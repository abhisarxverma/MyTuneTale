import useFetchData from "@/hooks/UseFetchData"
import styles from "./UserBox.module.css";
import { FaSpotify } from "react-icons/fa";
import clsx from "clsx";
import { User } from "lucide-react";
import { useSpotify } from "@/providers/SpotifyProvider";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export default function UserBox() {

    const { data, status, error, refetch } = useFetchData("user");
    const { persona } = useSpotify()!;

    return (
        <>
            {status === "success" && (
                <div className={styles.headerGroup}>
                    <div className={styles.connectionGroup}>
                        <FaSpotify className={styles.spotifyIcon} color="#1ED760" />
                        <span className={styles.spotifyConnected}>Spotify Connected</span>
                    </div>
                    <a href={data?.external_url} target="_blank" className={styles.avatarGroup}>
                        <Avatar className={styles.avatar}>
                            <AvatarImage src={data?.profile_image} />
                            <AvatarFallback className={styles.avatarFallback}><User size={"4rem"} /></AvatarFallback>
                        </Avatar>
                        <p className={clsx(styles.nameTitle, "font-onest")}>{data?.display_name ? data?.display_name : "Spotify User"}</p>
                    </a>
                    <p className={clsx(styles.reflection, "font-onest text-[1.3rem] text-zinc-300")}>{persona?.ai_analysis?.reflection || "Without music, life would be a mistake."}</p>
                    {persona?.ai_analysis && <div className={styles.emotionKeywords}>
                        {persona?.ai_analysis?.emotion_keywords.map((keyword: string, index: number) => {
                            return <Badge variant="outline" className={styles.emotionTag} key={index}>{keyword}</Badge>
                        })}
                    </div>}
                </div>)}

            {status === "loading" && (
                <div className={styles.headerGroup}>
                    <div className={styles.connectionGroup}>
                        <FaSpotify className={styles.spotifyIcon} color="#1ED760" />
                        <span className={styles.spotifyConnected}>Spotify Connected</span>
                    </div>
                    <a href={data?.external_url} target="_blank" className={clsx(styles.avatarGroup, "max-w-[100%]")}>
                        <div className={clsx(styles.avatar, "bg-zinc-700 rounded-full animate-pulse flex items-center justify-center")}>
                        </div>
                        <div className={clsx("bg-zinc-700 w-[30rem] max-w-[70vw] animate-pulse h-[4.5rem] p-5 rounded-full text-[1.5rem] text-zinc-600")}></div>
                    </a>
                    <p className={clsx(styles.reflection, "font-onest text-[1.3rem] text-zinc-300")}>{persona?.ai_analysis?.reflection || "Without music, life would be a mistake."}</p>
                    {persona?.ai_analysis && <div className={styles.emotionKeywords}>
                        {persona?.ai_analysis?.emotion_keywords.map((keyword: string, index: number) => {
                            return <Badge variant="outline" className={styles.emotionTag} key={index}>{keyword}</Badge>
                        })}
                    </div>}
                </div>
            )}

            {status === "error" && (
                <div className={clsx("bg-red-900/20 border border-red-500 h-[150px] sm:h-[150px] w-full flex flex-col justify-center items-center rounded-lg max-w-[400px]")}>
                    <p className="text-red-400 font-dm mb-4">Something went wrong!</p>
                    <p className="text-red-300 text-sm mb-4">{error}</p>
                    <button
                        onClick={() => refetch()}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-dm"
                    > Retry
                    </button>
                </div>
            )}
        </>
    )
}