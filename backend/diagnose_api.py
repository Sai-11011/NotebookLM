import os
import sys
from google import genai
from dotenv import load_dotenv

def diagnose():
    load_dotenv()
    api_key = os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        print("❌ Error: GOOGLE_API_KEY not found in .env")
        return

    print(f"Testing Gemini API with key: {api_key[:10]}...")
    client = genai.Client(api_key=api_key)
    
    print("\n--- Listing Available Models ---")
    try:
        # Re-check listing models logic for google-genai
        models = client.models.list()
        for m in models:
            # Check if it supports generate_content
            if "generateContent" in m.supported_generation_methods:
                print(f"  - {m.name}")
    except Exception as e:
        print(f"❌ Could not list models: {e}")

    models_to_test = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-flash-8b"]
    # ... rest of the script ...

if __name__ == "__main__":
    diagnose()
