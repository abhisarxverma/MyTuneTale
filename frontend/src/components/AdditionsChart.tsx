
import { useMemo } from "react"
import { LibraryBig } from "lucide-react"
import {
    LabelList,
    Line,
    LineChart,
    XAxis,
    YAxis,
} from "recharts"

import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import type { PlaylistCollection, SavedTrack } from "@/lib/types.ts"

export const description = "Monthly track additions overview"

function formatMonth(dateStr: string) {
    const date = new Date(dateStr)
    return `${date.toLocaleString("default", { month: "short" })} '${date.getFullYear().toString().slice(-2)}`
}

function generateMonthlyChartData(playlists: PlaylistCollection) {
    const monthlyCounts: Record<string, { count: number; date: Date }> = {}

    playlists?.forEach((playlist) => {
        playlist?.tracks?.forEach((track: SavedTrack) => {
            const date = new Date(track.added_at)
            const key = formatMonth(track.added_at)

            if (!monthlyCounts[key]) {
                monthlyCounts[key] = { count: 0, date: new Date(date.getFullYear(), date.getMonth(), 1) }
            }

            monthlyCounts[key].count += 1
        })
    })

    const sortedEntries = Object.entries(monthlyCounts).sort(
        (a, b) => a[1].date.getTime() - b[1].date.getTime()
    )

    return sortedEntries.map(([month, data]) => ({
        month,
        count: data.count,
    }))
}


export function AdditionsChart({ playlists }: { playlists: PlaylistCollection | null }) {

    const chartData = useMemo(() => generateMonthlyChartData(playlists || []), [playlists])

    return (
        <div>
            <p className="font-dm font-bold text-[1.5rem] mb-[.25rem] sm:text-[2rem] sm:mb-[.5rem] border-b-2 border-[#8A2BE2] w-[max-content] pb-1">Your Song Additions</p>
            <p className="font-dm text-zinc-300 mb-[.75rem] sm:mb-[1.5rem]">These tracks aren't just additions, they're memories from your past—college, first loves, and everything in between.</p>

            <Card className="bg-zinc-800 text-white border-0">
                <CardHeader>
                    <CardTitle className="font-dm text-[1.2rem] font-semibold flex items-center gap-1"><LibraryBig className="font-bold" size={"1.3rem"} />Your Monthly Song Addition Journey</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={{ count: { label: "Tracks Added", color: "var(--chart-1)" } }} className="w-full min-h-[200px] max-h-[280px] sm:h-[280px] bg-black">
                        <LineChart
                            data={chartData}
                            margin={{ top: 20, left: -30, right: 20 }}
                        >
                            <XAxis
                                dataKey="month"
                                tickLine={false}
                                axisLine={false}
                            // tickMargin={8}
                            />
                            <YAxis allowDecimals={false} />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent indicator="line" />}
                            />
                            <Line
                                dataKey="count"
                                type="monotone"
                                stroke="#8A2BE2"
                                strokeWidth={2}
                                dot={{ fill: "#8A2BE2" }}
                                activeDot={{ r: 6 }}
                                className="p-0"
                            >
                                <LabelList
                                    position="top"
                                    // offset={10}
                                    className="fill-foreground"
                                    fontSize={10}
                                />
                            </Line>
                        </LineChart>
                    </ChartContainer>
                </CardContent>
                <CardFooter className="flex-col items-start gap-2 text-sm">
                    <div className="text-zinc-400 fong-dm font-bold">
                        This shows the number of total songs you added in any of the playlist including the liked songs.
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
