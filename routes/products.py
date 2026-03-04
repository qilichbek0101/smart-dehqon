from models import PriceHistory
from flask import Blueprint, jsonify
from models import Product

products_bp = Blueprint("products", __name__)

@products_bp.route("/products", methods=["GET"])
def get_products():
    products = Product.query.all()

    return jsonify([
        {
            "id": p.id,
            "name": p.name,
            "price": p.price,
            "unit": p.unit,
            "image": p.image
        }
        for p in products
    ])

    @products_bp.route("/price-stats/<name>")
def price_stats(name):

    data = PriceHistory.query.filter_by(product_name=name).all()

    return jsonify([
        {
            "price": p.price,
            "date": p.created_at.strftime("%d-%m")
        }
        for p in data
    ])