import clsx from "clsx";
import styles from "./WelcomePage.module.css";
import { FaSpotify } from "react-icons/fa";
import { Loader2, PartyPopper } from "lucide-react";
import { useSpotify } from "@/providers/SpotifyProvider";
import { useState } from "react";

export default function WelcomePage() {

    const {connectSpotify} = useSpotify()!;
    const [loading, setLoading] = useState(false);

    function makeConnection() {
        setLoading(true)
        connectSpotify()
    }


    return (
        <div className={styles.container}>
            <div className={styles.left}>
                <div className={styles.headerGroup}>
                    <PartyPopper size={"2rem"} className={styles.popperIcon} />
                    <p className={clsx(styles.welcomeTitle, "font-onest mt-[-1rem]")}><span>Welcome To MyTuneTale!</span></p>
                    <h1 className={clsx(styles.title, "font-onest")}>You Music Tells a Story</h1>
                    <ul className={styles.list}>
                        <p className={styles.listLabel}>Relive your memories through -</p>
                        <li>Most played tracks & artists</li>
                        <li>Songs added on any date</li>
                        <li>Monthly addition trends</li>
                        <li>Mood shifts in your saved music</li>
                    </ul>
                </div>
                <div className={styles.connectWrapper}>
                    {loading ? <Loader2 className={clsx(styles.spotifyIcon, "text-xl animate-spin font-bold")}/> :  <FaSpotify className={clsx(styles.spotifyIcon, "animate-bounce")}/>}
                    <button disabled={loading} onClick={makeConnection} className={styles.connectButton}><span>Connect spotify</span></button>
                </div>
            </div>
            {/* <div className={styles.right}> */}
                {/* <iframe data-testid="embed-iframe" style={{borderRadius: "12px"}} src="https://open.spotify.com/embed/track/56sxN1yKg1dgOZXBcAHkJG?&theme=0" width="100%" height="152" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe> */}
                {/* <img className={styles.image} src="/cool.jpg" alt="cool cartoon listening music image" /> */}
                {/* <div className={styles.imageGrid}>
                    <div className={styles.top}>
                    <img className={styles.taylor} src="/taylor.jpg" alt="taylor swift concert image" />
                    <img className={styles.ariana} src="/ariana.jpg" alt="ariana grande's image" />

                    </div>
                    <div className={styles.bottom}>

                    <img className={styles.bilie} src="/bilie.jpg" alt="bilie eilish's image" />
                    <img className={styles.maroon} src="/maroon.jpg" alt="maroon 5's lead singer adam lavine's image" />
                    </div>
                </div> */}
                {/* <p className={styles.caption}>Me listening to sad songs, sitting on my terrace!</p> */}
            {/* </div> */}
        </div>
    )
}