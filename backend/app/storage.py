import os
from supabase import create_client, Client
from dotenv import load_dotenv

# load env 
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
BUCKET_NAME = "skin-images"

#secure supabase client
if SUPABASE_URL and SUPABASE_KEY:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
else:
    supabase = None

def upload_image_to_supabase(file_bytes: bytes, file_name: str) -> str:
    """
    Uploads an image to Supabase storage and returns the public URL.
    """
    if not supabase:
        print("Error: Supabase client is not initialized due to missing environment variables.")
        return None
    
    try:
        # upload to bucket with upsert=True to allow overwriting files with the same name
        response = supabase.storage.from_(BUCKET_NAME).upload(
            path=file_name, 
            file=file_bytes,
            file_options={"content_type": "image/jpeg", "upsert": "true"}
        )
        
        # get the url of the uploaded image safely (handling both dict and string return types)
        public_url_res = supabase.storage.from_(BUCKET_NAME).get_public_url(file_name)
        
        if isinstance(public_url_res, dict):
            public_url = public_url_res.get("publicUrl") or public_url_res.get("publicURL")
        else:
            public_url = public_url_res
            
        return public_url
    except Exception as e:
        print(f"Error uploading image to Supabase: {e}")
        return None