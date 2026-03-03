from flask import Flask, request, jsonify
from flask_cors import CORS
from config import Config
from extensions import db
from models import Product
from werkzeug.utils import secure_filename
import os

from routes.orders import orders_bp
from routes.products import products_bp

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

    if not name or not price or not image:
        return jsonify({"error": "missing data"}), 400

    try:
        price = int(price)
    except:
        return jsonify({"error": "price must be number"}), 400

    # Papka mavjudligini tekshirish
    if not os.path.exists("image"):
        os.makedirs("image")

    # Fayl nomini xavfsiz qilish
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
    db.session.commit()

    return jsonify({"status": "ok"})

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

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)