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
                    <div className="h-[300px] justify-center mb-5 bg-zinc-700 animate-pulse flex items-center gap-[1rem] rounded-2xl"><Loader className="text-emerald-500 animate-spin " /><span className="font-onest text-[1.5rem]">Loading....</span></div>
                    <div className="h-[300px] justify-center mb-5 bg-zinc-700 animate-pulse flex items-center gap-[1rem] rounded-2xl"><Loader className="text-emerald-500 animate-spin " /><span className="font-onest text-[1.5rem]">Loading....</span></div>
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

            {status === "success" && (
                <>
                    <AllTime playlistsData={data} />
                    <AdditionsChart playlists={data} />
                </>
            )}
        </>
    )

}