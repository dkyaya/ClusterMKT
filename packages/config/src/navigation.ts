import { ROUTES } from "./routes";

export interface NavigationItem {
  label: string;
  path: string;
}

export const PRIMARY_NAVIGATION: readonly NavigationItem[] = [
  { label: "Today", path: ROUTES.today },
  { label: "Watchlist", path: ROUTES.watchlist },
  { label: "Sectors", path: ROUTES.sectors },
  { label: "Saved", path: ROUTES.saved },
  { label: "Listen", path: ROUTES.listen },
  { label: "Calendar", path: ROUTES.calendar },
];

export const MOBILE_NAVIGATION = PRIMARY_NAVIGATION.slice(0, 5);
