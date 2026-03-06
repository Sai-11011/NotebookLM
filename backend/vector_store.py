"""
Vector Store using ChromaDB for RAG (Retrieval-Augmented Generation).
Manages storing and retrieving document chunks by notebook.
Uses Gemini text-embedding-004 for high-quality embeddings.
"""
import os
import time
import chromadb
from chromadb.config import Settings
from chromadb.api.types import EmbeddingFunction, Documents, Embeddings


# Support persistent storage on Render/Docker via DATA_DIR
DATA_DIR = os.environ.get("DATA_DIR", ".")
if not os.path.isabs(DATA_DIR):
    # If relative, make it relative to the backend directory
    DATA_DIR = os.path.join(os.path.dirname(__file__), DATA_DIR)

CHROMA_DB_PATH = os.path.join(DATA_DIR, "chroma_db")

EMBEDDING_MODEL = "gemini-embedding-001"
EMBEDDING_BATCH_SIZE = 100  # Max documents per embedding API call
EMBEDDING_RPM_LIMIT = 100   # Rate limit for embedding model


class GeminiEmbeddingFunction(EmbeddingFunction):
    """Custom ChromaDB embedding function using Google Gemini text-embedding-004."""

    def __init__(self):
        from google import genai
        api_key = os.environ.get("GOOGLE_API_KEY")
        if not api_key:
            raise RuntimeError("GOOGLE_API_KEY is not set in environment/.env")
        self._client = genai.Client(api_key=api_key)

    def __call__(self, input: Documents) -> Embeddings:
        """Embed documents in batches with exponential backoff for rate limits."""
        all_embeddings = []
        for i in range(0, len(input), EMBEDDING_BATCH_SIZE):
            batch = input[i : i + EMBEDDING_BATCH_SIZE]
            max_retries = 5
            for attempt in range(max_retries):
                try:
                    result = self._client.models.embed_content(
                        model=EMBEDDING_MODEL,
                        contents=batch,
                    )
                    all_embeddings.extend([emb.values for emb in result.embeddings])
                    break  # Success, move to next batch
                except Exception as exc:
                    is_rate_limit = "429" in str(exc) or "RESOURCE_EXHAUSTED" in str(exc)
                    if is_rate_limit and attempt < max_retries - 1:
                        wait_time = (2 ** attempt) + 1  # 2s, 3s, 5s, 9s, 17s
                        print(f"  ⚠ Embedding rate limit hit (attempt {attempt + 1}/{max_retries}). Waiting {wait_time}s...")
                        time.sleep(wait_time)
                    else:
                        print(f"  ✖ Embedding failed: {exc}")
                        raise
        return all_embeddings


# Singleton embedding function instance (lazy-loaded)
_embedding_fn = None

def _get_embedding_fn():
    """Return a cached GeminiEmbeddingFunction instance."""
    global _embedding_fn
    if _embedding_fn is None:
        _embedding_fn = GeminiEmbeddingFunction()
    return _embedding_fn


def _get_client():
    """Return a persistent ChromaDB client."""
    return chromadb.PersistentClient(
        path=CHROMA_DB_PATH,
        settings=Settings(anonymized_telemetry=False),
    )


def _get_collection(notebook_id: str):
    """Get (or create) a ChromaDB collection per notebook using Gemini embeddings."""
    client = _get_client()
    # Collection names must be 3-63 chars and alphanumeric with hyphens
    collection_name = f"nb-{notebook_id[:40]}"
    return client.get_or_create_collection(
        name=collection_name,
        metadata={"hnsw:space": "cosine"},
        embedding_function=_get_embedding_fn(),
    )


def _chunk_text(text: str, chunk_size: int = 1000, overlap: int = 150) -> list[str]:
    """Split text into overlapping chunks for better retrieval."""
    if not text or not text.strip():
        return []
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start += chunk_size - overlap
    return chunks


def add_source_to_store(notebook_id: str, source_id: str, source_name: str, text: str):
    """Chunk and add a source's text to the vector store for this notebook."""
    if not text or not text.strip():
        return

    collection = _get_collection(notebook_id)
    chunks = _chunk_text(text)

    ids = [f"{source_id}-chunk-{i}" for i in range(len(chunks))]
    documents = chunks
    metadatas = [{"source_id": source_id, "source_name": source_name, "chunk_index": i}
                 for i in range(len(chunks))]

    # Upsert to avoid duplicates if re-indexed
    collection.upsert(ids=ids, documents=documents, metadatas=metadatas)


def query_store(notebook_id: str, query: str, n_results: int = 5) -> list[dict]:
    """
    Query for the most relevant chunks from all sources in a notebook.
    Returns list of dicts with 'text', 'source_id', 'source_name'.
    """
    try:
        collection = _get_collection(notebook_id)
        count = collection.count()
        if count == 0:
            return []

        results = collection.query(
            query_texts=[query],
            n_results=min(n_results, count),
            include=["documents", "metadatas"],
        )
        output = []
        if results and results.get("documents"):
            for doc, meta in zip(results["documents"][0], results["metadatas"][0]):
                output.append({
                    "text": doc,
                    "source_id": meta.get("source_id", ""),
                    "source_name": meta.get("source_name", "Unknown"),
                })
        return output
    except Exception:
        return []


def delete_source_from_store(notebook_id: str, source_id: str):
    """Remove all chunks for a given source from the vector store."""
    try:
        collection = _get_collection(notebook_id)
        # Get all IDs for this source and delete them
        results = collection.get(where={"source_id": source_id})
        if results and results.get("ids"):
            collection.delete(ids=results["ids"])
    except Exception:
        pass  # Silently ignore if collection doesn't exist


def delete_notebook_store(notebook_id: str):
    """Delete the entire ChromaDB collection for a notebook."""
    try:
        client = _get_client()
        collection_name = f"nb-{notebook_id[:40]}"
        client.delete_collection(collection_name)
    except Exception:
        pass
