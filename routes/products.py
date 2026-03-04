from flask import Blueprint, jsonify
from models import Product, PriceHistory

products_bp = Blueprint("products", __name__)


# =========================
# PRODUCT LIST
# =========================

@products_bp.route("/products")
def get_products():

    products = Product.query.all()

    result = []

    for p in products:
        result.append({
            "id": p.id,
            "name": p.name,
            "price": p.price,
            "unit": p.unit,
            "image": p.image
        })

    return jsonify(result)


# =========================
# PRICE GRAPH
# =========================

@products_bp.route("/price-stats/<name>")
def price_stats(name):

    data = PriceHistory.query.filter_by(
        product_name=name
    ).all()

    result = []

    for d in data:
        result.append({
            "price": d.price,
            "date": d.created_at.strftime("%d-%m")
        })

    return jsonify(result)