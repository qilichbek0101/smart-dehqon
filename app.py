from flask import Flask, request, jsonify
from flask_cors import CORS
from config import Config
from extensions import db
from models import Product, PriceHistory
from werkzeug.utils import secure_filename
import os

from routes.orders import orders_bp
from routes.products import products_bp

# 🔥 AI import (TEPADA bo‘lishi shart)
from ai_predict import get_ai_insight


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

    # yangi mahsulot
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

    # =====================
    # PRICE HISTORY
    # =====================

    history = PriceHistory(
        product_name=name,
        price=price
    )

    db.session.add(history)
    db.session.commit()

    # faqat oxirgi 30 ta narxni qoldiramiz
    old = PriceHistory.query.filter_by(product_name=name) \
        .order_by(PriceHistory.created_at.desc()) \
        .offset(30).all()

    for r in old:
        db.session.delete(r)

    db.session.commit()

    return jsonify({"status": "ok"})


# =====================
# AI INSIGHT (🔥 YANGI)
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
    app.run(host="0.0.0.0", port=5000, debug=True)