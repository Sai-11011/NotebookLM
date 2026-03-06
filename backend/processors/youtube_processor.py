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
    """Extract transcript text from a YouTube video via URL.
    Tries multiple languages and auto-generated transcripts as fallbacks.
    """
    try:
        from youtube_transcript_api import YouTubeTranscriptApi

        video_id = extract_video_id(url)
        if not video_id:
            raise ValueError(f"Could not extract video ID from URL: {url}")

        # Try fetching transcripts in order of preference
        languages_to_try = ['en', 'hi', 'hi-en', 'en-US', 'en-GB']
        
        last_error = None
        
        # Attempt 1: Direct fetch with preferred languages
        for lang in languages_to_try:
            try:
                transcript_list = YouTubeTranscriptApi.get_transcript(video_id, languages=[lang])
                text_parts = [entry.get("text", "") for entry in transcript_list]
                return " ".join(text_parts)
            except Exception:
                continue
        
        # Attempt 2: Fetch any available transcript (auto-generated or manual)
        try:
            transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
            
            # Try manually created transcripts first
            for transcript in transcript_list:
                if not transcript.is_generated:
                    try:
                        fetched = transcript.fetch()
                        text_parts = [entry.get("text", "") for entry in fetched]
                        return " ".join(text_parts)
                    except Exception:
                        continue
            
            # Then try auto-generated ones
            for transcript in transcript_list:
                if transcript.is_generated:
                    try:
                        fetched = transcript.fetch()
                        text_parts = [entry.get("text", "") for entry in fetched]
                        return " ".join(text_parts)
                    except Exception:
                        continue
                        
        except Exception as e:
            last_error = e

        raise RuntimeError(
            f"No transcript available for this video. "
            f"The video may not have captions enabled. Last error: {last_error}"
        )

    except RuntimeError:
        raise
    except Exception as e:
        raise RuntimeError(f"Failed to fetch YouTube transcript: {e}") from e
