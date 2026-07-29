import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Badge.module.css";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  tone?: "accent" | "neutral" | "caution";
}

export function Badge({ children, className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span className={[styles.badge, styles[tone], className].filter(Boolean).join(" ")} {...props}>
      {children}
    </span>
  );
}
