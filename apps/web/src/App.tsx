import { AppShell } from "./app/AppShell";
import { AppRoutes } from "./app/routes";

export function App() {
  return (
    <AppShell>
      <AppRoutes />
    </AppShell>
  );
}
