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
import { getSongsAddedInMonth, getSongsAddedOnDay } from "@/utils.tsx";
import Paginator from "./Paginator";


export default function AllTime({ playlistsData }: { playlistsData: PlaylistCollection | null }) {


    const [date, setDate] = useState<Date>(new Date());
    const [pageSize] = useState(1);
    const [dayResultsCurrentPage, setDayResultsCurrentPage] = useState(1);
    const [monthResultsCurrentPage, setMonthResultsCurrentPage] = useState(1);

    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear()

    const handleDayPageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= dayResultsPageCount) {
            setDayResultsCurrentPage(newPage);
        }
    };

    const handleMonthPageChange = (newPage: number) => {
        if (newPage >= 0 && newPage <= monthResultsPageCount) {
            setMonthResultsCurrentPage(newPage)
        }
    }

    const dayResults = getSongsAddedOnDay(playlistsData as PlaylistCollection, date as Date) || []
    const monthResults = getSongsAddedInMonth(playlistsData as PlaylistCollection, date as Date) || []

    const dayResultsPageCount = Math.ceil(dayResults.length / pageSize);
    const paginatedDayResult = dayResults[dayResultsCurrentPage - 1];

    const monthResultsPageCount = Math.ceil(monthResults.length / pageSize);
    const paginatedMonthResult = monthResults[monthResultsCurrentPage - 1]


    console.log("DAYRESULTS :", dayResults)
    console.log("MONTHRESULSTS :", monthResults)

    return (
        <div className={styles.allTimeWrapper}>

            <h1 className={clsx(styles.title, "font-dm pb-1")}>Remember the times ?</h1>
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
                    {dayResults.length > 0 ?
                        <div className={clsx(styles.resultPlaylist, styles.dayResult, "bg-zinc-800 p-4 ")}>
                            <div className="py-4 pt-5 ps-5 pb-7 font-dm font-bold bg-neutral-950 text-[2.5rem] flex items-end gap-[1rem]">
                                <Avatar className={styles.playlistImage}>
                                    <AvatarImage src={paginatedDayResult.image} />
                                    <AvatarFallback className={styles.playlistImageFallback}><Heart className={clsx(styles.heartIcon, "bg-blue-500 w-full h-full")} size={"1.2rem"} /></AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <span className="text-[2rem]">{paginatedDayResult.playlistName}</span>
                                    <span className="text-zinc-400 text-[1rem]">{paginatedDayResult.tracks.length} {"Song" + (paginatedDayResult.tracks.length > 1 ? "s" : "")}</span>
                                </div>
                            </div>
                            <div className={clsx(styles.songsList, styles.customScroll, "bg-neutral-950 pt-5")}>{paginatedDayResult.tracks.map((song) => (
                                <LazySpotifyFrame key={song.id} name={song.name} trackId={song.id} height={80} theme={1} />
                            ))}</div>
                            {dayResults.length > pageSize && <div className="w-full flex justify-center mt-3">
                                <Paginator currentPage={dayResultsCurrentPage} totalPage={dayResultsPageCount} pageChangeHandler={handleDayPageChange} />
                            </div>}
                        </div>
                        : <p className="px-3 font-dm text-zinc-400 rounded-md min-h-[50px] bg-zinc-800 mb-[1rem] flex justify-center items-center max-w-[max-content]"><span className="bg-zinc-800 w-full h-full text-[1.2rem] px-3">You added no songs on this specific day</span></p>}
                    <p className={clsx(styles.boxLabel, "font-kanit text-zinc-300 mt-6")}><CalendarFold className={styles.calendarIcon} /><span>Songs added in {month} {year}</span></p>
                    {monthResults.length > 0 ?
                        <div className={clsx(styles.resultPlaylist, "bg-zinc-800 p-4")}>

                            <div className="py-4 pt-5 ps-5 pb-7 font-dm font-bold bg-neutral-950 text-[2.5rem] flex items-end gap-[1rem]">
                                <Avatar className={styles.playlistImage}>
                                    <AvatarImage src={paginatedMonthResult.image} />
                                    <AvatarFallback className={styles.playlistImageFallback}><Heart className={clsx(styles.heartIcon, "bg-blue-500 w-full h-full")} size={"1.2rem"} /></AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <span className="text-[2rem]">{paginatedMonthResult.playlistName}</span>
                                    <span className="text-zinc-400 text-[1rem]">{paginatedMonthResult.tracks.length} Songs</span>
                                </div>
                            </div>
                            <div className={clsx(styles.songsList, styles.customScroll, "bg-neutral-950 pt-5")}>{paginatedMonthResult.tracks.map((song) => (
                                <LazySpotifyFrame key={song.id} name={song.name} trackId={song.id} height={80} theme={1} />
                            ))}</div>

                            {monthResults.length > pageSize && <div className="w-full flex items-center justify-center mt-5">
                                <Paginator currentPage={monthResultsCurrentPage} totalPage={monthResultsPageCount} pageChangeHandler={handleMonthPageChange} />
                            </div>}
                        </div> :
                        <p className="p-1 px-3 font-dm text-zinc-400 rounded-md min-h-[50px] bg-zinc-800 mb-[1rem] flex justify-center items-center max-w-[max-content]"><span className="bg-zinc-800 w-full text-[1.2rem] px-3">You added no songs in this month</span></p>}
                </div>
            </div>
        </div>

    )
}
