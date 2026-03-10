import numpy as np
from sklearn.linear_model import LinearRegression


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
# PRICE RECOMMENDATION
# =========================

def recommend_price(prices):

    if len(prices) < 3:
        return prices[-1] if prices else 0

    avg = np.mean(prices[-5:])
    trend = prices[-1] - prices[-3]

    recommended = avg + trend * 0.5

    return int(recommended)