"""Test the multi-strategy web processor with both target URLs."""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from processors.web_processor import extract_url_text

def test(label, url):
    print(f"\n{'='*60}")
    print(f"TEST: {label}")
    print(f"  URL: {url}")
    print(f"{'='*60}")
    try:
        text = extract_url_text(url)
        print(f"\n✔ SUCCESS — {len(text)} characters extracted")
        print(f"  Preview: {text[:300]}...")
    except Exception as e:
        print(f"\n✖ FAILED: {e}")

if __name__ == "__main__":
    test("Fandom Wiki (One Piece Story Arcs)",
         "https://onepiece.fandom.com/wiki/Story_Arcs")
    
    test("Wikipedia (for comparison)",
         "https://en.wikipedia.org/wiki/One_Piece")
