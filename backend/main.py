from fastapi import FastAPI, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.database import get_db
from app.storage import upload_image_to_supabase
from app.ai import analyze_image_with_hf

app = FastAPI(title="Skin Cancer Analysis API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Skin Cancer Detection API is running successfully!"}

@app.post("/analyze")
async def analyze_skin_image(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Endpoint to analyze a skin image for potential skin cancer.
    """
    # Read the uploaded file
    image_bytes = await file.read()
    
    # Upload the image to Supabase
    file_name = file.filename
    image_url = upload_image_to_supabase(image_bytes, file_name)
    
    if not image_url:
        return {"error": "Failed to upload image to storage."}
      
    ai_result = analyze_image_with_hf(image_bytes)
    
    return {
      "status": "success",
      "image_url": image_url,
      "analysis": ai_result
    }
    
    