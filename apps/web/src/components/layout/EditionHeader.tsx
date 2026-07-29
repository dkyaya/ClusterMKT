import type { EditionDefinition } from "@cluster-mkt/config";
import { Badge } from "@cluster-mkt/ui";
import { ClusterMark } from "../brand/ClusterMark";

export function EditionHeader({ edition }: { edition: EditionDefinition }) {
  return (
    <header className="edition-header">
      <div className="mobile-brand">
        <ClusterMark compact />
      </div>
      <div>
        <Badge tone="accent">{edition.label}</Badge>
        <p className="updated-label">Updated with demonstration data · 9:40 a.m. ET</p>
      </div>
      <label className="search-field">
        <span className="visually-hidden">Search demonstration</span>
        <input disabled placeholder="Search stories, companies, or themes" type="search" />
      </label>
    </header>
  );
}
