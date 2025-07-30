import React, { useState, useRef, useEffect } from "react";

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
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const embedUrl = `https://open.spotify.com/embed/track/${trackId}?theme=${theme}`;

  useEffect(() => {
    let retryTimer: NodeJS.Timeout | null = null;

    if (error) {
      retryTimer = setTimeout(() => {
        setError(false);
        setRetryKey(prev => prev + 1);
      }, 10000); 
    }

    return () => {
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [error]);

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
        <span className="z-2 absolute left-0 top-0 text-xl font-bold font-onest rounded-full bg-blue-500 aspect-square min-w-7 min-h-7 grid place-items-center px-2">
          {position}
        </span>
      )}
      {!loaded && (
        <div className="absolute inset-0 bg-zinc-800 animate-pulse rounded-md"></div>
      )}
      {isVisible && (
        <iframe
          src={embedUrl}
          width="100%"
          height="100%"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          style={{ border: "none", visibility: loaded ? "visible" : "hidden" }}
          title={name + " Spotify Player"}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      )}
    </div>
  );
};

export default LazySpotifyFrame;
