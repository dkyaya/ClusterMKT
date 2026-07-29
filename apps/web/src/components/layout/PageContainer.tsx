import type { ReactNode } from "react";

export function PageContainer({
  children,
  narrow = false,
}: {
  children: ReactNode;
  narrow?: boolean;
}) {
  return (
    <div className={narrow ? "page-container page-container--narrow" : "page-container"}>
      {children}
    </div>
  );
}
