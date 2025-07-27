
// import { HeartCrack, TrendingUp } from "lucide-react"
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
// //   type ChartConfig,
//   ChartContainer,
//   ChartTooltip,
//   ChartTooltipContent,
// } from "@/components/ui/chart"

// export const description = "Emotion Frequency Bar Chart"

// export default function EmotionBarChart({ data }) {
//   const chartData = data.slice(0, 4).map((item) => ({
//     emotion: item.emotion,
//     count: item.count,
//   }));

//   const chartConfig = {
//     count: {
//       label: "Song Count",
//       color: "var(--chart-1)",
//     },
//   } 

  

//   return (
//     <Card className="bg-black text-white border-0">
//       <CardHeader>
//         <CardTitle className="flex gap-2 items-center text-2xl font-kanit"><HeartCrack /><span>Your Emotional Vibe</span></CardTitle>
//         <CardDescription>Based on your music taste</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <ChartContainer config={chartConfig}>
//           <BarChart className="text-white" data={chartData} width={500} height={300}>
//             <XAxis
//               dataKey="emotion"
//               tickLine={false}
//               tickMargin={10}
//               axisLine={false}
//               tick={{ fill: "#ffffff", fontFamily: "onest", color: "#ffffff" }} 
//             />
//             <ChartTooltip
//               cursor={false}
//               content={<ChartTooltipContent hideLabel />}
//             />
//             <Bar dataKey="count" fill="#2b7fff" radius={8} />
//           </BarChart>
//         </ChartContainer>
//       </CardContent>
//       <CardFooter className="flex-col items-start gap-2 text-sm">
//         <div className="flex gap-2 leading-none font-medium">
//           Emotion map from your top tracks <TrendingUp className="h-4 w-4" />
//         </div>
//       </CardFooter>
//     </Card>
//   )
// } 
