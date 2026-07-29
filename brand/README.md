# Cluster MKT™ brand package

This folder is the production asset and implementation package for Cluster MKT™. The five validated logo marks live once in `source/locked-masters/` and remain the locked source of truth.

## Quick selection guide

| Need | Use |
| --- | --- |
| Large light-mode branding | `source/locked-masters/cluster-mkt-mark-dimensional-light.svg` or `svg/cluster-mkt-lockup-horizontal-light-tm.svg` when the name is required |
| Large dark-mode branding | `source/locked-masters/cluster-mkt-mark-dimensional-dark.svg` or `svg/cluster-mkt-lockup-horizontal-dark-tm.svg` |
| Small UI mark | `source/locked-masters/cluster-mkt-mark-flat.svg` |
| One-color printing on light stock | `source/locked-masters/cluster-mkt-mark-monochrome-black.svg` |
| Reversed one-color use | `source/locked-masters/cluster-mkt-mark-monochrome-white.svg` |
| Favicons | `icons/favicon.ico`, or the exact PNG size required by the platform |
| Installed application icons | `icons/cluster-mkt-icon-192.png`, `icons/cluster-mkt-icon-512.png`, and their maskable counterparts |
| Default link sharing | `social/cluster-mkt-og-default-1200x630.png` |
| Light or dark social profile | `social/cluster-mkt-profile-light-1080.png` or `social/cluster-mkt-profile-dark-1080.png` |
| Marketing with the tagline | The appropriate `svg/cluster-mkt-tagline-lockup-*` file |

Use `Cluster` as the product-interface shorthand only when the available width cannot accommodate the full name. Public-facing brand placements should use `Cluster MKT™` on first or prominent use.

## Package map

- `source/locked-masters/` contains the five immutable SVG masters.
- `source/reference-exports/` contains the original required PNG mark exports.
- `source/original-validation/` preserves the original mark-only exporter, report, and manifest.
- `svg/` contains editable wordmarks, portable outlined wordmarks, and standalone vector lockups.
- `png/` contains high-resolution transparent lockup exports.
- `icons/` contains favicon, application, maskable, and Safari derivatives from the flat master.
- `social/` contains opaque, platform-sized social assets.
- `motion/` contains implementation tokens, motion guidance, and an opt-in demo.
- `previews/` contains validation-only brand sheets and regression surfaces. Checkerboards appear only here to demonstrate transparency.
- `validation/` contains the validator and its generated reports.
- `../relays/` contains historical and current auditable handoff archives.

## Typography note

The editable SVGs and CSS tokens specify DM Sans first. DM Sans was not installed in the build environment, so portable outlined wordmarks were created from the licensed local Helvetica Neue Medium system face, a close neutral grotesk. No font binary is bundled. The editorial serif remains intentionally provisional through the documented fallback token.

## Rebuild and validation

From the project root:

```sh
python brand/build_brand_package.py
python brand/validation/validate_cluster_mkt_brand_package.py
python scripts/build_brand_relay.py
```

The build stops if any locked master hash has changed. The validator must report `PASS` before production distribution.

See `BRAND_GUIDELINES.md` for the complete system and `brand-assets-manifest.json` for machine-readable metadata and checksums.
