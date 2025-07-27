import clsx from "clsx";
import React, { useState } from "react";

type SpotifyFrameProps = {
    name : string | undefined;
    position?: number | undefined;
    height?: number | undefined;
    theme?: number | undefined;
    trackId: string | undefined;
};

const SpotifyFrame: React.FC<SpotifyFrameProps> = ({ name=undefined, position=undefined, trackId="", height=152, theme=1 }) => {
    const [loaded, setLoaded] = useState(false);
    const embedUrl = `https://open.spotify.com/embed/track/${trackId}?theme=${theme}`;
    
    return (
        <div className={clsx(`max-w-[100%] h-[80px] sm:h-[${height}px] overflow-hidden rounded-lg shadow-md relative border-box`)}>
            {position && <span className="z-2 absolute left-0 top-0 text-xl font-bold font-onest rounded-full bg-blue-500 aspect-square min-w-7 min-h-7 grid place-items-center px-2">{position}</span>}
            {!loaded && (
                <div className="absolute z-1 inset-0 bg-zinc-800 animate-pulse rounded-md"></div>
            )}
            <iframe
                src={embedUrl}
                width="100%"
                height="100%"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="eager"
                style={{ border: "none", visibility : loaded ? "visible" : "hidden" }}
                title={name + " Spotify Player"}
                onLoad={() => setLoaded(true)}
            ></iframe>
        </div>
    );
};

export default SpotifyFrame;
