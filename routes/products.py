from flask import Blueprint, jsonify, request
from models import Product, PriceHistory, Order
from extensions import db
from ai_predict import predict_price, crop_recommendation, recommend_price

products_bp = Blueprint("products", __name__)


# =========================
# PRODUCT LIST
# =========================
@products_bp.route("/products")
def get_products():

    products = Product.query.order_by(Product.id.desc()).all()

    result = []
    seen = set()

    for p in products:

        # duplicate mahsulotlarni chiqarib tashlaymiz
        if p.name in seen:
            continue

        seen.add(p.name)

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
# PRICE RECOMMENDATION
# =========================
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


# =========================
# UPDATE PRODUCT
# =========================
@products_bp.route("/update-product/<int:id>", methods=["PUT"])
def update_product(id):

    data = request.get_json(silent=True) or {}

    product = Product.query.get(id)

    if not product:
        return jsonify({"error": "Product not found"}), 404

    old_name = product.name
    new_name = (data.get("name") or product.name or "").strip()
    new_unit = (data.get("unit") or product.unit or "kg").strip()

    if not new_name:
        return jsonify({"error": "Mahsulot nomini kiriting"}), 400

    duplicate = Product.query.filter(
        Product.name == new_name,
        Product.id != product.id
    ).first()

    if duplicate:
        return jsonify({"error": "Bu nomdagi mahsulot mavjud"}), 409

    try:
        new_price = int(data.get("price", product.price))
    except (TypeError, ValueError):
        return jsonify({"error": "Narx raqam bo'lishi kerak"}), 400

    if new_price <= 0:
        return jsonify({"error": "Narx 0 dan katta bo'lishi kerak"}), 400

    price_changed = product.price != new_price

    product.name = new_name
    product.price = new_price
    product.unit = new_unit

    if old_name != new_name:
        PriceHistory.query.filter_by(product_name=old_name).update(
            {"product_name": new_name}
        )

    if price_changed:
        db.session.add(PriceHistory(product_name=new_name, price=new_price))

    db.session.commit()

    return jsonify({"status": "updated"})


# =========================
# CROP RECOMMENDATION
# =========================
@products_bp.route("/crop-recommendation")
def crop_recommend():

    products = Product.query.all()

    orders = {}
    all_orders = Order.query.all()

    for o in all_orders:
        orders[o.product] = orders.get(o.product, 0) + 1

    rec = crop_recommendation(products, orders)

    return jsonify(rec)
