import { useEffect, useState } from "react";
import styles from "./WordCloud.module.css";
import { Loader } from "lucide-react";
import clsx from "clsx";
import { useSpotify } from "@/providers/SpotifyProvider";
import api from "@/lib/api";

export default function WordCloud() {

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [wordCloudUrl, setWordCloudUrl] = useState(null);

    const { persona } = useSpotify()!;

    async function createWordCloud() {
        setLoading(true);
        api.post("/wordcloud", {
            user_id: persona?.user.id,
            top_tracks: persona?.top_tracks.long_term
        }).then(res => {

            const data = res.data;
            console.log("WORDCLOUD RESPONSE :", data)
            if (data.success) {
                setWordCloudUrl(data.url);
            }
            else {
                setError(data.message)
            }
            setLoading(false)
        }).catch((error) => {
            console.log("Error occured in wordcloud fetching :", error)
            setError(error.response.data.message)
            setLoading(false)
        })
    }

    useEffect(() => {
        if (!persona) return;

        createWordCloud()
    }, [])

    if (loading) return (
        <>
            <h1 className={clsx(styles.title, "font-dm")}>A Wordcloud of your most listened tracks for a year</h1>
            <div className="h-[300px] w-full flex justify-center items-center relative bg-zinc-800 animate-pulse">
                <p className="flex gap-2 items-center text-[2rem] font-dm"><Loader size={"2rem"} className="animate-spin text-emerald-500" /><span>Creating wordcloud from your most listened tracks...</span></p>
            </div>
        </>
    )

    if (error) return (
        <>
            <h1 className={clsx(styles.title, "font-dm")}>A Wordcloud of your most listened tracks for a year</h1>
            <div className="h-[300px] w-full flex justify-center items-center relative bg-zinc-800">
                <p className="flex gap-2 items-center text-[2rem] font-dm text-red-500"><span>Error occured...</span></p>
            </div>
        </>
    )

    return (
        <>
            <h1 className={clsx(styles.title, "font-dm")}>A Wordcloud of your most listened tracks for a year</h1>
            <div className={clsx(styles.wordcloud_box)}>
                <img className={clsx(styles.wordcloud)} src={wordCloudUrl!} alt="Wordcloud image of your top tracks of 1 year" />
            </div>
        </>
    )

}