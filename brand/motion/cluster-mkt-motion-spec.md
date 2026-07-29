# Cluster MKT motion identity

## Principles

Motion is quiet, informative, and brief. It clarifies state changes without making the product feel like a trading terminal, game, or technology demonstration. Use ease-out deceleration, modest travel, and no elastic overshoot.

## Sphere convergence

Use only for initial loading, splash screens, first-run onboarding, or an unusually important page transition. Begin with the eight locked spheres displaced 10–32% from their final centers, preserving their final size and stacking order. Converge over 420 ms using `cubic-bezier(0.22, 1, 0.36, 1)`. Opacity may rise from 0.72 to 1. Do not rotate, recolor, reorder, bounce, or add glow. The final frame must match the flat or dimensional master exactly.

Recommended range: 350–500 ms. Default: 420 ms.

## Interface transitions

Use 180–260 ms for tabs, filters, cards, sidebar expansion, save confirmation, and audio-player opening. Default to 220 ms. Prefer opacity plus 4–8 px translation or direct color interpolation. Avoid scaling type.

## Edition transitions

Interpolate only the permitted edition accents—header wash, Daily Brief surface, active underline, selected navigation accent, audio progress, minor logo-lighting details, and loading accents—over 600 ms. The user-selected light or dark appearance always wins. Never recolor the entire application for an edition.

## Reduced motion

When `prefers-reduced-motion: reduce` is active, remove positional convergence and use an immediate final mark with a maximum 80 ms opacity change. Interface and edition transitions should become effectively immediate. The companion token stylesheet and demonstration implement this behavior.
