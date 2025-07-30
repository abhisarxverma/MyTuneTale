import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import styles from "./AllTime.module.css";
import clsx from "clsx";
import { useState } from "react";
import "./Calendar.css";
import { CalendarFold, Heart } from "lucide-react";
import { type PlaylistCollection } from "@/lib/types.ts";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import LazySpotifyFrame from "./LazySpotifyFrame";

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

function getSongsAddedOnDay(data: PlaylistCollection, date: Date) {
    const result = [];

    for (const playlist of data) {
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

function getSongsAddedInMonth(data: PlaylistCollection, date: Date) {
    const result = [];

    for (const playlist of data) {
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

export default function AllTime({ playlistsData }: { playlistsData: PlaylistCollection | null }) {

    
    const [date, setDate] = useState<Date>(new Date());
    
    
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear()
    
    const dayResults = getSongsAddedOnDay(playlistsData as PlaylistCollection, date as Date) || []
    const monthResults = getSongsAddedInMonth(playlistsData as PlaylistCollection, date as Date) || []
    
    console.log("DAYRESULTS :", dayResults)
    console.log("MONTHRESULSTS :", monthResults)
    
    if (!playlistsData) return null;
    
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
                    // footer={
                    //     date ? `Selected: ${date.toLocaleDateString()}` : "Pick a day."
                    // }
                    className={clsx(styles.calendar, "rdp-root bg-zinc-800 p-2 ")}
                />
                <div className={clsx(styles.result)}>
                    <p className={clsx(styles.boxLabel, "font-kanit text-zinc-300")}><CalendarFold className={styles.calendarIcon} /><span>Songs added on {day} {month} {year}</span></p>
                    <div className={clsx(styles.resultSongsBox, "bg-zinc-800")}>
                        {dayResults.length > 0 ?
                            <div className={clsx(styles.playlistList, styles.dayPlaylistList, styles.customScroll, "bg-zinc-800 p-4 ")}>
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
                                                    <LazySpotifyFrame key={song.id} name={song.name} trackId={song.id} height={80} theme={1} />
                                                ))}</div>
                                            </>
                                        )
                                    })}
                            </div>
                            : <p className="px-3 font-dm text-zinc-400 rounded-md min-h-[50px] bg-zinc-800 mb-[1rem] flex justify-center items-center"><span className="bg-zinc-800 w-full h-full text-[1.2rem] px-3">You saved no songs on this specific day</span></p>}
                    </div>
                    <p className={clsx(styles.boxLabel, "font-kanit text-zinc-300")}><CalendarFold className={styles.calendarIcon} /><span>Songs added in {month} {year}</span></p>
                    <div className={clsx(styles.resultSongsBox, "bg-zinc-800")}>
                        {monthResults.length > 0 ?
                            <div className={clsx(styles.playlistList, styles.customScroll, "bg-zinc-800 p-4")}>
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
                                                <LazySpotifyFrame key={song.id} name={song.name} trackId={song.id} height={80} theme={1} />
                                            ))}</div>
                                        </>
                                    )
                                })}
                            </div> :
                            <p className="p-1 px-3 font-dm text-zinc-400 rounded-md min-h-[50px] bg-zinc-800 mb-[1rem] flex justify-center items-center"><span className="bg-zinc-800 w-full text-[1.2rem] px-3">You saved no songs in this month</span></p>}
                    </div>
                </div>
            </div>

        </div>
    )
}
