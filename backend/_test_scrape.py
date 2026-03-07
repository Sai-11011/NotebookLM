import requests
from bs4 import BeautifulSoup

def test_url(url):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Cache-Control": "max-age=0"
    }
    
    try:
        print(f"Testing URL: {url}")
        response = requests.get(url, headers=headers, timeout=10)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, "html.parser")
            print(f"Title: {soup.title.string if soup.title else 'No title'}")
            
            # Print a snippet of the text to see if we got real content or a redirect page
            text = soup.get_text(separator=" ", strip=True)
            print(f"Snippet: {text[:200]}...")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_url("https://onepiece.fandom.com/wiki/Story_Arcs")
    test_url("https://en.wikipedia.org/wiki/One_Piece")
