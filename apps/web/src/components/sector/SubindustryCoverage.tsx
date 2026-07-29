import type { Sector, SectorFeed } from "@cluster-mkt/core";

export function SubindustryCoverage({ sector, feed }: { sector: Sector; feed: SectorFeed }) {
  const covered = new Set(feed.items.flatMap((item) => item.subindustryIds));
  return (
    <section className="subindustry-coverage" aria-labelledby="subindustry-heading">
      <p className="eyebrow">Breadth summary</p>
      <h2 id="subindustry-heading">Subindustry coverage</h2>
      <ul className="sector-tag-list">
        {sector.subindustries.map((item) => (
          <li className={covered.has(item.id) ? "is-covered" : "is-gap"} key={item.id}>
            {item.displayName} · {covered.has(item.id) ? "active evidence" : "coverage gap"}
          </li>
        ))}
      </ul>
    </section>
  );
}
