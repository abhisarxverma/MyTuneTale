
export interface SpotifyUser {
    display_name: string;
    email: string | undefined;
    id: string;
    country: string | undefined;
    product: string | undefined;
    profile_image: string | undefined;
    followers: number;
    external_url: string;
}

export interface Song {
    name: string;
    id: string;
    artist: string;
    album: string;
    image: string;
    position: number | undefined;
}

export interface SavedTrack {
    name: string;
    id: string;
    artist: string;
    album: string;
    image: string;
    position: number | undefined;
    added_at: string;
}

export interface SpotifyArtist {
    id: string;
    name: string;
    genres: string[];
    popularity: number;
    followers: number;
    image_url: string;
    external_url: string;
    uri: string;
    position: number | undefined;
}

export interface Playlist {
    id: string;
    name: string;
    description: string;
    owner: string;
    collaborative: boolean;
    public: boolean;
    total_tracks: number;
    image: string;
    tracks: SavedTrack[];
}

export type PlaylistCollection = (Playlist | { name: string, image: undefined, tracks: SavedTrack[] })[];

export interface TopArtists {
    short_term: SpotifyArtist[];
    medium_term: SpotifyArtist[];
    long_term: SpotifyArtist[];
}


export interface TopTracks {
    short_term: Song[];
    medium_term: Song[];
    long_term: Song[];
}

export interface SpotifyAnalysis {
    user: SpotifyUser;
    saved_tracks: SavedTrack[];
    top_artists: TopArtists;
    top_tracks: TopTracks;
    playlists: PlaylistCollection;
    ai_analysis: AiAnalysis | undefined;
}

export type SpotifyAnalysisState = SpotifyAnalysis | null;

export interface AiAnalysis {
    poetic_title: string;
    mood: string;
    emotion_keywords: string[];
    reflection: string | undefined;
    story: Story;
}

interface EmotionTag {
    name: string;
    color_hex: string;
}

interface GenreTag {
    name: string;
    color_hex: string;
}

interface AnalysedTrack {
    name: string;
    id: string;
    artist: string;
    album: string;
    image: string;
    position: number | undefined;
    emotion_tag: EmotionTag;
    genre_tag: GenreTag;
}

interface AnalysedPlaylist {
    id: string;
    name: string;
    description: string;
    owner: string;
    total_tracks: number;
    image: string;
    tracks: AnalysedTrack[];
    sadness_score: number;
    happiness_score: number;
    deep_lyrics_score: number;
}

export interface Chapter {
    month: string;
    this_month_tracks: AnalysedTrack[];
    happiness_score: number;
    sad_score: number; 
    deep_lyrics_score: number;
    persona_score: number;
}

export interface Story {
    all_playlists: AnalysedPlaylist[];
    all_chapters: Chapter[];
    story_title: string;
    story_lore: string;
}
