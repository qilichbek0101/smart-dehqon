import sqlite3
from datetime import datetime

def init_db():
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product TEXT,
            price TEXT,
            phone TEXT,
            created_at TEXT
        )
    """)

    conn.commit()
    conn.close()

init_db()

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os

app = Flask(__name__, static_folder=".", static_url_path="")
CORS(app)

TOKEN = os.environ.get("BOT_TOKEN")
CHAT_ID = os.environ.get("CHAT_ID")

@app.route("/send-order", methods=["POST"])
def send_order():
    data = request.json

    product = data.get("product")
    price = data.get("price")
    phone = data.get("phone")

    # SQLite saqlash
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO orders (product, price, phone, created_at)
        VALUES (?, ?, ?, ?)
    """, (product, price, phone, datetime.now().strftime("%Y-%m-%d %H:%M:%S")))

    conn.commit()
    conn.close()

    # Telegram yuborish
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
        }
    )

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