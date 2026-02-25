from flask import Flask
from flask_cors import CORS
from config import Config
from extensions import db
from routes.orders import orders_bp

app = Flask(__name__, static_folder=".", static_url_path="")
app.config.from_object(Config)

CORS(app)

db.init_app(app)

with app.app_context():
    db.create_all()

app.register_blueprint(orders_bp)

@app.route("/")
def home():
    return app.send_static_file("index.html")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)