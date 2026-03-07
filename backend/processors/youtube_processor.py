"""
YouTube transcript extractor.
Compatible with youtube-transcript-api v1.x (new API: instance-based, .fetch(), .snippets)
AND older versions (class methods, get_transcript, list_transcripts).
"""
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


def _try_new_api(video_id: str) -> str | None:
    """Try the new youtube-transcript-api v1.x API (instance-based)."""
    try:
        from youtube_transcript_api import YouTubeTranscriptApi
        ytt = YouTubeTranscriptApi()

        # Try direct fetch (auto-selects best available transcript)
        languages = ['en', 'hi', 'en-US', 'en-GB']
        for lang in languages:
            try:
                result = ytt.fetch(video_id, languages=[lang])
                parts = [s.text for s in result.snippets if s.text]
                if parts:
                    return " ".join(parts)
            except Exception:
                continue

        # Try without specifying language
        try:
            result = ytt.fetch(video_id)
            parts = [s.text for s in result.snippets if s.text]
            if parts:
                return " ".join(parts)
        except Exception:
            pass

    except (ImportError, TypeError, AttributeError):
        pass
    return None


def _try_old_api(video_id: str) -> str | None:
    """Try the old youtube-transcript-api API (class methods)."""
    try:
        from youtube_transcript_api import YouTubeTranscriptApi

        languages = ['en', 'hi', 'hi-en', 'en-US', 'en-GB']
        for lang in languages:
            try:
                entries = YouTubeTranscriptApi.get_transcript(video_id, languages=[lang])
                parts = [e.get("text", "") for e in entries]
                if parts:
                    return " ".join(parts)
            except Exception:
                continue

        # List and try all available transcripts
        try:
            transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
            for transcript in transcript_list:
                try:
                    fetched = transcript.fetch()
                    parts = [e.get("text", "") for e in fetched]
                    if parts:
                        return " ".join(parts)
                except Exception:
                    continue
        except Exception:
            pass

    except (ImportError, TypeError, AttributeError):
        pass
    return None


def extract_youtube_transcript(url: str) -> str:
    """Extract transcript text from a YouTube video via URL.
    Works with both old and new versions of youtube-transcript-api.
    """
    video_id = extract_video_id(url)
    if not video_id:
        raise ValueError(f"Could not extract video ID from URL: {url}")

    print(f"  → Extracting transcript for video ID: {video_id}")

    # Try new API first (v1.x)
    text = _try_new_api(video_id)
    if text and text.strip():
        print(f"  ✔ Transcript extracted (new API): {len(text)} chars")
        return text

    # Fall back to old API
    text = _try_old_api(video_id)
    if text and text.strip():
        print(f"  ✔ Transcript extracted (old API): {len(text)} chars")
        return text

    raise RuntimeError(
        f"No transcript available for this video (ID: {video_id}). "
        f"The video may not have captions enabled."
    )
