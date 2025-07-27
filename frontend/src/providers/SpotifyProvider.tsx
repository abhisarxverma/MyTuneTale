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
    const token_info = localStorage.getItem("spotify_token_info");
    if (!token_info) {
      setStatus("unauthenticated");
      return;
    }
    setStatus("loading");
    const access_token = JSON.parse(token_info).access_token;
    if (!access_token) {
      setStatus("unauthenticated");
      return;
    }
    api
      .get("/me/", {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
      .then((res) => {
        const data = res.data;
        if (data?.data) {
          setPersona(data.data);
          setStatus("authenticated");
        } else {
          setStatus("unauthenticated");
        }
      })
      .catch(() => setStatus("unauthenticated"));
  }

  useEffect(() => {
    fetchData();
  }, []);

  const connectSpotify = async () => {
    localStorage.removeItem("spotify_token_info");
    setStatus("loading");
    const raw_token = localStorage.getItem("spotify_token_info");
    const token_info = raw_token ? JSON.parse(raw_token) : null;

    try {
      const res = await api.post("/connect-spotify", {
        token_info: token_info,
      });

      const data = res.data;
      console.log("Connect Spotify response:", data);

      if (data.success) {
        if (data.to_redirect) {
          setStatus("unauthenticated");
          console.log("Redirecting to Spotify authorization URL:", data.redirect_url);
          window.location.href = data.redirect_url;
        } else {
          setStatus("authenticated");
          if (data.new_token_info) {
            localStorage.setItem("spotify_token_info", JSON.stringify(data.new_token_info));
            sessionStorage.setItem("spotkfy_token_info", data.new_token_info);
          }
          fetchData();
          navigate("/home");
        }
      } else {
        console.error("Error connecting to Spotify:", data.message);
        setStatus("unauthenticated");
        navigate("/");
      }
    } catch (error) {
      console.error("Connection error:", error);
      setStatus("unauthenticated");
      navigate("/");
    }
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
    const rawTokenInfo = new URLSearchParams(window.location.search).get("token_info");
    if (!rawTokenInfo) {
      console.warn("Missing token_info in URL, redirecting...");
      navigate("/");
      return;
    }

    try {
      const tokenInfo = JSON.parse(decodeURIComponent(rawTokenInfo));
      console.log("Decoded token info:", tokenInfo);

      localStorage.setItem("spotify_token_info", JSON.stringify(tokenInfo));

      api
        .get("/me/", {
          headers: {
            Authorization: `Bearer ${tokenInfo.access_token}`,
          },
        })
        .then((res) => {
          const data = res.data;
          console.log("Spotify /me response:", data);

          if (data.success) {
            if (data.to_redirect) {
              console.log("Redirecting to Spotify authorization URL:", data.redirect_url);
              window.location.href = data.redirect_url;
            } else if (data?.data) {
              setPersona(data.data);
              setTimeout(() => navigate("/home"), 300);
            } else {
              console.warn("Missing persona data, redirecting...");
              setPersona(null);
              navigate("/");
            }
          }
        })
        .catch((error) => {
          console.error("Error during persona fetch:", error);
          setPersona(null);
          navigate("/");
        });
    } catch (err) {
      console.error("Invalid token_info format:", err);
      navigate("/");
    }
  }, [setPersona, navigate]);


  return (
    <div className="h-[70vh] w-full flex items-center justify-center">
      <p className="flex items-center gap-[1.5rem] animate-pulse"><Loader2 size={"1.5rem"} className="animate-spin" /> Creating your Music Persona...</p>
    </div>
  );
}
