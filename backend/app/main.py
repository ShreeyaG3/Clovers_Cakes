import json
from datetime import datetime, timezone
from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from .db import get_connection, init_db
from .services.csv_service import load_square_csv
from .services.analytics import generate_dashboard

app = FastAPI(title="Clovers Cakes Bakery Analytics API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    init_db()

@app.get("/api/health")
def health():
    return {"status": "ok"}

@app.get("/api/imports")
def list_imports():
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT id, filename, uploaded_at, row_count FROM imports ORDER BY id DESC"
        ).fetchall()
    return [dict(row) for row in rows]

@app.post("/api/upload")
async def upload_csv(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(400, "Please upload a .csv file.")
    content = await file.read()
    if len(content) > 20 * 1024 * 1024:
        raise HTTPException(413, "CSV is too large. Maximum upload size is 20 MB.")
    try:
        df = load_square_csv(content)
        records = df.to_dict(orient="records")
        # Normalize pandas/numpy scalar values for JSON storage.
        payload = json.dumps(records, default=str)
        uploaded_at = datetime.now(timezone.utc).isoformat()
        with get_connection() as conn:
            cursor = conn.execute(
                "INSERT INTO imports (filename, uploaded_at, row_count, data_json) VALUES (?, ?, ?, ?)",
                (file.filename, uploaded_at, len(records), payload)
            )
            import_id = cursor.lastrowid
            conn.commit()
        return {
            "id": import_id, "filename": file.filename,
            "uploaded_at": uploaded_at, "row_count": len(records),
            "preview": records[:8]
        }
    except ValueError as exc:
        raise HTTPException(400, str(exc))
    except Exception as exc:
        raise HTTPException(400, f"Could not process this CSV: {exc}")

@app.get("/api/dashboard")
def dashboard(
    import_id: int | None = Query(default=None),
    start_date: str | None = Query(default=None),
    end_date: str | None = Query(default=None)
):
    with get_connection() as conn:
        if import_id is None:
            row = conn.execute("SELECT * FROM imports ORDER BY id DESC LIMIT 1").fetchone()
        else:
            row = conn.execute("SELECT * FROM imports WHERE id = ?", (import_id,)).fetchone()
    if row is None:
        return {"has_data": False, "imports": []}
    data = generate_dashboard(json.loads(row["data_json"]), start_date, end_date)
    return {
        "has_data": True,
        "import_info": {
            "id": row["id"], "filename": row["filename"],
            "uploaded_at": row["uploaded_at"], "row_count": row["row_count"]
        },
        **data
    }
