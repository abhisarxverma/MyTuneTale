import clsx from "clsx";
import styles from "./WelcomePage.module.css";
import { FaSpotify } from "react-icons/fa";
import { CalendarFold, Loader2, Music, PartyPopper, TrendingUp } from "lucide-react";
import { useSpotify } from "@/providers/SpotifyProvider";
import { useState } from "react";

export default function WelcomePage() {

    const { connectSpotify } = useSpotify()!;
    const [loading, setLoading] = useState(false);

    function makeConnection() {
        setLoading(true)
        connectSpotify()
    }

    return (
        <div className={styles.container}>
            <div className={styles.contentGroup}>
                <PartyPopper size={"2rem"} className={styles.popperIcon} />
                <p className={clsx(styles.welcomeTitle, "font-onest mt-[-1rem]")}><span>Welcome To MyTuneTale!</span></p>
                <h1 className={clsx(styles.title, "font-onest")}>You Music Tells a Story</h1>
                <ul className={styles.list}>
                    <p className={styles.listLabel}>Relive your memories through -</p>
                    <li><Music size={"1.8rem"} className={styles.listIcon} /><span>Most played tracks & artists</span></li>
                    <li><CalendarFold size={"1.8rem"} className={styles.listIcon} /><span>Songs added on any date in past</span></li>
                    <li><TrendingUp size={"1.8rem"} className={styles.listIcon} /><span>Your Monthly song addition trends</span></li>
                    {/* <li><HeartCrack size={"1.8rem"} className={styles.listIcon} /><span>Mood shifts in your music additions</span></li> */}
                </ul>
            </div>
            <div className={styles.connectWrapper}>
                {loading ? <Loader2 className={clsx(styles.spotifyIcon, "text-xl animate-spin font-bold")} /> : <FaSpotify className={clsx(styles.spotifyIcon, "animate-bounce")} />}
                <button disabled={loading} onClick={makeConnection} className={styles.connectButton}><span>Connect spotify</span></button>
            </div>
        </div>
    )
}