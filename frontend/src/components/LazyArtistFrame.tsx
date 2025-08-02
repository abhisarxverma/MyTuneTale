import React, { useEffect, useRef, useState } from "react";

type SpotifyArtistFrameProps = {
    artistId: string;
    name: string;
    position?: number;
    theme?:number;
    height?:number;
};

const LazyArtistFrame: React.FC<SpotifyArtistFrameProps> = ({ artistId, name, position, theme=1, height=152 }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null);
    const embedUrl = `https://open.spotify.com/embed/artist/${artistId}?theme=${theme}`;

    useEffect(() => {
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) setIsVisible(true);
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
        <div ref={ref} className={`h-[80px] sm:h-[${height}px] overflow-hidden rounded-lg shadow-md relative`}>
            <span className="z-2 absolute left-0 top-0 text-2xl font-bold font-onest rounded-full bg-blue-500 aspect-square min-w-7 min-h-7 grid place-items-center px-3">
                {position}
            </span>
            {!loaded && (
                <div className="z-1 absolute inset-0 bg-zinc-800 animate-pulse rounded-md"></div>
            )}

            {isVisible && <iframe
                src={embedUrl}
                width="100%"
                height="100%"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="eager"
                style={{ border: "none", visibility: loaded ? "visible" : "hidden" }}
                title={`${name} Spotify Artist`}
                onLoad={() => setLoaded(true)}
            ></iframe>}
        </div>
    );
};

export default LazyArtistFrame;
