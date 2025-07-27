

import { Smile } from "lucide-react"
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

export const description = "Happiness trend chart"

const chartConfig = {
  happiness: {
    label: "Happiness",
    color: "#FFD700",
  },
} satisfies ChartConfig

export function HappinessStory({ data }: { data: Chapter[] }) {
  const chartData = data.map((chapter) => ({
    month: new Date(chapter.month + "-01").toLocaleString("default", { month: "short", year: "numeric" }),
    happiness: Number(chapter.happiness_score),
  }))

  return (
    <Card className="bg-zinc-800 text-white border-0">
      <CardHeader>
        <CardTitle className="font-dm text-[1.3rem] flex items-center gap-[1rem]"><Smile size={"1.5rem"} className="icon" /><span>Happiness Trend</span></CardTitle>
        <CardDescription className="text-zinc-400 font-dm">Track evolution of happiness score</CardDescription>
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
              dataKey="happiness"
              stroke={chartConfig.happiness.color}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="text-zinc-400 font-dm font-bold">
          Monthly happiness insights from your music journey
        </div>
      </CardFooter>
    </Card>
  )
}
