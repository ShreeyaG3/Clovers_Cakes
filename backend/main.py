import csv
from io import StringIO
from fastapi import FastAPI, File, UploadFile

# Initialize the app
app = FastAPI()

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