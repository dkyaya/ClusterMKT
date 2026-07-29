import { editionDefinition } from "@cluster-mkt/config";
import type { ReactNode } from "react";
import { BriefPlayerPreview } from "../components/audio/BriefPlayerPreview";
import { EditionHeader } from "../components/layout/EditionHeader";
import { DesktopSidebar } from "../components/navigation/DesktopSidebar";
import { MobileBottomNav } from "../components/navigation/MobileBottomNav";
import { currentEdition } from "../lib/edition";

export function AppShell({ children }: { children: ReactNode }) {
  const edition = currentEdition();
  return (
    <div className="app-shell edition-transition" data-edition={edition}>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <DesktopSidebar />
      <div className="app-frame">
        <EditionHeader edition={editionDefinition(edition)} />
        <main id="main-content">{children}</main>
        <BriefPlayerPreview compact />
      </div>
      <MobileBottomNav />
    </div>
  );
}
