import useFetchData from "@/hooks/UseFetchData";
import { Loader } from "lucide-react";
import AllTime from "../AllTime";
import { AdditionsChart } from "../AdditionsChart";
import clsx from "clsx";

export default function StatBox() {
    const { data, status, error, refetch } = useFetchData("playlists");

    return (
        <>
            {status === "loading" && (
                <>
                    <div>
                        <h1 className={clsx("font-dm text-[2rem] w-[max-content] border-b-2 border-blue-500 font-bold mb-1 pb-1")}>Remember the times ?</h1>
                        <p className="text-zinc-300 font-dm mb-[1.5rem]">Select any date to see all the songs you added in any of the playlist at that time</p>

                        <div className="h-[300px] justify-center mb-5 bg-zinc-700 animate-pulse flex items-center gap-[1rem] rounded-2xl"><Loader className="text-emerald-500 animate-spin " /><span className="font-onest text-[1.5rem]">Loading....</span></div>
                    </div>
                    <div>
                        <p className="font-dm font-bold text-[2rem] mb-[.5rem] border-b-2 border-[#8A2BE2] w-[max-content] pb-1">Your Song Additions</p>
                        <p className="font-dm text-zinc-300 mb-[1.5rem]">These tracks aren't just additions, they're memories from your past—college, first loves, and everything in between.</p>

                        <div className="h-[300px] justify-center mb-5 bg-zinc-700 animate-pulse flex items-center gap-[1rem] rounded-2xl"><Loader className="text-emerald-500 animate-spin " /><span className="font-onest text-[1.5rem]">Loading....</span></div>
                    </div>
                </>
            )}

            {status === "error" && (
                <div className={clsx("bg-red-900/20 border border-red-500 h-[150px] sm:h-[300px] w-full flex flex-col justify-center items-center rounded-lg")}>
                    <p className="text-red-400 font-dm mb-4">Something went wrong!</p>
                    <p className="text-red-300 text-sm mb-4">{error}</p>
                    <button
                        onClick={() => refetch()}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-dm"
                    > Retry
                    </button>
                </div>
            )}

            {(status === "success" &&  data) && (
                <>
                    <AdditionsChart playlists={data} />
                    <AllTime playlistsData={data} />
                </>
            )}
        </>
    )

}