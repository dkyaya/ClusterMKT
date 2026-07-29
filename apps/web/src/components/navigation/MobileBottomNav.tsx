import { MOBILE_NAVIGATION } from "@cluster-mkt/config";
import { NavLink } from "react-router-dom";

export function MobileBottomNav() {
  return (
    <nav aria-label="Mobile navigation" className="mobile-nav">
      {MOBILE_NAVIGATION.map((item) => (
        <NavLink key={item.path} to={item.path}>
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
