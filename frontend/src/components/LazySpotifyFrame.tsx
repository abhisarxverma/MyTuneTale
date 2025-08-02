import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";

type LazySpotifyFrameProps = {
  trackId: string | undefined;
  theme?: number;
  name?: string;
  position?: number;
  height?: number;
  artist?: string;
  album?: string;
  image_url?: string
};

const LazySpotifyFrame: React.FC<LazySpotifyFrameProps> = ({
  trackId = "",
  theme = 1,
  name = undefined,
  position = undefined,
  height = 152,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const embedUrl = `https://open.spotify.com/embed/track/${trackId}?theme=${theme}`;

  useEffect(() => {
    
    if (iframeRef.current) {
      iframeRef.current.addEventListener("error", () => toast.error("Failed to load iframe due to weak connection"))
    }

  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setTimeout(() => setIsVisible(true), 300);
      },
      { threshold: 0.25 }
    );

    const currentRef = ref.current;
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`max-w-full h-[80px] sm:h-[${height}px] overflow-hidden rounded-lg shadow-md relative border-box`}
    >
      {position && (
        <span className="z-2 absolute left-0 top-0 text-2xl font-bold font-onest rounded-full bg-blue-500 aspect-square min-w-7 min-h-7 grid place-items-center px-3">
          {position}
        </span>
      )}
      {!loaded && (
        <div className="absolute inset-0 bg-zinc-800 animate-pulse rounded-md"></div>
      )}
      {isVisible && (
        <iframe
          ref={iframeRef}
          src={embedUrl}
          width="100%"
          height="100%"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          style={{ border: "none", visibility: loaded ? "visible" : "hidden" }}
          title={name + " Spotify Player"}
          onLoad={() => setLoaded(true)}
          onError={() => toast.error("Error occured while loading your songs")}
        />
      )}
    </div>
  );
};

export default LazySpotifyFrame;
