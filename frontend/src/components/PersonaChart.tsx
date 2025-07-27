
import { BookUser } from "lucide-react"
import { Line, LineChart, XAxis, YAxis } from "recharts"
import { type Chapter } from "@/lib/types.ts";

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
  persona: {
    label: "Persona",
    color: "#32CD32",
  },
} satisfies ChartConfig

export function PersonaStory({ data }: { data: Chapter[] }) {
  const chartData = data.map((chapter) => ({
    month: new Date(chapter.month + "-01").toLocaleString("default", { month: "short", year: "numeric" }),
    persona: Number(chapter.persona_score),
  }))

  return (
    <Card className="bg-zinc-800 text-white border-0">
      <CardHeader>
        <CardTitle className="font-dm text-[1.3rem] flex gap-[1rem] items-center"><BookUser size={"1.5rem"} className="icon" /><span>Your Persona Trend</span></CardTitle>
        <CardDescription className="text-zinc-400 font-dm">Track evolution of your persona score</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="max-h-[100%] border-0 bg-neutral-950 !aspect-auto h-[280px] font-dm">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{ left: 12, right: 12 }}
            className="bg-neutral-950"
          >
            {/* <CartesianGrid vertical={false} /> */}
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
              dataKey="persona"
              stroke={chartConfig.persona.color}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="text-zinc-400 leading-none font-dm font-bold">
          Monthly overall vibes insight from your music journey
        </div>
      </CardFooter>
    </Card>
  )
}
