import clsx from "clsx";
import React, { useState } from "react";
import styles from "./SongCard.module.css";

type SpotifyFrameProps = {
    name : string | undefined;
    position?: number | undefined;
    height?: number | undefined;
    theme?: number | undefined;
    trackId: string | undefined;
    image_url: string | undefined;
    artist: string | undefined;
};

const SongCard: React.FC<SpotifyFrameProps> = ({ name=undefined, artist, position=undefined, trackId="", height=152, theme=1, image_url }) => {
    const [loaded, setLoaded] = useState(true);
    
    return (
        <div className={clsx(`max-w-[100%] h-[80px] sm:h-[${height}px] overflow-hidden rounded-lg shadow-md relative border-box`)}>
            {position && <span className="z-2 absolute left-0 top-0 text-xl font-bold font-onest rounded-full bg-blue-500 aspect-square min-w-7 min-h-7 grid place-items-center px-2">{position}</span>}
            {!loaded && (
                <div className="absolute z-1 inset-0 bg-zinc-800 animate-pulse rounded-md"></div>
            )}

            <div className={styles.songCard}>
                <img className={styles.songImage} src={image_url || "/boy.jpg"} alt={`${name} song image`} />
                <div className={styles.songInfo}>
                    <p className={styles.songName}>{name}</p>
                    <p className={styles.songArtist}>{artist}</p>
                </div>
            </div>

        </div>
    );
};

export default SongCard;
