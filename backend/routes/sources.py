"""
Source routes.
Handles: add source (PDF upload, URL, YouTube), delete source.
"""
import uuid
from flask import Blueprint, jsonify, request
from models import SessionLocal, Notebook, Source
from vector_store import add_source_to_store, delete_source_from_store
from processors.pdf_processor import extract_pdf_text
from processors.web_processor import extract_url_text
from processors.youtube_processor import extract_youtube_transcript

bp = Blueprint("sources", __name__)


@bp.route("/api/notebooks/<notebook_id>/sources", methods=["POST"])
def add_source(notebook_id):
    db = SessionLocal()
    try:
        notebook = db.query(Notebook).filter(Notebook.id == notebook_id).first()
        if not notebook:
            return jsonify({"error": "Notebook not found"}), 404

        # Determine source type from either form data or JSON body
        # PDF uploads use multipart/form-data; URL/text use application/json
        is_multipart = request.content_type and "multipart/form-data" in request.content_type
        if is_multipart:
            source_type = request.form.get("type", "").strip()
            json_body = {}
        else:
            json_body = request.get_json(force=True, silent=True) or {}
            source_type = json_body.get("type", "").strip()

        if not source_type:
            return jsonify({"error": "source type is required"}), 400

        name = None
        extracted_text = ""

        # ── PDF File Upload ──────────────────────────────────────────────
        if source_type == "pdf":
            file = request.files.get("file")
            if not file or not file.filename:
                return jsonify({"error": "No file provided"}), 400
            name = file.filename
            try:
                extracted_text = extract_pdf_text(file.stream)
            except Exception as e:
                return jsonify({"error": str(e)}), 422

        # ── URL Scraping ─────────────────────────────────────────────────
        elif source_type == "url":
            url = json_body.get("url", "").strip()
            if not url:
                return jsonify({"error": "url is required"}), 400
            name = json_body.get("name") or url
            try:
                extracted_text = extract_url_text(url)
            except Exception as e:
                return jsonify({"error": str(e)}), 422

        # ── YouTube Transcript ───────────────────────────────────────────
        elif source_type == "youtube":
            url = json_body.get("url", "").strip()
            if not url:
                return jsonify({"error": "url is required"}), 400
            name = json_body.get("name") or url
            try:
                extracted_text = extract_youtube_transcript(url)
            except Exception as e:
                return jsonify({"error": str(e)}), 422

        # ── Plain Text ───────────────────────────────────────────────────
        elif source_type == "text":
            name = json_body.get("name", "Pasted Text")
            extracted_text = json_body.get("content", "").strip()
            if not extracted_text:
                return jsonify({"error": "content is required for text sources"}), 400

        else:
            return jsonify({"error": f"Unsupported source type: {source_type}"}), 400

        # Save to DB
        from datetime import datetime, timezone
        source = Source(
            id=str(uuid.uuid4()),
            notebook_id=notebook_id,
            name=name,
            type=source_type,
            content_text=extracted_text,
        )
        db.add(source)
        # Touch notebook last_modified so dashboard card updates
        notebook.last_modified = datetime.now(timezone.utc)
        db.commit()
        db.refresh(source)

        # Index in vector store
        if extracted_text:
            add_source_to_store(notebook_id, source.id, name, extracted_text)

        return jsonify(source.to_dict()), 201

    finally:
        db.close()


@bp.route("/api/notebooks/<notebook_id>/sources/<source_id>", methods=["DELETE"])
def delete_source(notebook_id, source_id):
    db = SessionLocal()
    try:
        source = db.query(Source).filter(
            Source.id == source_id, Source.notebook_id == notebook_id
        ).first()
        if not source:
            return jsonify({"error": "Source not found"}), 404

        delete_source_from_store(notebook_id, source_id)
        db.delete(source)
        db.commit()
        return jsonify({"message": "Source deleted"}), 200
    finally:
        db.close()
