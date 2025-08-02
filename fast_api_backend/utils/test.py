
# from supabase import Client, create_client
# from decouple import config

# SUPABASE_PROJECT_URL = config("SUPABASE_PROJECT_URL")
# SUPABASE_API_KEY = config("SUPABASE_API_KEY")

# supabase: Client = create_client(SUPABASE_PROJECT_URL, SUPABASE_API_KEY)

# # response = supabase.table("recommendations").select("*").execute()

# # print("RESPONSE :", response)
# # print("RESPONSE DATA : ", response.data)

# print("\n\n")

# # response = supabase.table("recommendations").insert({"recommendations" : {"test" : "test song"}, "country" : "autralia", "emotion" : "nostalgic", "user_id" : "test_id"}).execute()

# response = supabase.table("recommendations").update({"recommendations" : {"test_update" : "test song"}}).eq("country", "autralia").eq("emotion", "nostalgic").execute()

# print("RESPONSE DATA :", response.data)

import requests 

response = requests.get("https://open.spotify.com/embed/track/2hnOq45qQhuPEzAJqINh4z?theme=1")

print(response.status_code)