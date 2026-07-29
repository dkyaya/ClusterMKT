import { useEffect, useState } from "react";

export interface CollapsibleSearchHeaderOptions {
  searchFocused: boolean;
  profileMenuOpen: boolean;
}

const MOBILE_QUERY = "(max-width: 800px)";
const TOP_THRESHOLD = 16;
const DOWN_THRESHOLD = 24;
const UP_THRESHOLD = 12;

export function useCollapsibleSearchHeader({
  searchFocused,
  profileMenuOpen,
}: CollapsibleSearchHeaderOptions) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY);
    const isMobileViewport = () => media.matches || window.innerWidth <= 800;
    let lastY = window.scrollY;
    let downDistance = 0;
    let upDistance = 0;
    let suppressLayoutShiftUntil = 0;
    const suppressAnimatedLayoutShift = () => {
      if (document.querySelector(".header-search-row")) {
        suppressLayoutShiftUntil = performance.now() + 240;
      }
    };

    const shouldForceVisible = () => {
      const searchRow = document.querySelector(".header-search-row");
      if (!searchRow) return searchFocused || profileMenuOpen;
      return (
        searchRow.contains(document.activeElement) ||
        document.querySelector(".profile-menu__popover") !== null
      );
    };
    const evaluate = () => {
      const currentY = window.scrollY;
      if (performance.now() < suppressLayoutShiftUntil) {
        lastY = currentY;
        return;
      }
      if (!isMobileViewport()) {
        setVisible(true);
        lastY = currentY;
        return;
      }
      if (currentY <= TOP_THRESHOLD || shouldForceVisible()) {
        setVisible(true);
        downDistance = 0;
        upDistance = 0;
        lastY = currentY;
        return;
      }

      const delta = currentY - lastY;
      lastY = currentY;
      if (delta > 0) {
        downDistance += delta;
        upDistance = 0;
        if (downDistance >= DOWN_THRESHOLD) {
          setVisible(false);
          suppressAnimatedLayoutShift();
          downDistance = 0;
        }
      } else if (delta < 0) {
        upDistance += Math.abs(delta);
        downDistance = 0;
        if (upDistance >= UP_THRESHOLD) {
          setVisible(true);
          suppressAnimatedLayoutShift();
          upDistance = 0;
        }
      }
    };

    const onMediaChange = () => {
      lastY = window.scrollY;
      downDistance = 0;
      upDistance = 0;
      setVisible(!isMobileViewport() || window.scrollY <= TOP_THRESHOLD || shouldForceVisible());
    };

    window.addEventListener("scroll", evaluate, { passive: true });
    media.addEventListener("change", onMediaChange);
    onMediaChange();
    return () => {
      window.removeEventListener("scroll", evaluate);
      media.removeEventListener("change", onMediaChange);
    };
  }, [profileMenuOpen, searchFocused]);

  return visible;
}
