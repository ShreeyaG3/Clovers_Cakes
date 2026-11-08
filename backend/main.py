import csv
from fastapi import FastAPI, File, UploadFile

# Initialize the app
app = FastAPI()

# Define a route for the root URL ("/")
@app.get("/")
def read_root():
    return {"message": "Hello! Your Python backend is running successfully."}

# Define a route for uploading CSV files
@app.post("/upload-csv/")
def upload_csv(file: UploadFile = File(...)):
    contents = file.file.read()
    file.file.seek(0)
    reader = csv.reader(file.file)
    data = list(reader)
    return {"message": "CSV file uploaded successfully.", "data": data}