

import { PenTool } from "lucide-react"
import { Line, LineChart, XAxis, YAxis } from "recharts"
import { type Chapter } from "@/lib/types.ts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "Music mood trend chart"

const chartConfig = {
  lyrics: {
    label: "Deep Lyrics",
    color: "#9932CC",
  },
} satisfies ChartConfig

export function DeepLyricsStory({ data }: { data: Chapter[] | undefined }) {
  const chartData = data?.map((chapter) => ({
    month: new Date(chapter.month + "-01").toLocaleString("default", { month: "short", year: "numeric" }),
    lyrics: Number(chapter.deep_lyrics_score),
  }))

  return (
    <Card className="bg-zinc-800 text-white border-0">
      <CardHeader>
        <CardTitle className="text-[1.3rem] flex items-center gap-[1rem] font-dm"><PenTool size={"1.5rem"} /><span>Deep Lyrics Trend</span></CardTitle>
        <CardDescription>Track evolution of your lyrical depth</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="!aspect-auto h-[280px] bg-neutral-950">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{ left: 12, right: 12 }}
          >
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis domain={[0, 100]} hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent />}
            />
            <Line
              type="monotone"
              dataKey="lyrics"
              stroke={chartConfig.lyrics.color}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="text-zinc-400 font-bold font-dm">
          Monthly lyrical intensity from your music journey
        </div>
      </CardFooter>
    </Card>
  )
}
