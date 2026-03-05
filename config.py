import os

class Config:

    DB_URL = os.environ.get("DATABASE_URL")

    # Render postgres fix
    if DB_URL and DB_URL.startswith("postgres://"):
        DB_URL = DB_URL.replace("postgres://", "postgresql://", 1)

    # Agar Render bo'lmasa lokal SQLite ishlaydi
    SQLALCHEMY_DATABASE_URI = DB_URL or "sqlite:///database.db"

    SQLALCHEMY_TRACK_MODIFICATIONS = False