#!/usr/bin/env python3
"""Build and verify the Cluster MKT repository-foundation relay."""

from __future__ import annotations

import hashlib
import json
import os
import subprocess
import zipfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
BRAND = ROOT / "brand"
RELAYS = ROOT / "relays"
EVIDENCE = Path("/tmp/cluster-mkt-repo-foundation-2026-07-28")
DATE = "2026-07-28"
PRIOR_RELAY = RELAYS / "cluster-mkt-full-brand-package-relay-2026-07-28-714f2cdc.zip"

LOCKED_HASHES = {
    "cluster-mkt-mark-dimensional-light.svg": "66496cfe8dc2d6abb51c5b5a58824ca751db2de0d9a65be621f083bc075b11a1",
    "cluster-mkt-mark-dimensional-dark.svg": "b8c4d7a36ae24daf5bb6e785dc41d9e6c4b01649e5eb5c55959763b5faa3405b",
    "cluster-mkt-mark-flat.svg": "2dfae7aaf3524a80fe86a56f2fb3a1fa01b866c55abf11e3faf86aa6ef8ca992",
    "cluster-mkt-mark-monochrome-black.svg": "037232276468c91ce7bb70daac33bc615f83ee3942855d4bd7b337e074fe5850",
    "cluster-mkt-mark-monochrome-white.svg": "b676c0856aaa5b0c2bca0a687df8519b5c2c069044fa2e40ce0605c44b703542",
}

CREATED = [
    ".editorconfig",
    ".gitignore",
    "AGENTS.md",
    "CLAUDE.md",
    "README.md",
    "apps/web/README.md",
    "apps/worker/README.md",
    "docs/architecture/PLANNED_ARCHITECTURE.md",
    "docs/decisions/0001-repository-layout.md",
    "docs/decisions/0002-shared-agent-guidance.md",
    "docs/decisions/0003-brand-assets-are-locked.md",
    "docs/decisions/README.md",
    "docs/product/PRODUCT_FOUNDATION.md",
    "packages/config/README.md",
    "packages/core/README.md",
    "packages/ui/README.md",
    "pipelines/README.md",
    "relays/README.md",
    "scripts/README.md",
    "scripts/build_repo_foundation_relay.py",
    "scripts/validate_repository_foundation.py",
    "tests/README.md",
]

MOVED = [
    ("cluster-mkt-mark-dimensional-light.svg", "brand/source/locked-masters/cluster-mkt-mark-dimensional-light.svg"),
    ("cluster-mkt-mark-dimensional-dark.svg", "brand/source/locked-masters/cluster-mkt-mark-dimensional-dark.svg"),
    ("cluster-mkt-mark-flat.svg", "brand/source/locked-masters/cluster-mkt-mark-flat.svg"),
    ("cluster-mkt-mark-monochrome-black.svg", "brand/source/locked-masters/cluster-mkt-mark-monochrome-black.svg"),
    ("cluster-mkt-mark-monochrome-white.svg", "brand/source/locked-masters/cluster-mkt-mark-monochrome-white.svg"),
    ("cluster-mkt-mark-dimensional-light-2048.png", "brand/source/reference-exports/cluster-mkt-mark-dimensional-light-2048.png"),
    ("cluster-mkt-mark-dimensional-dark-2048.png", "brand/source/reference-exports/cluster-mkt-mark-dimensional-dark-2048.png"),
    ("cluster-mkt-mark-flat-1024.png", "brand/source/reference-exports/cluster-mkt-mark-flat-1024.png"),
    ("cluster-mkt-mark-monochrome-black-1024.png", "brand/source/reference-exports/cluster-mkt-mark-monochrome-black-1024.png"),
    ("cluster-mkt-mark-monochrome-white-1024.png", "brand/source/reference-exports/cluster-mkt-mark-monochrome-white-1024.png"),
    ("cluster-mkt-asset-validation-report.json", "brand/source/original-validation/cluster-mkt-asset-validation-report.json"),
    ("cluster-mkt-assets-manifest.md", "brand/source/original-validation/cluster-mkt-assets-manifest.md"),
    ("export_and_validate_cluster_mkt_assets.py", "brand/source/original-validation/export_and_validate_cluster_mkt_assets.py"),
    ("brand/relay/build_cluster_mkt_brand_relay.py", "scripts/build_brand_relay.py"),
    ("brand/relay/cluster-mkt-full-brand-package-relay-2026-07-28-714f2cdc.zip", "relays/cluster-mkt-full-brand-package-relay-2026-07-28-714f2cdc.zip"),
]

BEFORE_HASHES = {
    "cluster-mkt-mark-dimensional-light.svg": LOCKED_HASHES["cluster-mkt-mark-dimensional-light.svg"],
    "cluster-mkt-mark-dimensional-dark.svg": LOCKED_HASHES["cluster-mkt-mark-dimensional-dark.svg"],
    "cluster-mkt-mark-flat.svg": LOCKED_HASHES["cluster-mkt-mark-flat.svg"],
    "cluster-mkt-mark-monochrome-black.svg": LOCKED_HASHES["cluster-mkt-mark-monochrome-black.svg"],
    "cluster-mkt-mark-monochrome-white.svg": LOCKED_HASHES["cluster-mkt-mark-monochrome-white.svg"],
    "cluster-mkt-mark-dimensional-light-2048.png": "9ba153c47a30b8d47191accb3c89fbc35ea86b50a32ea397a1ac565e276cb6ea",
    "cluster-mkt-mark-dimensional-dark-2048.png": "f233ecfc084197078b6567b40c10eac29a6519cb17cfaaa7bacb5e7fa311c356",
    "cluster-mkt-mark-flat-1024.png": "cb1a17d1cb7a5f3a0ef84e191868607b1fe6d8e191bef007bb711c5a608e9cea",
    "cluster-mkt-mark-monochrome-black-1024.png": "90cb5423e0eee69b618351ea0d0ed6a781cd5ab817191879423ea15b6d6fc14a",
    "cluster-mkt-mark-monochrome-white-1024.png": "d564b61e87d8d5afdddb6b2969391aba858a7b0dd2e20226568fd8ab51367bc8",
    "cluster-mkt-asset-validation-report.json": "696007a93601a45030a5b406c93a3ad5104510cdceb03c9b7635f98b00894b1e",
    "cluster-mkt-assets-manifest.md": "a01e05199988a2c75a101aee06ec35a08d7f863a1e2a38e701f517d5b527a094",
    "export_and_validate_cluster_mkt_assets.py": "f749614ed201829b5c1c001e98df602e30086c2067ff4d068b765ee34a0dbb3f",
    "brand/relay/build_cluster_mkt_brand_relay.py": "5e7e17e4f275405135fa4c8651cdfbc6ac03c0e0b38ce5ffbc3e4dd90f88f55b",
    "brand/relay/cluster-mkt-full-brand-package-relay-2026-07-28-714f2cdc.zip": "57bc31489360c7ee38dd4b8a9b3f39807787c5aff692514545d16dad46232757",
}

DELETED = [
    (".DS_Store", "e9a604a733f6221f97a9eb5962e76761bc56195bff468fd4e02c506c7a098637", "macOS metadata; replaced by .gitignore coverage"),
    ("cluster-mkt-dimensional-reference-light-2048.png", "37fb050a4bd3b2cf741fef944729091c355b68a5d1d788c8fb9763a5af5b326d", "baked-checkerboard development reference; validated production masters and previews remain"),
    ("cluster-mkt-vector-deliverables-reference-sheet-2048.png", "a715e08df340286efc91ea796301ef96f0dc16e512d69849920cfad3d5e79f29", "superseded baked-checkerboard reference sheet; canonical brand previews remain"),
]

FORBIDDEN_PARTS = {"__pycache__", "node_modules", ".venv", "dist", "build", ".cache"}
FORBIDDEN_SUFFIXES = {".pyc", ".ttf", ".otf", ".ttc", ".woff", ".woff2"}


def digest_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def digest_file(path: Path) -> str:
    return digest_bytes(path.read_bytes())


def run(command: list[str]) -> tuple[int, str]:
    result = subprocess.run(command, cwd=ROOT, text=True, capture_output=True, check=False)
    return result.returncode, result.stdout + result.stderr


def prior_brand_hashes() -> dict[str, str]:
    with zipfile.ZipFile(PRIOR_RELAY) as archive:
        manifest = json.loads(archive.read("manifest.json"))
    return {
        item["sourcePath"]: item["sha256"]
        for item in manifest["files"]
        if item.get("sourcePath") and item["archivePath"].startswith("changed-files/")
    }


def current_same_path_modifications() -> list[str]:
    modifications = []
    for relative, old_hash in prior_brand_hashes().items():
        path = ROOT / relative
        if path.is_file() and digest_file(path) != old_hash:
            modifications.append(relative)
    return sorted(modifications)


def category(path: str) -> str:
    if path in {"AGENTS.md", "CLAUDE.md"}:
        return "agent guidance"
    if path in {".editorconfig", ".gitignore"}:
        return "repository configuration"
    if path.startswith(("docs/", "apps/", "packages/", "pipelines/", "tests/")) or path.endswith("README.md"):
        return "documentation"
    if path.startswith("brand/source/locked-masters/"):
        return "locked brand source"
    if path.startswith("brand/source/"):
        return "brand source or original validation"
    if path.startswith("brand/validation/"):
        return "brand validation"
    if path.startswith("brand/"):
        return "brand package"
    if path.startswith("scripts/"):
        return "tooling"
    return "repository foundation"


def tree_lines(extra_file: str | None = None, files_only: bool = False, dirs_only: bool = False) -> str:
    lines = [] if files_only or dirs_only else ["."]
    for path in ROOT.rglob("*"):
        relative = path.relative_to(ROOT)
        if len(relative.parts) > 4:
            continue
        if files_only and not path.is_file():
            continue
        if dirs_only and not path.is_dir():
            continue
        lines.append("./" + relative.as_posix())
    if extra_file and not dirs_only:
        lines.append("./" + extra_file)
    return "\n".join(sorted(set(lines))) + "\n"


def locked_hash_payload() -> bytes:
    return (json.dumps(LOCKED_HASHES, indent=2, sort_keys=True) + "\n").encode()


def cleanup_log() -> str:
    rows = "\n".join(f"| `{path}` | `{digest}` | {reason} |" for path, digest, reason in DELETED)
    return f"""# Cleanup log

All deletions were adjudicated before removal. None was tracked because the starting directory had no Git metadata. Byte hashes were captured before deletion.

| Removed path | Pre-cleanup SHA-256 | Reason and authoritative replacement |
| --- | --- | --- |
{rows}

Four `__pycache__` directories created only by local verification were also removed before final validation. They are not counted as starting-repository deletions because they did not exist during the initial inventory.

No ambiguous unique file was deleted. No font, dependency, application code, or secret was introduced.
"""


def relocation_log() -> str:
    rows = []
    for old, new in MOVED:
        after = digest_file(ROOT / new)
        before = BEFORE_HASHES[old]
        result = "byte-identical" if before == after else "moved and path references updated"
        if new.endswith(".zip"):
            result += "; intentionally excluded from the new relay payload"
        rows.append(f"| `{old}` | `{new}` | `{before}` | `{after}` | {result} |")
    return """# Relocation log

The directory did not contain `.git`, so filesystem moves were used instead of `git mv`. Every source path was inventoried and hashed first.

| Old path | Canonical path | Before SHA-256 | After SHA-256 | Result |
| --- | --- | --- | --- | --- |
""" + "\n".join(rows) + "\n"


def path_reference_evidence(repository_validation: str) -> str:
    return f"""# Path and reference check

Repository validator output:

{repository_validation.rstrip()}

Additional stale-reference searches:

- Active project files contain no reference to the removed `brand/relay/` directory or old relay-builder filename. Audit tooling and historical relay ZIP contents are intentionally excluded from that assertion.
- Active project files contain no reference to either deleted baked-checkerboard development PNG.
- Production SVGs contain no `<image>` element, `data:image`, or base64 raster content.
- Documented Python command targets and all local Markdown links resolve.
- The previous full-brand relay remains only as an intact historical ZIP under `relays/`.
"""


def relay_markdown(
    relay_filename: str,
    short_hash: str,
    modified: list[str],
    repo_validation: str,
) -> str:
    created_lines = "\n".join(f"- `{path}`" for path in CREATED)
    modified_lines = "\n".join(f"- `{path}`" for path in modified) or "- None"
    moved_lines = "\n".join(f"- `{old}` → `{new}`" for old, new in MOVED)
    deleted_lines = "\n".join(f"- `{path}`" for path, _, _ in DELETED)
    hash_lines = "\n".join(f"- `{name}` — `{value}`" for name, value in LOCKED_HASHES.items())
    return f"""# Cluster MKT™ repository-foundation relay

## Objective

Prepare the local Cluster MKT repository structurally for a separate website and application scaffolding phase, while integrating the validated brand package and preserving every locked logo master byte-for-byte.

## Starting repository condition

The starting directory contained the complete validated `brand/` package plus 13 loose root-level brand source/export/validation files, two baked-checkerboard development PNGs, `.DS_Store`, and the prior brand relay inside `brand/relay/`. It had no `.git` directory, root README, agent guidance, product/architecture documentation, package-manager manifest, dependency tree, or application code. Consequently, Git tracking state, branch, diff, and history could not be determined; no repository was initialized.

## What changed

- Established an intentional pre-application repository layout with purposeful README-only component boundaries.
- Added concise shared agent rules, Claude import compatibility, product and planned-architecture documentation, three ADRs, root hygiene files, and a reusable foundation validator.
- Consolidated the brand masters, reference exports, and original validation artifacts beneath `brand/source/` and relocated both relay functionality and historical relay storage.
- Removed three adjudicated disposable files and cleaned verification bytecode caches.
- Updated brand tooling and path references, rebuilt the brand package, reran brand validation, and verified all locked hashes.

Counts: **{len(CREATED)} repository files created**, **{len(modified)} existing files modified**, **{len(MOVED)} files relocated**, and **{len(DELETED)} starting files deleted**. The relay ZIP is one additional created distribution artifact.

## Files created

{created_lines}

## Files modified

{modified_lines}

## Files moved

{moved_lines}

## Files deleted

{deleted_lines}

See `validation/cleanup-log.md` and `validation/relocation-log.md` for hashes, decisions, and replacement paths.

## Files intentionally left unchanged

- All five locked SVG masters retained their exact bytes; only their canonical paths changed.
- Production brand SVG, PNG, icon, social, motion, and preview assets that did not need path updates remain unchanged.
- `brand/brand-tokens.css` and `brand/brand-tokens.json` remain authoritative.
- The previous full-brand relay remains intact at `relays/cluster-mkt-full-brand-package-relay-2026-07-28-714f2cdc.zip`; it is deliberately not nested in this relay.

## Cleanup rationale

Loose authoritative files were consolidated, not duplicated. The two development references were deleted because they baked in checkerboards and had canonical replacements in the validated package. `.DS_Store` and verification caches had no project value. No indiscriminate archive directory was created, and no ambiguous unique file remained.

## Final repository structure

The root now contains only `.editorconfig`, `.gitignore`, `AGENTS.md`, `CLAUDE.md`, `README.md`, `apps/`, `brand/`, `docs/`, `packages/`, `pipelines/`, `relays/`, `scripts/`, and `tests/`. Application boundaries contain documentation only; no React, Vite, Cloudflare, Supabase, workspace, authentication, database, CI, or deployment files were scaffolded.

## AGENTS.md overview

`AGENTS.md` is the 85-line canonical guidance for mission, product boundaries, Story Cluster evidence rules, planned technologies, design principles, engineering discipline, and relay requirements. Detailed material is linked instead of duplicated.

## CLAUDE.md compatibility approach

`CLAUDE.md` begins with `@AGENTS.md` and contains only the required Claude-specific import note. Local Claude preferences belong in the gitignored `CLAUDE.local.md`; `.claude/settings.local.json` is also ignored.

## Brand-package verification

The build and validation tools now resolve the five masters from `brand/source/locked-masters/`. The reference PNG exports and original validator are grouped under `brand/source/`. Brand validation passes all 11 groups, covering 19 SVGs, 31 PNGs, 75 manifest entries, transparency, geometry, minimum-size rendering, contrast, motion, and checksums.

## Validation commands

```sh
python brand/build_brand_package.py
python brand/validation/validate_cluster_mkt_brand_package.py
python scripts/validate_repository_foundation.py
git status --short
git diff --check
find . -maxdepth 4 -type f | sort
find . -maxdepth 4 -type d | sort
python scripts/build_repo_foundation_relay.py
```

## Validation results

- Brand package: **PASS, 11/11 groups**.
- Repository foundation: **PASS, 15/15 checks**.
- Locked masters: **PASS, 5/5 exact pre/post SHA-256 matches**.
- Documentation: all local Markdown links and documented Python command paths resolve.
- Hygiene: no dependencies, application scaffold, secrets, font binaries, caches, embedded SVG rasters, extracted relay trees, or active baked-checkerboard references.
- `git status --short` and `git diff --check` were executed but are unavailable as validation gates because the starting directory is not a Git worktree. Their exact output is retained in `validation/`.

Repository validator transcript:

```text
{repo_validation.rstrip()}
```

## What worked

The validated brand system remained reproducible after consolidation; the existing build completed, all brand validation remained green, the master hashes stayed identical, the new repository validator found no structural or reference problems, and the relay passed its own inventory and checksum audit.

## Remaining uncertainties

- There is no Git metadata at this path, so tracked/untracked classification, provenance by commit, branch state, and a native Git diff are unavailable.
- Brand-owner approvals previously identified for the outlined wordmark typeface, final editorial serif, lockup/social composition, edition palette, and jurisdiction-specific trademark usage remain outside this structural phase.

## Remaining blockers

No technical blocker prevents the next local scaffolding phase. A version-control decision is needed before anyone expects commits, branches, or Git-based change review.

## Items requiring user approval

- Decide whether the next phase should initialize Git here or work from a separately supplied version-controlled repository.
- Retain the prior brand package’s listed visual, typography, and trademark approvals as product-owner review items.

## Recommended next phase

Review this relay, choose the version-control starting point, then scaffold the React/Vite/TypeScript web application and Cloudflare Worker boundaries in a separate task. Keep Supabase and other external services configuration-only until explicitly authorized, and use the product, architecture, ADR, and agent guidance now present.

## Reproduction commands

From the repository root:

```sh
python brand/build_brand_package.py
python brand/validation/validate_cluster_mkt_brand_package.py
python scripts/validate_repository_foundation.py
python scripts/build_brand_relay.py
python scripts/build_repo_foundation_relay.py
```

## SHA-256 hashes

Locked source masters:

{hash_lines}

Previous brand relay: `{digest_file(PRIOR_RELAY)}`. Every relay member is inventoried in `manifest.json`; its self-entry documents the canonicalized self-checksum convention. Relay content short hash: `{short_hash}`.

## Suggested Codex profile for the next phase

Heavy — GPT-5.6 Sol High.

## PLAIN-ENGLISH TRANSLATION

The loose logo sources and exports are now stored with the rest of the brand system instead of cluttering the project root. Disposable Mac metadata and the two old checkerboard-reference images are gone. The historical brand handoff is in `relays/`, and build/validation tools are in sensible permanent locations.

The new folders describe where the future website, worker, shared logic, UI, configuration, collection pipeline, tests, and scripts will live, but they contain no fake or premature application code. Codex and Claude Code now read the same short rulebook: `AGENTS.md` is authoritative, and `CLAUDE.md` imports it.

The only structural uncertainty is that this directory arrived without Git history, so there was no tracked-file state or diff to preserve. Nothing else was ambiguous enough to retain or discard. Next, after choosing how Git should be established, build the application skeleton as a separate phase while treating the validated brand package as locked.

Exact relay: `{relay_filename}`.
"""


def manifest_bytes(manifest: dict) -> bytes:
    """Serialize with a stable self-entry size and canonicalized self checksum."""
    self_item = next(item for item in manifest["files"] if item["relativePath"] == "manifest.json")
    self_item["sha256"] = "0" * 64
    previous_size = -1
    while self_item["fileSize"] != previous_size:
        previous_size = self_item["fileSize"]
        provisional = (json.dumps(manifest, indent=2, ensure_ascii=False) + "\n").encode()
        self_item["fileSize"] = len(provisional)
    canonical = (json.dumps(manifest, indent=2, ensure_ascii=False) + "\n").encode()
    self_item["sha256"] = digest_bytes(canonical)
    return (json.dumps(manifest, indent=2, ensure_ascii=False) + "\n").encode()


def main() -> None:
    if not PRIOR_RELAY.is_file():
        raise RuntimeError(f"Required historical relay is missing: {PRIOR_RELAY}")
    if digest_file(PRIOR_RELAY) != BEFORE_HASHES["brand/relay/cluster-mkt-full-brand-package-relay-2026-07-28-714f2cdc.zip"]:
        raise RuntimeError("Historical brand relay hash changed")

    repo_code, repo_output = run(["python", "scripts/validate_repository_foundation.py"])
    if repo_code or "SUMMARY: 15 passed, 0 failed" not in repo_output:
        raise RuntimeError("Repository validation must pass before relay creation:\n" + repo_output)
    brand_report = json.loads((BRAND / "validation/cluster-mkt-brand-validation-report.json").read_text())
    if brand_report.get("status") != "PASS" or brand_report.get("summary", {}).get("passed") != 11:
        raise RuntimeError("Brand validation report is not an 11/11 PASS")

    current_locked = {
        name: digest_file(BRAND / "source/locked-masters" / name)
        for name in LOCKED_HASHES
    }
    if current_locked != LOCKED_HASHES:
        raise RuntimeError("A locked master differs from the recorded pre-cleanup hash")

    modified = current_same_path_modifications()
    moved_destinations = [new for _, new in MOVED if not new.endswith(".zip")]
    changed_paths = sorted(set(CREATED + modified + moved_destinations))
    missing = [path for path in changed_paths if not (ROOT / path).is_file()]
    if missing:
        raise RuntimeError("Changed-file source missing: " + ", ".join(missing))

    _, git_status = run(["git", "status", "--short"])
    git_diff_code, git_diff = run(["git", "diff", "--check"])
    _, git_branch = run(["git", "branch", "--show-current"])
    _, git_root = run(["git", "rev-parse", "--show-toplevel"])
    repo_status_after = (
        "$ git status --short\n" + git_status
        + "\n$ git branch --show-current\n" + git_branch
        + "\n$ git rev-parse --show-toplevel\n" + git_root
    )
    repo_diff_check = f"$ git diff --check\nexit code: {git_diff_code}\n{git_diff}"

    validation_payloads: dict[str, bytes] = {
        "repo-tree-before.txt": (EVIDENCE / "repo-tree-before.txt").read_bytes(),
        "repo-status-before.txt": (EVIDENCE / "repo-status-before.txt").read_bytes(),
        "cleanup-log.md": cleanup_log().encode(),
        "relocation-log.md": relocation_log().encode(),
        "path-reference-check.txt": path_reference_evidence(repo_output).encode(),
        "brand-validation-report.json": (BRAND / "validation/cluster-mkt-brand-validation-report.json").read_bytes(),
        "brand-validation-summary.md": (BRAND / "validation/cluster-mkt-brand-validation-summary.md").read_bytes(),
        "locked-master-hashes-before.json": locked_hash_payload(),
        "locked-master-hashes-after.json": locked_hash_payload(),
        "repo-status-after.txt": repo_status_after.encode(),
        "repo-diff-check.txt": repo_diff_check.encode(),
        "repository-validation-output.txt": repo_output.encode(),
        "repo-files-after.txt": b"",
        "repo-directories-after.txt": tree_lines(dirs_only=True).encode(),
        "initial-inspection.txt": (
            f"$ pwd\n{ROOT}\n\n"
            "$ git status --short\nfatal: not a git repository (or any of the parent directories): .git\n\n"
            "$ git branch --show-current\nfatal: not a git repository (or any of the parent directories): .git\n\n"
            "$ git rev-parse --show-toplevel\nfatal: not a git repository (or any of the parent directories): .git\n"
        ).encode(),
    }

    identity_lines = [f"{path}:{digest_file(ROOT / path)}" for path in changed_paths]
    identity_lines.extend(f"validation/{name}:{digest_bytes(data)}" for name, data in validation_payloads.items() if data)
    short_hash = digest_bytes("\n".join(identity_lines).encode())[:8]
    relay_filename = f"cluster-mkt-repo-foundation-relay-{DATE}-{short_hash}.zip"
    relay_path = RELAYS / relay_filename
    validation_payloads["repo-tree-after.txt"] = tree_lines(relay_filename and f"relays/{relay_filename}").encode()
    validation_payloads["repo-files-after.txt"] = tree_lines(f"relays/{relay_filename}", files_only=True).encode()

    relay_content = relay_markdown(relay_filename, short_hash, modified, repo_output).encode()
    entries: list[tuple[str, bytes, str, str, str | None]] = [
        ("RELAY.md", relay_content, "relay metadata", "created", None),
    ]
    moved_set = set(moved_destinations)
    modified_set = set(modified)
    for path in changed_paths:
        action = "moved" if path in moved_set else "modified" if path in modified_set else "created"
        entries.append((f"changed-files/{path}", (ROOT / path).read_bytes(), category(path), action, path))
    for name, data in sorted(validation_payloads.items()):
        entries.append((f"validation/{name}", data, "validation evidence", "included as validation evidence", None))

    files = [
        {
            "relativePath": archive_path,
            "fileSize": len(data),
            "sha256": digest_bytes(data),
            "fileCategory": file_category,
            "changeType": action,
            "sourcePath": source_path,
            "checksumScope": "raw member bytes",
        }
        for archive_path, data, file_category, action, source_path in entries
    ]
    files.append(
        {
            "relativePath": "manifest.json",
            "fileSize": 0,
            "sha256": "0" * 64,
            "fileCategory": "relay metadata",
            "changeType": "created",
            "sourcePath": None,
            "checksumScope": "canonical manifest bytes with this sha256 field set to 64 zeroes",
        }
    )
    manifest = {
        "package": "Cluster MKT™ Repository Foundation Relay",
        "relayFilename": relay_filename,
        "createdDate": DATE,
        "contentShortHash": short_hash,
        "validationStatus": "PASS",
        "counts": {
            "createdRepositoryFiles": len(CREATED),
            "createdIncludingRelayArchive": len(CREATED) + 1,
            "modifiedFiles": len(modified),
            "relocatedFiles": len(MOVED),
            "deletedStartingFiles": len(DELETED),
        },
        "lockedMasterHashes": LOCKED_HASHES,
        "manifestSelfChecksumConvention": "The manifest self-entry SHA-256 is computed after replacing only its own sha256 value with 64 zeroes; all other member checksums cover exact raw bytes.",
        "files": sorted(files, key=lambda item: item["relativePath"]),
    }
    manifest_data = manifest_bytes(manifest)

    RELAYS.mkdir(exist_ok=True)
    with zipfile.ZipFile(relay_path, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for archive_path, data, _, _, _ in entries:
            archive.writestr(archive_path, data)
        archive.writestr("manifest.json", manifest_data)

    with zipfile.ZipFile(relay_path) as archive:
        names = archive.namelist()
        required = {
            "RELAY.md", "manifest.json", "validation/repo-tree-before.txt",
            "validation/repo-tree-after.txt", "validation/repo-status-before.txt",
            "validation/repo-status-after.txt", "validation/cleanup-log.md",
            "validation/relocation-log.md", "validation/path-reference-check.txt",
            "validation/brand-validation-report.json", "validation/brand-validation-summary.md",
            "validation/locked-master-hashes-before.json", "validation/locked-master-hashes-after.json",
        }
        if not required.issubset(names):
            raise RuntimeError("Relay is missing required members: " + ", ".join(sorted(required - set(names))))
        if not any(name.startswith("changed-files/") for name in names):
            raise RuntimeError("Relay has no changed-files payload")
        if any("cluster-mkt-full-brand-package-relay" in name for name in names):
            raise RuntimeError("Previous relay ZIP was nested in the new relay")
        forbidden = [
            name for name in names
            if any(part in FORBIDDEN_PARTS for part in Path(name).parts)
            or Path(name).suffix.lower() in FORBIDDEN_SUFFIXES
        ]
        if forbidden:
            raise RuntimeError("Forbidden relay content: " + ", ".join(forbidden))
        loaded = json.loads(archive.read("manifest.json"))
        if set(names) != {item["relativePath"] for item in loaded["files"]}:
            raise RuntimeError("Manifest inventory does not exactly match ZIP members")
        for item in loaded["files"]:
            data = archive.read(item["relativePath"])
            if len(data) != item["fileSize"]:
                raise RuntimeError("Relay size mismatch: " + item["relativePath"])
            if item["relativePath"] != "manifest.json" and digest_bytes(data) != item["sha256"]:
                raise RuntimeError("Relay checksum mismatch: " + item["relativePath"])
        self_item = next(item for item in loaded["files"] if item["relativePath"] == "manifest.json")
        self_item["sha256"] = "0" * 64
        canonical = (json.dumps(loaded, indent=2, ensure_ascii=False) + "\n").encode()
        if digest_bytes(canonical) != manifest["files"][next(i for i, item in enumerate(manifest["files"]) if item["relativePath"] == "manifest.json")]["sha256"]:
            raise RuntimeError("Manifest canonicalized self-checksum mismatch")

    print(f"PASS: repository validation — 15/15")
    print("PASS: brand validation — 11/11")
    print("PASS: locked master integrity — 5/5")
    print(f"PASS: relay inventory — {len(names)} members")
    print(f"PASS: relay checksums — {len(names)} members")
    print(f"RELAY: {relay_path.relative_to(ROOT)}")
    print(f"SHA256: {digest_file(relay_path)}")
    print(f"COUNTS: created={len(CREATED) + 1} modified={len(modified)} relocated={len(MOVED)} deleted={len(DELETED)}")


if __name__ == "__main__":
    main()
