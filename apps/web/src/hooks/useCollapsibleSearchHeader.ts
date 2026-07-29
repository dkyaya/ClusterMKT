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
    let lastY = window.scrollY;
    let downDistance = 0;
    let upDistance = 0;

    const forceVisible = searchFocused || profileMenuOpen;
    const evaluate = () => {
      const currentY = window.scrollY;
      if (!media.matches) {
        setVisible(true);
        lastY = currentY;
        return;
      }
      if (currentY <= TOP_THRESHOLD || forceVisible) {
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
          downDistance = 0;
        }
      } else if (delta < 0) {
        upDistance += Math.abs(delta);
        downDistance = 0;
        if (upDistance >= UP_THRESHOLD) {
          setVisible(true);
          upDistance = 0;
        }
      }
    };

    const onMediaChange = () => {
      lastY = window.scrollY;
      downDistance = 0;
      upDistance = 0;
      setVisible(!media.matches || window.scrollY <= TOP_THRESHOLD || forceVisible);
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
