import pickle
from pathlib import Path

import shap


# ------------------------------------------------------------
# Model paths
# ------------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parents[2]

MODEL_PATH = (
    BASE_DIR
    / "models"
    / "animus_xgboost.pkl"
)

CONFIG_PATH = (
    BASE_DIR
    / "models"
    / "animus_model_config.pkl"
)


# ------------------------------------------------------------
# Load frozen Animus model
# ------------------------------------------------------------

with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)

with open(CONFIG_PATH, "rb") as f:
    config = pickle.load(f)


# ------------------------------------------------------------
# Model configuration
# ------------------------------------------------------------

MODEL_FEATURES = config["features"]
THRESHOLD = config["threshold"]


# ------------------------------------------------------------
# SHAP explainer
# ------------------------------------------------------------

explainer = shap.TreeExplainer(model)


# ------------------------------------------------------------
# Human-readable explanation mapping
# ------------------------------------------------------------

FEATURE_EXPLANATIONS = {
    "CUSTOMER_AMOUNT_RATIO":
        "Customer transaction amount compared with their historical spending pattern.",

    "CUSTOMER_PREV_AMOUNT":
        "Customer's previous transaction amount.",

    "CUSTOMER_AMOUNT_DEVIATION":
        "Difference between the transaction amount and the customer's historical average.",

    "CUSTOMER_AVG_AMOUNT_BEFORE":
        "Customer's historical average transaction amount.",

    "CUSTOMER_TX_COUNT_BEFORE":
        "Customer's historical transaction activity.",

    "CUSTOMER_TX_COUNT_5M":
        "Customer's transaction activity over the past 5 minutes.",

    "CUSTOMER_TX_COUNT_1H":
        "Customer's transaction activity over the past hour.",

    "CUSTOMER_TX_COUNT_24H":
        "Customer's transaction activity over the past 24 hours.",

    "TERMINAL_AMOUNT_RATIO":
        "Transaction amount compared with the terminal's historical transaction pattern.",

    "TERMINAL_AMOUNT_DEVIATION":
        "Difference between the transaction amount and the terminal's historical average.",

    "TERMINAL_AVG_AMOUNT_BEFORE":
        "Terminal's historical average transaction amount.",

    "TERMINAL_TX_COUNT_BEFORE":
        "Terminal's historical transaction activity.",

    "TERMINAL_TX_COUNT_5M":
        "Terminal's transaction activity over the past 5 minutes.",

    "TERMINAL_TX_COUNT_1H":
        "Terminal's transaction activity over the past hour.",

    "TERMINAL_TX_COUNT_24H":
        "Terminal's transaction activity over the past 24 hours.",

    "SYSTEM_TX_COUNT_5M":
        "System-wide transaction activity over the past 5 minutes.",

    "SYSTEM_TX_COUNT_1H":
        "System-wide transaction activity over the past hour.",

    "SYSTEM_TX_COUNT_24H":
        "System-wide transaction activity over the past 24 hours."
}


print("Animus fraud detector loaded.")
print("Features :", len(MODEL_FEATURES))
print("Threshold:", THRESHOLD)


# ------------------------------------------------------------
# Fraud prediction
# ------------------------------------------------------------

def predict_transaction(transaction_data: dict) -> dict:
    """
    Score a transaction using the frozen Animus model.
    """

    # --------------------------------------------------------
    # Validate required features
    # --------------------------------------------------------

    missing_features = [
        feature
        for feature in MODEL_FEATURES
        if feature not in transaction_data
    ]

    if missing_features:
        raise ValueError(
            f"Missing required features: {missing_features}"
        )

    # --------------------------------------------------------
    # Build model input
    # --------------------------------------------------------

    import pandas as pd

    model_input = pd.DataFrame(
        [[transaction_data[feature] for feature in MODEL_FEATURES]],
        columns=MODEL_FEATURES
    )

    # --------------------------------------------------------
    # Generate risk score
    # --------------------------------------------------------

    risk_score = float(
        model.predict_proba(model_input)[0, 1]
    )

    # --------------------------------------------------------
    # Apply frozen threshold
    # --------------------------------------------------------

    is_fraud = risk_score >= THRESHOLD

    # --------------------------------------------------------
    # Risk level
    # --------------------------------------------------------

    if risk_score >= 0.90:
        risk_level = "HIGH"

    elif risk_score >= THRESHOLD:
        risk_level = "MEDIUM-HIGH"

    elif risk_score >= 0.50:
        risk_level = "MEDIUM"

    else:
        risk_level = "LOW"

    # --------------------------------------------------------
    # Operational decision
    # --------------------------------------------------------

    if risk_score >= 0.90:
        decision = "BLOCK"

    elif risk_score >= THRESHOLD:
        decision = "REVIEW"

    elif risk_score >= 0.50:
        decision = "REVIEW"

    else:
        decision = "ALLOW"

    # --------------------------------------------------------
    # Final response
    # --------------------------------------------------------

    return {
        "risk_score": risk_score,
        "risk_score_percentage": round(risk_score * 100, 4),
        "threshold": THRESHOLD,
        "threshold_percentage": round(THRESHOLD * 100, 2),
        "is_fraud": bool(is_fraud),
        "risk_level": risk_level,
        "decision": decision
    }


# ------------------------------------------------------------
# Transaction explanation
# ------------------------------------------------------------

def explain_transaction(
    transaction_data: dict,
    top_n: int = 5
) -> list:
    """
    Generate SHAP-based explanations for a transaction.

    Returns the top features contributing to the fraud prediction.
    """

    # --------------------------------------------------------
    # Validate required features
    # --------------------------------------------------------

    missing_features = [
        feature
        for feature in MODEL_FEATURES
        if feature not in transaction_data
    ]

    if missing_features:
        raise ValueError(
            f"Missing required features: {missing_features}"
        )

    # --------------------------------------------------------
    # Build model input
    # --------------------------------------------------------

    import pandas as pd

    model_input = pd.DataFrame(
        [[transaction_data[feature] for feature in MODEL_FEATURES]],
        columns=MODEL_FEATURES
    )

    # --------------------------------------------------------
    # Generate SHAP values
    # --------------------------------------------------------

    shap_values = explainer.shap_values(model_input)

    values = shap_values[0]

    # --------------------------------------------------------
    # Build explanations
    # --------------------------------------------------------

    explanations = []

    for feature, value, shap_value in zip(
        MODEL_FEATURES,
        model_input.iloc[0].values,
        values
    ):

        base_description = FEATURE_EXPLANATIONS.get(
            feature,
            "This feature contributes to the transaction risk."
        )

        # ----------------------------------------------------
        # Determine SHAP direction
        # ----------------------------------------------------

        if shap_value > 0:
            direction = "increases_risk"

            description = (
                f"{base_description} "
                "This factor is contributing to higher fraud risk."
            )

        else:
            direction = "reduces_risk"

            description = (
                f"{base_description} "
                "This factor is contributing to lower fraud risk."
            )

        # ----------------------------------------------------
        # Store explanation
        # ----------------------------------------------------

        explanations.append({
            "feature": feature,
            "value": float(value),
            "impact": float(shap_value),
            "direction": direction,
            "description": description
        })

    # --------------------------------------------------------
    # Strongest contributors first
    # --------------------------------------------------------

    explanations.sort(
        key=lambda x: abs(x["impact"]),
        reverse=True
    )

    return explanations[:top_n]