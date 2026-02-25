from routes.products import products_bp
from flask import Flask
from flask_cors import CORS
from config import Config
from extensions import db
from routes.orders import orders_bp
from models import Product

app = Flask(__name__, static_folder=".", static_url_path="")
app.config.from_object(Config)

CORS(app)
db.init_app(app)

with app.app_context():
    db.create_all()

    # 🔴 seed
    if Product.query.count() == 0:
        db.session.add(Product(name="Pomidor", price=25000, image="/image/pomidor.jpeg"))
        db.session.add(Product(name="Piyoz", price=15000, image="/image/piyoz.jpeg"))
        db.session.add(Product(name="Kartoshka", price=7000, image="/image/kartoshka.jpeg"))
        db.session.commit()
        print(">>> SEEDED")

app.register_blueprint(orders_bp)

@app.route("/")
def home():
    return app.send_static_file("index.html")

    from routes.products import products_bp
app.register_blueprint(products_bp)
# app.register_blueprint(products_bp)