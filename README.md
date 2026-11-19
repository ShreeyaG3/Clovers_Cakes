# Clovers_Cakes
Building a dashboard for a small business bakery Clovers Cake 
# Clovers Cakes — Bakery Sales Analytics

A two-page React + FastAPI application for importing Square transaction CSV exports and exploring saved sales analytics.

## Features
- Two pages: **Import CSV** and **Dashboard**
- Persistent SQLite storage (`backend/data/bakery.db`)
- Upload history; each upload is saved as a separate snapshot
- Dashboard defaults to the latest import; switch between saved imports
- Sales KPIs, daily/monthly trends, product/category rankings, payment mix, peak weekday/hour and rule-based insights
- Date filtering on the dashboard
- CSV validation and preview before importing

## Requirements
- Python 3.10+
- Node.js 18+

## 1. Start the backend

```bash
cd backend
python -m venv .venv
# macOS/Linux:
source .venv/bin/activate
# Windows PowerShell:
# .venv\Scripts\Activate.ps1

pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend: http://localhost:8000  
API docs: http://localhost:8000/docs

## 2. Start the frontend (in another terminal)

Create a frontend/.env file:
"VITE_API_URL=http://localhost:xxxx"


```bash
cd frontend
npm install
npm run dev
```

## Data behavior
- Uploads are saved permanently in SQLite, not just browser memory.
- Each CSV upload is stored as its own snapshot. The dashboard uses the latest upload by default.
- Uploading the same file twice creates two snapshots; it does not silently merge or double-count them.
- The database is created automatically in `backend/data/`.
- Back up `backend/data/bakery.db` to preserve your imported data.

## Square CSV expectations
Expected headers:
`Transaction ID, Date, Time, Product, Category, Quantity, Unit Price, Gross Sales, Discount, Net Sales, Tax, Total, Payment Method, Status`

Header matching is case-insensitive and ignores extra spaces. Currency symbols and commas in numeric fields are supported. Unknown extra columns are ignored.

**Metric definitions**
- Net revenue: sum of `Net Sales` for non-void/non-cancelled rows, excluding tax.
- Orders: unique `Transaction ID` values.
- Units: sum of `Quantity`.
- Average order value: net revenue divided by unique transaction count.
- Product/category revenue: sum of row-level `Net Sales`.
- A CSV row is treated as a line item, not necessarily an order.
- Refund handling depends on how the Square export represents refunds. This MVP excludes statuses containing `void`, `cancel`, or `failed`; inspect refund rows in your export before relying on net revenue.

## Notes
This is a local MVP. It has no authentication and is intended for local/private use. Do not expose the API publicly without adding authentication, upload limits, and deployment security.
