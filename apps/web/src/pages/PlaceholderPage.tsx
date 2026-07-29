import { Badge, Surface } from "@cluster-mkt/ui";
import { PageContainer } from "../components/layout/PageContainer";
export function PlaceholderPage({ title }: { title: string }) {
  return (
    <PageContainer narrow>
      <Surface className="placeholder">
        <Badge tone="caution">Demonstration shell</Badge>
        <h1>{title}</h1>
        <p>
          This route establishes the future navigation boundary. No live feature or personal data is
          connected.
        </p>
      </Surface>
    </PageContainer>
  );
}
