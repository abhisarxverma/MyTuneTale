import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { type SpotifyAnalysis } from "@/lib/types.ts";

type SpotifyContextType = {
  authenticated: boolean;
  setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  connectSpotify: () => void;
  persona: SpotifyAnalysis | null;
  setPersona: React.Dispatch<React.SetStateAction<SpotifyAnalysis>>;
};

const SpotifyContext = createContext<SpotifyContextType | null>(null);
export function useSpotify() {
  return useContext(SpotifyContext);
}

export function SpotifyProvider({ children }: { children: ReactNode }) {
  const [persona, setPersona] = useState<SpotifyAnalysis>({
    user: undefined,
    saved_tracks: undefined,
    top_tracks: undefined,
    playlists: undefined,
    top_artists: undefined,
    ai_analysis: undefined
  });
  const [ authenticated, setAuthenticated ] = useState<boolean>(false);

  const connectSpotify = async () => {
    const token_info = localStorage.getItem("token_info");
    const encoded_token_info = encodeURIComponent(JSON.stringify(token_info));
    window.location.href = `/api/connect-spotify?token_info=${encoded_token_info}`;
  };

  const value : SpotifyContextType = {
    authenticated,
    setAuthenticated,
    connectSpotify,
    persona,
    setPersona,
  };

  return (
    <SpotifyContext.Provider value={value}>
      {children}
    </SpotifyContext.Provider>
  );
}

export function SpotifyCallback() {
  const navigate = useNavigate();
  
  useEffect(() => {

    const searchParams = new URLSearchParams(window.location.search);

    if (!searchParams) {
      console.log("No search params found, redirecting...");
      navigate("/")
    }

    const decoded_token_info = decodeURIComponent(searchParams.get("token_info")!)
    console.log("DECODED TOKEN INFO :", decoded_token_info)

    const userId = decodeURIComponent(searchParams.get("user_id")!)
    console.log("USER ID RECEIVED :", userId)

    const token_info = JSON.parse(decoded_token_info)
    console.log("Token info given to callback:", token_info);

    if (!token_info) {
      navigate("/");
      return;
    }

    localStorage.setItem("token_info", JSON.stringify(token_info));

    localStorage.setItem("user_id", JSON.stringify(userId));

    navigate("/home")

  }, []);


  return (
    <div className="h-[70vh] w-full flex items-center justify-center">
      <p className="flex items-center gap-[1.5rem] animate-pulse"><Loader2 size={"1.5rem"} className="animate-spin" /> Creating your Music Persona...</p>
    </div>
  );
}
