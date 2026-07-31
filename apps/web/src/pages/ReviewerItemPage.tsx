import { Badge } from "@cluster-mkt/ui";
import { Link, useParams } from "react-router-dom";
import { AnnotationForm } from "../components/dev/AnnotationForm";
import { EvidencePackage } from "../components/dev/EvidencePackage";
import { PageContainer } from "../components/layout/PageContainer";
export function ReviewerItemPage() {
  const { itemId } = useParams();
  return (
    <PageContainer narrow>
      <header className="page-intro reviewer-intro">
        <Link to="/dev/review">← Reviewer workbench</Link>
        <div className="normalization-labels">
          <Badge tone="caution">Blinded initial review</Badge>
          <Badge>Offline synthetic evidence</Badge>
        </div>
        <p className="eyebrow">{itemId}</p>
        <h1>Review without predictions</h1>
        <p>
          Only reviewer-permitted evidence appears here. Another reviewer’s label, system output,
          and future adjudication are deliberately unavailable.
        </p>
      </header>
      <EvidencePackage />
      <AnnotationForm />
    </PageContainer>
  );
}
