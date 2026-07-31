import { Route, Routes } from "react-router-dom";
import { ClusterDetailPage } from "../pages/ClusterDetailPage";
import { ClusterInspectorPage } from "../pages/ClusterInspectorPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { NormalizationInspectorPage } from "../pages/NormalizationInspectorPage";
import { IngestionInspectorPage } from "../pages/IngestionInspectorPage";
import { AdjudicationPage } from "../pages/AdjudicationPage";
import { PlaceholderPage } from "../pages/PlaceholderPage";
import { SettingsPage } from "../pages/SettingsPage";
import { SectorDetailPage } from "../pages/SectorDetailPage";
import { SectorsPage } from "../pages/SectorsPage";
import { TodayPage } from "../pages/TodayPage";
import { ReviewerItemPage } from "../pages/ReviewerItemPage";
import { ReviewerWorkbenchPage } from "../pages/ReviewerWorkbenchPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<TodayPage />} />
      <Route path="/clusters/:clusterId" element={<ClusterDetailPage />} />
      <Route path="/sectors" element={<SectorsPage />} />
      <Route path="/sectors/:sectorId" element={<SectorDetailPage />} />
      <Route path="/dev/normalization" element={<NormalizationInspectorPage />} />
      <Route path="/dev/clusters" element={<ClusterInspectorPage />} />
      <Route path="/dev/ingestion" element={<IngestionInspectorPage />} />
      <Route path="/dev/review" element={<ReviewerWorkbenchPage />} />
      <Route path="/dev/review/:itemId" element={<ReviewerItemPage />} />
      <Route path="/dev/adjudication" element={<AdjudicationPage />} />
      {[
        ["/watchlist", "Watchlist"],
        ["/saved", "Saved"],
        ["/listen", "Listen"],
        ["/calendar", "Calendar"],
        ["/profile", "Profile"],
      ].map(([path, title]) => (
        <Route
          key={path}
          path={path}
          element={<PlaceholderPage title={title ?? "Planned section"} />}
        />
      ))}
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
