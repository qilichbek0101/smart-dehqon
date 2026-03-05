import numpy as np
from sklearn.linear_model import LinearRegression


def predict_price(price_history):

    prices = np.array(price_history)

    # agar data juda kam bo‘lsa
    if len(prices) < 3:
        return prices.tolist()

    # ===== SMOOTHING (shovqinni kamaytirish) =====
    window = 3
    smoothed = np.convolve(prices, np.ones(window)/window, mode='valid')

    # ===== MODEL TRAIN =====
    X = np.arange(len(smoothed)).reshape(-1,1)
    y = smoothed

    model = LinearRegression()
    model.fit(X, y)

    # ===== FUTURE PREDICTION =====
    future_days = 5

    future_X = np.arange(
        len(smoothed),
        len(smoothed) + future_days
    ).reshape(-1,1)

    predictions = model.predict(future_X)

    return predictions.tolist()