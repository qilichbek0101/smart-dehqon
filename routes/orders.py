from flask import Blueprint, request, jsonify, send_file
from extensions import db
from models import Order
import os
from dotenv import load_dotenv
import requests
import openpyxl
from io import BytesIO
load_dotenv()
orders_bp = Blueprint("orders", __name__)


# ==============================
# BUYURTMA YUBORISH
# ==============================
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

    # Telegram xabar
    TOKEN = os.getenv("BOT_TOKEN")
    CHAT_ID = os.getenv("CHAT_ID")
    print(TOKEN,CHAT_ID)

    if TOKEN and CHAT_ID:
        text = f"""
🛒 YANGI BUYURTMA

Mahsulot: {product}
Narx: {price}
Telefon: {phone}
"""
        try:
            requests.post(
                f"https://api.telegram.org/bot{TOKEN}/sendMessage",
                json={"chat_id": CHAT_ID, "text": text},
                timeout=5
            )
        except:
            pass

    return jsonify({"status": "ok"})


# ==============================
# BUYURTMALAR RO‘YXATI
# ==============================
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


# ==============================
# EXCEL EXPORT
# ==============================
@orders_bp.route("/orders/export", methods=["GET"])
def export_orders():

    orders = Order.query.order_by(Order.id.desc()).all()

    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Orders"

    ws.append(["ID", "Mahsulot", "Narx", "Telefon", "Sana"])

    for o in orders:
        ws.append([
            o.id,
            o.product,
            o.price,
            o.phone,
            o.created_at.strftime("%Y-%m-%d %H:%M")
        ])

    file = BytesIO()
    wb.save(file)
    file.seek(0)

    return send_file(
        file,
        as_attachment=True,
        download_name="orders.xlsx",
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )


# ======================
# TOP PRODUCTS + DEMAND
# ======================
@orders_bp.route("/top-products")
def top_products():

    from sqlalchemy import func

    data = db.session.query(
        Order.product,
        func.count(Order.id)
    ).group_by(Order.product).all()

    result = []

    # 🔥 LISTGA O‘TKAZAMIZ
    for product, count in data:
        result.append({
            "product": product,
            "orders": count
        })

    # 🔥 SORT
    result.sort(key=lambda x: x["orders"], reverse=True)

    # 🔥 DEMAND HISOBLASH (ENG MUHIM QISM)
    if result:
        max_count = result[0]["orders"]  # eng kattasi

        for item in result:
            ratio = item["orders"] / max_count

            if ratio >= 0.8:
                item["demand"] = "high"
            elif ratio >= 0.5:
                item["demand"] = "medium"
            else:
                item["demand"] = "low"

    return jsonify(result)