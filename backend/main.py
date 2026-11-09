import csv
from io import StringIO
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 1. Replace with your actual Supabase Database URL
SUPABASE_URL = "database url"

# Setup SQLAlchemy engine
engine = create_engine(SUPABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Initialize the app
app = FastAPI()

# Add CORS middleware to allow frontend to make requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define a route for the root URL ("/")
@app.get("/")
def read_root():
    return {"message": "Hello! Your Python backend is running successfully."}

# Define a route for uploading CSV files
@app.post("/upload-csv/")
async def upload_csv(file: UploadFile = File(...)):
    contents = await file.read()
    reader = csv.reader(StringIO(contents.decode("utf-8")))
    data = list(reader)
    return {"message": "CSV file uploaded successfully.", "data": data}
