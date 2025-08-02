import clsx from "clsx";
import styles from "./StartListening.module.css";
import { recommendedSongs } from "@/utils";
import LazySpotifyFrame from "./LazySpotifyFrame";

export default function StartListening() {
    return (
        <div className={clsx(styles.wrapper)}>
            <h1 className={clsx(styles.title, "font-onest")}><span>Your music persona is waiting to be discovered. Start listening on Spotify to unlock your sonic identity.</span></h1>
            <div className={clsx(styles.songs)}>
                {recommendedSongs.map((song) => (
                    <LazySpotifyFrame name={song.name} trackId={song.id} />
                ))}
            </div>
        </div>
    )
}