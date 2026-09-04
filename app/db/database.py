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

    # =========================
    # USERS
    # =========================

    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
        """
    )

    # =========================
    # TRANSACTIONS
    # =========================

    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            created_at TEXT NOT NULL,
            amount REAL NOT NULL,
            risk_score REAL NOT NULL,
            risk_score_percentage REAL NOT NULL,
            risk_level TEXT NOT NULL,
            decision TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
        """
    )

    # =========================
    # MIGRATE EXISTING DATABASES
    # =========================

    columns = connection.execute(
        """
        PRAGMA table_info(transactions)
        """
    ).fetchall()

    column_names = {
        column["name"]
        for column in columns
    }

    if "user_id" not in column_names:
        connection.execute(
            """
            ALTER TABLE transactions
            ADD COLUMN user_id INTEGER
            """
        )

    connection.commit()
    connection.close()


# =========================================================
# USER FUNCTIONS
# =========================================================


def create_user(
    name: str,
    email: str,
    password_hash: str,
    created_at: str,
):
    connection = get_connection()

    cursor = connection.execute(
        """
        INSERT INTO users (
            name,
            email,
            password_hash,
            created_at
        )
        VALUES (?, ?, ?, ?)
        """,
        (
            name,
            email,
            password_hash,
            created_at,
        ),
    )

    connection.commit()

    user_id = cursor.lastrowid

    connection.close()

    return user_id


def get_user_by_email(email: str):
    connection = get_connection()

    row = connection.execute(
        """
        SELECT
            id,
            name,
            email,
            password_hash,
            created_at
        FROM users
        WHERE email = ?
        """,
        (email,),
    ).fetchone()

    connection.close()

    return dict(row) if row else None


# =========================================================
# TRANSACTION FUNCTIONS
# =========================================================


def save_transaction(
    user_id: int,
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
            user_id,
            created_at,
            amount,
            risk_score,
            risk_score_percentage,
            risk_level,
            decision
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            user_id,
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


def get_transactions(
    user_id: int,
    limit: int = 10,
):
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
        WHERE user_id = ?
        ORDER BY id DESC
        LIMIT ?
        """,
        (
            user_id,
            limit,
        ),
    ).fetchall()

    connection.close()

    return [dict(row) for row in rows]


# =========================================================
# ANALYTICS
# =========================================================


def get_analytics(user_id: int):
    connection = get_connection()

    # =========================
    # TRANSACTION COUNTS
    # =========================

    total_transactions = connection.execute(
        """
        SELECT COUNT(*) AS count
        FROM transactions
        WHERE user_id = ?
        """,
        (user_id,),
    ).fetchone()["count"]

    blocked = connection.execute(
        """
        SELECT COUNT(*) AS count
        FROM transactions
        WHERE user_id = ?
        AND decision = 'BLOCK'
        """,
        (user_id,),
    ).fetchone()["count"]

    review = connection.execute(
        """
        SELECT COUNT(*) AS count
        FROM transactions
        WHERE user_id = ?
        AND decision = 'REVIEW'
        """,
        (user_id,),
    ).fetchone()["count"]

    allowed = connection.execute(
        """
        SELECT COUNT(*) AS count
        FROM transactions
        WHERE user_id = ?
        AND decision = 'ALLOW'
        """,
        (user_id,),
    ).fetchone()["count"]

    # =========================
    # RISK LEVEL COUNTS
    # =========================

    high_risk = connection.execute(
        """
        SELECT COUNT(*) AS count
        FROM transactions
        WHERE user_id = ?
        AND risk_level = 'HIGH'
        """,
        (user_id,),
    ).fetchone()["count"]

    medium_high_risk = connection.execute(
        """
        SELECT COUNT(*) AS count
        FROM transactions
        WHERE user_id = ?
        AND risk_level = 'MEDIUM-HIGH'
        """,
        (user_id,),
    ).fetchone()["count"]

    medium_risk = connection.execute(
        """
        SELECT COUNT(*) AS count
        FROM transactions
        WHERE user_id = ?
        AND risk_level = 'MEDIUM'
        """,
        (user_id,),
    ).fetchone()["count"]

    low_risk = connection.execute(
        """
        SELECT COUNT(*) AS count
        FROM transactions
        WHERE user_id = ?
        AND risk_level = 'LOW'
        """,
        (user_id,),
    ).fetchone()["count"]

    # =========================
    # FINANCIAL VALUE ANALYTICS
    # =========================

    total_value = connection.execute(
        """
        SELECT COALESCE(SUM(amount), 0) AS total
        FROM transactions
        WHERE user_id = ?
        """,
        (user_id,),
    ).fetchone()["total"]

    blocked_value = connection.execute(
        """
        SELECT COALESCE(SUM(amount), 0) AS total
        FROM transactions
        WHERE user_id = ?
        AND decision = 'BLOCK'
        """,
        (user_id,),
    ).fetchone()["total"]

    review_value = connection.execute(
        """
        SELECT COALESCE(SUM(amount), 0) AS total
        FROM transactions
        WHERE user_id = ?
        AND decision = 'REVIEW'
        """,
        (user_id,),
    ).fetchone()["total"]

    flagged_value = blocked_value + review_value

    connection.close()

    # =========================
    # DERIVED METRICS
    # =========================

    flagged_transactions = blocked + review

    if total_transactions > 0:
        flagged_rate = (
            flagged_transactions / total_transactions
        ) * 100
    else:
        flagged_rate = 0

    if total_value > 0:
        flagged_value_percentage = (
            flagged_value / total_value
        ) * 100
    else:
        flagged_value_percentage = 0

    return {
        # Transaction volume
        "total_transactions": total_transactions,

        # Decision breakdown
        "blocked": blocked,
        "review": review,
        "allowed": allowed,

        # Risk distribution
        "high_risk": high_risk,
        "medium_high_risk": medium_high_risk,
        "medium_risk": medium_risk,
        "low_risk": low_risk,

        # Financial exposure
        "total_value": total_value,
        "blocked_value": blocked_value,
        "review_value": review_value,
        "flagged_value": flagged_value,

        # Derived risk metrics
        "flagged_transactions": flagged_transactions,
        "flagged_rate": round(flagged_rate, 2),
        "flagged_value_percentage": round(
            flagged_value_percentage,
            2
        ),
    }