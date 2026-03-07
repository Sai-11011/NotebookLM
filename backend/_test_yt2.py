"""Test YouTube transcript extraction."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from processors.youtube_processor import extract_youtube_transcript

url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
print(f"Testing: {url}")
try:
    text = extract_youtube_transcript(url)
    print(f"✔ SUCCESS — {len(text)} characters extracted")
    print(f"  Preview: {text[:300]}...")
except Exception as e:
    print(f"✖ FAILED: {e}")
