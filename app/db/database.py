import sqlite3
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parents[2]
DATABASE_PATH = BASE_DIR / "data" / "animus.db"


def get_connection():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database():
    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)

    connection = get_connection()

    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at TEXT NOT NULL,
            amount REAL NOT NULL,
            risk_score REAL NOT NULL,
            risk_score_percentage REAL NOT NULL,
            risk_level TEXT NOT NULL,
            decision TEXT NOT NULL
        )
        """
    )

    connection.commit()
    connection.close()


def save_transaction(
    created_at: str,
    amount: float,
    risk_score: float,
    risk_score_percentage: float,
    risk_level: str,
    decision: str,
):
    connection = get_connection()

    cursor = connection.execute(
        """
        INSERT INTO transactions (
            created_at,
            amount,
            risk_score,
            risk_score_percentage,
            risk_level,
            decision
        )
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (
            created_at,
            amount,
            risk_score,
            risk_score_percentage,
            risk_level,
            decision,
        ),
    )

    connection.commit()

    transaction_id = cursor.lastrowid

    connection.close()

    return transaction_id


def get_transactions(limit: int = 10):
    connection = get_connection()

    rows = connection.execute(
        """
        SELECT
            id,
            created_at,
            amount,
            risk_score,
            risk_score_percentage,
            risk_level,
            decision
        FROM transactions
        ORDER BY id DESC
        LIMIT ?
        """,
        (limit,),
    ).fetchall()

    connection.close()

    return [dict(row) for row in rows]

def get_analytics():
    connection = get_connection()

    total_transactions = connection.execute(
        """
        SELECT COUNT(*) AS count
        FROM transactions
        """
    ).fetchone()["count"]

    blocked = connection.execute(
        """
        SELECT COUNT(*) AS count
        FROM transactions
        WHERE decision = 'BLOCK'
        """
    ).fetchone()["count"]

    review = connection.execute(
        """
        SELECT COUNT(*) AS count
        FROM transactions
        WHERE decision = 'REVIEW'
        """
    ).fetchone()["count"]

    allowed = connection.execute(
        """
        SELECT COUNT(*) AS count
        FROM transactions
        WHERE decision = 'ALLOW'
        """
    ).fetchone()["count"]

    high_risk = connection.execute(
        """
        SELECT COUNT(*) AS count
        FROM transactions
        WHERE risk_level = 'HIGH'
        """
    ).fetchone()["count"]

    medium_high_risk = connection.execute(
        """
        SELECT COUNT(*) AS count
        FROM transactions
        WHERE risk_level = 'MEDIUM-HIGH'
        """
    ).fetchone()["count"]

    medium_risk = connection.execute(
        """
        SELECT COUNT(*) AS count
        FROM transactions
        WHERE risk_level = 'MEDIUM'
        """
    ).fetchone()["count"]

    low_risk = connection.execute(
        """
        SELECT COUNT(*) AS count
        FROM transactions
        WHERE risk_level = 'LOW'
        """
    ).fetchone()["count"]

    connection.close()

    return {
        "total_transactions": total_transactions,
        "blocked": blocked,
        "review": review,
        "allowed": allowed,
        "high_risk": high_risk,
        "medium_high_risk": medium_high_risk,
        "medium_risk": medium_risk,
        "low_risk": low_risk,
    }