from flask import Blueprint, jsonify

products_bp = Blueprint("products", __name__)

@products_bp.route("/products", methods=["GET"])
def get_products():
    return jsonify({"status": "ok"})