import type { HTMLAttributes, ReactNode } from "react";

export function VisuallyHidden({
  children,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { children: ReactNode }) {
  return (
    <span className="visually-hidden" {...props}>
      {children}
    </span>
  );
}
