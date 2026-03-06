"""
Search routes.
Handles: web search for discovering new sources.
"""
from flask import Blueprint, jsonify, request
from processors.web_search import search_web

bp = Blueprint("search", __name__)


@bp.route("/api/search", methods=["GET"])
def search():
    """Search the web and return results."""
    query = request.args.get("q", "").strip()
    if not query:
        return jsonify({"error": "query parameter 'q' is required"}), 400

    try:
        results = search_web(query, num_results=6)
        return jsonify({"results": results, "query": query})
    except Exception as e:
        return jsonify({"error": f"Search failed: {str(e)}"}), 500
