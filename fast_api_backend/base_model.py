from pydantic import BaseModel
from typing import List, Optional

class GenreCount(BaseModel):
    genre: str
    count: int
    color_hex: str

class EmotionCount(BaseModel):
    emotion: str
    count: int
    color_hex : str

class Artist(BaseModel):
    id: str
    name: str
    genres: str
    popularity: str
    followers: str
    image_url: str
    external_url: str
    uri: str

class Song(BaseModel):
    name: str
    id: str
    artist: str
    album: str
    image: str
    emotion_tag: Optional[str]  = None # get emotion tag that the song contains, based on the tone and the lyrics and the vibe
    genre_tag: Optional[str] = None # get the genre tag of the song

class Playlist(BaseModel):
    id: str
    name: str
    description: str
    owner: str
    total_tracks: int
    image: str
    tracks: List["SavedTrack"]

class TopTrackList(BaseModel):
    songs_list: List[Song]                                   # 🎵 Raw list of songs with the genre and emotion tags already predicted
    sorted_genre_map: Optional[List[GenreCount]] = None      # 📊 Genre frequency map (sorted based on the number of songs of that genre tag in the current timeline top tracks song list)
    sorted_emotion_map: Optional[List[EmotionCount]] = None  # 📊 Emotion frequency map (sorted based on the number of songs of that emotion tag in the current timeline top tracks song list)
    top_tracks_summary: Optional[List[EmotionCount]] = None  # one line simple relative and non fancy line that complement the nice combination of songs that are on their top tracks like not related to any emotion or genre, just like a story, like "You top tracks tells about a story of a boy who is going through the adventure of finding what he himself is not sure exists.", not the same but mysterious and simple like this
    emotion_map_summary: Optional[str] = None # a 5 word very simple relative line that say about user's emotional state by top songs like "Looks like you are deeply hurt but strong"
    genre_map_summary: Optional[str] = None  # a 5 word very simple relative line that say about user's genre listening like "Oh! you like the pop and soothing genres" like this

class TopTracks(BaseModel):
    short_term: TopTrackList # Summary of the user's music listening journey in the sort_term's top songs
    mid_term: TopTrackList   # Summary of the user's music listening journey in the mid_term's top songs
    long_term: TopTrackList  # Summary of the user's music listening journey in the long_term's top songs

class SavedTrack(BaseModel):
    name: str
    id: str
    artist: str
    album: str
    image: str
    added_at: str
    emotion_tag: Optional[str]  = None # get emotion tag that the song contains, based on the tone and the lyrics and the vibe
    genre_tag: Optional[str] = None # get the genre tag of the song

class TopArtistsList(BaseModel):
    artists_list : List[Artist] # List of top artists for the current timeline only

class TopArtists(BaseModel):
    short_term: TopArtistsList # List of the top artists for the short term
    mid_term: TopArtistsList # List of the top artists for the mid term
    long_term: TopArtistsList # List of the top artists for the long term

class MonthlyChapterOfStory(BaseModel):
    month: Optional[str] = None # Format: "YYYY-MM" 
    this_month_tracks: List[SavedTrack] # Only songs added this month in any of the playlist or the saved tracks, just saved somewhere in this month with emotion tag and genre predicted
    happiness_value: Optional[str] = None # what is the happiness score of the user according to the songs he/she added this month in any of the playlist either saved tracks or any playlist, what does each song's vibe, lyrics and rhythm tells about the user's happiness score for this month
    sad_value: Optional[str] = None # what is the sad score fo the user according to the only songs that he/she added in any of the playist or the saved track this month only, what does the song's lyrics, tone, rhythm tell about the user's sad score that that song is made for
    deep_lyrics_score: Optional[str] = None # calculate the deep lyrics score by evaluating the lyrics of the song the user has added in this month only in any of the playlist or the saved tracks list, what do the lyrics tell about how deep the user is into life or love or anything, how deep the user has started to feel in this month according to the songs they liked or added in any playlist this month
    persona_score : Optional[str] = None # a number that withing itself tells a big thing, the number should be calculated based on above thigns such that if it goes up, the user's positivity is more on that month, and if it goes down the user's positivity went down for that month, by persona score i mean that whether the user is more positive of negative towards the world

class Story(BaseModel): 
    all_playlists: List[Playlist] # i have given all the playlists of the user which has all the songs in that playlist in "tracks" key and also at last i will attach the saved tracks playlist with just "tracks" key
    all_chapters: Optional[List[MonthlyChapterOfStory]] = None  # Divide all the playlists songs by month in which the songs are added and evaluate some scores about the user's music listening of that month
    story_title : Optional[str] = None # After creating the monthly chapters of the user's story, now based on that create a nice at max 4 word story title that suits the user's story till now, not fancy, not buzzy, just straight and just more heroic and villainic if the story says so, just put whatever the story tells into there in 2-4 words
    story_main_line: Optional[str] = None # After creating the monthly chapters of the user's story, based on teh happiness's score, sadness'score, deep_lyrics's score, just create a 2 main line of the story that just tells straight what and how the user have gone through the times that the story tells, like "You have tried to come close to few, buat at the end all you've got is regret, so you started to enjoy alone and keep quiet, Join the Dark party!", not the exact same but like this, simpler and hit harder one

class VibeSummary(BaseModel):
    top_tracks: TopTracks # Whole top tracks summary based on model
    top_artists : TopArtists # List of top artists for all the three timelines short term, mid term and long term
    poetic_title: Optional[str] = None # A nice human understandalbe and readable and relatable with less fancy words 4 words that praise the user's music listening journey as unique and very deep based on the above summaries of the user's music listening journey
    mood: Optional[str] = None # User's current mood predicted from the above summaries of the user's music listening journey
    emotion_keywords: Optional[List[str]] = None # emotion keywords at most 3 not more than that, that the user is possibly going through now, predicted from the above summaries of the user's music listening journey
    reflection: Optional[str] = None # simple reflective line based on the user's music journey fetched from the above summaries
    story: Optional[Story] = None
