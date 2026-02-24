from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os

app = Flask(__name__)
CORS(app)

TOKEN = os.environ.get("BOT_TOKEN")
CHAT_ID = os.environ.get("CHAT_ID")

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

  if __name__ == "__main__":
         app.run(host="0.0.0.0", port=5000)