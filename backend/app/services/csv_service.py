import io
import re
import pandas as pd

REQUIRED = [
    "Transaction ID", "Date", "Time", "Product", "Category",
    "Quantity", "Unit Price", "Gross Sales", "Discount",
    "Net Sales", "Tax", "Total", "Payment Method", "Status"
]

ALIASES = {re.sub(r"[^a-z0-9]", "", c.lower()): c for c in REQUIRED}

def normalize_headers(df: pd.DataFrame) -> pd.DataFrame:
    rename = {}
    for col in df.columns:
        key = re.sub(r"[^a-z0-9]", "", str(col).strip().lower())
        if key in ALIASES:
            rename[col] = ALIASES[key]
    return df.rename(columns=rename)

def parse_number(value):
    if pd.isna(value) or str(value).strip() == "":
        return 0.0
    raw = str(value).strip()
    negative = raw.startswith("(") and raw.endswith(")")
    raw = raw.replace("$", "").replace(",", "").replace("%", "")
    raw = raw.replace("(", "").replace(")", "").replace(" ", "")
    raw = re.sub(r"[^0-9.\-]", "", raw)
    try:
        result = float(raw) if raw not in ("", "-", ".") else 0.0
        return -abs(result) if negative else result
    except ValueError:
        return 0.0

def load_square_csv(content: bytes):
    try:
        df = pd.read_csv(io.BytesIO(content), dtype=str,encoding="utf-8-sig")
    except Exception as exc:
        raise ValueError(f"Could not read CSV: {exc}") from exc

    df = normalize_headers(df)
    missing = [col for col in REQUIRED if col not in df.columns]
    if missing:
        raise ValueError("Missing required columns: " + ", ".join(missing))
    if df.empty:
        raise ValueError("The CSV contains no transaction rows.")

    df = df[REQUIRED].copy()
    for col in ["Transaction ID", "Product", "Category", "Payment Method", "Status", "Time"]:
        df[col] = df[col].fillna("").astype(str).str.strip()

    for col in ["Quantity", "Unit Price", "Gross Sales", "Discount", "Net Sales", "Tax", "Total"]:
        df[col] = df[col].map(parse_number)

    dates = pd.to_datetime(df["Date"], errors="coerce")
    if dates.isna().all():
        raise ValueError("No valid dates were found in the Date column.")
    df["Date"] = dates.dt.strftime("%Y-%m-%d")
    df = df[ df["Date"].notna() ].copy()

    df["Product"] = df["Product"].replace("", "Uncategorized product")
    df["Category"] = df["Category"].replace("", "Uncategorized")
    df["Payment Method"] = df["Payment Method"].replace("", "Unknown")

    # Remove rows without a transaction identifier only from order counting;
    # retain their sales rows so valid financial totals are not silently lost.
    return df
