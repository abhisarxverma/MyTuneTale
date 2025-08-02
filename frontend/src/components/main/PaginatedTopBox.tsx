import useFetchData from "@/hooks/UseFetchData";
import type { Song, SpotifyArtist } from "@/lib/types";
import { Activity, Guitar, Loader, MicVocal, Music4 } from "lucide-react";
import { useEffect, useState } from "react";
import styles from "./PaginatedTopBox.module.css";
import clsx from "clsx";
import LazySpotifyFrame from "../LazySpotifyFrame";
import LazyArtistFrame from "../LazyArtistFrame";
import CreatePlaylist from "../CreatePlaylist";
import Paginator from "../Paginator";

interface currentTimeline {
    songs_list: Song[] | undefined;
    top_artists: SpotifyArtist[] | undefined;
    title: string;
    tagline: string;
    term: string;
}

export default function PaginatedTopBox() {

    const { data: topTracksData, status: topTracksStatus, error: topTracksError, refetch: topTracksRefetch } = useFetchData("top_tracks")
    const { data: topArtistsData, status: topArtistsStatus, error: topArtistsError, refetch: topArtistsRefetch } = useFetchData("top_artists")
    const [currentTimeline, setCurrentTimeline] = useState<currentTimeline | null>(null)
    const [topSongsPageSize] = useState<number>(8);
    const [topArtistsPageSize] = useState(4);
    const [currentSongPage, setCurrentSongPage] = useState(1);
    const [currentArtistPage, setCurrentArtistPage] = useState(1);

    useEffect(() => {
        setCurrentTimeline({
            term: "short_term",
            songs_list: positionify(topTracksData?.short_term),
            top_artists: positionify(topArtistsData?.short_term),
            title: "30 Days",
            tagline: "Fresh drops and recent obsessions—here’s what ruled your month in music."
        } as currentTimeline)
    }, [topTracksData, topArtistsData]);

    function positionify(array: Song[] | SpotifyArtist[] | undefined) {
        if (!array) return undefined;
        return array.map((obj, index) => {
            return {
                ...obj,
                position: index + 1
            }
        })
    }

    const topSongs = currentTimeline?.songs_list || [];
    const topSongsPageCount = Math.ceil(topSongs.length / topSongsPageSize);
    const paginatedTopSongs = topSongs.slice((currentSongPage - 1) * topSongsPageSize, currentSongPage * topSongsPageSize);

    const topArtists = currentTimeline?.top_artists || [];
    const topArtistsPageCount = Math.ceil(topArtists.length / topArtistsPageSize);
    const paginatedTopArtists = topArtists.slice((currentArtistPage - 1) * topArtistsPageSize, currentArtistPage * topArtistsPageSize);

    const handleSongsPageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= topSongsPageCount) {
            setCurrentSongPage(newPage);
        }
    };

    const handleArtistPageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= topArtistsPageCount) {
            setCurrentArtistPage(newPage)
        }
    }

    function changeTimeline(timeline: string) {
        if (timeline === currentTimeline?.title) return;
        else if (timeline === "30 Days") {
            setCurrentTimeline({
                term: "short_term",
                songs_list: positionify(topTracksData?.short_term),
                top_artists: positionify(topArtistsData?.short_term),
                title: timeline,
                tagline: "Fresh drops and recent obsessions—here’s what ruled your month in music."
            } as currentTimeline)
        }
        else if (timeline === "6 Months") {
            setCurrentTimeline({
                term: "medium_term",
                songs_list: positionify(topTracksData?.medium_term),
                top_artists: positionify(topArtistsData?.medium_term),
                title: timeline,
                tagline: "A playlist of memories—your last six months in soundwaves and snapshots."
            } as currentTimeline
            )
        }
        else if (timeline === "1 Year") {
            setCurrentTimeline({
                term: "long_term",
                songs_list: positionify(topTracksData?.long_term),
                top_artists: positionify(topArtistsData?.long_term),
                title: timeline,
                tagline: "The soundtrack of your year—melodies that marked every high, low, and everything in between."
            } as currentTimeline
            )
        }
    }

    console.log("CURRENTTIMELINE", currentTimeline)

    return (
        <>
            <div className={clsx(styles.mostBox)} >
                {(topTracksData?.long_term) && <p className={clsx(styles.boxLabel, "font-kanit flex items-center text-zinc-300")}><Guitar className={clsx(styles.icon, "me-3")} /><span>Your Most Listened Song for an year</span></p>}
                {(topTracksStatus === "success" && topTracksData?.long_term) &&
                    (<div className="mt-[1rem] p-3 bg-emerald-800 rounded-md">
                        {(topTracksData?.long_term) && <LazySpotifyFrame name={topTracksData?.long_term[0].name} trackId={topTracksData?.long_term[0].id} height={152} />}
                    </div>)}
                {topTracksStatus === "loading" && (
                    <div className=" h-[10rem] mt-5 w-[50rem] bg-zinc-700 animate-pulse rounded-md max-w-[100%]">
                    </div>
                )}
                {topTracksStatus === "error" &&
                    (<div className={clsx("bg-red-900/20 border border-red-500 h-[150px] sm:h-[300px] w-full flex flex-col justify-center items-center rounded-lg")}>
                        <p className="text-red-400 font-dm mb-4">Something went wrong!</p>
                        <p className="text-red-300 text-sm mb-4">{topTracksError}</p>
                        <button
                            onClick={() => topTracksRefetch()}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-dm"
                        > Retry
                        </button>
                    </div>)}
            </div>

            <div className={clsx(styles.topTracksBox, "bg-[transparent]")}>
                <div className={styles.boxLabelGroup}>
                    <p className={clsx(styles.boxLabel, "font-kanit flex items-center text-zinc-300")}><Music4 size={"1.5rem"} className={clsx(styles.icon, "me-3")} /><span>Your Top Listenings</span></p>
                    {topTracksStatus !== "loading" ?
                        (
                            <div className="flex gap-[1rem]">
                                <div className={clsx(styles.boxNavGroup, "bg-zinc-800")}>
                                    {topTracksData?.short_term && <button onClick={() => changeTimeline("30 Days")} className={clsx("30 Days" === currentTimeline?.title ? styles.activeTimeline : "", "bg-black font-kanit cursor-pointer border-box")}>30 Days</button>}
                                    {topTracksData?.medium_term && <button onClick={() => changeTimeline("6 Months")} className={clsx("6 Months" === currentTimeline?.title ? styles.activeTimeline : "", "bg-black font-kanit cursor-pointer border-box")}>6 Months</button>}
                                    {topTracksData?.long_term && <button onClick={() => changeTimeline("1 Year")} className={clsx("1 Year" === currentTimeline?.title ? styles.activeTimeline : "", "bg-black font-kanit cursor-pointer border-box")}>1 Year</button>}
                                </div>
                                <CreatePlaylist currentTimeline={currentTimeline!} />
                            </div >
                        ) : (
                            <div className={clsx("bg-zinc-700 rounded-2xl animate-pulse h-[50px] w-[300px] max-w-[100%] ")}>

                            </div>
                        )}
                </div>
                <div className={clsx(styles.boxContent, "bg-zinc-800")}>
                    <div className={styles.boxContentHeaderGroup}>
                        <div className={styles.boxContentHeaderTextGroup}>
                            {topTracksStatus !== "loading" ?
                                (<>
                                    <h2 className={clsx(styles.boxContentTitle, "font-kanit")}>{currentTimeline?.title}</h2>
                                    <p className={clsx(styles.boxContentSubtitle, "font-dm text-zinc-300")}>{currentTimeline?.tagline}</p>
                                </>) :
                                (<>
                                    <h2 className={clsx(styles.boxContentTitle, "bg-zinc-700 text-zinc-700 animate-pulse w-[max-content] rounded-md py-0 mt-2")}>{currentTimeline?.title}</h2>
                                    <p className={clsx(styles.boxContentSubtitle, "bg-zinc-700 text-zinc-700 animate-pulse w-[max-content] max-w-[100%] overflow-hidden rounded-md mt-2")}>{currentTimeline?.tagline}</p>
                                </>)}
                        </div>
                    </div>
                    {topTracksStatus === "loading" && (
                        <div className="h-[300px]  flex justify-center items-center bg-zinc-700 animate-pulse rounded-2xl m-4">
                            <div className="flex flex-col items-center gap-[1rem] sm:flex-row"><Loader className="size-10 animate-spin text-emerald-500 text-[2rem]" /><span className="font-onest text-[1.5rem]">Loading your most listened songs...</span></div>
                        </div>
                    )}
                    {topTracksStatus === "error" && (
                        <div className={clsx("bg-red-900/20 border border-red-500 h-[150px] sm:h-[300px] w-full flex flex-col justify-center items-center rounded-lg")}>
                            <p className="text-red-400 font-dm mb-4">Something went wrong!</p>
                            <p className="text-red-300 text-sm mb-4">{topTracksError}</p>
                            <button
                                onClick={() => topTracksRefetch()}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-dm"
                            > Retry
                            </button>
                        </div>
                    )}
                    {(topTracksStatus === "success" && topTracksData) && (
                        <div className={clsx(styles.topTracksWrapper, "bg-neutral-950")}>
                            <div className={styles.topTracksHeaderGroup}>
                                <p className="font-dm font-bold flex items-center text-[1.3rem] flex-1"><Activity size={"1.5rem"} className={clsx(styles.icon, "me-3")} /><span className="text-zinc-300">Your Most Listened Songs</span></p>
                            </div>
                            <div className={clsx(styles.listWrapper, styles.customScroll)}>
                                <div className={clsx(styles.topTracksList, "bg-neutral-950")}>
                                    {topSongs.length > 0 ? (
                                        <>
                                            {paginatedTopSongs.map((song) => (
                                                <LazySpotifyFrame key={song.id} name={song.name} position={song.position} trackId={song.id} />
                                            ))}

                                        </>
                                    ) : (
                                        <p className="font-dm text-zinc-300 w-[max-content] h-[max-content] px-10 py-4 rounded-md bg-zinc-800">No song found !</p>

                                    )}
                                </div>
                                {topSongs.length > topSongsPageSize && <div className="w-full flex justify-center pt-5">
                                    <Paginator currentPage={currentSongPage} totalPage={topSongsPageCount} pageChangeHandler={handleSongsPageChange} />
                                </div>}
                            </div>
                        </div>
                    )}
                    {topArtistsStatus === "loading" && (
                        <div className="h-[200px]  flex justify-center items-center bg-zinc-700 animate-pulse rounded-2xl m-4">
                            <div className="flex flex-col items-center gap-[1rem] sm:flex-row"><Loader className="size-10 animate-spin text-emerald-500 text-[2rem]" /><span className="font-onest text-[1.5rem]">Loading your most listened artists...</span></div>
                        </div>
                    )}
                    {topArtistsStatus === "error" && (
                        <div className={clsx("bg-red-900/20 border border-red-500 h-[150px] sm:h-[300px] w-full flex flex-col justify-center items-center rounded-lg")}>
                            <p className="text-red-400 font-dm mb-4">Something went wrong!</p>
                            <p className="text-red-300 text-sm mb-4">{topArtistsError}</p>
                            <button
                                onClick={() => topArtistsRefetch()}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-dm"
                            > Retry
                            </button>
                        </div>
                    )}
                    {(topArtistsStatus === "success" && topArtistsData) && (
                        <div className={clsx(styles.topArtistsWrapper, "bg-neutral-950")}>
                            <div className={clsx(styles.topArtistsHeaderGroup)}>
                                <p className="font-dm font-bold flex items-center text-[1.3rem] flex-1"><MicVocal size={"1.5rem"} className={clsx(styles.icon, "me-3")} /><span className="text-zinc-300">Your Most Listened Artists</span></p>
                            </div>
                            <div className={clsx(styles.listWrapper, styles.custromScroll)}>
                                <div className={styles.topArtistsList}>
                                    {topArtists.length > 0 ?
                                        (<>
                                            {paginatedTopArtists.map((artist) => (
                                                <LazyArtistFrame key={artist.id} name={artist.name} position={artist.position} artistId={artist.id} />
                                            ))}
                                        </>) : (
                                            <p className="font-dm text-zinc-300 w-[max-content] h-[max-content] px-10 py-4 rounded-md bg-zinc-800">No Artist found !</p>
                                        )}
                                </div>
                                {topArtists.length > topArtistsPageSize && <div className="flex justify-center pt-5">
                                    <Paginator currentPage={currentArtistPage} totalPage={topArtistsPageCount} pageChangeHandler={handleArtistPageChange} />
                                </div>}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}