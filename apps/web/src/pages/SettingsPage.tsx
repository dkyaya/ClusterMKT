import { Badge, Surface } from "@cluster-mkt/ui";
import { PageContainer } from "../components/layout/PageContainer";

const sections = ["Account", "Coverage", "Sources", "Feed", "Audio", "Notifications", "Privacy"];
export function SettingsPage() {
  return (
    <PageContainer narrow>
      <header className="page-intro">
        <Badge tone="caution">Demonstration controls</Badge>
        <h1>Settings</h1>
        <p>
          These static sections preview future preferences. Nothing is saved and no personal data is
          collected.
        </p>
      </header>
      <div className="settings-grid">
        {sections.map((section) => (
          <Surface key={section} className="settings-card">
            <div>
              <h2>{section}</h2>
              <p>Configuration will be added in a later, authorized phase.</p>
            </div>
            <button disabled type="button">
              Not connected
            </button>
          </Surface>
        ))}
      </div>
    </PageContainer>
  );
}
