"""
Agentic Tools for NoteBookLM.
These functions are used by the Gemini Agent to interact with the notebook environment.
"""
import uuid
from models import SessionLocal, Notebook, Source, Note
from vector_store import query_store, add_source_to_store
from processors.web_processor import extract_url_text
from processors.web_search import search_web


def search_sources(notebook_id: str, query: str) -> str:
    """
    Search all sources in the notebook for specific information using semantic search.
    Returns the most relevant text chunks.
    """
    chunks = query_store(notebook_id, query, n_results=5)
    if not chunks:
        return "No relevant information found in the sources."
    
    results = []
    for chunk in chunks:
        results.append(f"[Source: {chunk['source_name']}]\n{chunk['text']}")
    
    return "\n\n---\n\n".join(results)

def create_note(notebook_id: str, title: str, content: str) -> str:
    """
    Create a new note in the notebook. Use this to save summaries, 
    insights, or collected research for the user.
    """
    db = SessionLocal()
    try:
        new_note = Note(
            id=str(uuid.uuid4()),
            notebook_id=notebook_id,
            title=title,
            content=content,
            color="bg-white/5"  # Dark-theme compatible color for agent notes
        )
        db.add(new_note)
        db.commit()
        return f"Successfully created note: '{title}'"
    except Exception as e:
        db.rollback()  # Prevent session corruption on database errors
        return f"Failed to create note: {str(e)}"
    finally:
        db.close()

def list_sources(notebook_id: str) -> str:
    """
    List all available sources in the notebook.
    Returns names and types of all sources.
    """
    db = SessionLocal()
    try:
        notebook = db.query(Notebook).filter(Notebook.id == notebook_id).first()
        if not notebook:
            return "Notebook not found."
        
        sources = notebook.sources
        if not sources:
            return "No sources added to this notebook yet."
        
        source_list = [f"- {s.name} ({s.type})" for s in sources]
        return "Available Sources:\n" + "\n".join(source_list)
    finally:
        db.close()


def fetch_url_as_source(notebook_id: str, url: str) -> str:
    """
    Fetch content from a URL and add it as a new source to the notebook.
    Use this when the user asks you to read, import, or analyze a web page or article.
    Supports any website including wiki pages, blogs, documentation, etc.
    """
    db = SessionLocal()
    try:
        notebook = db.query(Notebook).filter(Notebook.id == notebook_id).first()
        if not notebook:
            return "Error: Notebook not found."

        # Extract text from the URL
        try:
            text = extract_url_text(url)
        except Exception as e:
            return f"Failed to extract content from {url}: {str(e)}"

        if not text or len(text.strip()) < 20:
            return f"Could not extract meaningful content from {url}"

        # Create a source record
        source = Source(
            id=str(uuid.uuid4()),
            notebook_id=notebook_id,
            name=url,
            type="url",
            content_text=text,
        )
        db.add(source)
        db.commit()
        db.refresh(source)

        # Index in vector store
        try:
            add_source_to_store(notebook_id, source.id, url, text)
        except Exception as embed_err:
            print(f"  ⚠ Embedding failed for fetched URL '{url}': {embed_err}")

        snippet = text[:200].replace("\n", " ")
        return (
            f"Successfully fetched and added '{url}' as a source "
            f"({len(text)} chars extracted). Preview: {snippet}..."
        )

    except Exception as e:
        db.rollback()
        return f"Error adding URL source: {str(e)}"
    finally:
        db.close()


def search_web_for_info(query: str) -> str:
    """
    Search the web using DuckDuckGo for a given query.
    Returns titles, URLs, and snippets of the top results.
    Use this to find information that is NOT in the notebook sources.
    """
    try:
        results = search_web(query, num_results=5)
        if not results:
            return f"No web results found for '{query}'."

        formatted = []
        for r in results:
            formatted.append(f"**{r['title']}**\n  URL: {r['url']}\n  {r['snippet']}")
        return "Web Search Results:\n\n" + "\n\n".join(formatted)
    except Exception as e:
        return f"Web search failed: {str(e)}"


# List of tools available to the agent
AVAILABLE_TOOLS = [search_sources, create_note, list_sources, fetch_url_as_source, search_web_for_info]
