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
    setStatus("loading");
    api
      .get("/me/")
      .then((res) => {
        const data = res.data;
        console.log("API/ME RESPONSE :", data)
        if (data?.data) {
          setPersona(data.data);
          setStatus("authenticated");
        } else {
          console.log("API/ME EMPTY DATA :", data);
          setStatus("unauthenticated");
          navigate("/");
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
    window.location.href = "/api/connect-spotify";
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
    api
      .get("/me/")
      .then((res) => {
        const data = res.data;
        console.log("Spotify /me response:", data);

        if (data.success) {
          setPersona(data.data);
          setTimeout(() => navigate("/home"), 300);
        } else {
          console.warn("Missing persona data from api/me response, redirecting...");
          setPersona(null);
          navigate("/");
        }
      })
      .catch((error) => {
        console.error("Error during persona fetch:", error);
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
