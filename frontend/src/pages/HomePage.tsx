import { useSpotify } from "@/providers/SpotifyProvider";
// import Story from "@/components/Story";
import TopBox from "@/components/main/TopBox";
import UserBox from "@/components/main/UserBox";
import StatBox from "@/components/main/StatBox";

export default function HomePage() {

    const { persona, authenticated } = useSpotify()!
    console.log("PERSONA : ", persona)
    console.log("SPOTIFY CONNECTED : ", authenticated)

    return (
        <>
            <UserBox />

            <TopBox />

            <StatBox />

            {/* <Story /> */}
        </>
    )
}