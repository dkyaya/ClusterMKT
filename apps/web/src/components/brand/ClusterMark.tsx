import darkMark from "../../../../../brand/source/locked-masters/cluster-mkt-mark-dimensional-dark.svg";
import lightMark from "../../../../../brand/source/locked-masters/cluster-mkt-mark-dimensional-light.svg";

export function ClusterMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="brand-lockup">
      <picture>
        <source media="(prefers-color-scheme: dark)" srcSet={darkMark} />
        <img className="brand-mark" src={lightMark} alt="" width={compact ? 40 : 52} height={compact ? 40 : 52} />
      </picture>
      <span className="brand-name">Cluster <small>MKT</small><sup>™</sup></span>
    </span>
  );
}
