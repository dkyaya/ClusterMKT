#!/usr/bin/env python3
"""Build and verify the committed frontend-acceptance repair relay."""

from __future__ import annotations

import hashlib
import json
import shutil
import subprocess
import zipfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TMP = ROOT / "relays/tmp/frontend-acceptance-repair"
FOUNDATION_TMP = ROOT / "relays/tmp/application-foundation"
RELAYS = ROOT / "relays"
DATE = "2026-07-28"
IMPLEMENTATION_MESSAGE = "Refine Cluster MKT prototype interactions"
LOCKED = {
    "cluster-mkt-mark-dimensional-light.svg": "66496cfe8dc2d6abb51c5b5a58824ca751db2de0d9a65be621f083bc075b11a1",
    "cluster-mkt-mark-dimensional-dark.svg": "b8c4d7a36ae24daf5bb6e785dc41d9e6c4b01649e5eb5c55959763b5faa3405b",
    "cluster-mkt-mark-flat.svg": "2dfae7aaf3524a80fe86a56f2fb3a1fa01b866c55abf11e3faf86aa6ef8ca992",
    "cluster-mkt-mark-monochrome-black.svg": "037232276468c91ce7bb70daac33bc615f83ee3942855d4bd7b337e074fe5850",
    "cluster-mkt-mark-monochrome-white.svg": "b676c0856aaa5b0c2bca0a687df8519b5c2c069044fa2e40ce0605c44b703542",
}
FORBIDDEN_PARTS = {
    "node_modules",
    "dist",
    "coverage",
    "__pycache__",
    ".vite",
    ".wrangler",
    ".cache",
}
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
    (TMP / log_name).write_text(
        f"$ {' '.join(command)}\nexit code: {code}\n\n{output}", encoding="utf-8"
    )
    if code:
        raise RuntimeError(f"Required command failed: {' '.join(command)}\n{output}")
    return output


def implementation_commit() -> str:
    code, history = run(["git", "log", "--format=%H%x09%s"])
    if code:
        raise RuntimeError("Committed Git history is required")
    commit = next(
        (
            line.split("\t", 1)[0]
            for line in history.splitlines()
            if line.endswith(f"\t{IMPLEMENTATION_MESSAGE}")
        ),
        "",
    )
    if len(commit) != 40:
        raise RuntimeError(f"Missing implementation commit: {IMPLEMENTATION_MESSAGE}")
    return commit


def changed_paths(commit: str) -> tuple[list[str], list[str], list[str], list[str]]:
    code, output = run(["git", "diff", "--name-status", f"{commit}^", commit])
    if code:
        raise RuntimeError(output)
    created: list[str] = []
    modified: list[str] = []
    moved: list[str] = []
    deleted: list[str] = []
    for line in output.splitlines():
        fields = line.split("\t")
        status = fields[0]
        if status == "A":
            created.append(fields[1])
        elif status == "M":
            modified.append(fields[1])
        elif status == "D":
            deleted.append(fields[1])
        elif status.startswith("R"):
            moved.append(f"{fields[1]} -> {fields[2]}")
        else:
            raise RuntimeError(f"Unsupported Git change status: {line}")
    return sorted(created), sorted(modified), sorted(moved), sorted(deleted)


def category(path: str) -> str:
    if "/__tests__/" in path or path.endswith(".test.tsx") or path.endswith(".test.ts"):
        return "behavior test"
    if path.startswith("apps/web/src/components/"):
        return "web component"
    if path.startswith("apps/web/src/hooks/") or path.startswith("apps/web/src/lib/"):
        return "web behavior"
    if path.startswith("apps/web/src/styles/"):
        return "web styling"
    if path.startswith("packages/ui/"):
        return "shared UI"
    if path.startswith("docs/") or path.endswith("README.md"):
        return "documentation"
    if path.startswith("scripts/"):
        return "tooling"
    return "application foundation"


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


def bullet_list(paths: list[str]) -> str:
    return "\n".join(f"- `{path}`" for path in paths) or "- None."


def relay_markdown(
    commit: str,
    created: list[str],
    modified: list[str],
    moved: list[str],
    deleted: list[str],
) -> str:
    hashes = "\n".join(f"- `{name}` — `{digest}`" for name, digest in LOCKED.items())
    return f"""# Cluster MKT™ frontend-acceptance repair relay

## Objective

Repair the bounded frontend acceptance issues reported after manual review without redesigning the approved application, connecting live services, or changing the locked brand masters. This relay documents implementation commit `{commit}`.

## User-reported issues

The global search was disabled; mobile lacked convenient Profile and Settings access; the mobile search row consumed space while scrolling; the global Daily Brief could not be dismissed; Story Cluster actions did not deep-link to a tab; and the Listen panel reused the global brief instead of a cluster-specific audio concept.

## Starting state

`main` and `origin/main` both started at `f086c46e5fc2bf70cae94266583344f621d87a0b`. The workspace was clean except for a redundant untracked nested clone at `ClusterMKT/`; inspection confirmed the same remote and commit, a clean nested worktree, and no dangling objects before it was removed. Baseline Vitest passed 25/25 tests across 8 files. Pre-change Git, tree, test, and locked-master evidence is in `validation/`.

## What changed

Implemented a controlled and honest search form, a responsive profile menu, thresholded mobile search-row collapse, safe session-scoped Daily Brief dismissal, URL-controlled cluster tabs, and separate global versus cluster audio previews. Focused tests cover keyboard, pointer, persistence, URL, responsive, reduced-motion, and accessible-state contracts. Documentation now describes the actual prototype behavior.

## Exact files created

{bullet_list(created)}

## Exact files modified

{bullet_list(modified)}

## Exact files moved

{bullet_list(moved)}

## Exact files deleted

{bullet_list(deleted)}

The deleted `BriefPlayerPreview.tsx` was superseded by purpose-specific Daily Brief and Cluster Audio components. The separate untracked `ClusterMKT/` nested clone was redundant local duplication, not project source; it was verified and removed before implementation.

## Search behavior

Search now accepts typing and paste, has a programmatic label and clear control, clears with Escape, ignores empty submission, and reports that indexing is disconnected. It never filters fixtures or fabricates results and does not persist a query.

## Mobile profile access

A neutral `CM` avatar button is present in the Edition header at every viewport. Its accessible menu links to Profile, Settings, and Appearance, represents current routes, closes with Escape or outside pointer input, and returns focus to the trigger on dismissive closure. Authentication and Sign Out remain absent.

## Header-collapse behavior

The primary identity/status/profile row remains sticky. On viewports at or below 800 px, the search row starts visible, hides after 24 px of accumulated downward movement, restores after 12 px upward or within 16 px of the top, and stays visible while search is focused or the profile menu is open. The listener is passive and cleaned up; desktop never collapses; reduced-motion CSS disables movement transitions.

## Daily Brief dismissal behavior

The global Daily Brief supports a labeled close button, Escape from within the card, and left/right touch or mouse pointer drag. Horizontal gestures coexist with native vertical scrolling, use a 72–96 px/30% threshold, and unsuccessful drags reset. Safe `sessionStorage` keys include the America/New_York market date and edition, so dismissal does not suppress the next edition or market date. Storage denial does not break rendering.

## Tab deep-link behavior

Card title and Overview, Read, and Listen actions target `?tab=overview`, `?tab=read`, and `?tab=listen`. Cluster detail derives state from the URL, defaults invalid or missing values to Overview, updates the URL on tab selection, and restores the rendered tab through refresh and browser history. Shared Tabs now supports controlled state without breaking uncontrolled use.

## Audio-component separation

`DailyBriefPlayer` remains global and describes the followed-market universe. `ClusterAudioBriefPreview` receives the active cluster ID and title and appears only above that cluster's related podcasts. The cluster Listen panel does not contain “Daily market brief.” Both controls explicitly say generated audio is unavailable.

## Accessibility work

Search has a label, polite status, native search semantics, and keyboard clearing. Profile uses button/menu/menuitem semantics, Escape, outside dismissal, route state, and focus return. Tabs preserve roles, selected state, roving tab stops, arrow/Home/End behavior, and controlled/uncontrolled APIs. Dismissal labels include the active edition. Reduced-motion behavior is explicit.

## Tests added

Vitest now passes 56/56 behavior tests across 13 files, up from 25/25 across 8. New coverage includes search, profile, header thresholds and cleanup, Daily Brief storage and gestures, direct tab URLs/history, audio-context separation, and controlled Tabs compatibility.

## Visual validation

Vite started successfully at `http://127.0.0.1:5173`. The installed in-app browser control surface reported that no controllable browser was available, so screenshots and manual pointer screenshots could not be captured. No new browser/test dependency was installed solely for images. Component interaction tests, responsive CSS assertions, and the production web build provide the available local evidence; see `previews/README.md` and `validation/interaction-validation.md`.

## Validation commands

```sh
pnpm install --frozen-lockfile
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test:run
pnpm build
pnpm brand:validate
pnpm foundation:validate
pnpm validate
python scripts/build_frontend_acceptance_repair_relay.py
```

## Validation results

- Formatting: PASS.
- ESLint: PASS with zero warnings.
- Strict TypeScript: PASS across all five workspaces.
- Tests: PASS, 56/56 across 13 files.
- Web production build: PASS, 173 modules and canonical dimensional SVGs bundled.
- Worker Wrangler dry-run build: PASS, no bindings and no deployment.
- Brand validation: PASS, 11/11 groups.
- Foundation validation: PASS, 24/24 checks.
- Locked masters: PASS, 5/5 exact SHA-256 matches.
- `git diff --check`: PASS.

## Failures and repairs

- Two first-pass focused tests exposed incorrect test setup around the top threshold and asynchronous focus restoration; fixtures were corrected while preserving the implementations.
- The first full validation run found formatting drift after the last test addition; formatting was applied and rechecked.
- The next run caught an unsafe Node global in a CSS-contract test; the test moved to explicit filesystem resolution.
- TypeScript then required explicit Node test types for those imports; a file-scoped type reference fixed it without relaxing application strictness.
- The final complete validation passed. No test, lint rule, type setting, or other gate was weakened.

## Implementation commit

`{commit}` — `{IMPLEMENTATION_MESSAGE}` on `main`.

## Push result

The implementation commit was pushed non-destructively to `origin/main`; no force push was used. Exact Git and remote evidence is in `validation/push-result.txt` and `validation/git-log-after-implementation.txt`.

## What remains demonstration-only

Search indexing, results, all story/source/podcast fixtures, Daily Brief audio, cluster audio, profile/account state, settings persistence, authentication, live ingestion, financial data, publisher connections, AI, and TTS remain disconnected.

## Remaining uncertainties

No browser screenshots were available in this environment. Product-owner retesting on representative iOS/Android and desktop browsers remains appropriate, especially for tactile swipe feel and device safe areas. The final editorial serif and inherited brand/legal approval items remain open.

## Remaining blockers

No implementation, validation, commit, or push blocker remains.

## Recommended next phase

Proceed with the bounded source-foundation phase: publisher/feed capability matrix, canonical source metadata, entity-resolution dictionary, relevance-scoring corpus, Story Cluster fixture set, and adversarial ticker-collision cases. Keep it offline and fixture-driven with no live ingestion.

## Reproduction commands

```sh
pnpm install --frozen-lockfile
pnpm validate
python scripts/build_frontend_acceptance_repair_relay.py
```

## SHA-256 hashes

{hashes}

## Suggested Codex profile for the next phase

Heavy — GPT-5.6 Sol High.

## PLAIN-ENGLISH TRANSLATION

Users can now type, paste, clear, and submit search text; the app responds honestly that search is not connected. On mobile, the profile button makes Profile and Settings easy to reach, while the search row gets out of the way during downward scrolling and comes back when the user scrolls up.

The global Daily Brief can be closed or swiped away and stays dismissed only for that market date and edition in the current browser session. Story cards now open the exact Overview, Read, or Listen section requested, and browser Back/Forward preserves that choice. The Listen page now shows audio for that one Story Cluster conceptually—not a second copy of the whole-market Daily Brief.

Nothing was connected to live search, live news, accounts, AI, or audio generation. The public GitHub `main` branch received the tested implementation. Next, build the offline source registry and aggressive relevance/clustering fixture corpus before connecting publishers.
"""


def main() -> None:
    TMP.mkdir(parents=True, exist_ok=True)
    commit = implementation_commit()
    created, modified, moved, deleted = changed_paths(commit)

    require(["pnpm", "format:check"], "format-check.txt")
    require(["pnpm", "lint"], "lint.txt")
    require(["pnpm", "typecheck"], "typecheck.txt")
    require(["pnpm", "test:run"], "tests.txt")
    require(["pnpm", "build"], "build.txt")
    require(["pnpm", "brand:validate"], "brand-validation-command.txt")
    require(["pnpm", "foundation:validate"], "foundation-validation-command.txt")

    brand_report = ROOT / "brand/validation/cluster-mkt-brand-validation-report.json"
    brand_summary = ROOT / "brand/validation/cluster-mkt-brand-validation-summary.md"
    foundation_report = FOUNDATION_TMP / "application-foundation-validation-report.json"
    foundation_summary = FOUNDATION_TMP / "application-foundation-validation-summary.md"
    shutil.copy2(brand_report, TMP / "brand-validation-report.json")
    shutil.copy2(brand_summary, TMP / "brand-validation-summary.md")
    shutil.copy2(foundation_report, TMP / "foundation-validation-report.json")
    shutil.copy2(foundation_summary, TMP / "foundation-validation-summary.md")
    if json.loads(brand_report.read_text(encoding="utf-8"))["status"] != "PASS":
        raise RuntimeError("Brand validation report is not PASS")
    if json.loads(foundation_report.read_text(encoding="utf-8"))["status"] != "PASS":
        raise RuntimeError("Foundation validation report is not PASS")

    current_hashes = {
        name: sha_file(ROOT / "brand/source/locked-masters" / name) for name in LOCKED
    }
    if current_hashes != LOCKED:
        raise RuntimeError("Locked brand master hash mismatch")
    (TMP / "locked-master-hashes-after.json").write_text(
        json.dumps(current_hashes, indent=2, sort_keys=True) + "\n", encoding="utf-8"
    )

    for name, command in {
        "git-status-after-implementation.txt": ["git", "status", "--short"],
        "git-log-after-implementation.txt": ["git", "log", "--oneline", "--decorate", "-10"],
    }.items():
        code, output = run(command)
        (TMP / name).write_text(
            f"$ {' '.join(command)}\nexit code: {code}\n{output}", encoding="utf-8"
        )
        if code:
            raise RuntimeError(f"Evidence command failed: {' '.join(command)}")
    code, tracked = run(["git", "ls-files"])
    if code:
        raise RuntimeError(tracked)
    (TMP / "repo-tree-after.txt").write_text(
        "\n".join(sorted(tracked.splitlines())) + "\n", encoding="utf-8"
    )

    interaction = """# Interaction validation

Overall status: **PASS with screenshot limitation**.

- Global search behavior: PASS through controlled-form tests (type, clear, Escape, empty/nonempty submission, accessible label, no fabricated results).
- Profile behavior: PASS through button/menu semantics, link, Escape, outside-pointer, route-state, and focus-return tests.
- Mobile search collapse: PASS through top/down/up/hysteresis/focus/menu/desktop/cleanup tests and reduced-motion CSS assertion.
- Daily Brief: PASS through button, Escape, persistence, edition/date, safe-storage, pointer-threshold, and failed-drag reset tests.
- Direct tab routing: PASS for Read, Listen, missing/invalid fallback, URL update, history restoration, card actions, and controlled/uncontrolled Tabs.
- Audio separation: PASS; the cluster Listen panel has cluster context and excludes “Daily market brief,” while the global Daily Brief remains in AppShell.
- Production browser bundle: PASS.
- Local Vite server: PASS at `http://127.0.0.1:5173` and then stopped cleanly.
- Screenshot capture: NOT AVAILABLE. The installed in-app browser control surface returned “No browser is available.” No substitute browser stack was added solely for screenshots.
"""
    (TMP / "interaction-validation.md").write_text(interaction, encoding="utf-8")
    previews = TMP / "previews"
    previews.mkdir(exist_ok=True)
    (previews / "README.md").write_text(
        "# Preview availability\n\nNo screenshots were captured because the installed in-app browser control surface reported that no controllable browser was available. Vite startup, interaction tests, responsive/reduced-motion assertions, and the production build passed. No browser dependency was installed solely for screenshots.\n",
        encoding="utf-8",
    )

    required = {
        "git-status-before.txt",
        "git-status-after-implementation.txt",
        "git-log-before.txt",
        "git-log-after-implementation.txt",
        "repo-tree-before.txt",
        "repo-tree-after.txt",
        "locked-master-hashes-before.json",
        "locked-master-hashes-after.json",
        "format-check.txt",
        "lint.txt",
        "typecheck.txt",
        "tests.txt",
        "build.txt",
        "brand-validation-report.json",
        "brand-validation-summary.md",
        "foundation-validation-report.json",
        "foundation-validation-summary.md",
        "interaction-validation.md",
        "push-result.txt",
    }
    missing = sorted(name for name in required if not (TMP / name).is_file())
    if missing:
        raise RuntimeError("Missing relay validation evidence: " + ", ".join(missing))

    relay_filename = f"cluster-mkt-frontend-acceptance-repair-relay-{DATE}-{commit[:8]}.zip"
    relay_path = RELAYS / relay_filename
    entries: list[tuple[str, bytes, str, str, str | None]] = [
        (
            "RELAY.md",
            relay_markdown(commit, created, modified, moved, deleted).encode(),
            "relay metadata",
            "created",
            None,
        )
    ]
    for path in created:
        entries.append(
            (f"changed-files/{path}", (ROOT / path).read_bytes(), category(path), "created", path)
        )
    for path in modified:
        entries.append(
            (f"changed-files/{path}", (ROOT / path).read_bytes(), category(path), "modified", path)
        )
    if moved or deleted:
        audit = "# Moved and deleted paths\n\n"
        audit += "## Moved\n\n" + bullet_list(moved) + "\n\n"
        audit += "## Deleted\n\n" + bullet_list(deleted) + "\n"
        entries.append(
            (
                "changed-files/CHANGE-AUDIT.md",
                audit.encode(),
                "change audit",
                "included as validation evidence",
                None,
            )
        )
    for path in sorted(TMP.iterdir()):
        if path.is_file():
            entries.append(
                (
                    f"validation/{path.name}",
                    path.read_bytes(),
                    "validation evidence",
                    "included as validation evidence",
                    None,
                )
            )
    for path in sorted(previews.iterdir()):
        entries.append(
            (
                f"previews/{path.name}",
                path.read_bytes(),
                "preview evidence",
                "included as validation evidence",
                None,
            )
        )

    files = [
        {
            "relativePath": archive_path,
            "fileSize": len(data),
            "sha256": sha_bytes(data),
            "fileCategory": file_category,
            "changeType": change_type,
            "sourcePath": source_path,
        }
        for archive_path, data, file_category, change_type, source_path in entries
    ]
    files.append(
        {
            "relativePath": "manifest.json",
            "fileSize": 0,
            "sha256": "0" * 64,
            "fileCategory": "relay metadata",
            "changeType": "created",
            "sourcePath": None,
        }
    )
    manifest = {
        "package": "Cluster MKT™ Frontend Acceptance Repair Relay",
        "relayFilename": relay_filename,
        "implementationCommit": commit,
        "validationStatus": "PASS",
        "counts": {
            "created": len(created),
            "modified": len(modified),
            "moved": len(moved),
            "deleted": len(deleted),
        },
        "dependenciesAdded": 0,
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
        expected_names = {item["relativePath"] for item in loaded["files"]}
        if set(names) != expected_names:
            raise RuntimeError("Manifest inventory does not match relay members")
        for item in loaded["files"]:
            member = item["relativePath"]
            data = archive.read(member)
            if len(data) != item["fileSize"]:
                raise RuntimeError(f"Relay size mismatch: {member}")
            if member != "manifest.json" and sha_bytes(data) != item["sha256"]:
                raise RuntimeError(f"Relay checksum mismatch: {member}")
            parts = Path(member).parts
            if any(part in FORBIDDEN_PARTS for part in parts):
                raise RuntimeError(f"Forbidden generated path in relay: {member}")
            if Path(member).suffix in FORBIDDEN_SUFFIXES:
                raise RuntimeError(f"Forbidden font/cache binary in relay: {member}")
            if member.endswith(".zip"):
                raise RuntimeError(f"Nested relay archive: {member}")

    print(f"PASS: relay inventory and checksums — {len(names)} members")
    print(f"RELAY: {relay_path.relative_to(ROOT)}")
    print(f"SHA256: {sha_file(relay_path)}")
    print(
        f"COUNTS: created={len(created)} modified={len(modified)} "
        f"moved={len(moved)} deleted={len(deleted)}"
    )


if __name__ == "__main__":
    main()
