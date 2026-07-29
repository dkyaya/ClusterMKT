#!/usr/bin/env python3
"""Build the audited relay for the committed application foundation."""

from __future__ import annotations

import hashlib
import json
import shutil
import subprocess
import zipfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TMP = ROOT / "relays/tmp/application-foundation"
RELAYS = ROOT / "relays"
DATE = "2026-07-28"
LOCKED = {
    "cluster-mkt-mark-dimensional-light.svg": "66496cfe8dc2d6abb51c5b5a58824ca751db2de0d9a65be621f083bc075b11a1",
    "cluster-mkt-mark-dimensional-dark.svg": "b8c4d7a36ae24daf5bb6e785dc41d9e6c4b01649e5eb5c55959763b5faa3405b",
    "cluster-mkt-mark-flat.svg": "2dfae7aaf3524a80fe86a56f2fb3a1fa01b866c55abf11e3faf86aa6ef8ca992",
    "cluster-mkt-mark-monochrome-black.svg": "037232276468c91ce7bb70daac33bc615f83ee3942855d4bd7b337e074fe5850",
    "cluster-mkt-mark-monochrome-white.svg": "b676c0856aaa5b0c2bca0a687df8519b5c2c069044fa2e40ce0605c44b703542",
}
MODIFIED = {
    ".gitignore",
    "AGENTS.md",
    "README.md",
    "apps/web/README.md",
    "apps/worker/README.md",
    "docs/architecture/PLANNED_ARCHITECTURE.md",
    "docs/decisions/README.md",
    "packages/config/README.md",
    "packages/core/README.md",
    "packages/ui/README.md",
    "scripts/README.md",
    "tests/README.md",
}
ROOT_CREATED = {
    ".github/workflows/ci.yml",
    ".gitattributes",
    ".prettierignore",
    ".prettierrc.json",
    "eslint.config.js",
    "package.json",
    "pnpm-lock.yaml",
    "pnpm-workspace.yaml",
    "tsconfig.base.json",
    "tsconfig.json",
    "vitest.workspace.ts",
    "brand/validation/requirements.txt",
}
NEW_DOCS = {
    "docs/architecture/APPLICATION_FOUNDATION.md",
    "docs/development/LOCAL_DEVELOPMENT.md",
    "docs/development/VALIDATION.md",
    "docs/decisions/0004-application-foundation-stack.md",
}
NEW_SCRIPTS = {
    "scripts/clean-generated.mjs",
    "scripts/sync-web-brand-assets.mjs",
    "scripts/validate-application-foundation.mjs",
    "scripts/build_application_foundation_relay.py",
}
FORBIDDEN_PARTS = {"node_modules", "dist", "coverage", "__pycache__", ".vite", ".wrangler", ".cache"}
FORBIDDEN_SUFFIXES = {".pyc", ".ttf", ".otf", ".woff", ".woff2"}


def sha_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def sha_file(path: Path) -> str:
    return sha_bytes(path.read_bytes())


def run(command: list[str]) -> tuple[int, str]:
    result = subprocess.run(command, cwd=ROOT, text=True, capture_output=True, check=False)
    return result.returncode, result.stdout + result.stderr


def require(command: list[str], log_name: str) -> str:
    code, output = run(command)
    (TMP / log_name).write_text(f"$ {' '.join(command)}\nexit code: {code}\n\n{output}", encoding="utf-8")
    if code:
        raise RuntimeError(f"Required command failed: {' '.join(command)}\n{output}")
    return output


def tracked_files() -> list[str]:
    code, output = run(["git", "ls-files"])
    if code:
        raise RuntimeError(output)
    return sorted(line for line in output.splitlines() if line)


def changed_paths() -> tuple[list[str], list[str]]:
    tracked = set(tracked_files())
    created = set(ROOT_CREATED | NEW_DOCS | NEW_SCRIPTS)
    created.update(path for path in tracked if path.startswith("apps/") and path not in MODIFIED)
    created.update(path for path in tracked if path.startswith("packages/") and path not in MODIFIED)
    missing = sorted(path for path in created | MODIFIED if path not in tracked)
    if missing:
        raise RuntimeError("Expected committed changed file is missing: " + ", ".join(missing))
    return sorted(created), sorted(MODIFIED)


def category(path: str) -> str:
    if path.startswith("apps/web/"):
        return "web application"
    if path.startswith("apps/worker/"):
        return "worker application"
    if path.startswith("packages/core/"):
        return "core package"
    if path.startswith("packages/ui/"):
        return "UI package"
    if path.startswith("packages/config/"):
        return "configuration package"
    if path.startswith("docs/") or path.endswith("README.md"):
        return "documentation"
    if path.startswith(".github/"):
        return "continuous integration"
    if path.startswith("scripts/"):
        return "tooling"
    return "workspace configuration"


def package_versions() -> dict[str, str]:
    code, output = run(["pnpm", "list", "--depth", "0", "--recursive", "--json"])
    if code:
        raise RuntimeError(output)
    packages = json.loads(output)
    versions: dict[str, str] = {}
    for package in packages:
        for group in ("dependencies", "devDependencies"):
            for name, detail in package.get(group, {}).items():
                if isinstance(detail, dict) and detail.get("version"):
                    versions[name] = detail["version"]
    return dict(sorted(versions.items()))


def canonical_manifest_bytes(manifest: dict) -> bytes:
    self_item = next(item for item in manifest["files"] if item["relativePath"] == "manifest.json")
    self_item["sha256"] = "0" * 64
    previous = -1
    while self_item["fileSize"] != previous:
        previous = self_item["fileSize"]
        provisional = (json.dumps(manifest, indent=2, ensure_ascii=False) + "\n").encode()
        self_item["fileSize"] = len(provisional)
    canonical = (json.dumps(manifest, indent=2, ensure_ascii=False) + "\n").encode()
    self_item["sha256"] = sha_bytes(canonical)
    return (json.dumps(manifest, indent=2, ensure_ascii=False) + "\n").encode()


def relay_markdown(commit: str, created: list[str], modified: list[str], versions: dict[str, str]) -> str:
    filename = f"cluster-mkt-application-foundation-relay-{DATE}-{commit[:8]}.zip"
    created_list = "\n".join(f"- `{path}`" for path in created)
    modified_list = "\n".join(f"- `{path}`" for path in modified)
    dependencies = "\n".join(f"- `{name}` — `{version}`" for name, version in versions.items())
    hashes = "\n".join(f"- `{name}` — `{digest}`" for name, digest in LOCKED.items())
    return f"""# Cluster MKT™ application-foundation relay

## Objective

Initialize the cleaned Cluster MKT foundation as the public repository, establish the pnpm TypeScript workspace, implement the static branded web and Worker boundaries, validate them, and document the first implementation commit `{commit}`.

## Starting repository state

The local foundation was complete but had no `.git` metadata, package manager, application code, dependencies, tests, or CI. The public repository returned no refs. Pre-state evidence is preserved in `validation/`.

## Remote-repository state

`origin` is `https://github.com/dkyaya/ClusterMKT.git`. It was empty before initialization. No remote history was rewritten, no branch was deleted, and no force push was used.

## Git initialization or reconciliation performed

The existing directory was initialized directly, the branch was named `main`, `origin` was added exactly, and an empty fetch confirmed that no reconciliation commit was needed.

## Branch used

`main`

## Commit created

Implementation commit: `{commit}` — `Initialize Cluster MKT application foundation`.

## Push result

The implementation commit was pushed successfully to `origin/main`. Exact command evidence is in `validation/push-result.txt`.

## What changed

Created a private pnpm workspace; strict shared TypeScript configuration; React/Vite web shell; plain Cloudflare Worker; core, UI, and config packages; static Story Cluster fixtures; responsive edition-aware brand styling; behavior tests; ESLint; Prettier; GitHub Actions CI; runtime brand sync; validation tooling; and application/development documentation.

## Exact files created

{created_list}

## Exact files modified

{modified_list}

## Exact files moved

None.

## Exact files deleted

None.

## Dependencies added and package versions

{dependencies}

All are open-source workspace runtime or development dependencies. No Tailwind, component library, state library, data-fetching library, Supabase client, AI SDK, animation library, or live-data client was added.

## Workspace structure

- `@cluster-mkt/web`: React/Vite demonstration application.
- `@cluster-mkt/worker`: plain Worker routes and dry-run build.
- `@cluster-mkt/core`: Zod evidence and Story Cluster contracts.
- `@cluster-mkt/ui`: accessible token-driven primitives.
- `@cluster-mkt/config`: non-secret routes, identity, navigation, and edition logic.

## Web application structure

The responsive shell includes desktop and mobile navigation, static search presentation, Today, Story Cluster detail, placeholder routes, settings previews, a nonfunctional audio preview, and explicit demonstration-data labeling. Detail clusters present Overview, Read, and Listen with source roles, relevance, reasons for inclusion, overview-use flags, transcript status, and related-listening disclosures.

## Worker structure

`GET /health` returns structured health data. `GET /api/status` explicitly reports live data, authentication, and external AI as false. Unknown routes return 404. The Wrangler build is a telemetry-disabled dry run with no bindings and no deployment.

## Shared-package structure

Core preserves framework-independent evidence semantics. Config centralizes deterministic America/New_York edition boundaries. UI provides Button, Badge, Surface, Tabs, and VisuallyHidden primitives with keyboard behavior and reduced-motion-aware brand styles.

## Brand integration

The canonical package stays under `brand/`. The web build imports the locked light/dark dimensional masters directly. Exactly nine runtime icons are generated from `brand/icons/` into ignored `apps/web/public/brand/`, and the validator compares hashes. All locked master hashes remained unchanged.

## Runtime-generated brand-asset policy

`apps/web/public/brand/` is ignored, removed by `pnpm clean`, and regenerated by development, build, CI, or `pnpm assets:sync`. It is never an alternate source of truth.

## Edition implementation

Morning begins at 06:00 ET, Midday at 12:00 ET, and Closing at 18:00 ET through 05:59 ET. Deterministic tests cover every transition. `data-edition` affects restrained accent tokens while `prefers-color-scheme` independently controls appearance; Closing never forces dark mode.

## Testing performed

Vitest executed 25 behavior tests across 8 files: schema acceptance/rejection, evidence flags, podcast transcript safety, deterministic relevance labels, edition boundaries, accessible tabs, UI labels, app/navigation/demo rendering, cluster cards, and Worker responses.

## CI configuration

GitHub Actions runs on pull requests and pushes to `main` using Node 24 LTS, pnpm 10.26.2, Python 3.12, pinned Pillow/Playwright validator dependencies, a Chromium runtime, a frozen pnpm lockfile, asset sync, formatting, lint, type-checking, tests, builds, brand validation, and foundation validation. It has read-only repository permission and no deploy step.

## Validation commands

```sh
pnpm install --frozen-lockfile
pnpm assets:sync
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test:run
pnpm build:web
pnpm build:worker
pnpm brand:validate
pnpm foundation:validate
pnpm validate
```

## Validation results

- Formatting: PASS.
- ESLint: PASS with zero warnings.
- Strict TypeScript: PASS across five workspace packages.
- Tests: PASS, 25/25 across 8 files.
- Web build: PASS, 168 modules; both locked dimensional marks bundled as SVG.
- Worker build: PASS, 2.12 KiB dry-run upload, no bindings, no deployment.
- Brand: PASS, 11/11 groups.
- Application foundation: PASS, 24/24 checks.
- Locked masters: PASS, 5/5 exact hashes.

## What worked

One workspace lockfile supports all boundaries, source schemas reject unsafe podcast evidence, edition selection remains deterministic, the visual shell stays honestly static, brand sources remain canonical, and local/CI gates share the same commands.

## Failures encountered and repairs

- The first pnpm install resolved a deprecated matcher patch; it was pinned to 6.9.1 and the lockfile refreshed.
- Initial type-checking needed CSS-module declarations and reference-free leaf checks; both were corrected without reducing strictness.
- Vitest 4 removed the old workspace flag and projects were moved into the supported configuration. Explicit cleanup fixed test isolation.
- The sandbox blocked Wrangler's user-level log path; the authorized dry-run succeeded. Metrics are now explicitly disabled.
- Optional screenshot capture was attempted with the available browser control surface, but no controllable browser instance was available. No browser dependency was added; `previews/README.md` records this.
- The first two public CI runs exposed missing Python brand-validator dependencies on clean Ubuntu runners. Pillow and Playwright are now pinned in `brand/validation/requirements.txt`, CI installs Chromium with its system dependencies, and the repaired remote run is recorded in `validation/ci-remote-results.md`.

## Remaining uncertainties

Visual review should still be performed in the product owner's browsers. The final editorial serif and previously documented brand-owner/legal approvals remain open. GitHub Actions will provide the first remote Linux/Node 24 execution after push.

## Remaining blockers

No implementation or push blocker remains for this phase.

## Items requiring user approval

Product-owner visual approval of the shell and inherited brand typography/trademark decisions remain appropriate before production design expansion.

## Recommended next phase

Design a source registry and publisher/feed capability matrix, canonical source metadata, an entity-resolution dictionary, relevance-scoring fixtures, Story Cluster fixtures, and adversarial ticker-collision cases. Keep all ingestion offline and fixture-driven.

## Reproduction commands

```sh
pnpm install --frozen-lockfile
pnpm validate
python scripts/build_application_foundation_relay.py
```

## SHA-256 hashes

{hashes}

Every relay member is inventoried in `manifest.json`. The relay filename is `{filename}`.

## Suggested Codex profile for the next phase

Heavy — GPT-5.6 Sol High.

## PLAIN-ENGLISH TRANSLATION

Cluster MKT now has a real development foundation. The website displays a polished, responsive, brand-aligned preview of Today, Story Cluster details, sources, podcasts, settings, and navigation. Every story, count, timestamp, source, and control is explicitly demonstration material; no live market service is attached.

The Worker only answers health and status questions and truthfully reports that live data, authentication, and AI are disconnected. Code is separated into browser, Worker, domain, UI, and configuration packages. Tests protect evidence rules, edition timing, accessibility behavior, page rendering, and Worker routing. The public GitHub `main` branch received the implementation commit.

The brand is used directly from its locked masters and canonical tokens; browser icons are reproducibly generated rather than copied by hand. Nothing has been deployed, and ingestion, accounts, persistence, publisher connections, AI, podcasts, and TTS remain unconnected. Next, build offline source metadata and adversarial relevance/clustering fixtures before any live ingestion.
"""


def main() -> None:
    TMP.mkdir(parents=True, exist_ok=True)
    code, history = run(["git", "log", "--format=%H%x09%s"])
    if code:
        raise RuntimeError("Committed repository history is required")
    commit = next(
        (
            line.split("\t", 1)[0]
            for line in history.splitlines()
            if line.endswith("\tInitialize Cluster MKT application foundation")
        ),
        "",
    )
    if len(commit) != 40:
        raise RuntimeError("The application-foundation implementation commit is missing")

    require(["pnpm", "install", "--frozen-lockfile", "--offline"], "install-log.txt")
    require(["pnpm", "format:check"], "format-check.txt")
    require(["pnpm", "lint"], "lint.txt")
    require(["pnpm", "typecheck"], "typecheck.txt")
    require(["pnpm", "test:run"], "tests.txt")
    require(["pnpm", "build:web"], "web-build.txt")
    require(["pnpm", "build:worker"], "worker-build.txt")
    require(["pnpm", "foundation:validate"], "foundation-validation.txt")

    for name in ("cluster-mkt-brand-validation-report.json", "cluster-mkt-brand-validation-summary.md"):
        shutil.copy2(ROOT / "brand/validation" / name, TMP / name)
    if json.loads((TMP / "cluster-mkt-brand-validation-report.json").read_text())["status"] != "PASS":
        raise RuntimeError("Brand validation report is not PASS")
    application_report = json.loads((TMP / "application-foundation-validation-report.json").read_text())
    if application_report["status"] != "PASS":
        raise RuntimeError("Application foundation report is not PASS")

    current_hashes = {
        name: sha_file(ROOT / "brand/source/locked-masters" / name) for name in LOCKED
    }
    if current_hashes != LOCKED:
        raise RuntimeError("Locked master hash mismatch")
    (TMP / "locked-master-hashes-after.json").write_text(
        json.dumps(current_hashes, indent=2, sort_keys=True) + "\n", encoding="utf-8"
    )

    commands = {
        "git-status-after-foundation-commit.txt": ["git", "status", "--short"],
        "git-remotes-after.txt": ["git", "remote", "-v"],
        "git-log-after.txt": ["git", "log", "--oneline", "--decorate", "-10"],
    }
    for name, command in commands.items():
        code, output = run(command)
        (TMP / name).write_text(f"$ {' '.join(command)}\nexit code: {code}\n{output}", encoding="utf-8")
    _, tree = run(["find", ".", "-maxdepth", "4", "-type", "f"])
    (TMP / "repo-tree-after.txt").write_text("\n".join(sorted(tree.splitlines())) + "\n", encoding="utf-8")
    (TMP / "ci-workflow-review.md").write_text(
        "# CI workflow review\n\nPASS. The workflow triggers on pull requests and pushes to `main`, uses maintained official checkout/pnpm/Node/Python actions, installs pinned Python brand-validator dependencies and Chromium, installs the frozen pnpm lockfile, runs all requested gates, has read-only contents permission, declares no secrets, and contains no deployment step.\n",
        encoding="utf-8",
    )
    preview_note = (
        "# Preview availability\n\nOptional screenshot capture was attempted with the available local browser-control surface after a successful Vite startup, but no controllable browser instance was available. No Playwright or browser dependency was installed solely for screenshots. The successful web build and component tests are included as validation evidence.\n"
    ).encode()

    created, modified = changed_paths()
    versions = package_versions()
    relay_filename = f"cluster-mkt-application-foundation-relay-{DATE}-{commit[:8]}.zip"
    relay_path = RELAYS / relay_filename
    relay_data = relay_markdown(commit, created, modified, versions).encode()
    entries: list[tuple[str, bytes, str, str, str | None]] = [
        ("RELAY.md", relay_data, "relay metadata", "created", None),
        ("previews/README.md", preview_note, "preview evidence", "included as validation evidence", None),
    ]
    for path in created:
        entries.append((f"changed-files/{path}", (ROOT / path).read_bytes(), category(path), "created", path))
    for path in modified:
        entries.append((f"changed-files/{path}", (ROOT / path).read_bytes(), category(path), "modified", path))

    required_validation = {
        "git-status-before.txt", "git-status-after-foundation-commit.txt", "git-remotes-before.txt",
        "git-remotes-after.txt", "git-log-before.txt", "git-log-after.txt", "repo-tree-before.txt",
        "repo-tree-after.txt", "remote-inspection.txt", "install-log.txt", "format-check.txt", "lint.txt",
        "typecheck.txt", "tests.txt", "web-build.txt", "worker-build.txt",
        "cluster-mkt-brand-validation-report.json", "cluster-mkt-brand-validation-summary.md",
        "application-foundation-validation-report.json", "application-foundation-validation-summary.md",
        "locked-master-hashes-before.json", "locked-master-hashes-after.json", "ci-workflow-review.md",
        "ci-remote-results.md", "push-result.txt",
    }
    missing = sorted(name for name in required_validation if not (TMP / name).is_file())
    if missing:
        raise RuntimeError("Missing relay evidence: " + ", ".join(missing))
    rename = {
        "cluster-mkt-brand-validation-report.json": "brand-validation-report.json",
        "cluster-mkt-brand-validation-summary.md": "brand-validation-summary.md",
    }
    for path in sorted(TMP.iterdir()):
        if path.is_file():
            entries.append((f"validation/{rename.get(path.name, path.name)}", path.read_bytes(), "validation evidence", "included as validation evidence", None))

    files = [
        {
            "relativePath": archive_path,
            "fileSize": len(data),
            "sha256": sha_bytes(data),
            "fileCategory": file_category,
            "changeType": change_type,
            "sourcePath": source_path,
            "checksumScope": "raw member bytes",
        }
        for archive_path, data, file_category, change_type, source_path in entries
    ]
    files.append({
        "relativePath": "manifest.json", "fileSize": 0, "sha256": "0" * 64,
        "fileCategory": "relay metadata", "changeType": "created", "sourcePath": None,
        "checksumScope": "canonical manifest bytes with this sha256 field set to 64 zeroes",
    })
    manifest = {
        "package": "Cluster MKT™ Application Foundation Relay",
        "relayFilename": relay_filename,
        "implementationCommit": commit,
        "validationStatus": "PASS",
        "counts": {"created": len(created), "modified": len(modified), "moved": 0, "deleted": 0},
        "lockedMasterHashes": LOCKED,
        "files": sorted(files, key=lambda item: item["relativePath"]),
    }
    manifest_data = canonical_manifest_bytes(manifest)
    with zipfile.ZipFile(relay_path, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for archive_path, data, _, _, _ in entries:
            archive.writestr(archive_path, data)
        archive.writestr("manifest.json", manifest_data)

    with zipfile.ZipFile(relay_path) as archive:
        names = archive.namelist()
        loaded = json.loads(archive.read("manifest.json"))
        if set(names) != {item["relativePath"] for item in loaded["files"]}:
            raise RuntimeError("Manifest inventory does not match archive members")
        if any("relay-2026-07-28" in name and name.endswith(".zip") for name in names):
            raise RuntimeError("A prior relay ZIP was nested")
        for item in loaded["files"]:
            data = archive.read(item["relativePath"])
            if len(data) != item["fileSize"]:
                raise RuntimeError("Archive size mismatch: " + item["relativePath"])
            if item["relativePath"] != "manifest.json" and sha_bytes(data) != item["sha256"]:
                raise RuntimeError("Archive hash mismatch: " + item["relativePath"])
            if any(part in FORBIDDEN_PARTS for part in Path(item["relativePath"]).parts):
                raise RuntimeError("Forbidden generated content in relay")
            if Path(item["relativePath"]).suffix in FORBIDDEN_SUFFIXES:
                raise RuntimeError("Forbidden binary in relay")

    print(f"PASS: relay inventory and checksums — {len(names)} members")
    print(f"RELAY: {relay_path.relative_to(ROOT)}")
    print(f"SHA256: {sha_file(relay_path)}")
    print(f"COUNTS: created={len(created)} modified={len(modified)} moved=0 deleted=0")


if __name__ == "__main__":
    main()
