import { Activity, Guitar, Loader2, MicVocal, Music4, Search, User } from "lucide-react";
import SpotifyFrame from "../components/SpotifyFrame";
import { FaSpotify } from "react-icons/fa";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import styles from "./HomePage.module.css";
import clsx from "clsx";
import SpotifyArtistFrame from "../components/ArtistFrame";
import React, { useEffect, useState } from "react";
import { useSpotify } from "@/providers/SpotifyProvider";
import AllTime from "@/components/AllTime";
import { type SpotifyAnalysis, type Song, type SpotifyArtist } from "@/lib/types.ts";
import { AdditionsChart } from "@/components/AdditionsChart";
import Story from "@/components/Story";
import { Badge } from "@/components/ui/badge";

interface currentTimeline {
    songs_list : Song[] | undefined;
    top_artists: SpotifyArtist[] | undefined;
    title: string;
    tagline: string;
}

export default function HomePage() {

    const { persona, status } = useSpotify()!
    console.log("PERSONA : ", persona)
    const [data, setData] = useState<SpotifyAnalysis | null>(null)
    const [currentTimeline, setCurrentTimeline] = useState<currentTimeline | null>(null)
    const [songsList, setSongsList] = useState<Song[] | undefined>(undefined);
    const [artistsList, setArtistsList] = useState<SpotifyArtist[] | undefined>(undefined);
    const [songSearchQuery, setSongSearchQuery] = useState<string>("");
    const [artistSearchQuery, setArtistSearchQuery] = useState<string>("");
    // console.log("persona DATA :", data)
    // console.log("SPOTIFY CONNECTED : ", authenticated)

    useEffect(() => {
        if (status !== "authenticated" || !persona) return;
        setData(persona as SpotifyAnalysis)
        setCurrentTimeline({
            songs_list: positionify(persona?.top_tracks.short_term),
            top_artists: positionify(persona?.top_artists.short_term),
            title: "30 Days",
            tagline: "Fresh drops and recent obsessions—here’s what ruled your month in music."
        } as currentTimeline)
    }, [persona, status])

    function positionify(array: Song[] | SpotifyArtist[] | undefined) {
        if (!array) return [];
        return array.map((obj, index) => {
            return {
                ...obj,
                position: index + 1
            }
        })
    }

    function songSearch(e : React.ChangeEvent<HTMLInputElement>) {
        const query = e.target.value.trim().toLowerCase();
        setSongSearchQuery(query)
        setSongsList(currentTimeline?.songs_list?.filter(song => (song.name.toLowerCase().includes(query))))
    }

    function artistSearch(e : React.ChangeEvent<HTMLInputElement>) {
        const query = e.target.value.trim().toLowerCase();
        setArtistSearchQuery(query);
        setArtistsList(currentTimeline?.top_artists?.filter(artist => (artist.name.toLowerCase().includes(query))))
    }

    function changeTimeline(timeline: string) {
        if (timeline === currentTimeline?.title) return;
        else if (timeline === "30 Days") {
            setCurrentTimeline({
                songs_list: positionify(data?.top_tracks.short_term),
                top_artists: positionify(data?.top_artists.short_term),
                title: timeline,
                tagline: "Fresh drops and recent obsessions—here’s what ruled your month in music."
            } as currentTimeline)
        }
        else if (timeline === "6 Months") {
            setCurrentTimeline({
                songs_list: positionify(data?.top_tracks.medium_term),
                top_artists: positionify(data?.top_artists.medium_term),
                title: timeline,
                tagline: "A playlist of memories—your last six months in soundwaves and snapshots."
            } as currentTimeline
            )
        }
        else if (timeline === "1 Year") {
            setCurrentTimeline({
                songs_list: positionify(data?.top_tracks.long_term),
                top_artists: positionify(data?.top_artists.long_term),
                title: timeline,
                tagline: "The soundtrack of your year—melodies that marked every high, low, and everything in between."
            } as currentTimeline
            )
        }
    }

    console.log("CURRENTTIMELINE", currentTimeline)

    if (status === "loading") {
        return (
            <div className="h-[75vh] w-full flex justify-center items-center">
                <Loader2 className="size-10 animate-spin" />
            </div>
        );
    }

    if (status === "unauthenticated") {
        window.location.href = "/";
        return null;
    }

    if (!data || !currentTimeline) return (
        <div className="h-[75vh] w-full flex justify-center items-center">
            <div className="flex items-center gap-[1rem]"><Loader2 className="size-[1.5rem] animate-spin" /><span className="text-[1.5rem]">Please Wait</span></div>
        </div>
    )

    const topSongsToShow = songsList && songSearchQuery !== "" ? songsList : currentTimeline.songs_list
    const topArtistsToShow = artistsList && artistSearchQuery !== "" ? artistsList : currentTimeline.top_artists

    return (
        <>
            <div className={styles.headerGroup}>
                <div className={styles.connectionGroup}>
                    <FaSpotify size={"1.5rem"} color="#1ED760" />
                    <span className={styles.spotifyConnected}>Spotify Connected</span>
                </div>
                <div className={styles.avatarGroup}>
                    <Avatar className={styles.avatar}>
                        <AvatarImage src={data.user.profile_image} />
                        <AvatarFallback className={styles.avatarFallback}><User size={"2rem"} /></AvatarFallback>
                    </Avatar>
                    <h2 className={clsx(styles.nameTitle, "font-onest")}>{data.user.display_name}</h2>

                </div>
                <p className={clsx(styles.reflection, "font-kanit text-zinc-300")}>{persona?.ai_analysis?.reflection || "Every track tells a little bit of you."}</p>
                {persona?.ai_analysis && <div className={styles.emotionKeywords}>
                    {persona?.ai_analysis?.emotion_keywords.map((keyword, index) => {
                        return <Badge variant="outline" className={styles.emotionTag} key={index}>{keyword}</Badge>
                        })}
                </div>}
            </div>

            <div className={clsx(styles.mostBox)} >
                <p className={clsx(styles.boxLabel, "font-kanit flex items-center text-zinc-300")}><Guitar className={clsx(styles.icon, "me-3")} /><span>Your Most Listened Song for an year</span></p>
                <div className="mt-[1rem] p-3 bg-emerald-800 rounded-md">
                    <SpotifyFrame name={data.top_tracks.long_term[0].name} trackId={data.top_tracks.long_term[0].id} height={152} />
                </div>
            </div>


            <div className={clsx(styles.topTracksBox, "bg-[transparent]")}>
                <div className={styles.boxLabelGroup}>
                    <p className={clsx(styles.boxLabel, "font-kanit flex items-center text-zinc-300")}><Music4 size={"1.5rem"} className={clsx(styles.icon, "me-3")} /><span>Your Top Listenings</span></p>
                    <div className={clsx(styles.boxNavGroup, "bg-zinc-800")}>
                        <button onClick={() => changeTimeline("30 Days")} className={clsx("30 Days" === currentTimeline?.title ? styles.activeTimeline : "", "bg-black font-kanit cursor-pointer border-box")}>30 Days</button>
                        <button onClick={() => changeTimeline("6 Months")} className={clsx("6 Months" === currentTimeline?.title ? styles.activeTimeline : "", "bg-black font-kanit cursor-pointer border-box")}>6 Months</button>
                        <button onClick={() => changeTimeline("1 Year")} className={clsx("1 Year" === currentTimeline?.title ? styles.activeTimeline : "", "bg-black font-kanit cursor-pointer border-box")}>1 Year</button>
                    </div>
                </div>
                <div className={clsx(styles.boxContent, "bg-zinc-800")}>
                    <div className={styles.boxContentHeaderGroup}>
                        <div className={styles.boxContentHeaderTextGroup}>
                            <h2 className={clsx(styles.boxContentTitle, "font-kanit")}>{currentTimeline?.title}</h2>
                            <p className={clsx(styles.boxContentSubtitle, "font-dm text-zinc-300")}>{currentTimeline?.tagline}</p>
                        </div>
                    </div>
                    <div className={clsx(styles.topTracksWrapper, "bg-neutral-950")}>
                        <div className={styles.topTracksHeaderGroup}>
                            <p className="font-dm font-bold flex items-center text-[1.3rem] flex-1"><Activity size={"1.5rem"} className={clsx(styles.icon, "me-3")} /><span className="text-zinc-300">Your Most Listened Songs</span></p>
                            <div className={clsx(styles.searchBarGroup, "bg-zinc-800")}>
                                <Search className={styles.searchIcon} />
                                <input type="text" placeholder="Search any song here" value={songSearchQuery} className={clsx(styles.searchBar)} onChange={(e) => songSearch(e)} />
                            </div>
                        </div>
                        <div className={styles.topTracksList}>
                            {(topSongsToShow ? topSongsToShow.length : 0) > 0 ? topSongsToShow?.map((song) => (
                                <SpotifyFrame key={song.id} name={song.name} position={song.position} trackId={song.id} />
                            )) :
                                <p className="font-dm text-zinc-300 w-[max-content] h-[max-content] px-10 py-4 rounded-md bg-zinc-800">No song found !</p>
                            }
                        </div>
                    </div>
                    <div className={clsx(styles.topArtistsWrapper, "bg-neutral-950")}>
                        <div className={clsx(styles.topArtistsHeaderGroup)}>
                            <p className="font-dm font-bold flex items-center text-[1.3rem] flex-1"><MicVocal size={"1.5rem"} className={clsx(styles.icon, "me-3")} /><span className="text-zinc-300">Your Most Listened Artists</span></p>
                            <div className={clsx(styles.searchBarGroup, "bg-zinc-800")}>
                                <Search className={styles.searchIcon} />
                                <input type="text" placeholder="Search any artist here" value={artistSearchQuery} className={styles.searchBar} onChange={(e) => artistSearch(e)} />
                            </div>
                        </div>
                        <div className={styles.topArtistsList}>
                            {(topArtistsToShow? topArtistsToShow.length : 0) > 0 ? topArtistsToShow?.map((artist) => (
                                <SpotifyArtistFrame key={artist.id} name={artist.name} position={artist.position} artistId={artist.id} />
                            )) :
                                <p className="font-dm text-zinc-300 w-[max-content] h-[max-content] px-10 py-4 rounded-md bg-zinc-800">No Artist found !</p>
                            }
                        </div>
                    </div>
                </div>
            </div>


            <AllTime />

            <AdditionsChart playlists={persona?.playlists}/>

            {/* <Story /> */}
        </>
    )
}