import clsx from "clsx";
import styles from "./Footer.module.css";
import { FaGithub, FaSpotify } from "react-icons/fa";
import { Loader, Send } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import api from "@/lib/api.ts";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export default function Footer() {

    const [sending, setSending] = useState(false);
    const [review, setReview] = useState("");

    async function sendReview() {
        if (!review.trim()) return;

        setSending(true);
        try {
            const response = await api.post("/review", { message: review });
            const data = response.data;
            console.log("Review response:", data);
            if (data.success) {
                toast.success("Review sent successfully!");
                setReview("");
            } else {
                toast.error(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error("Error sending review:", error);
            toast.error("Failed to send review. Please try again later.");
        } finally {
            setSending(false);
        }
    }

    return (
        <div className={clsx(styles.wrapper)}>
            <div className={styles.back}></div>
            <div className={styles.left}>
                <div className={styles.titleGroup}>
                    {/* <img className={clsx(styles.logo)} src="https://nakupimpbqzntlgsthna.supabase.co/storage/v1/object/sign/images/profile_image.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zMmI3NTRlZi0zY2NmLTRiZjYtOTI4NS00OTM2M2Y4OGUwMzAiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvcHJvZmlsZV9pbWFnZS5qcGciLCJpYXQiOjE3NTM1OTA2MzEsImV4cCI6MTc4NTEyNjYzMX0.jq-fD2SN8vLM_vkWESBkpX4_apOU9Qy2iwTORW_X5EU" alt="My tune tale logo image" /> */}
                    <Avatar className={styles.myImage}>
                        <AvatarImage src="https://nakupimpbqzntlgsthna.supabase.co/storage/v1/object/sign/images/profile_image.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zMmI3NTRlZi0zY2NmLTRiZjYtOTI4NS00OTM2M2Y4OGUwMzAiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvcHJvZmlsZV9pbWFnZS5qcGciLCJpYXQiOjE3NTM1OTA2MzEsImV4cCI6MTc4NTEyNjYzMX0.jq-fD2SN8vLM_vkWESBkpX4_apOU9Qy2iwTORW_X5EU" />
                        <AvatarFallback>A</AvatarFallback>
                    </Avatar>
                    <h1 className={clsx(styles.title, "font-dm")}>Created for you by <a href="https://github.com/abhisarxverma/" className={styles.myName}> Abhisar verma</a></h1>
                </div>
                <p className={clsx(styles.subtitle, "font-dm text-zinc-300")}>Hey, I am Abhisar verma, I just tried to turn one my many silly ideas into a reality with MyTuneTale, hope you find some happiness with this. I would also like to mention that spotify's policy is rigid and does not give simply all your listening data, so tried my best to curate few meaningfull insights with what spotify gives, thank you.</p>

                <div className={styles.poweredWrapper}>
                    <p className="text-zinc-400">Powered by the one and only</p>
                    <a href="https://open.spotify.com/" className={styles.spotifyName}><FaSpotify /><span className="font-onest">Spotify</span></a>
                </div>

                <div className={styles.githubWrapper}>
                    <FaGithub className={styles.githubLogo} />
                    <p className={clsx(styles.githubTitle, "font-dm")}>Github open sourced</p>
                </div>

            </div>
            <div className={styles.right}>
                <p className={clsx(styles.reviewTitle, "font-dm text-zinc-300")}>Share your valuable feedback</p>
                <textarea required aria-required="true" className={styles.reviewInput} onChange={(e) => setReview(e.target.value)} value={review} placeholder="Send your reviews, advices, suggestions, critiques straight to me" ></textarea>
                <button disabled={sending} onClick={sendReview} className={clsx(styles.sendButton, "bg-white text-black disabled:cursor-not-allowed")}>{sending ? <Loader className={clsx(styles.loader, "animate-spin")} size={"1.5rem"} /> : <Send size={"1.5rem"} />}{sending ? "Sending..." : "Send Review"}</button>
            </div>
        </div>
    )
}