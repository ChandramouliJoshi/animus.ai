import pickle
from pathlib import Path

import pandas as pd
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
        "Compares this transaction amount with the customer's historical spending pattern.",

    "CUSTOMER_PREV_AMOUNT":
        "The customer's previous transaction amount.",

    "CUSTOMER_AMOUNT_DEVIATION":
        "Measures how far this transaction amount is from the customer's historical average.",

    "CUSTOMER_AVG_AMOUNT_BEFORE":
        "The customer's historical average transaction amount.",

    "CUSTOMER_TX_COUNT_BEFORE":
        "The customer's historical transaction activity before this transaction.",

    "CUSTOMER_TX_COUNT_5M":
        "The customer's transaction activity during the previous 5 minutes.",

    "CUSTOMER_TX_COUNT_1H":
        "The customer's transaction activity during the previous hour.",

    "CUSTOMER_TX_COUNT_24H":
        "The customer's transaction activity during the previous 24 hours.",

    "TERMINAL_AMOUNT_RATIO":
        "Compares this transaction amount with the terminal's historical transaction pattern.",

    "TERMINAL_AMOUNT_DEVIATION":
        "Measures how far this transaction amount is from the terminal's historical average.",

    "TERMINAL_AVG_AMOUNT_BEFORE":
        "The terminal's historical average transaction amount.",

    "TERMINAL_TX_COUNT_BEFORE":
        "The terminal's historical transaction activity before this transaction.",

    "TERMINAL_TX_COUNT_5M":
        "The terminal's transaction activity during the previous 5 minutes.",

    "TERMINAL_TX_COUNT_1H":
        "The terminal's transaction activity during the previous hour.",

    "TERMINAL_TX_COUNT_24H":
        "The terminal's transaction activity during the previous 24 hours.",

    "SYSTEM_TX_COUNT_5M":
        "System-wide transaction activity during the previous 5 minutes.",

    "SYSTEM_TX_COUNT_1H":
        "System-wide transaction activity during the previous hour.",

    "SYSTEM_TX_COUNT_24H":
        "System-wide transaction activity during the previous 24 hours."
}


print("Animus fraud detector loaded.")
print("Features :", len(MODEL_FEATURES))
print("Threshold:", THRESHOLD)


# ------------------------------------------------------------
# Helpers
# ------------------------------------------------------------

def _build_model_input(transaction_data: dict) -> pd.DataFrame:
    """
    Validate and construct the model input using the frozen
    feature ordering from the trained model configuration.
    """

    missing_features = [
        feature
        for feature in MODEL_FEATURES
        if feature not in transaction_data
    ]

    if missing_features:
        raise ValueError(
            f"Missing required features: {missing_features}"
        )

    return pd.DataFrame(
        [[transaction_data[feature] for feature in MODEL_FEATURES]],
        columns=MODEL_FEATURES
    )


def _format_value(feature: str, value: float) -> str:
    """
    Convert raw feature values into readable values for explanations.
    """

    if value is None:
        return "N/A"

    # Ratios
    if "RATIO" in feature:
        return f"{value:.2f}×"

    # Monetary values
    if (
        "AMOUNT" in feature
        or "DEVIATION" in feature
    ):
        return f"₹{value:,.2f}"

    # Counts
    if "COUNT" in feature:
        return f"{value:,.0f}"

    return f"{value:.2f}"


def _build_transaction_specific_description(
    feature: str,
    value: float,
    direction: str
) -> str:
    """
    Build a human-readable explanation using the actual
    transaction feature value and SHAP direction.
    """

    readable_value = _format_value(feature, value)

    if feature == "CUSTOMER_AMOUNT_RATIO":
        if value > 1:
            context = (
                f"The transaction is {value:.2f}× the customer's "
                "historical average amount."
            )
        else:
            context = (
                f"The transaction is {value:.2f}× the customer's "
                "historical average amount."
            )

    elif feature == "CUSTOMER_AMOUNT_DEVIATION":
        context = (
            f"The transaction differs from the customer's historical "
            f"average by {readable_value}."
        )

    elif feature == "CUSTOMER_AVG_AMOUNT_BEFORE":
        context = (
            f"The customer's historical average transaction amount "
            f"is {readable_value}."
        )

    elif feature == "CUSTOMER_PREV_AMOUNT":
        context = (
            f"The customer's previous transaction amount was "
            f"{readable_value}."
        )

    elif feature == "CUSTOMER_TX_COUNT_BEFORE":
        context = (
            f"The customer had {readable_value} previous transactions "
            "in the available history."
        )

    elif feature == "TERMINAL_AMOUNT_RATIO":
        context = (
            f"The transaction amount is {value:.2f}× the terminal's "
            "historical transaction pattern."
        )

    elif feature == "TERMINAL_AMOUNT_DEVIATION":
        context = (
            f"The transaction differs from the terminal's historical "
            f"average by {readable_value}."
        )

    elif feature == "TERMINAL_AVG_AMOUNT_BEFORE":
        context = (
            f"The terminal's historical average transaction amount "
            f"is {readable_value}."
        )

    elif feature == "TERMINAL_TX_COUNT_BEFORE":
        context = (
            f"The terminal has processed {readable_value} previous "
            "transactions in the available history."
        )

    elif feature == "CUSTOMER_TX_COUNT_5M":
        context = (
            f"The customer made {readable_value} transaction(s) "
            "during the previous 5 minutes."
        )

    elif feature == "CUSTOMER_TX_COUNT_1H":
        context = (
            f"The customer made {readable_value} transaction(s) "
            "during the previous hour."
        )

    elif feature == "CUSTOMER_TX_COUNT_24H":
        context = (
            f"The customer made {readable_value} transaction(s) "
            "during the previous 24 hours."
        )

    elif feature == "TERMINAL_TX_COUNT_5M":
        context = (
            f"The terminal processed {readable_value} transaction(s) "
            "during the previous 5 minutes."
        )

    elif feature == "TERMINAL_TX_COUNT_1H":
        context = (
            f"The terminal processed {readable_value} transaction(s) "
            "during the previous hour."
        )

    elif feature == "TERMINAL_TX_COUNT_24H":
        context = (
            f"The terminal processed {readable_value} transaction(s) "
            "during the previous 24 hours."
        )

    elif feature == "SYSTEM_TX_COUNT_5M":
        context = (
            f"The system processed {readable_value} transaction(s) "
            "during the previous 5 minutes."
        )

    elif feature == "SYSTEM_TX_COUNT_1H":
        context = (
            f"The system processed {readable_value} transaction(s) "
            "during the previous hour."
        )

    elif feature == "SYSTEM_TX_COUNT_24H":
        context = (
            f"The system processed {readable_value} transaction(s) "
            "during the previous 24 hours."
        )

    else:
        context = FEATURE_EXPLANATIONS.get(
            feature,
            "This feature contributes to the transaction risk."
        )

    if direction == "increases_risk":
        effect = "This signal pushed the model toward higher fraud risk."
    else:
        effect = "This signal pushed the model toward lower fraud risk."

    return f"{context} {effect}"


# ------------------------------------------------------------
# Fraud prediction
# ------------------------------------------------------------

def predict_transaction(transaction_data: dict) -> dict:
    """
    Score a transaction using the frozen Animus model.

    risk_score represents the model's estimated fraud probability.
    It should not be interpreted as generic model confidence.
    """

    model_input = _build_model_input(transaction_data)

    # --------------------------------------------------------
    # Generate fraud probability
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

    SHAP impact represents the feature's contribution to the
    model output. Positive values push the prediction toward
    higher fraud risk; negative values push it toward lower risk.

    The returned list is sorted by absolute contribution.
    """

    model_input = _build_model_input(transaction_data)

    # --------------------------------------------------------
    # Generate SHAP values
    # --------------------------------------------------------

    shap_values = explainer.shap_values(model_input)

    # Handle standard binary XGBoost SHAP output.
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

        shap_value = float(shap_value)
        value = float(value)

        # ----------------------------------------------------
        # Determine SHAP direction
        # ----------------------------------------------------

        if shap_value > 0:
            direction = "increases_risk"
        elif shap_value < 0:
            direction = "reduces_risk"
        else:
            direction = "neutral"

        # ----------------------------------------------------
        # Human-readable description
        # ----------------------------------------------------

        if direction == "neutral":
            description = (
                f"{FEATURE_EXPLANATIONS.get(feature, 'This feature was considered by the model.')} "
                "This signal had negligible influence on the prediction."
            )
        else:
            description = _build_transaction_specific_description(
                feature,
                value,
                direction
            )

        # ----------------------------------------------------
        # Store explanation
        # ----------------------------------------------------

        explanations.append({
            "feature": feature,
            "value": value,
            "value_display": _format_value(feature, value),

            # SHAP contribution in model-output space.
            "impact": shap_value,

            "direction": direction,

            "description": description
        })

    # --------------------------------------------------------
    # Sort strongest contributors first
    # --------------------------------------------------------

    explanations.sort(
        key=lambda x: abs(x["impact"]),
        reverse=True
    )

    return explanations[:top_n]