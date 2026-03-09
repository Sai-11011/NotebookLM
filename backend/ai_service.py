"""
AI Service for interacting with Google Gemini API using the modern google-genai SDK.
Handles context-aware chat with RAG and a MANUAL agentic tool-calling loop
that tracks each step for frontend observability.
"""
import os
import json
from google import genai
from google.genai import types

from tools import AVAILABLE_TOOLS
from utils import retry_with_backoff

# Build a lookup map: tool_name -> callable
_TOOL_MAP = {fn.__name__: fn for fn in AVAILABLE_TOOLS}

def _get_client():
    api_key = os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        raise RuntimeError("GOOGLE_API_KEY is not set in environment/.env")
    return genai.Client(api_key=api_key)


def chat_with_sources(notebook_id: str, user_message: str, chat_history: list[dict]) -> dict:
    """
    Given a user message and the notebook's chat history, use a MANUAL agentic loop
    that captures every tool call step for frontend visibility.
    
    Returns:
        {
            "content": str,           # Final AI text response
            "sources": [],
            "tool_calls": [           # List of tool call steps for UI display
                {"tool": "search_sources", "args": {...}, "result_preview": "..."},
                ...
            ]
        }
    
    Raises:
        RuntimeError: if GOOGLE_API_KEY is not set (returns HTTP 503 to caller).
    """
    client = _get_client()

    # System instruction for the agentic role
    system_instruction = (
        "You are an autonomous research assistant for NoteBookLM. "
        "Your goal is to help the user manage their notebook, research their sources, and create insights. "
        "\n\nYou have access to tools that let you:\n"
        "1. **search_sources** — Search sources for specific information (semantic search).\n"
        "2. **list_sources** — List all sources available in the notebook.\n"
        "3. **create_note** — Create a new note to save summaries, research, and insights.\n"
        "4. **fetch_url_as_source** — Fetch a web page URL and add it as a source to the notebook.\n"
        "5. **search_web_for_info** — Search the web for information not in the notebook.\n"
        "\nIMPORTANT GUIDELINES:\n"
        "- Always search sources first if the user's question relates to their content.\n"
        "- If the user shares a URL or asks you to read a web page, use fetch_url_as_source.\n"
        "- If you find a significant piece of information or complete a summary, automatically create a note for the user.\n"
        "- Be concise and professional.\n"
        "- You MUST use a tool to access source information; do not rely on your internal knowledge for the content of the sources.\n"
        "- If there are no sources yet, tell the user to add some first.\n"
        f"CURRENT NOTEBOOK ID: {notebook_id}"
    )

    # Convert history to the format expected by google-genai
    contents = []
    for msg in chat_history:
        role = "user" if msg.get("role") == "user" else "model"
        content = msg.get("content", "").strip()
        if not content:
            continue
        if contents and contents[-1].role == role:
            contents[-1].parts.append(types.Part(text="\n\n" + content))
        else:
            contents.append(types.Content(role=role, parts=[types.Part(text=content)]))

    # Append the current user message
    if contents and contents[-1].role == "user":
        contents[-1].parts.append(types.Part(text="\n\n" + user_message))
    else:
        contents.append(types.Content(role="user", parts=[types.Part(text=user_message)]))

    # Build tool declarations for Gemini
    tool_declarations = AVAILABLE_TOOLS

    # Track tool calls for frontend display
    tracked_tool_calls = []

    MAX_ITERATIONS = 8  # Safety limit to prevent infinite loops

    try:
        for iteration in range(MAX_ITERATIONS):
            # Slow down slightly between iterations to avoid bursting the 5 RPM limit
            if iteration > 0:
                print(f"  ... pausing 1s before iteration {iteration+1} ...")
                import time
                time.sleep(1)

            def generate():
                # Try 2.0 Flash first, but fallback to 1.5 Flash if needed?
                # Actually, let's stick to 1.5-flash for now as it's more stable for many users
                return client.models.generate_content(
                    model="gemini-1.5-flash", 
                    contents=contents,
                    config=types.GenerateContentConfig(
                        system_instruction=system_instruction,
                        temperature=0.7,
                        tools=tool_declarations,
                    )
                )
            
            try:
                response = retry_with_backoff(generate)
            except Exception as e:
                # Log exactly what happened if retries failed
                print(f"\n  ✖ API CALL FAILED after all retries in iteration {iteration+1}")
                print(f"  Error: {str(e)}")
                raise

            # Check if the model wants to call a function
            candidate = response.candidates[0] if response.candidates else None
            if not candidate or not candidate.content or not candidate.content.parts:
                break

            has_function_call = False
            function_response_parts = []

            for part in candidate.content.parts:
                if part.function_call:
                    has_function_call = True
                    fc = part.function_call
                    tool_name = fc.name
                    tool_args = dict(fc.args) if fc.args else {}

                    print(f"\n  🔧 Agent calling tool: {tool_name}({tool_args})")

                    # Execute the tool
                    func = _TOOL_MAP.get(tool_name)
                    if func:
                        try:
                            result = func(**tool_args)
                        except Exception as e:
                            result = f"Tool error: {str(e)}"
                    else:
                        result = f"Unknown tool: {tool_name}"

                    result_str = str(result)
                    print(f"  📋 Tool result preview: {result_str[:150]}...")

                    # Track for frontend
                    tracked_tool_calls.append({
                        "tool": tool_name,
                        "args": {k: str(v)[:100] for k, v in tool_args.items()},
                        "result_preview": result_str[:200],
                    })

                    # Build function response
                    function_response_parts.append(
                        types.Part(function_response=types.FunctionResponse(
                            name=tool_name,
                            response={"result": result_str[:10000]},
                        ))
                    )

            if not has_function_call:
                # No function call — model produced a final text answer
                break

            # Add the model's function call turn and then the function response turn
            contents.append(candidate.content)
            contents.append(types.Content(
                role="user",
                parts=function_response_parts,
            ))

        # Extract the final text response
        ai_text = response.text if response.text else None
        if not ai_text:
            # Try to extract text from the last response parts
            for part in (candidate.content.parts if candidate and candidate.content else []):
                if part.text:
                    ai_text = part.text
                    break
        
        if not ai_text:
            ai_text = "I processed your request but could not generate a text response. Please try rephrasing."

        return {
            "content": ai_text,
            "sources": [],
            "tool_calls": tracked_tool_calls,
        }

    except RuntimeError:
        raise
    except Exception as e:
        import traceback
        print(f"\n{'='*60}")
        print(f"  ✖ Gemini API Error in chat_with_sources:")
        print(f"  Type: {type(e).__name__}")
        print(f"  Message: {e}")
        traceback.print_exc()
        print(f"{'='*60}\n")
        
        # Propagate rate limit errors so the route can return HTTP 429
        error_str = str(e)
        if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
            raise RuntimeError("RATE_LIMIT_EXCEEDED") from e
        
        error_type = type(e).__name__
        return {
            "content": f"I encountered an error ({error_type}) while processing your request. Please try again or check the server logs.",
            "sources": [],
            "tool_calls": tracked_tool_calls,
        }
