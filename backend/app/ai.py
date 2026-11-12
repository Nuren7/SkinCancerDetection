import os
import requests
from dotenv import load_dotenv

# load env 
load_dotenv()

# hg AI
HF_API_URL = os.getenv("HF_API_URL")
print(f"DEBUG URL: '{HF_API_URL}'")
HF_API_KEY = os.getenv("HF_TOKEN")

def analyze_image_with_hf(image_bytes: bytes) -> dict:
    """
    Send pics binary info to hf. It's in the cloud to save local RAM.
    """
    headers = {
        "Authorization": f"Bearer {HF_API_KEY}",
        "Content-Type": "application/octet-stream"
    }
    
    response = requests.post(HF_API_URL, headers=headers, data=image_bytes)
    
    if response.status_code != 200:
        return {"error": "Could not process picture via Hugging Face", "details": response.text}
    
    result = response.json()
    
    # Handle the case where the model is still loading
    if isinstance(result, dict) and "error" in result:
        if "loading" in result["error"].lower():
            return {
                "error": "Modellen laddar fortfarande på Hugging Face. Vänligen vänta några sekunder och försök igen.",
                "details": result
            }
            
    return result