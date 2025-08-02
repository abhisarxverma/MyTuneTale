import { useSpotify } from "@/providers/SpotifyProvider";
import UserBox from "@/components/main/UserBox";
import StatBox from "@/components/main/StatBox";
import PaginatedTopBox from "@/components/main/PaginatedTopBox";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import type { SpotifyKey } from "@/lib/types";
import StartListening from "@/components/StartListening";

export default function HomePage() {

    const { persona, authenticated } = useSpotify()!
    const navigate = useNavigate();
    const checked = useRef(false);
    const [ newSpotifyUser, setNewSpotifyUser ] = useState(false);

    console.log("PERSONA : ", persona)
    console.log("SPOTIFY CONNECTED : ", authenticated)

    
    useEffect(() => {
        if (checked.current) return;
        
        const token_info = localStorage.getItem("token_info");
        const user_id = localStorage.getItem("user_id");
        if (!token_info || !user_id) {
            navigate("/")
            toast.error("Please connect to spotify", { id: "error-authorize" })
        }

        const hasFetchedAll = ["user", "top_tracks", "top_artists", "playlists"]
            .every((k) => persona[k as SpotifyKey] !== undefined);

        if (!hasFetchedAll) return;
        

        const allEmpty = ["user", "top_tracks", "top_artists", "playlists"]
            .every((k) => persona[k as SpotifyKey] == null);

        if ( allEmpty ) {
            console.log("All empty spotify data");
            navigate("/")
            toast.error("Please connect to spotify", {id : "error-authorize"})
        }

        const onlyUserPresent =
            persona.user && ["top_tracks", "top_artists", "playlists", "saved_tracks"]
                .every((k) => persona[k as SpotifyKey] == null);

        if (onlyUserPresent) {
            setNewSpotifyUser(true);
        }

        checked.current = true;


    }, [navigate, persona])


    return (
        <>
            <UserBox />

            {newSpotifyUser ? (
                <StartListening />
            ) : (
                <>
                    <PaginatedTopBox />
                    <StatBox />
                </>
            )}

        </>
    )
}