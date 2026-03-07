try:
    from youtube_transcript_api import YouTubeTranscriptApi
    print("YouTubeTranscriptApi imported successfully.")
    print("Attributes:", dir(YouTubeTranscriptApi))
    
    video_id = "AD6RuxQfeaU"
    print(f"Testing list_transcripts for {video_id}...")
    try:
        transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
        print("list_transcripts exists and worked.")
    except AttributeError as e:
        print(f"AttributeError: {e}")
    except Exception as e:
        print(f"Other error: {e}")
except ImportError:
    print("youtube-transcript-api not installed.")
