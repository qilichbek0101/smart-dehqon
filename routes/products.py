from flask import Blueprint, jsonify, request
from models import Product, PriceHistory
from extensions import db
from ai_predict import predict_price

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
# PRICE HISTORY
# =========================
@products_bp.route("/price-stats/<name>")
def price_stats(name):

    data = PriceHistory.query.filter_by(
    product_name=name
).order_by(PriceHistory.created_at.desc()).limit(30).all()

    result = []

    for d in data:
        result.append({
            "price": int(d.price),
            "date": d.created_at.strftime("%d-%m")
        })

    return jsonify(result)


# =========================
# AI PRICE PREDICTION
# =========================
@products_bp.route("/price-predict/<name>")
def price_predict(name):

    history = PriceHistory.query.filter_by(
        product_name=name
    ).all()

    prices = [int(p.price) for p in history][-30:]

    if len(prices) < 2:
        return jsonify([])

    predictions = predict_price(prices)

    return jsonify(predictions)


# =========================
# DELETE PRODUCT
# =========================
@products_bp.route("/delete-product/<int:id>", methods=["DELETE"])
def delete_product(id):

    product = Product.query.get(id)

    if not product:
        return jsonify({"error": "Product not found"}), 404

    PriceHistory.query.filter_by(product_name=product.name).delete()

    db.session.delete(product)
    db.session.commit()

    return jsonify({"status": "deleted"})   

@products_bp.route("/update-product/<int:id>", methods=["PUT"])
def update_product(id):

    data = request.get_json()

    product = Product.query.get(id)

    if not product:
        return jsonify({"error":"Product not found"}),404

    product.name = data.get("name", product.name)
    product.price = int(data.get("price", product.price))
    product.unit = data.get("unit", product.unit)

    db.session.commit()

    return jsonify({"status":"updated"})

@products_bp.route("/price-recommend/<name>")
def price_recommend(name):

    history = PriceHistory.query.filter_by(
        product_name=name
    ).order_by(PriceHistory.created_at).all()

    prices = [int(p.price) for p in history][-30:]

    if len(prices) < 3:
        return jsonify({"recommend": prices[-1] if prices else 0})

    rec = recommend_price(prices)

    return jsonify({"recommend": rec})