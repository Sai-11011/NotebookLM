import os
import sys

sys.path.append('backend')
from google import genai
from google.genai import types

def run_test():
    client = genai.Client(api_key=os.environ.get("GOOGLE_API_KEY"))
    
    contents = [
        types.Content(role="user", parts=[types.Part(text="Hello!")]),
    ]
    
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=contents
        )
        print("Success 1!")
    except Exception as e:
        print(f"Error 1 ({type(e).__name__}): {e}")

    contents = [
        types.Content(role="user", parts=[types.Part(text="Hello!")]),
        types.Content(role="user", parts=[types.Part(text="How are you?")]),
    ]
    
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=contents
        )
        print("Success 2!")
    except Exception as e:
        print(f"Error 2 ({type(e).__name__}): {e}")

if __name__ == "__main__":
    run_test()
