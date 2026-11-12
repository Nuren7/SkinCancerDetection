import os
import requests
from dotenv import load_dotenv

#load env 
load_dotenv()

#hg AI
HF_API_URL = "https://api-inference.huggingface.co/models/google/vit-base-patch16-224"
HF_API_KEY = os.getenv("HF_TOKEN")

def analyze_image_with_hf(image_bytes: bytes) -> dict:
  """
  send pics binary info to hf. its in the clout to save local RAM
  """
  headers = {
    "Authorization": f"Bearer {HF_API_KEY}",
    "Content-Type": "application/octet-stream"
  }
  
  
  response = requests.post(HF_API_URL, headers = headers, data = image_bytes)
  
  if response.status_code != 200:
    return {"error": "Could not find picture via Hugging Face", "details": response.text}
  
  return response.json()
