"""
Chat routes.
Handles: send a message, get chat history, clear history.
"""
import uuid
from flask import Blueprint, jsonify, request
from models import SessionLocal, Notebook, Message
from ai_service import chat_with_sources

bp = Blueprint("chat", __name__)


@bp.route("/api/notebooks/<notebook_id>/chat", methods=["POST"])
def send_message(notebook_id):
    db = SessionLocal()
    try:
        notebook = db.query(Notebook).filter(Notebook.id == notebook_id).first()
        if not notebook:
            return jsonify({"error": "Notebook not found"}), 404

        data = request.get_json(force=True) or {}
        user_content = (data.get("message") or "").strip()
        if not user_content:
            return jsonify({"error": "message is required"}), 400

        # Save user message
        user_msg = Message(
            id=str(uuid.uuid4()),
            notebook_id=notebook_id,
            role="user",
            content=user_content,
        )
        db.add(user_msg)
        db.commit()

        # Build recent history (last 20 turns) for context, excluding current user message
        history_rows = (
            db.query(Message)
            .filter(Message.notebook_id == notebook_id, Message.id != user_msg.id)
            .order_by(Message.timestamp.desc())
            .limit(20)  # Prevent unbounded context causing API timeouts
            .all()
        )
        # Reverse to chronological order
        history_rows.reverse()
        history = [{"role": m.role, "content": m.content} for m in history_rows if m.content and m.content.strip()]

        # Call AI service
        try:
            result = chat_with_sources(notebook_id, user_content, history)
        except RuntimeError as e:
            error_msg = str(e)
            # Distinguish rate limit from other RuntimeErrors
            if "RATE_LIMIT" in error_msg or "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg:
                return jsonify({"error": "Rate limit reached. Please wait a moment and try again."}), 429
            # API key not set or other Gemini error
            return jsonify({"error": error_msg}), 503

        # Save model response (including agent tool call steps)
        model_msg = Message(
            id=str(uuid.uuid4()),
            notebook_id=notebook_id,
            role="model",
            content=result["content"],
        )
        model_msg.sources = result.get("sources", [])
        model_msg.tool_calls = result.get("tool_calls", [])
        db.add(model_msg)
        db.commit()
        db.refresh(model_msg)

        return jsonify(model_msg.to_dict()), 200

    finally:
        db.close()


@bp.route("/api/notebooks/<notebook_id>/chat", methods=["GET"])
def get_messages(notebook_id):
    db = SessionLocal()
    try:
        messages = (
            db.query(Message)
            .filter(Message.notebook_id == notebook_id)
            .order_by(Message.timestamp.asc())
            .all()
        )
        return jsonify([m.to_dict() for m in messages])
    finally:
        db.close()


@bp.route("/api/notebooks/<notebook_id>/chat", methods=["DELETE"])
def clear_chat(notebook_id):
    db = SessionLocal()
    try:
        db.query(Message).filter(Message.notebook_id == notebook_id).delete()
        db.commit()
        return jsonify({"message": "Chat history cleared"}), 200
    finally:
        db.close()
