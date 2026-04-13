from flask import Flask, request, jsonify
from flask_cors import CORS
from config import Config
from extensions import db
from models import Product, PriceHistory
from werkzeug.utils import secure_filename
import os

from routes.orders import orders_bp
from routes.products import products_bp

from ai_predict import get_ai_insight, analyze_disease_image

# =====================
# APP INIT (FAQAT 1 MARTA)
# =====================
app = Flask(__name__, static_folder=".", static_url_path="")
app.config.from_object(Config)

CORS(app)
db.init_app(app)

# =====================
# DB CREATE
# =====================
with app.app_context():
    db.create_all()

# =====================
# ADD PRODUCT
# =====================
@app.route("/add-product", methods=["POST"])
def add_product():

    name = request.form.get("name")
    price = request.form.get("price")
    unit = request.form.get("unit") or "kg"
    image = request.files.get("image")

    if not name or not price:
        return jsonify({"error": "missing data"}), 400

    name = name.strip().title()

    try:
        price = int(price)
    except:
        return jsonify({"error": "price must be number"}), 400

    product = Product.query.filter_by(name=name).first()

    if not product:

        if not image:
            return jsonify({"error": "image required"}), 400

        if not os.path.exists("image"):
            os.makedirs("image")

        filename = secure_filename(image.filename)
        image_path = os.path.join("image", filename)
        image.save(image_path)

        product = Product(
            name=name,
            price=price,
            unit=unit,
            image=f"/image/{filename}"
        )

        db.session.add(product)

    else:
        product.price = price

    history = PriceHistory(
        product_name=name,
        price=price
    )

    db.session.add(history)
    db.session.commit()

    old = PriceHistory.query.filter_by(product_name=name) \
        .order_by(PriceHistory.created_at.desc()) \
        .offset(30).all()

    for r in old:
        db.session.delete(r)

    db.session.commit()

    return jsonify({"status": "ok"})

# =====================
# AI INSIGHT
# =====================
@app.route("/ai-insight/<product_name>")
def ai_insight(product_name):

    history = PriceHistory.query \
        .filter(PriceHistory.product_name.ilike(product_name)) \
        .order_by(PriceHistory.created_at.asc()) \
        .all()

    prices = [h.price for h in history]

    result = get_ai_insight(prices)

    return jsonify(result)

# =====================
# 🔥 AI CHAT (ENG MUHIM)
# =====================
@app.route("/ai-chat", methods=["POST"])
def ai_chat():
    data = request.get_json()
    text = data.get("text", "").lower()

#    if "pomidor" in text:

    if "dog" in text or "qora" in text:
        return jsonify({
            "kasallik": "Fitoftora",
            "confidence": 85,
            "sabab": "Yuqori namlik va qo‘ziqorin kasalligi",
            "tavsiyalar": [
                "Zararlangan barglarni olib tashlang",
                "Sug‘orishni kamaytiring"
            ],
            "dori": ["Ridomil Gold", "Bravo"]
        })

    elif "sarg" in text:
        return jsonify({
            "kasallik": "Azot yetishmasligi",
            "confidence": 70,
            "sabab": "O‘g‘it yetishmasligi",
            "tavsiyalar": [
                "Azotli o‘g‘it qo‘shing",
                "Tuproqni tekshiring"
            ],
            "dori": ["Karbamid"]
        })

    elif "oq" in text:
        return jsonify({
            "kasallik": "Oq chirish",
            "confidence": 60,
            "sabab": "Zamburug‘ infektsiyasi",
            "tavsiyalar": [
                "Zararlangan qismlarni olib tashlang",
                "Namlikni kamaytiring"
            ],
            "dori": ["Topaz"]
        })

    elif "hasharot" in text:
        return jsonify({
            "kasallik": "Zararkunanda hujumi",
            "confidence": 75,
            "sabab": "Tuta absoluta yoki boshqa hasharot",
            "tavsiyalar": [
                "Barglarni tekshiring",
                "Zararlangan qismlarni olib tashlang"
            ],
            "dori": ["Aktara", "Karate"]
        })

    else:
        return jsonify({
            "kasallik": "Aniqlanmadi",
            "sabab": "Ma’lumot yetarli emas",
            "tavsiyalar": [
                "Batafsil yozing",
                "Rasm yuklang"
            ],
            "dori": []
        })


# =====================
# IMAGE DISEASE ANALYSIS
# =====================
@app.route("/analyze-disease-image", methods=["POST"])
def analyze_disease():

    image = request.files.get("image")

    if not image or not image.filename:
        return jsonify({"error": "Rasm yuborilmadi"}), 400

    filename = secure_filename(image.filename.lower())
    allowed = (".jpg", ".jpeg", ".png", ".webp")

    if not filename.endswith(allowed):
        return jsonify({"error": "Faqat jpg, jpeg, png, webp ruxsat"}), 400

    image_bytes = image.read()

    if not image_bytes:
        return jsonify({"error": "Rasm bo'sh"}), 400

    try:
        result = analyze_disease_image(image_bytes)
        return jsonify(result)
    except Exception as exc:
        return jsonify({
            "error": "Rasm tahlil qilinmadi",
            "details": str(exc)
        }), 500


# =====================
# BLUEPRINTS
# =====================
app.register_blueprint(orders_bp)
app.register_blueprint(products_bp)

# =====================
# HOME
# =====================
@app.route("/")
def home():
    return app.send_static_file("index.html")

# =====================
# RUN
# =====================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002, debug=True)
