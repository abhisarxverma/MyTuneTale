import api from "@/lib/api";
import { type SpotifyUser, type PlaylistCollection, type TopArtists, type TopTracks, type SavedTrack } from "@/lib/types";
import { useSpotify } from "@/providers/SpotifyProvider";
import { useCallback, useEffect, useState } from "react";
import { getCachedData, setCachedData } from "@/lib/cacheDB";

type EndpointDataMap = {
  user: SpotifyUser;
  playlists: PlaylistCollection;
  top_tracks: TopTracks;
  top_artists: TopArtists;
  saved_tracks: SavedTrack[];
};

type EndPointKey = keyof EndpointDataMap;

const endpointMap: Record<string, string> = {
  user: '/user/',
  playlists: '/playlists/',
  top_tracks: '/top_tracks/',
  top_artists: '/top_artists/',
  saved_tracks: '/saved_tracks/'
};

const fetchData = async <K extends EndPointKey>(key: K): Promise<EndpointDataMap[K]> => {

  const cached = await getCachedData(key);
  if (cached) {
    console.log(`Using cached data for ${key} : ${cached}`);
    return cached;
  }

  const token_info = localStorage.getItem("token_info");
  if (!token_info) {
    throw new Error("Token info not found in localstorage.")
  }

  const user_id = localStorage.getItem("user_id");
  if (!user_id) {
    throw new Error("User Id not found in localstorage")
  };

  const endpoint = endpointMap[key];
  if (!endpoint) throw new Error(`Key is unknown: ${key}`);

  const res = await api.post(endpoint, {
    token_info: JSON.parse(token_info),
    user_id: user_id
  });
  const data = res.data;
  console.log(`DATA RESPONSE FOR ${key} : `, data)
  if (!data.success) throw new Error(`Error occured in fetching ${key} data:: ${data?.message}`);

  await setCachedData(key, data.data); 
  return data?.data;
}

const useFetchData = <K extends EndPointKey>(key: K) => {
  const [data, setData] = useState<EndpointDataMap[K] | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const { setAuthenticated, setPersona } = useSpotify()!;
  const [retryKey, setRetryKey] = useState(0);

  const refetch = useCallback(() => {
    setRetryKey(prev => prev + 1);
  }, []);

  useEffect(() => {
    const load = async () => {
      setStatus('loading');
      try {
        const result = await fetchData(key);
        setData(result);
        setPersona(prev => ({ ...prev, [key]: result }));
        setStatus('success');
        setAuthenticated(true);
      } catch (err) {
        setError((err as Error).message);
        console.log(`Error fetching ${key} : `, err)
        setStatus('error');
        setAuthenticated(false);
        setPersona(prev => ({ ...prev, [key]: null }));
      }
    };
    load();
  }, [key, retryKey]);

  return { data, status, error, refetch };
};

export default useFetchData;