import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api.ts";
import { Loader2 } from "lucide-react";
import { type SpotifyAnalysis } from "@/lib/types.ts";

type SpotifyContextType = {
  status: "idle" | "loading" | "authenticated" | "unauthenticated";
  connectSpotify: () => void;
  persona: SpotifyAnalysis | null;
  setPersona: React.Dispatch<React.SetStateAction<SpotifyAnalysis | null>>;
};

type SpotifyStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

const SpotifyContext = createContext<SpotifyContextType | null>(null);
export function useSpotify() {
  return useContext(SpotifyContext);
}

export function SpotifyProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SpotifyStatus>("idle");
  const [persona, setPersona] = useState<SpotifyAnalysis | null>(null);
  const navigate = useNavigate();

  function fetchData() {
    
    const token_info = localStorage.getItem("token_info");
    if (!token_info) {
      setStatus("unauthenticated");
      return;
    }

    setStatus("loading");

    api
      .post("/me/", {
        token_info: JSON.parse(token_info),
      })
      .then((res) => {
        const data = res.data;
        if (data.success) {
          console.log("API/ME fetch successful !", data)
          setPersona(data.data);
          setStatus("authenticated");
          setTimeout(() => navigate("/home"), 300)
        } else {
          console.log("API/ME fetch failed !", data)
          setStatus("unauthenticated");
        }
      })
      .catch((error) => {
        console.log("Error in API/ME call :", error)
        setStatus("unauthenticated")
      });
  }

  useEffect(() => {
    fetchData();
  }, []);

  const connectSpotify = async () => {
    setStatus("loading");
    const token_info = localStorage.getItem("token_info");
    const encoded_token_info = encodeURIComponent(JSON.stringify(token_info));
    window.location.href = `/api/connect-spotify?token_info=${encoded_token_info}`;
  };


  const value = {
    status,
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
  const { setPersona } = useSpotify()!;
  const navigate = useNavigate();

  useEffect(() => {

    const searchParams = new URLSearchParams(window.location.search);

    if (!searchParams) {
      console.log("No search params found, redirecting...");
      navigate("/")
    }

    const decoded_token_info = decodeURIComponent(searchParams.get("token_info")!)
    console.log("DECODED TOKEN INFO :", decoded_token_info)

    const token_info = JSON.parse(decoded_token_info)
    console.log("Token info given to callback:", token_info);

    if (!token_info) {
      navigate("/");
      return;
    }

    localStorage.setItem("token_info", JSON.stringify(token_info));

    api
      .post("/me/", {
        token_info: token_info,
      })
      .then((res) => {
        const data = res.data;
        console.log("Spotify /me response:", data);

        if (data.success) {
          console.log("Persona data fetched successfully, redirecting...", data)
          setPersona(data.data);
          setTimeout(() => navigate("/home"), 300);
        } else {
          console.log("Missing persona data from api/me response, redirecting...", data);
          setPersona(null);
          navigate("/");
        }
      })
      .catch((error) => {
        console.log("Error during persona fetch:", error);
        setPersona(null);
        navigate("/");
      });
  }, [setPersona, navigate]);


  return (
    <div className="h-[70vh] w-full flex items-center justify-center">
      <p className="flex items-center gap-[1.5rem] animate-pulse"><Loader2 size={"1.5rem"} className="animate-spin" /> Creating your Music Persona...</p>
    </div>
  );
}
