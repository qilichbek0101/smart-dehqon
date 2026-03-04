from flask import Blueprint, jsonify, request
from models import Product, PriceHistory
from extensions import db

products_bp = Blueprint("products", __name__)


# ======================
# GET PRODUCTS
# ======================

@products_bp.route("/products")
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


# ======================
# PRICE HISTORY
# ======================

@products_bp.route("/price-stats/<name>")
def price_stats(name):

    history = PriceHistory.query.filter_by(product_name=name).all()

    return jsonify([
        {
            "price": h.price,
            "date": h.created_at.strftime("%d-%m")
        }
        for h in history
    ])


# ======================
# DELETE PRODUCT
# ======================

@products_bp.route("/delete-product/<int:id>", methods=["DELETE"])
def delete_product(id):

    product = Product.query.get(id)

    if not product:
        return jsonify({"error": "not found"}), 404

    db.session.delete(product)
    db.session.commit()

    return jsonify({"status": "deleted"})


# ======================
# UPDATE PRODUCT
# ======================

@products_bp.route("/update-product/<int:id>", methods=["PUT"])
def update_product(id):

    product = Product.query.get(id)

    if not product:
        return jsonify({"error": "not found"}), 404

    data = request.json

    product.name = data["name"]
    product.price = data["price"]
    product.unit = data["unit"]

    db.session.commit()

    return jsonify({"status": "updated"})
from models import PriceHistory
from flask import jsonify

@products_bp.route("/price-stats/<name>")
def price_stats(name):

    data = PriceHistory.query.filter(
        PriceHistory.product_name.ilike(name)
    ).all()

    result = []

    for d in data:
        result.append({
            "price": d.price,
            "date": d.created_at.strftime("%d-%m")
        })

    return jsonify(result)

    print("PRODUCT NAME:", name)
print("RESULT:", data)
    