import { type ReactNode } from "react"
import styles from "./Layout.module.css";
import clsx from "clsx";

interface layoutProps {
    children: ReactNode
}


export default function Layout({ children }: layoutProps) {
  return (
    <div className={clsx(styles.container, "bg-neutral-950 text-white")}>
      {children}
    </div>
  )
}
