import clsx from "clsx";
import styles from "./Header.module.css";
import { FaGithub } from "react-icons/fa";

export default function Header() {
    return (
        <header className={clsx(styles.header)}>
            <div className={styles.back}></div>
            <div className={styles.titleGroup}>

                <img  className={styles.logo} src="https://nakupimpbqzntlgsthna.supabase.co/storage/v1/object/sign/images/logo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zMmI3NTRlZi0zY2NmLTRiZjYtOTI4NS00OTM2M2Y4OGUwMzAiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvbG9nby5wbmciLCJpYXQiOjE3NTM1OTExMTQsImV4cCI6MTc4NTEyNzExNH0.3Mjl4jaQa_k0rOYCnGD9Qgc4QxpmSIc95wiFPeY0mEM" alt="MyTuneTale logo image" />
                <span className={clsx(styles.title, "font-onest bg-gradient-to-r from-blue-400 via-emerald-500 to-emerald-500 text-transparent bg-clip-text")}>
                    MyTuneTale
                </span>

            </div>
            <a href="https://github.com/abhisarxverma/MyTuneTale/" className={styles.info}>
                <FaGithub size={"2rem"} />
            </a>
        </header>
    )
}