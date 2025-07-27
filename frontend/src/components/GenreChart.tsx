
// import { ListMusic, TrendingUp } from "lucide-react"
// import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

// import {
//     Card,
//     CardContent,
//     CardDescription,
//     CardFooter,
//     CardHeader,
//     CardTitle,
// } from "@/components/ui/card"
// import {
//     //   type ChartConfig,
//     ChartContainer,
//     ChartTooltip,
//     ChartTooltipContent,
// } from "@/components/ui/chart"

// export const description = "Emotion Frequency Bar Chart"

// export default function GenreBarChart({ data }) {
//     const chartData = data.map((item) => ({
//         genre: item.genre,
//         count: item.count,
//     }));

//     const chartConfig = {
//         count: {
//             label: "Song Count",
//             color: "#111111",
//         },
//     }

//     return (
//         <Card className="bg-black text-white border-0">
//             <CardHeader>
//                 <CardTitle className="flex gap-2 items-center text-2xl font-kanit"><ListMusic /><span>Your Top Genres</span></CardTitle>
//                 <CardDescription>Based on your music taste</CardDescription>
//             </CardHeader>
//             <CardContent>
//                 <ChartContainer config={chartConfig} className="">
//                     <BarChart data={chartData} width={500} height={300}>
//                         <XAxis
//                             dataKey="genre"
//                             tickLine={false}
//                             tickMargin={10}
//                             axisLine={false}
//                         />
//                         <ChartTooltip
//                             cursor={false}
//                             content={<ChartTooltipContent hideLabel />}
//                         />
//                         <Bar dataKey="count" fill="#1ED760" radius={8} />
//                     </BarChart>
//                 </ChartContainer>
//             </CardContent>
//             <CardFooter className="flex-col items-start gap-2 text-sm">
//                 <div className="flex gap-2 leading-none font-medium">
//                     Genre map from your top tracks <TrendingUp className="h-4 w-4" />
//                 </div>
//                 {/* <div className="text-muted-foreground leading-none">
//           Showing Genre map from top tracks
//         </div> */}
//             </CardFooter>
//         </Card>
//     )
// } 
