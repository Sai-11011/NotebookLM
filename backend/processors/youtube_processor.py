import re


def extract_video_id(url: str) -> str | None:
    """Extract YouTube video ID from various URL formats including Shorts and mobile."""
    patterns = [
        r"(?:v=|/v/)([A-Za-z0-9_-]{11})",       # Standard watch?v= and /v/
        r"youtu\.be/([A-Za-z0-9_-]{11})",         # Shortened youtu.be/
        r"/embed/([A-Za-z0-9_-]{11})",            # Embedded /embed/
        r"/shorts/([A-Za-z0-9_-]{11})",           # YouTube Shorts
        r"/live/([A-Za-z0-9_-]{11})",             # YouTube Live
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None


def extract_youtube_transcript(url: str) -> str:
    """Extract transcript text from a YouTube video via URL."""
    try:
        from youtube_transcript_api import YouTubeTranscriptApi

        video_id = extract_video_id(url)
        if not video_id:
            raise ValueError(f"Could not extract video ID from URL: {url}")

        transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
        # Combine into readable text
        text_parts = [entry.get("text", "") for entry in transcript_list]
        return " ".join(text_parts)
    except Exception as e:
        raise RuntimeError(f"Failed to fetch YouTube transcript: {e}") from e
