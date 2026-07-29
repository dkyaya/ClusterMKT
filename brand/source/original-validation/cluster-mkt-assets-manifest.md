# Cluster MKT logo asset manifest

All five SVG masters use the same 1100 × 1100 viewBox, eight native circles, sphere coordinates, relative sizes, and rear-to-front stack order. Their canvas is transparent; no file contains a background rectangle, checkerboard, embedded image, raster data, or pattern.

| Asset | Recommended use |
| --- | --- |
| `cluster-mkt-mark-dimensional-light.svg` | Primary large-format branding on light or neutral surfaces. Use the SVG whenever possible; the 2048 px PNG is the raster handoff. |
| `cluster-mkt-mark-dimensional-dark.svg` | Dark-mode branding. It keeps the full palette while adding subtle edge separation to the forest-green and ink-blue spheres. |
| `cluster-mkt-mark-flat.svg` | Small UI icons and contexts where gradients or shadows are undesirable. Use this master for favicon generation. |
| `cluster-mkt-mark-monochrome-black.svg` | One-color black printing, engraving, stamps, and light-background sponsorship lockups. |
| `cluster-mkt-mark-monochrome-white.svg` | One-color reversed printing and dark-background sponsorship lockups. |

## PNG exports

- `cluster-mkt-mark-dimensional-light-2048.png`
- `cluster-mkt-mark-dimensional-dark-2048.png`
- `cluster-mkt-mark-flat-1024.png`
- `cluster-mkt-mark-monochrome-black-1024.png`
- `cluster-mkt-mark-monochrome-white-1024.png`

For favicons, generate 16, 32, 48, and 64 px derivatives from `cluster-mkt-mark-flat.svg`; its solid fills remain clearer than the dimensional lighting at very small sizes. Keep the full square transparent canvas rather than cropping differently between sizes.

## Verification

Run `python brand/source/original-validation/export_and_validate_cluster_mkt_assets.py` from the repository root to regenerate the PNGs in `brand/source/reference-exports/` and the original mark-only validation report. The check confirms eight shared sphere geometries and stack order, rejects raster images/patterns/rectangles, verifies transparent corner pixels, and renders every SVG at 32, 128, 512, and 2048 px to confirm resolution-independent scaling and antialiased vector edges.
