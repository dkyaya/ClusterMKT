import type { EditionDefinition } from "@cluster-mkt/config";
import { Badge } from "@cluster-mkt/ui";
import { useState } from "react";
import { useCollapsibleSearchHeader } from "../../hooks/useCollapsibleSearchHeader";
import { ClusterMark } from "../brand/ClusterMark";
import { ProfileMenu } from "../navigation/ProfileMenu";
import { GlobalSearch } from "../search/GlobalSearch";

export function EditionHeader({ edition }: { edition: EditionDefinition }) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const searchVisible = useCollapsibleSearchHeader({ profileMenuOpen, searchFocused });

  return (
    <header className="edition-header">
      <div className="header-primary-row">
        <div className="mobile-brand">
          <ClusterMark compact />
        </div>
        <div className="edition-status">
          <Badge tone="accent">{edition.label}</Badge>
          <p className="updated-label">Updated with demonstration data · 9:40 a.m. ET</p>
        </div>
        <ProfileMenu onOpenChange={setProfileMenuOpen} />
      </div>
      <div className="header-search-row" data-search-visible={searchVisible}>
        <GlobalSearch onFocusChange={setSearchFocused} />
      </div>
    </header>
  );
}
