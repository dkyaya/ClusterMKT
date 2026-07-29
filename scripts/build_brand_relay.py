#!/usr/bin/env python3
"""Build the auditable relay ZIP for the Cluster MKT full brand package."""

from __future__ import annotations

import hashlib
import json
import zipfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
BRAND = ROOT / "brand"
RELAY_DIR = ROOT / "relays"
DATE = "2026-07-28"
FORBIDDEN_PARTS = {"__pycache__", "node_modules", ".venv", "dist", "build"}
FORBIDDEN_SUFFIXES = {".pyc", ".ttf", ".otf", ".ttc", ".woff", ".woff2"}

LOCKED_MASTER_HASHES = {
    "cluster-mkt-mark-dimensional-light.svg": "66496cfe8dc2d6abb51c5b5a58824ca751db2de0d9a65be621f083bc075b11a1",
    "cluster-mkt-mark-dimensional-dark.svg": "b8c4d7a36ae24daf5bb6e785dc41d9e6c4b01649e5eb5c55959763b5faa3405b",
    "cluster-mkt-mark-flat.svg": "2dfae7aaf3524a80fe86a56f2fb3a1fa01b866c55abf11e3faf86aa6ef8ca992",
    "cluster-mkt-mark-monochrome-black.svg": "037232276468c91ce7bb70daac33bc615f83ee3942855d4bd7b337e074fe5850",
    "cluster-mkt-mark-monochrome-white.svg": "b676c0856aaa5b0c2bca0a687df8519b5c2c069044fa2e40ce0605c44b703542",
}


def digest_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def digest_file(path: Path) -> str:
    return digest_bytes(path.read_bytes())


def eligible_brand_files() -> list[Path]:
    files = []
    for path in BRAND.rglob("*"):
        if not path.is_file() or path.suffix == ".zip":
            continue
        if any(part in FORBIDDEN_PARTS for part in path.parts):
            continue
        if path.suffix.lower() in FORBIDDEN_SUFFIXES:
            continue
        files.append(path)
    return sorted(files)


def relay_markdown(changed_files: list[Path], short_hash: str, relay_filename: str) -> str:
    exact_files = "\n".join(
        f"- `{path.relative_to(ROOT).as_posix()}`" for path in changed_files
    )
    master_hashes = "\n".join(
        f"- `{filename}` — `{digest}`" for filename, digest in LOCKED_MASTER_HASHES.items()
    )
    return f"""# Cluster MKT™ full brand package relay

## Objective

Complete the production-ready Cluster MKT™ brand system around the five locked, validated SVG logo masters without redesigning or replacing them.

## What changed

Created the complete `brand/` package: wordmarks; horizontal, stacked, and tagline lockups; high-resolution transparent PNG exports; favicon and application icons; social assets; semantic and edition tokens; motion guidance and a reduced-motion-aware demo; brand guidelines; a selection README; a machine-readable asset manifest; automated validation; visual-regression previews; build tooling; and this relay builder.

## Files created

{exact_files}

## Files modified

No pre-existing source or validated logo-master file was modified. All changed files are new files under `brand/`.

## Files intentionally left unchanged

The following locked masters remain byte-for-byte unchanged:

{master_hashes}

The existing root PNG exports, original validation report, original asset manifest, and original exporter also remain unchanged.

## Exact relay filename

`{relay_filename}`

## Design decisions

- Preserved the established eight-sphere geometry, count, order, palette, and dimensional shading.
- Generated standalone vector lockups by embedding native master geometry; no production SVG contains a raster image.
- Kept Cluster dominant, set MKT smaller and uppercase, and used wide MKT tracking.
- Used generous, editorial whitespace and avoided financial clichés, trading-terminal motifs, and technology ornament.
- Derived standard icons only from the flat master. Maskable icons use a 68% mark scale on Warm Ivory to maintain platform safe areas.
- Confined checkerboards to validation previews.

## Typography decisions

- Editable wordmarks and implementation tokens specify `DM Sans, Inter, Arial, sans-serif`.
- DM Sans was not installed locally. Portable outlined wordmarks use the licensed local Helvetica Neue Medium system face as the closest available neutral grotesk.
- No font binary is included.
- The editorial stack remains explicitly provisional: `Newsreader, Source Serif 4, Georgia, serif`.
- Numeric typography uses the interface stack with tabular numerals.

## Edition-color decisions

- Morning uses Warm Ivory, a derived light wash, Forest Green, darkened Ochre, and restrained Rust.
- Midday uses light neutral or White, Soft Sage, Forest Green, and Ink Blue.
- Closing uses Ink Blue, Muted Rust, dimmed Ochre, and dusky or Near Black surfaces.
- Edition overrides are restricted to wash, primary/secondary accents, and audio progress. Light/dark appearance always takes priority.
- The lowest tested edition accent contrast is 3.15:1; semantic text and market-state colors meet the relevant 4.5:1 threshold.

## Validation performed

- Required filename and directory audit.
- Locked-master SHA-256 integrity checks.
- XML, viewBox, descriptive-ID, color, raster-embedding, pattern, and background checks across production SVGs.
- Sphere geometry and stacking parity checks.
- Editable/outlined wordmark and trademark-variant checks.
- PNG size, mode, transparency, corner-alpha, checkerboard, and crop checks.
- Favicon bundle, small-size legibility, consistent centering, and maskable safe-area checks.
- Semantic-token completeness, WCAG contrast, edition-scope, and typography-token checks.
- Minimum-size Chromium renders at 16, 48, 140, and 280 px.
- Reduced-motion and no-autoplay checks.
- Visual regression previews on White, Warm Ivory, Near Black, Forest Green, and validation checkerboard surfaces.
- Asset-manifest SHA-256 verification.

## Validation results

Overall status: **PASS**. Eleven of eleven validation groups pass. The authoritative artifacts are `brand/validation/cluster-mkt-brand-validation-report.json` and `brand/validation/cluster-mkt-brand-validation-summary.md`.

## What worked

- Locked masters remained unchanged.
- Standalone vector lockups render reliably with genuine transparency.
- The flat mark remains recognizable from 16 px upward.
- Dark assets retain palette character and readable wordmarks on Near Black and Forest Green.
- Edition tokens preserve application hierarchy while meeting tested contrast thresholds.
- The build and validator are reproducible from the project root.

## Remaining uncertainties

- The final editorial serif has not been formally approved; the fallback stack is intentional.
- The outlined wordmark uses Helvetica Neue Medium because DM Sans was not locally installed. A future approved build may regenerate outlines from an approved DM Sans installation, without bundling the font.
- Legal counsel or the brand owner should confirm jurisdiction-specific trademark placement conventions.
- Social compositions and lockup spacing still require normal human brand-owner sign-off even though technical validation passes.

## Remaining blockers

No technical blocker remains. Production adoption is pending the user’s visual, typography, and legal approval.

## Items requiring user approval

1. Approve the current outlined Helvetica Neue Medium wordmark or authorize regeneration from an installed DM Sans face.
2. Select and license the final editorial serif, or approve the provisional stack for implementation.
3. Approve the lockup spacing, social compositions, and edition palettes as the brand owner.
4. Confirm trademark usage with appropriate legal guidance.

## Recommended next step

Conduct a short brand-owner review using the five preview sheets, approve or annotate typography and spacing, then integrate `brand-tokens.css`, `icons/site.webmanifest`, the appropriate lockups, and the social assets into the product repository. Rerun validation after any approved change.

## Reproduction commands

From the project root:

```sh
python brand/build_brand_package.py
python brand/validation/validate_cluster_mkt_brand_package.py
python scripts/build_brand_relay.py
```

## SHA-256 hashes

Locked-master hashes are listed above. Per-file hashes for every relay entry appear in the relay’s root `manifest.json`. The relay content short hash is `{short_hash}`.

## Suggested Codex profile for the next phase

Use `gpt-5.6-sol` with high reasoning in Code mode, local browser rendering enabled, and the existing brand validator as the completion gate. Do not enable remote publishing unless the user explicitly requests it.
"""


def main() -> None:
    validation = json.loads(
        (BRAND / "validation" / "cluster-mkt-brand-validation-report.json").read_text(encoding="utf-8")
    )
    if validation.get("status") != "PASS":
        raise RuntimeError("Relay creation blocked: brand validation status is not PASS")

    changed_files = eligible_brand_files()
    identity = "\n".join(
        f"{path.relative_to(ROOT).as_posix()}:{digest_file(path)}" for path in changed_files
    ).encode("utf-8")
    short_hash = digest_bytes(identity)[:8]
    relay_filename = f"cluster-mkt-full-brand-package-relay-{DATE}-{short_hash}.zip"
    relay_path = RELAY_DIR / relay_filename
    relay_content = relay_markdown(changed_files, short_hash, relay_filename).encode("utf-8")

    entries: list[tuple[str, bytes, str | None]] = [("RELAY.md", relay_content, None)]
    for path in changed_files:
        relative = path.relative_to(ROOT).as_posix()
        entries.append((f"changed-files/{relative}", path.read_bytes(), relative))

    validation_files = [
        BRAND / "validation" / "validate_cluster_mkt_brand_package.py",
        BRAND / "validation" / "cluster-mkt-brand-validation-report.json",
        BRAND / "validation" / "cluster-mkt-brand-validation-summary.md",
    ]
    preview_files = sorted((BRAND / "previews").glob("*.png"))
    for path in validation_files:
        entries.append((f"validation/{path.name}", path.read_bytes(), path.relative_to(ROOT).as_posix()))
    for path in preview_files:
        entries.append((f"previews/{path.name}", path.read_bytes(), path.relative_to(ROOT).as_posix()))

    manifest = {
        "package": "Cluster MKT™ Full Brand Package Relay",
        "relayFilename": relay_filename,
        "createdDate": DATE,
        "contentShortHash": short_hash,
        "validationStatus": "PASS",
        "lockedMasterHashes": LOCKED_MASTER_HASHES,
        "files": [
            {
                "archivePath": archive_path,
                "sourcePath": source_path,
                "size": len(data),
                "sha256": digest_bytes(data),
            }
            for archive_path, data, source_path in entries
        ],
    }
    manifest_data = (json.dumps(manifest, indent=2, ensure_ascii=False) + "\n").encode("utf-8")

    RELAY_DIR.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(relay_path, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        archive.writestr("RELAY.md", relay_content)
        archive.writestr("manifest.json", manifest_data)
        for archive_path, data, _ in entries[1:]:
            archive.writestr(archive_path, data)

    with zipfile.ZipFile(relay_path, "r") as archive:
        names = archive.namelist()
        required = {"RELAY.md", "manifest.json"}
        if not required.issubset(names):
            raise RuntimeError("Relay archive is missing required root files")
        if not any(name.startswith("validation/") for name in names):
            raise RuntimeError("Relay archive is missing validation/")
        if not any(name.startswith("previews/") for name in names):
            raise RuntimeError("Relay archive is missing previews/")
        if not any(name.startswith("changed-files/") for name in names):
            raise RuntimeError("Relay archive is missing changed-files/")
        forbidden = [
            name for name in names
            if any(part in FORBIDDEN_PARTS for part in Path(name).parts)
            or Path(name).suffix.lower() in FORBIDDEN_SUFFIXES
        ]
        if forbidden:
            raise RuntimeError("Forbidden cache/dependency/font files in relay: " + ", ".join(forbidden))
        loaded_manifest = json.loads(archive.read("manifest.json"))
        for item in loaded_manifest["files"]:
            if digest_bytes(archive.read(item["archivePath"])) != item["sha256"]:
                raise RuntimeError(f"Relay checksum mismatch: {item['archivePath']}")

    print(f"PASS: relay created and verified: {relay_path}")
    print(f"PASS: {len(entries) + 1} archive entries, no font binaries, caches, dependencies, or build outputs")
    print(f"SHA256: {digest_file(relay_path)}")


if __name__ == "__main__":
    main()
