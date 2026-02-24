from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import requests
import os
from datetime import datetime

# ==============================
# APP CONFIG
# ==============================

app = Flask(__name__, static_folder=".", static_url_path="")
CORS(app)

TOKEN = os.environ.get("BOT_TOKEN")
CHAT_ID = os.environ.get("CHAT_ID")

if not TOKEN or not CHAT_ID:
    print("⚠️ BOT_TOKEN yoki CHAT_ID topilmadi!")

# ==============================
# DATABASE INIT
# ==============================

def init_db():
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product TEXT NOT NULL,
            price TEXT NOT NULL,
            phone TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)

    conn.commit()
    conn.close()

init_db()

# ==============================
# ROUTES
# ==============================

@app.route("/")
def home():
    return app.send_static_file("index.html")


@app.route("/send-order", methods=["POST"])
def send_order():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data"}), 400

    product = data.get("product")
    price = data.get("price")
    phone = data.get("phone")

    if not product or not price or not phone:
        return jsonify({"error": "Missing fields"}), 400

    # 1️⃣ DB ga saqlash
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO orders (product, price, phone, created_at)
        VALUES (?, ?, ?, ?)
    """, (
        product,
        price,
        phone,
        datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    ))

    conn.commit()
    conn.close()

    # 2️⃣ Telegramga yuborish
    try:
        text = f"""
🛒 YANGI BUYURTMA

Mahsulot: {product}
Narx: {price}
Telefon: {phone}
"""

        requests.post(
            f"https://api.telegram.org/bot{TOKEN}/sendMessage",
            json={
                "chat_id": CHAT_ID,
                "text": text
            },
            timeout=5
        )
    except Exception as e:
        print("Telegram error:", e)

    return jsonify({"status": "ok"})


@app.route("/orders", methods=["GET"])
def get_orders():
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM orders ORDER BY id DESC")
    rows = cursor.fetchall()

    conn.close()

    orders = []
    for row in rows:
        orders.append({
            "id": row[0],
            "product": row[1],
            "price": row[2],
            "phone": row[3],
            "created_at": row[4]
        })

    return jsonify(orders)


# ==============================
# START (Render uchun)
# ==============================

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)