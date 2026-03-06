"""
Vector Store using ChromaDB for RAG (Retrieval-Augmented Generation).
Manages storing and retrieving document chunks by notebook.
"""
import os
import chromadb
from chromadb.config import Settings


# Support persistent storage on Render/Docker via DATA_DIR
DATA_DIR = os.environ.get("DATA_DIR", ".")
if not os.path.isabs(DATA_DIR):
    # If relative, make it relative to the backend directory
    DATA_DIR = os.path.join(os.path.dirname(__file__), DATA_DIR)

CHROMA_DB_PATH = os.path.join(DATA_DIR, "chroma_db")


def _get_client():
    """Return a persistent ChromaDB client."""
    return chromadb.PersistentClient(
        path=CHROMA_DB_PATH,
        settings=Settings(anonymized_telemetry=False),
    )


def _get_collection(notebook_id: str):
    """Get (or create) a ChromaDB collection per notebook."""
    client = _get_client()
    # Collection names must be 3-63 chars and alphanumeric with hyphens
    collection_name = f"nb-{notebook_id[:40]}"
    return client.get_or_create_collection(
        name=collection_name,
        metadata={"hnsw:space": "cosine"},
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
