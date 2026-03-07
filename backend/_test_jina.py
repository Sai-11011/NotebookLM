import requests

def test_jina(url):
    print(f"Testing URL with Jina: {url}")
    try:
        response = requests.get(f"https://r.jina.ai/{url}", timeout=20)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            text = response.text
            print(f"Success! Snippet length: {len(text)}")
            print(f"Snippet: {text[:200]}...")
        else:
            print(f"Failed with {response.status_code}: {response.text[:200]}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_jina("https://onepiece.fandom.com/wiki/Story_Arcs")
