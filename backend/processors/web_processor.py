def extract_url_text(url: str) -> str:
    """Scrape and extract readable text content from a webpage."""
    try:
        import requests
        from bs4 import BeautifulSoup

        headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            )
        }
        response = requests.get(url, headers=headers, timeout=20)
        response.raise_for_status()

        # Limit content size to prevent processing huge pages (5MB max)
        content = response.content[:5 * 1024 * 1024]

        # Try lxml first for speed, fall back to built-in html.parser
        try:
            soup = BeautifulSoup(content, "lxml")
        except Exception:
            soup = BeautifulSoup(content, "html.parser")

        # Remove non-content tags
        for tag in soup(["script", "style", "nav", "footer", "header", "aside", "form"]):
            tag.decompose()

        # Get main content: prefer article/main, fallback to body
        main = soup.find("article") or soup.find("main") or soup.find("body")
        if main:
            text = main.get_text(separator="\n", strip=True)
        else:
            text = soup.get_text(separator="\n", strip=True)

        # Clean up excessive blank lines and limit total text size
        lines = [line for line in text.splitlines() if line.strip()]
        cleaned = "\n".join(lines)
        # Cap at 200,000 characters to keep indexing manageable
        return cleaned[:200_000]
    except Exception as e:
        raise RuntimeError(f"Failed to extract URL content from {url}: {e}") from e
