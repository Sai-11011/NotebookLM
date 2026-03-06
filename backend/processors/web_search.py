"""
Web Search processor.
Uses DuckDuckGo search (no API key required) via HTTP scraping,
falling back to a simple Google search URL construction.
"""
import urllib.request
import urllib.parse
import json
import re


def search_web(query: str, num_results: int = 6) -> list[dict]:
    """
    Search the web for a given query and return a list of results.
    Each result is a dict with 'title', 'url', and 'snippet'.
    
    Uses the DuckDuckGo Instant Answer API (free, no key needed).
    """
    if not query or not query.strip():
        return []

    results = []

    # Strategy 1: DuckDuckGo Instant Answer API
    try:
        encoded_query = urllib.parse.quote_plus(query)
        ddg_url = f"https://api.duckduckgo.com/?q={encoded_query}&format=json&no_html=1&skip_disambig=1"
        
        req = urllib.request.Request(
            ddg_url,
            headers={"User-Agent": "Mozilla/5.0 (NotebookLM-Clone/1.0)"}
        )
        
        with urllib.request.urlopen(req, timeout=8) as response:
            data = json.loads(response.read().decode("utf-8"))
        
        # Extract from RelatedTopics
        for topic in data.get("RelatedTopics", []):
            if "FirstURL" in topic and "Text" in topic:
                results.append({
                    "title": topic.get("Text", "")[:100],
                    "url": topic["FirstURL"],
                    "snippet": topic.get("Text", ""),
                })
            # Handle sub-topics (nested groups)
            elif "Topics" in topic:
                for sub_topic in topic["Topics"]:
                    if "FirstURL" in sub_topic and "Text" in sub_topic:
                        results.append({
                            "title": sub_topic.get("Text", "")[:100],
                            "url": sub_topic["FirstURL"],
                            "snippet": sub_topic.get("Text", ""),
                        })
            
            if len(results) >= num_results:
                break

        # Also check for AbstractURL (Wikipedia-like result)
        if data.get("AbstractURL") and data.get("AbstractText"):
            results.insert(0, {
                "title": data.get("Heading", query),
                "url": data["AbstractURL"],
                "snippet": data["AbstractText"],
            })

    except Exception as e:
        print(f"  ⚠ DuckDuckGo search failed: {e}")

    # If we got no results, provide helpful fallback with constructed search URLs
    if not results:
        results = [
            {
                "title": f"Search Google for '{query}'",
                "url": f"https://www.google.com/search?q={urllib.parse.quote_plus(query)}",
                "snippet": f"No instant results found. Click to search Google for: {query}",
            },
            {
                "title": f"Search Wikipedia for '{query}'",
                "url": f"https://en.wikipedia.org/wiki/{urllib.parse.quote_plus(query.replace(' ', '_'))}",
                "snippet": f"Look up '{query}' on Wikipedia for a comprehensive overview.",
            },
        ]

    return results[:num_results]
