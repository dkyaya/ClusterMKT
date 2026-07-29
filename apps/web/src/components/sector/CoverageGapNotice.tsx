import { Surface } from "@cluster-mkt/ui";

export function CoverageGapNotice({ gaps }: { gaps: string[] }) {
  return (
    <Surface className="coverage-gap-notice" aria-labelledby="coverage-gap-heading">
      <p className="eyebrow">Coverage gaps</p>
      <h2 id="coverage-gap-heading">What the fixtures do not establish</h2>
      {gaps.length ? (
        <ul>
          {gaps.map((gap) => (
            <li key={gap}>{gap}</li>
          ))}
        </ul>
      ) : (
        <p>No configured gap is present. This still does not imply comprehensive coverage.</p>
      )}
      <p>
        Absence of qualifying fixture evidence is reported; lower-quality stories are never invented
        to fill space.
      </p>
    </Surface>
  );
}
