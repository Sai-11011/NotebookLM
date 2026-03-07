"""
Web content extractor with multi-strategy fallback.
Strategy 1: Jina.ai Reader API (handles JS-rendered pages)
Strategy 2: urllib with full browser headers (works on Fandom/wiki)
Strategy 3: requests + BeautifulSoup enhanced scraping
"""


def _clean_text(text: str, max_chars: int = 200_000) -> str:
    """Remove excessive blank lines and cap length."""
    lines = [line for line in text.splitlines() if line.strip()]
    cleaned = "\n".join(lines)
    return cleaned[:max_chars]


def _html_to_text(html_bytes: bytes) -> str:
    """Parse HTML and extract readable text content."""
    from bs4 import BeautifulSoup

    try:
        soup = BeautifulSoup(html_bytes, "lxml")
    except Exception:
        soup = BeautifulSoup(html_bytes, "html.parser")

    # Remove non-content tags
    for tag in soup(["script", "style", "nav", "footer", "header", "aside",
                     "form", "noscript", "iframe", "svg"]):
        tag.decompose()

    # Get main content: prefer article/main, fallback to body
    main = (
        soup.find("article")
        or soup.find("main")
        or soup.find("div", {"id": "mw-content-text"})  # MediaWiki/Fandom
        or soup.find("div", {"class": "mw-parser-output"})
        or soup.find("body")
    )
    if main:
        text = main.get_text(separator="\n", strip=True)
    else:
        text = soup.get_text(separator="\n", strip=True)

    return text


def _extract_via_jina(url: str) -> str:
    """Use Jina.ai Reader API to extract clean text from any URL.
    Free, no API key needed, handles JavaScript-rendered pages."""
    import requests

    jina_url = f"https://r.jina.ai/{url}"
    headers = {
        "Accept": "text/plain",
        "User-Agent": "Mozilla/5.0 (NotebookLM-Clone/1.0)",
    }

    response = requests.get(jina_url, headers=headers, timeout=30)
    response.raise_for_status()

    text = response.text.strip()
    if len(text) < 50:
        raise ValueError("Jina returned too little content")

    return _clean_text(text)


def _extract_via_urllib(url: str) -> str:
    """Use urllib with full browser headers — works on sites that block requests
    (like Fandom wikis that return 403 to requests but 200 to urllib)."""
    import urllib.request

    req = urllib.request.Request(
        url,
        data=None,
        headers={
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/122.0.0.0 Safari/537.36"
            ),
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,"
                      "image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Sec-Fetch-User": "?1",
            "Upgrade-Insecure-Requests": "1",
        },
    )

    with urllib.request.urlopen(req, timeout=20) as response:
        html = response.read(5 * 1024 * 1024)  # 5MB max

    text = _html_to_text(html)
    if len(text) < 50:
        raise ValueError("urllib extracted too little content")

    return _clean_text(text)


def _extract_via_requests(url: str) -> str:
    """Enhanced requests + BeautifulSoup scraping."""
    import requests

    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/122.0.0.0 Safari/537.36"
        ),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,"
                  "image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Cache-Control": "max-age=0",
    }
    response = requests.get(url, headers=headers, timeout=20)
    response.raise_for_status()

    content = response.content[:5 * 1024 * 1024]
    text = _html_to_text(content)

    if len(text) < 50:
        raise ValueError("BeautifulSoup extracted too little content")

    return _clean_text(text)


def extract_url_text(url: str) -> str:
    """Scrape and extract readable text content from a webpage.
    Tries multiple strategies: Jina.ai → urllib → requests+BS4."""
    errors = []

    # Strategy 1: Jina.ai Reader (best for JS-rendered pages)
    try:
        print(f"  → Trying Jina.ai Reader for: {url}")
        text = _extract_via_jina(url)
        print(f"  ✔ Jina.ai succeeded: {len(text)} chars extracted")
        return text
    except Exception as e:
        errors.append(f"Jina.ai: {e}")
        print(f"  ⚠ Jina.ai failed: {e}")

    # Strategy 2: urllib with full browser headers (works on Fandom)
    try:
        print(f"  → Trying urllib for: {url}")
        text = _extract_via_urllib(url)
        print(f"  ✔ urllib succeeded: {len(text)} chars extracted")
        return text
    except Exception as e:
        errors.append(f"urllib: {e}")
        print(f"  ⚠ urllib failed: {e}")

    # Strategy 3: requests + BeautifulSoup
    try:
        print(f"  → Trying requests+BS4 for: {url}")
        text = _extract_via_requests(url)
        print(f"  ✔ requests+BS4 succeeded: {len(text)} chars extracted")
        return text
    except Exception as e:
        errors.append(f"requests+BS4: {e}")
        print(f"  ⚠ requests+BS4 failed: {e}")

    raise RuntimeError(
        f"Failed to extract URL content from {url}. "
        f"Errors: {'; '.join(errors)}"
    )
