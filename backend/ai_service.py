"""
AI Service for interacting with Google Gemini API using the modern google-genai SDK.
Handles context-aware chat with RAG and handles agentic tool calling.
"""
import os
from google import genai
from google.genai import types

from tools import AVAILABLE_TOOLS

def _get_client():
    api_key = os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        raise RuntimeError("GOOGLE_API_KEY is not set in environment/.env")
    return genai.Client(api_key=api_key)

def chat_with_sources(notebook_id: str, user_message: str, chat_history: list[dict]) -> dict:
    """
    Given a user message and the notebook's chat history, use an agentic loop 
    to fulfill the user's request using available tools.
    
    Raises:
        RuntimeError: if GOOGLE_API_KEY is not set (returns HTTP 503 to caller).
    """
    # This will raise RuntimeError if key is missing, propagating to chat.py's 503 handler
    client = _get_client()

    # Step 1: Define system instruction for the agentic role
    system_instruction = (
        "You are an autonomous research assistant for NoteBookLM. "
        "Your goal is to help the user manage their notebook, research their sources, and create insights. "
        "\n\nYou have access to tools that let you:\n"
        "1. Search sources for specific information (semantic search).\n"
        "2. List all sources available in the notebook.\n"
        "3. Create new notes to save summaries, research, and insights for the user.\n"
        "\nIMPORTANT GUIDELINES:\n"
        "- Always search sources first if the user's question relates to their content.\n"
        "- If you find a significant piece of information or complete a summary, automatically create a note for the user.\n"
        "- Be concise and professional.\n"
        "- You MUST use a tool to access source information; do not rely on your internal knowledge for the content of the sources.\n"
        "- If there are no sources yet, tell the user to add some first.\n"
        f"CURRENT NOTEBOOK ID: {notebook_id}"
    )

    # Step 2: Convert history to the format expected by google-genai
    # Gemini requires alternating roles. We combine sequential messages of the same role.
    contents = []
    
    for msg in chat_history:
        role = "user" if msg.get("role") == "user" else "model"
        content = msg.get("content", "").strip()
        if not content:
            continue
            
        if contents and contents[-1].role == role:
            # Append string to existing part instead of string concatenation to preserve structure
            contents[-1].parts.append(types.Part(text="\n\n" + content))
        else:
            contents.append(types.Content(role=role, parts=[types.Part(text=content)]))

    # Append the current user message
    if contents and contents[-1].role == "user":
        contents[-1].parts.append(types.Part(text="\n\n" + user_message))
    else:
        contents.append(types.Content(role="user", parts=[types.Part(text=user_message)]))

    # Step 3: Generate a response using the agentic loop (automatic function calling)
    try:
        response = client.models.generate_content(
            model="gemini-3.1-flash-lite",
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.7,
                tools=AVAILABLE_TOOLS,
                automatic_function_calling=types.AutomaticFunctionCallingConfig(
                    disable=False
                )
            )
        )

        ai_text = response.text
        if not ai_text:
            ai_text = "I processed your request but could not generate a text response. Please try rephrasing."

        return {
            "content": ai_text,
            "sources": [],
        }

    except RuntimeError:
        # Re-raise RuntimeError (e.g., API key issues) so the caller gets HTTP 503
        raise
    except Exception as e:
        # For unexpected Gemini API errors, return a user-friendly message
        error_type = type(e).__name__
        return {
            "content": f"I encountered an error ({error_type}) while processing your request. Please try again or check the server logs.",
            "sources": [],
        }
