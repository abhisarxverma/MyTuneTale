from supabase import create_client, Client
from datetime import datetime, timedelta
from decouple import config
import json

SUPABASE_PROJECT_URL = config("SUPABASE_PROJECT_URL")
SUPABASE_API_KEY = config("SUPABASE_API_KEY")

supabase: Client = create_client(SUPABASE_PROJECT_URL, SUPABASE_API_KEY)

response = supabase.table("users").select("id", "updated_at").eq("id", "31zrdosy5dvl4eglpvwbcc3pdb3e").execute()

response = json.dumps(response.data, indent=4)
response = json.loads(response)
diff = (datetime.now() - datetime.fromisoformat(response[0]["updated_at"]).replace(tzinfo=None)) < timedelta(minutes=1)
print(diff)