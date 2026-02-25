from flask import Blueprint, request, jsonify
from extensions import db
from models import Order
import os
import requests

orders_bp = Blueprint("orders", __name__)

@orders_bp.route("/send-order", methods=["POST"])
def send_order():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data"}), 400

    product = data.get("product")
    price = data.get("price")
    phone = data.get("phone")

    if not product or not price or not phone:
        return jsonify({"error": "Missing fields"}), 400

    new_order = Order(
        product=product,
        price=price,
        phone=phone
    )

    db.session.add(new_order)
    db.session.commit()

    # Telegram
    TOKEN = os.environ.get("BOT_TOKEN")
    CHAT_ID = os.environ.get("CHAT_ID")

    if TOKEN and CHAT_ID:
        text = f"""
🛒 YANGI BUYURTMA

Mahsulot: {product}
Narx: {price}
Telefon: {phone}
"""
        requests.post(
            f"https://api.telegram.org/bot{TOKEN}/sendMessage",
            json={"chat_id": CHAT_ID, "text": text},
            timeout=5
        )

    return jsonify({"status": "ok"})


@orders_bp.route("/orders", methods=["GET"])
def get_orders():
    orders = Order.query.order_by(Order.id.desc()).all()

    return jsonify([
        {
            "id": o.id,
            "product": o.product,
            "price": o.price,
            "phone": o.phone,
            "created_at": o.created_at.strftime("%Y-%m-%d %H:%M:%S")
        }
        for o in orders
    ])