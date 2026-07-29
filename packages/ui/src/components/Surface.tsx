import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Surface.module.css";

export interface SurfaceProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  as?: "article" | "section" | "div";
}

export function Surface({ as: Element = "section", children, className, ...props }: SurfaceProps) {
  return (
    <Element className={[styles.surface, className].filter(Boolean).join(" ")} {...props}>
      {children}
    </Element>
  );
}
