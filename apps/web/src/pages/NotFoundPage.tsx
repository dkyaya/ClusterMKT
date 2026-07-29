import { Link } from "react-router-dom";
import { PageContainer } from "../components/layout/PageContainer";
export function NotFoundPage() {
  return (
    <PageContainer narrow>
      <h1>Page not found</h1>
      <p>The requested route is not part of this application foundation.</p>
      <Link to="/">Return to Today</Link>
    </PageContainer>
  );
}
