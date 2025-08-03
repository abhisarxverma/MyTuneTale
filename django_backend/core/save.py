# @app.post("/api/get_recommendations")
# async def get_recommendations( request : Request ):

#     body = json.loads(request.body)

#     print("RAW BODY IN RECOMMENDATIONS :", body)

#     token_info = body.get("token_info", None)
#     emotion = body.get("emotion", None)
#     country = body.get("country", None)
#     user_id = body.get("user_id", None)

#     if not token_info or not emotion or not country or not user_id:
#         print("Missing data in post request for recommendations")
#         return JsonResponse({
#             "success" : False,
#             "message" : "Missing data in recommendation requests",
#             "data" : None
#         })


#     print("EMOTION REQUESTED : ", emotion)
#     print("COUNTRY REQUESTED : ", country)

#     try:
#         existing_data = give_from_recommendations_table(user_id, country, emotion)
#         if existing_data :
#             return JsonResponse({
#                 "success": True,
#                 "message": "Recommendations data returned from Supabase",
#                 "data": existing_data,
#             })
#     except Exception as e:
#         pass
    
#     access_token = token_info.get("access_token", None)

#     print("Fetching fresh recommendations data from Spotify")

#     sp = Spotify(auth=access_token)

#     try:
#         # recommendations = fetch_recommendations(sp, emotion, country)
#         recommendations = fetch_recommendations(sp, emotion, country)

#         if not recommendations :
#             return JsonResponse(status_code=200, {
#                 "success" : True,
#                 "message" : "Empty recommendations",
#                 "data" : None
#             })

#         res = save_in_recommendations_table(user_id, country, emotion, recommendations)

#         return JsonResponse(status_code=200, {
#             "success": True,
#             "message" : "Successfully fetched saved tracks.",
#             "data" : recommendations
#         })
#     except SpotifyException as s:
#         return JsonResponse(status_code=401, {
#             "success" : True,
#             "message" : "Please reauthorize",
#             "data" : None
#         })
#     except Exception as e:
#         print("Failed to generate recommendations :", str(e))
#         return JsonResponse(status_code=500, {
#             "success": False,
#             "message": "Error occured :"+str(e),
#             "data": None
#         })

# @app.post(f"/api/ai_analysis")
# async def get_ai_analysis(request : Request):

#     body = json.loads(request.body)
#     print("Received data for AI analysis:", body)
#     id = body.get("user_id", "")
#     if not id:
#         return JsonResponse(status_code=400, {"success": False, "message": "User ID is required", "data" : None})
    
#     try:
#         existing_analysis = give_from_users_table(id, "ai_analysis")
#         if existing_analysis :
#              return JsonResponse(status_code=200, {
#                 "success": True,
#                 "message": "Fetched ai analysis from the supabase",
#                 "data": existing_analysis
#             })
#     except Exception as e:
#         pass
    
    
#     try:
#         if not check_limit(request, "ai_analysis"):
#             print("Rate limit exceeded for AI analysis")
#             return JsonResponse(status_code=429, {"success": False, "message": "Rate limit exceeded. Try again later.", "data": None })
        
#         response = supabase.table("users").select("user", "top_tracks", "top_artists", "playlists", "saved_tracks").eq("id", id).single().execute()

#         data = response.data

#         if not data:
#             return JsonResponse(status_code=401, {
#                 "success" : False,
#                 "message" : "Data not found in supabase",
#                 "data" : None
#             })

#         print("Trying to create the ai analysis")
#         story = createStory(data)
#         if not story:
#             print("ANALYSIS GENERATED :", story)
#             return JsonResponse(status_code=500, {"success": False, "message": "Failed to generate AI analysis", "data" : None})
#         else :
#             print("AI analysis generated successfully")
            
#             res = save_in_users_table(id, "ai_analysis", story)

#             return JsonResponse(status_code=200, {
#                 "success": True,
#                 "message": "AI analysis generated successfully",
#                 "data": story
#             })
    
#     except Exception as e:
#         print("Error Occured : ", e)
#         return JsonResponse(status_code=500, {"success": False, "message": f"Failed to generate AI analysis: {str(e)}", "data": None})

# @app.post("/api/wordcloud")
# async def create_wordcloud(request: Request):
#     body = json.loads(request.body)
#     user_id = body.get("user_id", "")
#     if not user_id: return JsonResponse(status_code=400, {"success": False, "message" : f"User ID is required", "data": None})

#     top_tracks = body.get("top_tracks", None)
#     if not top_tracks: return JsonResponse(status_code=400, {"success": False, "message" : "Top tracks data is required", "data": None})

#     wordcloud_supabase_url = make_wordcloud(user_id, top_tracks)

#     print("WORDCLOUD URL :", wordcloud_supabase_url)

#     return JsonResponse(status_code=200, {
#         "success": True,
#         "message" : "Wordcloud successfully created",
#         "data" : {"url" : wordcloud_supabase_url}
#     })
