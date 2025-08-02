from typing import Optional, List
from pydantic import BaseModel

class MonthlySummary(BaseModel):
    month: Optional[str]  
    genre_counts: Optional[List[GenreCount]] = None 
    emotion_counts: Optional[List[EmotionCount]] = None 
    top_genre: Optional[str] = None # Top genre this month by the number of songs of that genre_tag added in this month    
    top_emotion: Optional[str] = None # Top emotion this monty by the number of songs of that emotion_tag added in this month
    tracks_added_this_month: List[SavedTrack]  # ✅ Only songs added in this month with the genre and emotion tags already predicted
    this_month_emotional_state : Optional[str] = None  # the emotional state of the user based on the songs, genres, emotion tags and emotion map of songs of this month

class ListeningTimeline(BaseModel):
    timeline: List[MonthlySummary] # list of the dictionary of the MonthlyGenreSummay for each month, extracted from te dates added from every song in the saved_tracks songs list
    genre_transition_summary: Optional[str] = None  # ✨ Two-line genre transition summary for whole saved tracks, with sequence based on the added_at field, human understandable and relatable with not fancy words but real words
    emotional_transition_story: Optional[str] = None # Two-line emotion transition story for whole saved tracks, with sequence based on the emotional summary of each month according to the songs added in that month, human understandable and relatable with not fancy words but real words

class SavedTrackSummary(BaseModel):
    saved_tracks: List[SavedTrack]                     # All saved tracks with the genre and emotion tags already predicted
    genre_timeline: Optional[ListeningTimeline] = None     # Monthly genre transitions
    whole_saved_tracks_story: Optional[str] = None     # A simple nice one liner for the user's story of whole saved tracks playlist of the user's music, based on the monthly emotional summaries with sequence

    # saved_tracks: SavedTrackSummary # Whole saved tracks summary based on model
