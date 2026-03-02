from flask import Blueprint, jsonify, request
from models import Product
from extensions import db

products_bp = Blueprint("products", __name__)


# 🔹 mahsulotlarni olish
@products_bp.route("/products", methods=["GET"])
def get_products():

    products = Product.query.all()

    return jsonify([
        {
            "id": p.id,
            "name": p.name,
            "price": p.price,
            "image": p.image,
            "unit": p.unit
        }
        for p in products
    ])


# 🔹 mahsulot qo‘shish
@products_bp.route("/add-product", methods=["POST"])
def add_product():

    data = request.get_json()

    name = data.get("name")
    price = data.get("price")
    unit = data.get("unit")
    image = data.get("image")

    if not name or not price:
        return jsonify({"error":"missing fields"}),400

    product = Product(
        name=name,
        price=price,
        unit=unit,
        image=image
    )

    db.session.add(product)
    db.session.commit()

    return jsonify({"status":"ok"})