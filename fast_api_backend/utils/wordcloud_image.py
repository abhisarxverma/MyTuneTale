from wordcloud import WordCloud
import numpy as np
from PIL import Image
import matplotlib.pyplot as plt
from supabase import create_client, Client
from decouple import config

SUPABASE_PROJECT_URL = config("SUPABASE_PROJECT_URL")
SUPABASE_API_KEY = config("SUPABASE_API_KEY")

supabase: Client = create_client(SUPABASE_PROJECT_URL, SUPABASE_API_KEY)


def make_wordcloud(user_id, top_tracks):

    if not top_tracks: return None

    filename = f"{user_id}-wordcloud.png"
    bucket_name = "userwordclouds"

    try:
        files_in_bucket = supabase.storage.from_(bucket_name).list()
        
        existing_file_names = [f['name'] for f in files_in_bucket]

        if filename in existing_file_names:
            public_url = supabase.storage.from_(bucket_name).get_public_url(filename)
            print(f"Wordcloud '{filename}' already exists. Returning existing URL.")
            return public_url
    except Exception :
        pass

    max_pos = len(top_tracks)
    frequencies = {
        track["name"]: (max_pos - index)
        for index, track in enumerate(top_tracks)
    }

    try:
        mask_image = np.array(Image.open("images/mask-circle.png"))
    except Exception as e:
        print("Error loading the mask Image :", e)
        quit(1)

    wc = WordCloud(
        width=800,
        height=800,
        mask=mask_image,
        colormap="Reds", 
        contour_color="firebrick",
        contour_width=1,
        background_color="black",
        prefer_horizontal=.8
    ).generate_from_frequencies(frequencies)

    # ---------- 4. Save image locally ----------
    wc.to_file(f"user_wordclouds/{filename}")

    try:
        with open(f"user_wordclouds/{filename}", "rb") as f:
            res = supabase.storage.from_(bucket_name).upload(filename, f)
            print("SUCCESSFULLY UPLOADED WORDCLOUD IN STORAGE :", res)

        public_url = supabase.storage.from_(bucket_name).get_public_url(filename)
    
    except Exception as e:
        print("Error occured in uploading wordcloud to supabase :", e)
        return None

    return public_url
