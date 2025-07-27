from pydantic import BaseModel
from typing import Optional, List

class EmotionTag(BaseModel) :
    name : Optional[str] = None # name of the emotion tag, not fancy, not buzzy, real life relatable, seeing which user can say, "oh yes i felt this emotion at times, how did it know?"
    color_hex : Optional[str] = None  # just give a nice color to the emotion that will make it more relatable and good to the user's eyes

class GenreTag(BaseModel):
    name : Optional[str] = None # give the name of the genre, the song belongs to, not just fancy name like rock pop and like that but just the real things like soothing, pop, rock, slow, and more of the straight words
    color_hex : Optional[str] = None # just give a nice color to the genre that will make it more relatable and good to the user's eyes

class Track(BaseModel):
    name: str
    id: str
    artist: str
    album: str
    image: str
    added_at: str
    emotion_tag: Optional[EmotionTag]  = None # get emotion tag that the song contains, based on the tone and the lyrics and the vibe
    genre_tag: Optional[GenreTag] = None # get the genre tag of the song

class Playlist(BaseModel):
    id: str
    name: str
    description: str
    owner: str
    total_tracks: int
    image: str
    tracks: List["Track"]
    sadness_score : Optional[int] = None # claculate the sad score of the song out of 100, how much sad the lyrics are, how much broken it make the user feels or how much saddnes it translates to the user, get this score from both the lyrics and the music rhythms, and get a close measure
    happiness_score : Optional[int] = None # calculate the happiness score of the song out of 100, how much happy vibe it gives to the user, maybe cause of lyrics or maybe cause of the music or both, just get the good close score
    deep_lyrics_score : Optional[int] = None # calculate the score that tells how much deep the lyrics of this song are, how much meaningful and relatable the lyrics are rather than just good to listen but heavy to feel, must be calculated out of 100

class MonthlyChapterOfStory(BaseModel):
    month: Optional[str] = None # Format: "YYYY-MM" 
    this_month_tracks: List[Track] # Only songs added this month in any of the playlist or the saved tracks, just saved somewhere in this month with emotion tag and genre predicted
    happiness_score: Optional[str] = None # what is the happiness score of the user according to the songs he/she added this month in any of the playlist either saved tracks or any playlist, what does each song's vibe, lyrics and rhythm tells about the user's happiness score for this month, must be calculated out of 100
    sad_score: Optional[str] = None # what is the sad score fo the user according to the only songs that he/she added in any of the playist or the saved track this month only, what does the song's lyrics, tone, rhythm tell about the user's sad score that that song is made for, must be calculated out of 100
    deep_lyrics_score: Optional[str] = None # calculate the deep lyrics score by evaluating the lyrics of the song the user has added in this month only in any of the playlist or the saved tracks list, what do the lyrics tell about how deep the user is into life or love or anything, how deep the user has started to feel in this month according to the songs they liked or added in any playlist this month, must be calculated out of 100
    persona_score : Optional[str] = None # a number that within itself tells a big thing, the number should be calculated based on above things such that if it goes up, the user's positivity is more on that month, and if it goes down the user's positivity went down for that month, by persona score i mean that whether the user is more positive of negative towards the world, this must be calculated out of 100

class Story(BaseModel): 
    all_playlists: List[Playlist] # i have given all the playlists of the user which has all the songs in that playlist in "tracks" key and also at last i will attach the saved tracks playlist with just "tracks" key
    all_chapters: Optional[List[MonthlyChapterOfStory]] = None  # Divide all the playlists songs by month in which the songs are added and evaluate some scores about the user's music listening of that month
    story_title : Optional[str] = None # After creating the monthly chapters of the user's story, now based on that create a nice at max 4 word story title that suits the user's story till now, not fancy, not buzzy, just straight and just more heroic and villainic if the story says so, just put whatever the story tells into there in 2-4 words, not heavy or just about music but about the user themself
    story_lore: Optional[str] = None # After creating the monthly chapters of the user's story, based on the chapters create a story lore line that tells how the user have transitioned, not fancy not buzzy not heavy just the real line like "from 2020, you went into deep dive into yourself, each year from have heavy introspection and discovery, not ended tilln now" this is just example, just take the time of the user's first playlist of first song added and creatte a realistic line not just about music but about the possible user's story

class VibeSummary(BaseModel):
    poetic_title: Optional[str] = None # A nice human understandalbe and readable and relatable with less fancy words 4 words that praise the user's music listening journey as unique and very deep based on the above summaries of the user's music listening journey
    mood: Optional[str] = None # User's current mood predicted from the above summaries of the user's music listening journey
    emotion_keywords: Optional[List[str]] = None # emotion keywords at most 3 not more than that, that the user is possibly going through now, predicted from the above summaries of the user's music listening journey
    reflection: Optional[str] = None # simple reflective line based on the user's music journey fetched from the above summaries
    story: Optional[Story] = None
