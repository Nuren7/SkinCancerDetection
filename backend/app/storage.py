import os
from supabase import create_client, Client
from dotenv import load_dotenv

#load env 

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
BUCKET_NAME = "skin-images"

if SUPABASE_URL and SUPABASE_KEY:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
else:
    supabase = None

#crate supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def upload_image_to_supabase(file_bytes: bytes, file_name: str) -> str:
    """
    Uploads an image to Supabase storage and returns the public URL.

    """
    
    try:
      #upload to bucket
      response = supabase.storage.from_(BUCKET_NAME).upload(
        path=file_name, file=file_bytes,
        file_options={"content_type": "image/jpeg"}
      )
      
      #get the url of the uploaded image
      public_url_response = supabase.storage.from_(BUCKET_NAME).get_public_url(file_name)
      
      return public_url_response
    except Exception as e:
      print(f"Error uploading image to Supabase: {e}")
      return None
