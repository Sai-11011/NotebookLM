"""
Notebook CRUD routes.
Handles: list, get, create, rename, delete notebooks.
"""
import uuid
from flask import Blueprint, jsonify, request
from models import SessionLocal, Notebook
from vector_store import delete_notebook_store

bp = Blueprint("notebooks", __name__)


@bp.route("/api/notebooks", methods=["GET"])
def list_notebooks():
    db = SessionLocal()
    try:
        notebooks = db.query(Notebook).order_by(Notebook.last_modified.desc()).all()
        return jsonify([
            {
                "id": n.id,
                "title": n.title,
                "lastModified": n.last_modified.isoformat() if n.last_modified else None,
                "sources": [s.to_dict() for s in n.sources],
                "notes": [note.to_dict() for note in n.notes],
                "messages": [],  # Omit messages in list view for performance
            }
            for n in notebooks
        ])
    finally:
        db.close()


@bp.route("/api/notebooks/<notebook_id>", methods=["GET"])
def get_notebook(notebook_id):
    db = SessionLocal()
    try:
        notebook = db.query(Notebook).filter(Notebook.id == notebook_id).first()
        if not notebook:
            return jsonify({"error": "Notebook not found"}), 404
        return jsonify(notebook.to_dict())
    finally:
        db.close()


@bp.route("/api/notebooks", methods=["POST"])
def create_notebook():
    data = request.get_json(force=True)
    title = (data or {}).get("title", "Untitled Notebook").strip()
    if not title:
        return jsonify({"error": "Title is required"}), 400

    db = SessionLocal()
    try:
        notebook = Notebook(id=str(uuid.uuid4()), title=title)
        db.add(notebook)
        db.commit()
        db.refresh(notebook)
        return jsonify(notebook.to_dict()), 201
    finally:
        db.close()


@bp.route("/api/notebooks/<notebook_id>", methods=["PATCH"])
def rename_notebook(notebook_id):
    data = request.get_json(force=True)
    new_title = (data or {}).get("title", "").strip()
    if not new_title:
        return jsonify({"error": "Title is required"}), 400

    db = SessionLocal()
    try:
        notebook = db.query(Notebook).filter(Notebook.id == notebook_id).first()
        if not notebook:
            return jsonify({"error": "Notebook not found"}), 404
        notebook.title = new_title
        db.commit()
        db.refresh(notebook)
        return jsonify(notebook.to_dict())
    finally:
        db.close()


@bp.route("/api/notebooks/<notebook_id>", methods=["DELETE"])
def delete_notebook(notebook_id):
    db = SessionLocal()
    try:
        notebook = db.query(Notebook).filter(Notebook.id == notebook_id).first()
        if not notebook:
            return jsonify({"error": "Notebook not found"}), 404
        db.delete(notebook)
        db.commit()
        # Also clean up vector store
        delete_notebook_store(notebook_id)
        return jsonify({"message": "Notebook deleted"}), 200
    finally:
        db.close()
