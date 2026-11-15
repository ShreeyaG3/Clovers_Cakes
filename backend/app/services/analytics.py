from collections import Counter
import pandas as pd

EXCLUDED_STATUS_PARTS = ("void", "cancel", "failed")

def _records(frame):
    return frame.where(pd.notnull(frame), None).to_dict(orient="records")

def generate_dashboard(rows, start_date=None, end_date=None):
    df = pd.DataFrame(rows)
    if df.empty:
        return {"empty": True, "summary": {}, "daily_sales": [], "monthly_sales": [],
                "top_products": [], "categories": [], "payments": [],
                "weekdays": [], "hours": [], "insights": []}

    df["Date"] = pd.to_datetime(df["Date"], errors="coerce")
    df = df[df["Date"].notna()].copy()
    for col in ["Quantity", "Unit Price", "Gross Sales", "Discount", "Net Sales", "Tax", "Total"]:
        df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

    status = df["Status"].fillna("").astype(str).str.lower()
    df = df[~status.apply(lambda s: any(part in s for part in EXCLUDED_STATUS_PARTS))].copy()

    if start_date:
        df = df[df["Date"] >= pd.Timestamp(start_date)]
    if end_date:
        df = df[df["Date"] < (pd.Timestamp(end_date) + pd.Timedelta(days=1))]

    if df.empty:
        return {"empty": True, "summary": {}, "daily_sales": [], "monthly_sales": [],
                "top_products": [], "categories": [], "payments": [],
                "weekdays": [], "hours": [], "insights": ["No valid sales found in this date range."]}

    revenue = float(df["Net Sales"].sum())
    gross = float(df["Gross Sales"].sum())
    discounts = float(df["Discount"].sum())
    orders = int(df.loc[df["Transaction ID"].astype(str).str.strip() != "", "Transaction ID"].nunique())
    units = float(df["Quantity"].sum())
    aov = revenue / orders if orders else 0

    daily = df.groupby(df["Date"].dt.strftime("%Y-%m-%d"), as_index=False)["Net Sales"].sum()
    daily.columns = ["date", "sales"]

    monthly = df.groupby(df["Date"].dt.to_period("M").astype(str), as_index=False)["Net Sales"].sum()
    monthly.columns = ["month", "sales"]

    products = df.groupby("Product", dropna=False).agg(
        revenue=("Net Sales", "sum"), quantity=("Quantity", "sum"),
        orders=("Transaction ID", "nunique")
    ).reset_index().sort_values("revenue", ascending=False)
    products.columns = ["product", "revenue", "quantity", "orders"]

    categories = df.groupby("Category", dropna=False)["Net Sales"].sum().reset_index()
    categories.columns = ["category", "revenue"]
    categories = categories.sort_values("revenue", ascending=False)
    categories["percentage"] = (categories["revenue"] / revenue * 100) if revenue else 0

    payments = df.groupby("Payment Method")["Net Sales"].sum().reset_index()
    payments.columns = ["method", "revenue"]
    payments = payments.sort_values("revenue", ascending=False)

    weekday_order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    df["weekday"] = df["Date"].dt.day_name()
    weekdays = df.groupby("weekday")["Net Sales"].sum().reindex(weekday_order, fill_value=0).rename_axis("day").reset_index()
    weekdays.columns = ["day", "sales"]

    df["hour"] = pd.to_datetime(df["Time"], format="%H:%M:%S", errors="coerce")
    missing_hour = df["hour"].isna()
    df.loc[missing_hour, "hour"] = pd.to_datetime(df.loc[missing_hour, "Time"], format="%H:%M", errors="coerce")
    df["hour_label"] = df["hour"].dt.hour.map(lambda h: f"{int(h):02d}:00" if pd.notna(h) else "Unknown")
    hours = df.groupby("hour_label")["Net Sales"].sum().reset_index()
    hours.columns = ["hour", "sales"]
    hours = hours.sort_values("hour")

    insights = []
    if not products.empty:
        p = products.iloc[0]
        insights.append(f"{p['product']} is your highest-revenue product, generating ${p['revenue']:,.2f}.")
        most_units = products.sort_values("quantity", ascending=False).iloc[0]
        if most_units["product"] != p["product"]:
            insights.append(f"{most_units['product']} sells the most units ({most_units['quantity']:,.0f}), but it's not the top revenue driver.")
    if not categories.empty:
        c = categories.iloc[0]
        insights.append(f"{c['category']} leads categories with {c['percentage']:.1f}% of net sales.")
    if not weekdays.empty and weekdays["sales"].max() > 0:
        w = weekdays.loc[weekdays["sales"].idxmax()]
        insights.append(f"{w['day']} is your strongest weekday by revenue.")
    if discounts:
        insights.append(f"You recorded ${discounts:,.2f} in discounts during this period.")
    if orders:
        insights.append(f"Your average order value is ${aov:,.2f} across {orders:,} unique transactions.")

    return {
        "empty": False,
        "summary": {
            "revenue": round(revenue, 2), "gross_sales": round(gross, 2),
            "orders": orders, "units_sold": round(units, 2),
            "average_order_value": round(aov, 2), "discounts": round(discounts, 2),
            "tax": round(float(df["Tax"].sum()), 2),
            "transactions_rows": int(len(df))
        },
        "daily_sales": _records(daily),
        "monthly_sales": _records(monthly),
        "top_products": _records(products.head(10)),
        "categories": _records(categories),
        "payments": _records(payments),
        "weekdays": _records(weekdays),
        "hours": _records(hours),
        "insights": insights
    }
