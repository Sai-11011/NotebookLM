def extract_pdf_text(file_stream) -> str:
    """Extract all text from a PDF file stream."""
    try:
        from pypdf import PdfReader
        reader = PdfReader(file_stream)
        text_parts = []
        for page in reader.pages:
            text = page.extract_text()
            if text:
                text_parts.append(text)
        return "\n\n".join(text_parts)
    except Exception as e:
        raise RuntimeError(f"Failed to extract PDF text: {e}") from e
