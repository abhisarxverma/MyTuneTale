// import { TrendingUp } from "lucide-react"
// import { Bar, BarChart, XAxis } from "recharts"

// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card"
// import {
//   ChartContainer,
//   ChartTooltip,
//   ChartTooltipContent,
// } from "@/components/ui/chart"

// export const description = "Genre Timeline Bar Chart"

// export default function GenreTimelineChart({ genre_timeline }) {
//   const timeline = genre_timeline.timeline || [];

//   // Process each month entry into chartData
//   const chartData = timeline.map((entry) => {
//     const totalTracks = entry.tracks_added_this_month.length;

//     return {
//       month: entry.month,
//       count: totalTracks,
//     };
//   });

//   return (
//     <Card className="bg-zinc-800 text-white border-0">
//       <CardHeader>
//         <CardTitle>Monthly Music Activity</CardTitle>
//         <CardDescription>Tracks you added over time</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <ChartContainer config={{}}>
//           <BarChart data={chartData} width={600} height={300}>
//             <XAxis
//               dataKey="month"
//               tickLine={false}
//               tickMargin={10}
//               axisLine={false}
//               tick={{ fontSize: 12, fill: "#374151" }}
//             />
//             <ChartTooltip
//               cursor={false}
//               content={<ChartTooltipContent hideLabel />}
//             />
//             <Bar
//               dataKey="count"
//               radius={6}
//               fill="#8A2BE2"
//             >
//             </Bar>
//           </BarChart>
//         </ChartContainer>
//       </CardContent>
//       <CardFooter className="flex-col items-start gap-2 text-sm">
//         <div className="flex gap-2 leading-none font-medium">
//           Your mood in music over months <TrendingUp className="h-4 w-4" />
//         </div>
//         <div className="text-muted-foreground leading-none">
//           Tracks grouped by month with bar brightness = intensity
//         </div>
//       </CardFooter>
//     </Card>
//   );
// }
