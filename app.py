from flask import Flask, request, jsonify
from flask_cors import CORS
from config import Config
from extensions import db
from models import Product

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
    unit = request.form.get("unit")
    image = request.files.get("image")

    if not name or not price or not image:
        return jsonify({"error":"missing data"}),400

    filename = image.filename
    path = f"/image/{filename}"

    image.save("image/" + filename)

    product = Product(
        name=name,
        price=price,
        unit=unit,
        image=path
    )

    db.session.add(product)
    db.session.commit()

    return jsonify({"status":"ok"})


# =====================
# BLUEPRINTS
# =====================

app.register_blueprint(orders_bp)
app.register_blueprint(products_bp)

@app.route("/")
def home():
    return app.send_static_file("index.html")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)