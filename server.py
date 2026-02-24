from flask import send_from_directory
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os

app = Flask(__name__)
CORS(app)

TOKEN = os.environ.get("8337983319:AAH3iAAqYc1ncV2vjzJaIa9nQlP3is0R6CI")
CHAT_ID = os.environ.get("7311023411")

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

    from flask import send_from_directory

@app.route("/")
def home():
    return send_from_directory(".", "index.html")