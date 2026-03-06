"""
Agentic Tools for NoteBookLM.
These functions are used by the Gemini Agent to interact with the notebook environment.
"""
import uuid
from models import SessionLocal, Notebook, Source, Note
from vector_store import query_store

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

# List of tools available to the agent
AVAILABLE_TOOLS = [search_sources, create_note, list_sources]
