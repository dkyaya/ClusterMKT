import { PRIMARY_NAVIGATION, ROUTES } from "@cluster-mkt/config";
import { NavLink } from "react-router-dom";
import { ClusterMark } from "../brand/ClusterMark";

export function DesktopSidebar() {
  return (
    <aside className="desktop-sidebar">
      <NavLink aria-label="Cluster MKT home" to={ROUTES.today}>
        <ClusterMark />
      </NavLink>
      <nav aria-label="Primary navigation">
        {PRIMARY_NAVIGATION.map((item) => (
          <NavLink key={item.path} to={item.path}>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <NavLink to={ROUTES.settings}>Settings</NavLink>
        <NavLink to={ROUTES.profile}>Profile</NavLink>
      </div>
    </aside>
  );
}
