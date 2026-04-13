import numpy as np
from sklearn.linear_model import LinearRegression
from PIL import Image
import io


DISEASE_LIBRARY = {
    "fitoftora": {
        "label": "Fitoftora ehtimoli",
        "sabab": "To'q jigarrang va qora dog'lar ko'paygani barg chirishi yoki zamburug' zararlanishini ko'rsatmoqda.",
        "tavsiyalar": [
            "Zararlangan barg va mevalarni ajratib oling",
            "Issiqxonada namlikni kamaytiring va shamollatishni kuchaytiring",
            "Mis yoki mankozeb asosidagi fungitsidni agronom tavsiyasi bilan qo'llang"
        ],
        "dori": ["Ridomil Gold", "Kurzat", "Revus"],
    },
    "un_shudring": {
        "label": "Un shudring ehtimoli",
        "sabab": "Oq rangli qoplama va barg yuzasidagi yorqin qatlam un shudringga o'xshash belgilar beradi.",
        "tavsiyalar": [
            "Qalin joylarni siyraklashtirib havo aylanishini yaxshilang",
            "Kasallangan barglarni olib tashlang",
            "Fungitsidni erta bosqichda qo'llang"
        ],
        "dori": ["Topaz", "Thiovit Jet"],
    },
    "xloroz": {
        "label": "Xloroz yoki oziqa tanqisligi",
        "sabab": "Sarg'ayish darajasi yuqori, bu azot yoki temir tanqisligi, ildiz stressi yoki sug'orish muammosini anglatishi mumkin.",
        "tavsiyalar": [
            "Azot va mikroelementli oziqlantirishni tekshiring",
            "Tuproq pH va namligini o'lchang",
            "Sug'orishni me'yorlashtiring"
        ],
        "dori": ["Karbamid", "Temir xelat"],
    },
    "quruq_dog": {
        "label": "Quruq dog' yoki kuyish ehtimoli",
        "sabab": "Jigarrang-quruq joylar ko'pligi quyosh kuyishi, suv tanqisligi yoki barg nekroziga mos keladi.",
        "tavsiyalar": [
            "Sug'orish rejimini tekshiring",
            "Kuchli quyosh vaqtida stressni kamaytiring",
            "Zararlangan barglarni kuzatib boring"
        ],
        "dori": ["Aminokislota spreyi", "Kaliyli oziqa"],
    },
    "soglom": {
        "label": "Kuchli kasallik belgisi topilmadi",
        "sabab": "Rasmda bargning asosiy qismi yashil ko'rinmoqda, aniq kasallik belgilari keskin emas.",
        "tavsiyalar": [
            "Yaqinroq va yorug'roq rasm yuklab qayta tekshirib ko'ring",
            "Bargning old va orqa qismini alohida suratga oling",
            "Sug'orish va oziqlantirish holatini kuzating"
        ],
        "dori": [],
    },
}


# =========================
# PRICE PREDICTION
# =========================

def predict_price(price_history):

    if len(price_history) < 2:
        return []

    X = np.arange(len(price_history)).reshape(-1, 1)
    y = np.array(price_history)

    model = LinearRegression()
    model.fit(X, y)

    future_days = 5

    future_X = np.arange(
        len(price_history),
        len(price_history) + future_days
    ).reshape(-1, 1)

    predictions = model.predict(future_X)

    return predictions.tolist()


# =========================
# CROP RECOMMENDATION
# =========================

def crop_recommendation(products, orders):

    scores = {}

    for p in products:

        demand = orders.get(p.name, 0)
        price = p.price

        score = demand * 2 + price / 1000

        scores[p.name] = score

    best = sorted(scores.items(), key=lambda x: x[1], reverse=True)

    return best


# =========================
# PRICE RECOMMENDATION
# =========================

def recommend_price(prices):

    if len(prices) < 3:
        return prices[-1] if prices else 0

    avg = np.mean(prices[-5:])
    trend = prices[-1] - prices[-3]

    recommended = avg + trend * 0.5

    return int(recommended)

    # ============ STARTUP FULL VILOYAT===========

def get_ai_insight(price_history):

    if len(price_history) < 3:
        return {
            "trend": "stable",
            "message": "Ma'lumot yetarli emas",
            "confidence": 50,
            "explanation": "Yetarli tarixiy ma'lumot yo‘q"
        }

    last = price_history[-1]
    first = price_history[0]

    change = last - first
    percent = (change / first) * 100 if first != 0 else 0

    # 🔥 TREND ANIQLASH
    if change > 0:
        trend = "up"
        message = "Narx oshmoqda"
    elif change < 0:
        trend = "down"
        message = "Narx tushmoqda"
    else:
        trend = "stable"
        message = "Narx barqaror"

    # 🔥 EXPLANATION
    explanation = f"So‘nggi {len(price_history)} kunda narx {first} → {last} ({round(percent,1)}%)"

    # 🔥 CONFIDENCE
    confidence = min(90, 50 + abs(percent))

    return {
        "trend": trend,
        "message": message,
        "confidence": int(confidence),
        "explanation": explanation
    }


def _safe_ratio(mask):
    return float(mask.mean()) if mask.size else 0.0


def _extract_image_features(image_bytes):

    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image = image.resize((224, 224))

    rgb = np.asarray(image).astype(np.float32) / 255.0
    r = rgb[:, :, 0]
    g = rgb[:, :, 1]
    b = rgb[:, :, 2]

    brightness = rgb.mean(axis=2)
    green_dominant = (g > r * 1.08) & (g > b * 1.08) & (g > 0.22)
    yellow_mask = (r > 0.42) & (g > 0.42) & (b < 0.42)
    brown_mask = (r > 0.32) & (g > 0.18) & (g < 0.55) & (b < 0.28)
    white_mask = (r > 0.72) & (g > 0.72) & (b > 0.72)
    dark_spot_mask = (brightness < 0.28) & (r > b * 0.95)

    return {
        "green_ratio": _safe_ratio(green_dominant),
        "yellow_ratio": _safe_ratio(yellow_mask),
        "brown_ratio": _safe_ratio(brown_mask),
        "white_ratio": _safe_ratio(white_mask),
        "dark_ratio": _safe_ratio(dark_spot_mask),
        "brightness": float(brightness.mean()),
        "contrast": float(brightness.std()),
    }


def analyze_disease_image(image_bytes):

    features = _extract_image_features(image_bytes)

    green_ratio = features["green_ratio"]
    yellow_ratio = features["yellow_ratio"]
    brown_ratio = features["brown_ratio"]
    white_ratio = features["white_ratio"]
    dark_ratio = features["dark_ratio"]

    disease_key = "soglom"
    confidence = 58

    if white_ratio > 0.12 and green_ratio > 0.18:
        disease_key = "un_shudring"
        confidence = min(95, int(62 + white_ratio * 220))
    elif dark_ratio > 0.10 and brown_ratio > 0.09:
        disease_key = "fitoftora"
        confidence = min(95, int(60 + dark_ratio * 170 + brown_ratio * 120))
    elif yellow_ratio > 0.22 and green_ratio < 0.42:
        disease_key = "xloroz"
        confidence = min(92, int(55 + yellow_ratio * 140))
    elif brown_ratio > 0.18:
        disease_key = "quruq_dog"
        confidence = min(88, int(52 + brown_ratio * 120))
    elif green_ratio > 0.45 and yellow_ratio < 0.16 and brown_ratio < 0.12:
        disease_key = "soglom"
        confidence = 80

    info = DISEASE_LIBRARY[disease_key]

    return {
        "kasallik": info["label"],
        "confidence": confidence,
        "sabab": info["sabab"],
        "tavsiyalar": info["tavsiyalar"],
        "dori": info["dori"],
        "analysis_type": "heuristic-image-ai",
        "features": {
            "green_ratio": round(green_ratio * 100, 1),
            "yellow_ratio": round(yellow_ratio * 100, 1),
            "brown_ratio": round(brown_ratio * 100, 1),
            "white_ratio": round(white_ratio * 100, 1),
            "dark_ratio": round(dark_ratio * 100, 1),
        },
        "note": "Bu natija rasm ranglari va dog'lar ulushiga asoslangan tezkor AI tahlildir. Yakuniy diagnoz uchun agronom tekshiruvi kerak.",
    }
