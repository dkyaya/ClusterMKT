export function ClaimEvidenceList({
  evidence,
  depth,
  support,
}: {
  evidence: readonly string[];
  depth: string;
  support: number;
}) {
  return (
    <div className="claim-evidence-list">
      <p>
        <strong>Evidence depth:</strong> {depth}
      </p>
      <p>
        <strong>Independent support:</strong> {support}
      </p>
      <ul>
        {evidence.map((item) => (
          <li key={item}>
            <code>{item}</code>
          </li>
        ))}
      </ul>
    </div>
  );
}
