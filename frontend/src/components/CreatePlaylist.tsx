import toast from "react-hot-toast";
import styles from "./CreatePlaylist.module.css";
import type { Song, SpotifyArtist } from "@/lib/types";
import { useState } from "react";
import api from "@/lib/api";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import { FaSpotify } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface currentTimeline {
    songs_list: Song[] | undefined;
    top_artists: SpotifyArtist[] | undefined;
    title: string;
    tagline: string;
    term: string;
}

export default function CreatePlaylist({ currentTimeline }: { currentTimeline: currentTimeline }) {

    const [creatingPlaylist, setCreatingPlaylist] = useState(false);
    const [playlistName, setPlaylistName] = useState("My music persona");
    const [playlistDescription, setPlaylistDescription] = useState("My most listened songs, which together are summary of my life's story.");
    const navigate = useNavigate()

    async function createPlaylist() {

        const name = playlistName.trim();
        if (name==="") return;

        const description = playlistDescription.trim();
        if (description==="") return;

        setCreatingPlaylist(true);

        const raw_token = localStorage.getItem("token_info");

        if (!raw_token) return;

        try {
            const term = currentTimeline?.term;
            const access_token = JSON.parse(raw_token).access_token;

            const res = await api.post("/create_playlist/", {
                term: term,
                access_token: access_token,
                name: name,
                description: description
            })

            const data = res.data;

            console.log("RESPONSE FROM CREATING PLAYLIST :", data)

            if (data?.success) {
                const playlist_url = data.data;
                window.open(playlist_url, "_blank");
                toast.success(data?.message)
                setPlaylistName("")
                setPlaylistDescription("")
            }
            else {
                toast.error(data?.message)
            }

        } catch (error: any) {
            console.log("Error in creating playlist :", error);
            if (error.response.data.cause === "token") navigate("/")
            toast.error("Please connect to spotify to create playlist")
        } finally {
            setCreatingPlaylist(false);
        }
    }

    return (
        <>
            <Popover >
                <PopoverTrigger className={styles.popoverTrigger}>
                    <button 
                            className={clsx(styles.createPlaylistButton, "bg-neutral-950 font-kanit")} 
                            title="turn the whole top songs list into a playlist">{!creatingPlaylist ? <FaSpotify size={"1.7rem"} className={styles.createPlaylistIcon} /> : <Loader2 size={"1.7rem"} className={clsx(styles.createPlaylistIcon, "animate-spin")} />}
                            <span>Create Playlist</span>
                            </button>
                </PopoverTrigger>
                <PopoverContent className={styles.popoverContent}>
                    <div className={styles.formWrapper}>
                        <input 
                            type="text" 
                            placeholder="Playlist Name"
                            value={playlistName}
                            onChange={(e) => setPlaylistName(e.target.value)}
                            className={clsx(styles.input, styles.nameInput)} />
                        <textarea 
                            placeholder="Playlist Description"
                            value={playlistDescription}
                            onChange={(e) => setPlaylistDescription(e.target.value)}
                            className={clsx(styles.textarea, styles.descriptionInput)} ></textarea>
                        <button onClick={() => createPlaylist()} className={styles.createButton}>{creatingPlaylist ? <Loader2 className={clsx(styles.buttonIcon, "animate-spin")} /> : <span className={clsx("flex items-center gap-2")}><FaSpotify className={styles.buttonIcon} /><span>Create</span></span>}</button>
                    </div>
                </PopoverContent>
            </Popover>
            
        </>
    )

}