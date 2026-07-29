# Cluster MKT™ brand guidelines

## 1. Brand purpose

Cluster MKT™ helps people understand the sources and context that may influence investment decisions. It organizes information; it does not tell investors what to buy. The identity should make a dense information product feel clearer, calmer, and more human.

The character is minimal, editorial, upscale, credible, and intelligent without presenting as technological spectacle. It must not resemble a trading terminal, brokerage, cryptocurrency product, bank, generic AI startup, social network, or children’s application.

## 2. Name, trademark, and shorthand

The formal name is **Cluster MKT™**. Use the trademark symbol on first or most prominent public-facing use, on launch screens, and in primary marketing lockups. Subsequent nearby references may use **Cluster MKT** without the symbol when repetition would create visual noise.

Inside the product interface, **Cluster** is an approved shorthand where width is limited. Do not use the registered-mark symbol. Do not attach the trademark symbol to **MKT** alone.

## 3. Tagline and product promise

The approved tagline is:

> All your sources, in one Cluster™

The product promise is:

> Cluster MKT™ does not tell investors what to buy. It provides a clearer, faster way to understand the information that may influence their investment decisions.

The tagline is always secondary to the name. Never typeset it larger, bolder, or with stronger contrast than the wordmark in the same composition.

## 4. Logo mark

The mark is an asymmetric composition of eight overlapping spheres. Sphere count, coordinates, relative size, stacking order, palette, and dimensional lighting are locked. The dimensional variants use matte upper-left lighting and restrained contact shadows. The flat mark keeps the same geometry without lighting or shadows. Monochrome variants preserve the same sphere elements and stack.

Never rebuild the mark from a screenshot or use the preview checkerboard as artwork. The five SVGs in `brand/source/locked-masters/` are the only mark masters.

## 5. Wordmark hierarchy

**Cluster** is dominant. **MKT** is smaller, uppercase, and widely tracked on the same horizontal baseline. The sphere mark and letters remain separate; no letter may be integrated into a sphere.

Editable wordmarks use the interface stack beginning with DM Sans. Portable outlined variants use the locally licensed Helvetica Neue Medium outline established during package production. Do not distort, redraw, condense, italicize, or substitute unofficial display typography.

## 6. Lockups

### Horizontal

Use horizontal lockups for mastheads, navigation, press, partnerships, and wide-format marketing. The mark stays left and the wordmark stays right. Use the trademark variant for prominent public-facing placements.

### Stacked

Use stacked lockups for login, splash, onboarding, square marketing placements, and mobile introduction screens. The mark remains above the wordmark with generous separation. The standard stacked lockup does not contain the tagline.

### Tagline

Tagline lockups are marketing assets, not routine navigation assets. Use them only where the sentence remains readable at the final size. The tagline must not compete with the brand name.

## 7. Clear space

Define **x** as the radius of the small lower-left sage sphere in the master, equal to 95 units in the 1100-unit viewBox.

- Mark alone: maintain at least **1x** clear space on every side of the visible sphere silhouette and intended shadow.
- Horizontal and stacked lockups: maintain at least **0.75x** around the complete lockup.
- Tagline lockups: maintain at least **1x** because the secondary line needs more visual quiet.

Clear space is empty space. Background color may continue through it, but text, borders, photographs, charts, and interface controls may not enter it.

## 8. Validated minimum sizes

Package renders and visual size tests establish these production minimums:

- Dimensional mark: **48 px** minimum.
- Flat mark: **16 px** minimum.
- Horizontal lockup: **140 px** minimum width.
- Tagline lockup: **280 px** minimum width, and only when the tagline remains readable in the target display context.

Below 48 px, use the flat mark rather than the dimensional mark. Below 140 px, separate the flat mark from any adjacent interface label instead of shrinking a complete lockup.

## 9. Light, dark, and monochrome use

- Use `cluster-mkt-mark-dimensional-light.svg` and light lockups on White, Warm Ivory, or similarly quiet pale surfaces.
- Use `cluster-mkt-mark-dimensional-dark.svg` and dark lockups on Near Black, Forest Green, or similarly quiet dark surfaces.
- The dark mark preserves the established palette and adds only subtle forest and ink edge separation.
- Use solid black for one-color work on light stock.
- Use solid white for reversed one-color work on dark stock.

Do not place dimensional assets over visually noisy photography. If imagery is unavoidable, introduce a quiet solid surface with sufficient clear space rather than adding glow, keylines, or drop shadows to the logo.

## 10. Favicons and application icons

Tiny icons derive only from `cluster-mkt-mark-flat.svg`. Standard icons use a transparent canvas and consistent geometry. Maskable icons use a Warm Ivory platform background and a reduced 68% mark scale to protect the required safe area. Do not crop individual spheres differently between sizes.

Use the supplied exact-size PNGs instead of resizing a small raster upward. The Safari pinned-tab SVG is a solid monochrome silhouette.

## 11. Color palette

| Color | Hex | Primary role |
| --- | --- | --- |
| Forest Green | `#21483A` | Primary brand accent, selected navigation, Midday emphasis |
| Muted Rust | `#A55D47` | Secondary brand accent and restrained negative-market family |
| Warm Ochre | `#C69A4A` | Morning and caution family |
| Ink Blue | `#26374A` | Analytical and Closing Edition emphasis |
| Soft Sage | `#9DAF9D` | Quiet secondary surfaces and dark-mode accent |
| Warm Ivory | `#F7F4EC` | Preferred warm page background and reversed wordmark |
| Near Black | `#111210` | Primary text and dark-mode page background |
| White | `#FFFFFF` | Clean raised surface |

Supporting neutrals in the token files are derived from Warm Ivory, Near Black, and established colors. Do not add unrelated accent colors.

## 12. Edition color system

The user’s light or dark appearance setting always takes priority. Edition styling affects only the header wash, Daily Brief surface, active-tab underline, selected-navigation accent, audio progress, small logo-lighting or accent details, and loading accents.

- **Morning Edition, 6:00 a.m.–11:59 a.m. ET:** warm, fresh, anticipatory. Uses Warm Ivory, Warm Ochre, light Rust, and Forest Green.
- **Midday Edition, 12:00 p.m.–5:59 p.m. ET:** clear, bright, active. Uses White or light neutral, Soft Sage, Forest Green, and Ink Blue.
- **Closing Edition, 6:00 p.m.–5:59 a.m. ET:** reflective, settled, analytical. Uses Ink Blue, Muted Rust, dimmed Ochre, and Near Black or a dusky neutral.

Exact light and dark values are in `brand-tokens.json` and `brand-tokens.css`. Never recolor the entire application to announce an edition.

## 13. Typography

### Editorial

Major editorial headlines and Story Cluster titles use:

```css
font-family: "Newsreader", "Source Serif 4", Georgia, serif;
```

This selection is explicitly provisional. Product design must formally approve the final editorial face before removing the provisional status from the token.

### Interface

Navigation, body copy, buttons, labels, and the wordmark use:

```css
font-family: "DM Sans", Inter, Arial, sans-serif;
```

### Numerical typography

Prices, percentages, timestamps, dates, and scores use the interface family with tabular numerals:

```css
font-variant-numeric: tabular-nums;
font-feature-settings: "tnum" 1;
```

Use tabular alignment for columns, tickers, and score comparisons. Do not use an ornamental serif for live numeric values.

## 14. Motion principles

Sphere convergence lasts 350–500 ms, with a 420 ms default. It is soft and deliberate, has no bounce, and ends on the exact locked composition. Routine interface transitions last 180–260 ms. Edition color-temperature transitions last 500–700 ms, with a 600 ms default.

Reduced-motion preferences must eliminate positional convergence and collapse transitions to effectively immediate changes. See the motion specification and token stylesheet.

## 15. Accessibility

- Normal text must meet WCAG AA contrast of at least 4.5:1.
- Large text and essential non-text interface boundaries must meet at least 3:1.
- Color cannot be the only indicator of positive, negative, caution, edition, or selected state.
- Light lockups belong on quiet light surfaces; dark lockups belong on quiet dark surfaces.
- Keep the tagline above its tested minimum and confirm readability at the final physical or CSS size.
- Every animated implementation must honor `prefers-reduced-motion`.

Positive and negative market colors are intentionally restrained. Pair them with labels, arrows supplied by the product UI system, or signed values—not extra marks inside the brand logo.

## 16. Incorrect use

Do not:

- Stretch or compress the mark.
- Reorder, add, remove, rotate, or resize individual spheres.
- Change sphere colors or dimensional shading.
- Add outlines, glow, bevels, or unapproved shadows.
- Rotate the mark.
- Place it over visually noisy imagery.
- Use the dimensional mark below 48 px.
- Substitute unofficial wordmark typography.
- Use the registered-mark symbol.
- Set the tagline so small that it becomes unreadable.
- Add arrows, candlesticks, charts, currency symbols, robots, magnifying glasses, or network-node lines.
- Embed a PNG inside an SVG lockup.

## 17. File-selection guide

| Context | Preferred asset |
| --- | --- |
| Large light branding | `source/locked-masters/cluster-mkt-mark-dimensional-light.svg` |
| Large dark branding | `source/locked-masters/cluster-mkt-mark-dimensional-dark.svg` |
| Light masthead | Horizontal light trademark SVG |
| Dark masthead | Horizontal dark trademark SVG |
| Login or splash | Stacked light or dark SVG |
| Small interface icon | `source/locked-masters/cluster-mkt-mark-flat.svg` |
| Favicon | Supplied ICO or exact-size favicon PNG |
| One-color print | Locked monochrome black or white SVG in `source/locked-masters/` |
| Marketing with promise | Tagline lockup SVG |
| Social sharing | Exact-size PNG from `social/` |

## 18. Export guidance

Prefer SVG for web, interface, print layout, and large-format output. Use supplied PNGs only where the target system requires raster input. Preserve alpha for lockups and standard icons. Social assets and maskable icons intentionally use opaque canonical backgrounds.

Do not crop the supplied canvas differently between placements. Do not convert an outlined lockup back into editable text. Do not distribute font binaries with the package. Use `brand-assets-manifest.json` to verify filenames, dimensions, and SHA-256 checksums.
