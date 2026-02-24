from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import requests
import os

app = Flask(__name__, static_folder=".")
CORS(app)

TOKEN = os.environ.get("BOT_TOKEN")
CHAT_ID = os.environ.get("CHAT_ID")

@app.route("/")
def home():
    return send_from_directory(".", "index.html")

@app.route("/send-order", methods=["POST"])
def send_order():
    data = request.json

    text = f"""
🛒 YANGI BUYURTMA

Mahsulot: {data.get('product')}
Narx: {data.get('price')}
Telefon: {data.get('phone')}
"""

    requests.post(
        f"https://api.telegram.org/bot{TOKEN}/sendMessage",
        json={
            "chat_id": CHAT_ID,
            "text": text
        }
    )

    return jsonify({"status": "ok"})