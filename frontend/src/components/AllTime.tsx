import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import styles from "./AllTime.module.css";
import clsx from "clsx";
import { useState } from "react";
import "./Calendar.css"
import { useSpotify } from "@/providers/SpotifyProvider";
import SpotifyFrame from "./SpotifyFrame";
import { CalendarFold, Heart } from "lucide-react";
import { type SpotifyAnalysis } from "@/lib/types.ts";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

function areSameDate(date1: Date, date2: Date) {
    if (!(date1 instanceof Date) || !(date2 instanceof Date)) {
        console.error("Inputs must be Date objects.");
        return false;
    }

    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
}

function areSameMonth(date1: Date, date2: Date) {
    if (!(date1 instanceof Date) || !(date2 instanceof Date)) {
        console.error("Error in same months checker : both inputs must be date objects");
        return false;
    }

    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth()
    )

}

function getSongsAddedOnDay(data: SpotifyAnalysis, date: Date) {
    const result = [];

    for (const playlist of data.playlists) {
        const items = []
        const allTracks = playlist.tracks
        for (const track of allTracks) {
            const dateAdded = new Date(track.added_at)
            if (areSameDate(dateAdded, date)) items.push(track)
        }
        if (items.length > 0) {
            result.push({
                playlistName: playlist.name,
                image: playlist.image,
                tracks: items
            })
        }
    }

    result.sort((a, b) => {
        if (a.tracks > b.tracks) return -1;
        if (a.tracks < b.tracks) return 1;
        return 0;
    })

    return result;
}

function getSongsAddedInMonth(data: SpotifyAnalysis, date: Date) {
    const result = [];

    for (const playlist of data.playlists) {
        const items = []
        const allTracks = playlist.tracks
        for (const track of allTracks) {
            const dateAdded = new Date(track.added_at)
            if (areSameMonth(dateAdded, date)) items.push(track)
        }
        if (items.length > 0) {
            result.push({
                playlistName: playlist.name,
                image: playlist.image,
                tracks: items
            })
        }
    }

    result.sort((a, b) => {
        if (a.tracks > b.tracks) return -1;
        if (a.tracks < b.tracks) return 1;
        return 0;
    })

    return result;
}

export default function AllTime() {

    const { persona } = useSpotify()!;
    const [date, setDate] = useState<Date>(new Date());


    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear()

    const dayResults = getSongsAddedOnDay(persona as SpotifyAnalysis, date as Date) || []
    const monthResults = getSongsAddedInMonth(persona as SpotifyAnalysis, date as Date) || []

    console.log("DAYRESULTS :", dayResults)
    console.log("MONTHRESULSTS :", monthResults)

    return (
        <div className={styles.allTimeWrapper}>

            <h1 className={clsx(styles.title, "font-dm")}>Remember the times ?</h1>
            <p className="text-zinc-300 font-dm">Select any date to see all the songs you added in any of the playlist at that time</p>

            <div className={clsx(styles.allTimeBox)}>
                <DayPicker
                    required={true}
                    animate
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    navLayout="around"
                    footer={
                        date ? `Selected: ${date.toLocaleDateString()}` : "Pick a day."
                    }
                    className={clsx(styles.calendar, "rdp-root bg-zinc-800 p-2 ")}
                />
                <div className={clsx(styles.result, "bg-zinc-800")}>
                    <div className={clsx(styles.resultSongsBox, styles.dayResults, "transition-all duration-300")}>
                        <p className={clsx(styles.boxLabel, "font-dm flex items-center gap-[.7rem] text-zinc-500")}><CalendarFold size={".8rem"} /><span>Songs added on {day} {month} {year}</span></p>
                        {dayResults.length > 0 ?
                            <div className={clsx(styles.playlistList, styles.dayPlaylistList, styles.customScroll, "bg-zinc-900 ")}>
                                {
                                    dayResults.map((playlist) => {
                                        return (
                                            <>
                                                <p className="py-4 px-2 font-dm font-bold bg-zinc-900 text-[2.5rem] flex items-end gap-[1rem]">
                                                    <Avatar className={styles.playlistImage}>
                                                        <AvatarImage src={playlist.image} />
                                                        <AvatarFallback className={styles.playlistImageFallback}><Heart className={clsx(styles.heartIcon, "bg-blue-500 w-full h-full")} size={"1.2rem"} /></AvatarFallback>
                                                    </Avatar>
                                                    {playlist.playlistName}
                                                </p>
                                                <div className={clsx(styles.songsList, styles.daySongsList, "bg-zinc-900")}>{playlist.tracks.map((song) => (
                                                    <SpotifyFrame name={song.name} trackId={song.id} key={song.id} height={80} theme={1} />
                                                ))}</div>
                                            </>
                                        )
                                    })}
                            </div>
                            : <p className="font-dm text-zinc-400 rounded-md min-h-[50px] bg-neutral-900 mb-[1rem] flex justify-center items-center">You saved no songs on this specific day</p>}
                    </div>
                    <div className={clsx(styles.resultSongsBox)}>
                        <p className={clsx(styles.boxLabel, "font-dm flex items-center gap-[.7rem] text-zinc-500")}><CalendarFold size={".8rem"} /><span>Songs added in {month} {year}</span></p>
                        {monthResults.length > 0 ?
                            <div className={clsx(styles.playlistList, styles.customScroll, "bg-zinc-800")}>
                                {monthResults.map((playlist) => {
                                    return (
                                        <>
                                            <p className="py-4 pt-5 px-2 font-dm font-bold bg-zinc-900 text-[2.5rem] flex items-end gap-[1rem]">
                                                <Avatar className={styles.playlistImage}>
                                                    <AvatarImage src={playlist.image} />
                                                    <AvatarFallback className={styles.playlistImageFallback}><Heart className={clsx(styles.heartIcon, "bg-blue-500 w-full h-full")} size={"1.2rem"} /></AvatarFallback>
                                                </Avatar>
                                                {playlist.playlistName}
                                            </p>
                                            <div className={clsx(styles.songsList, "bg-zinc-900")}>{playlist.tracks.map((song) => (
                                                <SpotifyFrame name={song.name} trackId={song.id} key={song.id} height={80} theme={1} />
                                            ))}</div>
                                        </>
                                    )
                                })}
                            </div> :
                            <p className="font-dm text-zinc-400 min-h-[5rem] px-4 py-2 bg-neutral-900 mb-[1rem] flex justify-center items-center">You saved no songs in this month</p>}
                    </div>
                </div>
            </div>

        </div>
    )
}
