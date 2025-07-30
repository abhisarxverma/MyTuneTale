import clsx from "clsx";
import styles from "./Story.module.css";
import { useEffect, useState } from "react";
import { Loader } from "lucide-react";
import { useSpotify } from "@/providers/SpotifyProvider";
import { PersonaStory } from "./PersonaChart";
import { SadStory } from "./SadChart";
import { HappinessStory } from "./HappinessStory";
import { DeepLyricsStory } from "./DeepLyricsChart";
import api from "@/lib/api.ts";
import type { SpotifyAnalysis } from "@/lib/types";
import { useNavigate } from "react-router-dom";

export default function Story() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { persona, setPersona } = useSpotify()!;
    const [currentChart, setCurrentChart] = useState("persona");
    const navigate = useNavigate();

    async function fetchAnalysis() {
        
        const user_id = localStorage.getItem("user_id")

        if (!user_id) {
            console.log("USER ID NOT FUOND IN THE LOCALSTORAGE IN THE STORY")
            navigate("/")
        }

        try {
            setLoading(true);
            setError(null);

            const res = await api.post(`/aianalysis`, { user_id: user_id });
            console.log("ANALYSIS RESPONSE:", res);

            if (!res.data || !res.data.data) {
                throw new Error("Invalid response structure from api");
            }

            const data = res.data.data.data;
            console.log("ANALYSIS DATA:", data);

            if (!data.story || !data.story.all_chapters) {
                throw new Error("Analysis response missing story data");
            }

            setPersona(prev => ({ ...prev, ai_analysis: data }) as SpotifyAnalysis);
            setLoading(false);
        } catch (error) {
            console.error("Error in fetching ai analysis:", error);
            setError(error instanceof Error ? error.message : "Failed to fetch analysis");
            setLoading(false);
        }
    }

    function changeChart(chartName: string) {
        if (!chartName.trim()) return;

        const query = chartName.trim().toLowerCase();

        if (query === "persona") setCurrentChart("persona");
        else if (query === "happiness") setCurrentChart("happiness");
        else if (query === "sadness") setCurrentChart("sadness");
        else if (query === "deep_lyrics") setCurrentChart("deep_lyrics");
    }

    useEffect(() => {
        fetchAnalysis();
    }, []);

    console.log("PERSONA AI ANALYSIS:", persona?.ai_analysis);


    if (loading) {
        return (
            <div>
                <h2 className={clsx(styles.title, "font-onest", styles[`${currentChart}Title`])}>
                    What your music journey tells about your past?
                </h2>
                <p className="text-zinc-300 font-dm">
                    Below you can see how with each month, you changed, determined by your music journey
                </p>
                <div className={clsx("animate-pulse bg-zinc-800 h-[300px] w-full flex justify-center items-center mt-[2rem]")}>
                    <p className={styles.creatingLabel}>
                        <Loader size={"2rem"} className={clsx(styles.creatingLoader, "animate-spin")} />
                        <span className="font-dm">Analyzing your beautiful music journey</span>
                    </p>
                </div>
            </div>
        ); 
    }

    if (error) {
        return (
            <div className={clsx("bg-red-900/20 border border-red-500 h-[300px] w-full flex flex-col justify-center items-center rounded-lg")}>
                <p className="text-red-400 font-dm mb-4">Failed to load your story</p>
                <p className="text-red-300 text-sm mb-4">{error}</p>
                <button
                    onClick={() => fetchAnalysis()}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-dm"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!persona) {
        return (
            <div className={clsx("bg-yellow-900/20 border border-yellow-500 h-[300px] w-full flex justify-center items-center rounded-lg")}>
                <p className="text-yellow-400 font-dm">No persona data available</p>
            </div>
        );
    }

    if (!persona.ai_analysis || !persona.ai_analysis.story || !persona.ai_analysis.story.all_chapters) {
        return (
            <div className={clsx("bg-yellow-900/20 border border-yellow-500 h-[300px] w-full flex flex-col justify-center items-center rounded-lg")}>
                <p className="text-yellow-400 font-dm mb-4">Analysis data is incomplete</p>
                <button
                    onClick={() => fetchAnalysis()}
                    className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-dm"
                >
                    Retry Analysis
                </button>
            </div>
        );
    }

    return (
        <div className={styles.storyWrapper}>
            <h2 className={clsx(styles.title, "font-onest", styles[`${currentChart}Title`])}>
                What your music journey tells about your past?
            </h2>
            <p className="text-zinc-300 font-dm">
                Below you can see how with each month, you changed, determined by your music journey
            </p>

            <div className={clsx(styles.navGroup, "bg-zinc-800")}>
                <button
                    onClick={() => changeChart("persona")}
                    className={clsx(
                        styles.navTab,
                        "bg-neutral-950 text-white",
                        styles.personaTab,
                        currentChart === "persona" ? styles.active : ""
                    )}
                >
                    Persona
                </button>
                <button
                    onClick={() => changeChart("happiness")}
                    className={clsx(
                        styles.navTab,
                        "bg-neutral-950 text-white",
                        styles.happinessTab,
                        currentChart === "happiness" ? styles.active : ""
                    )}
                >
                    Happiness
                </button>
                <button
                    onClick={() => changeChart("sadness")}
                    className={clsx(
                        styles.navTab,
                        "bg-neutral-950 text-white",
                        styles.sadnessTab,
                        currentChart === "sadness" ? styles.active : ""
                    )}
                >
                    Sadness
                </button>
                <button
                    onClick={() => changeChart("deep_lyrics")}
                    className={clsx(
                        styles.navTab,
                        "bg-neutral-950 text-white",
                        styles.deepLyricsTab,
                        currentChart === "deep_lyrics" ? styles.active : ""
                    )}
                >
                    Deep Lyrics
                </button>
            </div>

            <div className={clsx(styles.storyBox, "bg-neutral-950")}>
                <div className={styles.personaBox}>
                    {currentChart === "persona" && (
                        <PersonaStory data={persona.ai_analysis.story.all_chapters} />
                    )}
                </div>
                <div className={styles.sadnessBox}>
                    {currentChart === "sadness" && (
                        <SadStory data={persona.ai_analysis.story.all_chapters} />
                    )}
                </div>
                <div className={styles.happinessBox}>
                    {currentChart === "happiness" && (
                        <HappinessStory data={persona.ai_analysis.story.all_chapters} />
                    )}
                </div>
                <div className={styles.deepLyricsBox}>
                    {currentChart === "deep_lyrics" && (
                        <DeepLyricsStory data={persona.ai_analysis.story.all_chapters} />
                    )}
                </div>
            </div>
        </div>
    );
}