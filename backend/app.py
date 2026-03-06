"""
Main Flask application entry point.
- Serves the React frontend from the ../dist directory.
- Registers all API blueprints.
- Initializes the SQLite database.
"""
import os
import sys
from flask import Flask, jsonify, send_from_directory, send_file
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Ensure backend package root is on the path
sys.path.insert(0, os.path.dirname(__file__))

from models import init_db
from routes.notebooks import bp as notebooks_bp
from routes.sources import bp as sources_bp
from routes.notes import bp as notes_bp
from routes.chat import bp as chat_bp
from routes.search import bp as search_bp

# ── App & Static File Setup ──────────────────────────────────────────────────
# Support both local dev and Docker production paths
# In Docker, dist is copied inside the app root
# Locally, dist is one level up from the backend folder
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
DOCKER_DIST = os.path.join(ROOT_DIR, "dist")
LOCAL_DIST = os.path.join(ROOT_DIR, "..", "dist")

DIST_DIR = DOCKER_DIST if os.path.exists(DOCKER_DIST) else LOCAL_DIST

app = Flask(
    __name__,
    static_folder=DIST_DIR,
    static_url_path="/",
)

# Configuration for persistent storage
app.config['DATA_DIR'] = os.environ.get("DATA_DIR", ".")

# Initialize database on startup (necessary for Gunicorn)
with app.app_context():
    init_db()

# Allow cross-origin requests from the Vite dev server during development
# (harmless in production since Flask serves the frontend directly)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# ── Register API Blueprints ──────────────────────────────────────────────────
app.register_blueprint(notebooks_bp)
app.register_blueprint(sources_bp)
app.register_blueprint(notes_bp)
app.register_blueprint(chat_bp)
app.register_blueprint(search_bp)


# ── Health check ─────────────────────────────────────────────────────────────
@app.route("/api/health")
def health():
    return jsonify({"status": "ok", "version": "1.0.0"})


# ── Serve React SPA ──────────────────────────────────────────────────────────
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_spa(path):
    """Serve the React single-page app.
    If the request is for an existing static asset, serve it directly.
    Otherwise fall back to index.html so React Router can handle navigation.
    """
    target = os.path.join(DIST_DIR, path)
    if path and os.path.exists(target):
        return send_from_directory(DIST_DIR, path)
    index = os.path.join(DIST_DIR, "index.html")
    if os.path.exists(index):
        return send_file(index)
    return jsonify({
        "message": "React frontend not built yet. Run: npm run build"
    }), 200


# ── SPA Fallback for 404s ────────────────────────────────────────────────────
@app.errorhandler(404)
def not_found(e):
    """If the 404 is for a non-API route, serve index.html so React Router
    can handle the route on the client side."""
    from flask import request
    if not request.path.startswith('/api/'):
        index = os.path.join(DIST_DIR, "index.html")
        if os.path.exists(index):
            return send_file(index)
    return jsonify({"error": "Not found"}), 404


# ── Startup ───────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    init_db()
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_ENV", "development") == "development"
    print(f"  * NoteBookLM backend running on http://localhost:{port}")
    print(f"  * Debug mode: {debug}")
    app.run(host="0.0.0.0", port=port, debug=debug)
