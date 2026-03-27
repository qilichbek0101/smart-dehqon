import numpy as np
from sklearn.linear_model import LinearRegression


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