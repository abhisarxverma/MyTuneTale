
from supabase import Client, create_client
from decouple import config

SUPABASE_PROJECT_URL = config("SUPABASE_PROJECT_URL")
SUPABASE_API_KEY = config("SUPABASE_API_KEY")

supabase: Client = create_client(SUPABASE_PROJECT_URL, SUPABASE_API_KEY)

with open(f"images/wordcloud.png", "rb") as f:
    res = supabase.storage.from_("userwordclouds").upload("test_image", f)
    print("SUCCESSFULLY UPLOADED WORDCLOUD IN STORAGE :", res)

public_url = supabase.storage.from_("userwordclouds").get_public_url("test_image")