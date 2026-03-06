"""
Notes routes.
Handles: create, update, delete notes within a notebook.
"""
import uuid
from flask import Blueprint, jsonify, request
from models import SessionLocal, Notebook, Note, utcnow

bp = Blueprint("notes", __name__)


@bp.route("/api/notebooks/<notebook_id>/notes", methods=["POST"])
def create_note(notebook_id):
    db = SessionLocal()
    try:
        notebook = db.query(Notebook).filter(Notebook.id == notebook_id).first()
        if not notebook:
            return jsonify({"error": "Notebook not found"}), 404

        data = request.get_json(force=True) or {}
        note = Note(
            id=str(uuid.uuid4()),
            notebook_id=notebook_id,
            title=data.get("title", ""),
            content=data.get("content", ""),
            color=data.get("color", "bg-white/5"),
        )
        db.add(note)
        # Update notebook last_modified
        notebook.last_modified = utcnow()
        db.commit()
        db.refresh(note)
        return jsonify(note.to_dict()), 201
    finally:
        db.close()


@bp.route("/api/notebooks/<notebook_id>/notes/<note_id>", methods=["PATCH"])
def update_note(notebook_id, note_id):
    db = SessionLocal()
    try:
        note = db.query(Note).filter(
            Note.id == note_id, Note.notebook_id == notebook_id
        ).first()
        if not note:
            return jsonify({"error": "Note not found"}), 404

        data = request.get_json(force=True) or {}
        if "title" in data:
            note.title = data["title"]
        if "content" in data:
            note.content = data["content"]
        if "color" in data:
            note.color = data["color"]
        # Update notebook last_modified
        note.notebook.last_modified = utcnow()
        db.commit()
        db.refresh(note)
        return jsonify(note.to_dict())
    finally:
        db.close()


@bp.route("/api/notebooks/<notebook_id>/notes/<note_id>", methods=["DELETE"])
def delete_note(notebook_id, note_id):
    db = SessionLocal()
    try:
        note = db.query(Note).filter(
            Note.id == note_id, Note.notebook_id == notebook_id
        ).first()
        if not note:
            return jsonify({"error": "Note not found"}), 404

        db.delete(note)
        db.commit()
        return jsonify({"message": "Note deleted"}), 200
    finally:
        db.close()
