from fastapi import FastAPI

# Initialize the app
app = FastAPI()

# Define a route for the root URL ("/")
@app.get("/")
def read_root():
    return {"message": "Hello! Your Python backend is running successfully."}