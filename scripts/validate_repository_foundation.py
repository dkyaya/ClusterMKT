#!/usr/bin/env python3
"""Validate the pre-application Cluster MKT repository foundation."""

from __future__ import annotations

import hashlib
import re
import sys
from pathlib import Path
from xml.etree import ElementTree as ET


ROOT = Path(__file__).resolve().parents[1]
MASTER_DIR = ROOT / "brand" / "source" / "locked-masters"

LOCKED_HASHES = {
    "cluster-mkt-mark-dimensional-light.svg": "66496cfe8dc2d6abb51c5b5a58824ca751db2de0d9a65be621f083bc075b11a1",
    "cluster-mkt-mark-dimensional-dark.svg": "b8c4d7a36ae24daf5bb6e785dc41d9e6c4b01649e5eb5c55959763b5faa3405b",
    "cluster-mkt-mark-flat.svg": "2dfae7aaf3524a80fe86a56f2fb3a1fa01b866c55abf11e3faf86aa6ef8ca992",
    "cluster-mkt-mark-monochrome-black.svg": "037232276468c91ce7bb70daac33bc615f83ee3942855d4bd7b337e074fe5850",
    "cluster-mkt-mark-monochrome-white.svg": "b676c0856aaa5b0c2bca0a687df8519b5c2c069044fa2e40ce0605c44b703542",
}

REQUIRED_FILES = {
    "AGENTS.md", "CLAUDE.md", "README.md", ".editorconfig", ".gitignore",
    "apps/web/README.md", "apps/worker/README.md",
    "packages/core/README.md", "packages/ui/README.md", "packages/config/README.md",
    "pipelines/README.md", "scripts/README.md", "tests/README.md", "relays/README.md",
    "docs/product/PRODUCT_FOUNDATION.md",
    "docs/architecture/PLANNED_ARCHITECTURE.md",
    "docs/decisions/README.md",
    "docs/decisions/0001-repository-layout.md",
    "docs/decisions/0002-shared-agent-guidance.md",
    "docs/decisions/0003-brand-assets-are-locked.md",
    "brand/README.md", "brand/BRAND_GUIDELINES.md",
    "brand/brand-assets-manifest.json", "brand/brand-tokens.css", "brand/brand-tokens.json",
    "brand/build_brand_package.py",
    "brand/validation/validate_cluster_mkt_brand_package.py",
    "scripts/build_brand_relay.py",
}

REQUIRED_IGNORE_LINES = {
    ".DS_Store", "Thumbs.db", "node_modules/", "dist/", "build/", "coverage/",
    ".vite/", ".wrangler/", ".turbo/", ".cache/", ".tmp/", "temp/", "*.log",
    "__pycache__/", "*.py[cod]", ".pytest_cache/", ".mypy_cache/", ".ruff_cache/",
    ".venv/", "venv/", ".env", ".env.*", "!.env.example", "CLAUDE.local.md",
    ".claude/settings.local.json", "playwright-report/", "test-results/",
}

TEXT_SUFFIXES = {".md", ".json", ".css", ".svg", ".html", ".py", ".webmanifest", ".txt"}
FONT_SUFFIXES = {".ttf", ".otf", ".ttc", ".woff", ".woff2"}
PACKAGE_FILES = {"package.json", "package-lock.json", "pnpm-lock.yaml", "yarn.lock", "bun.lockb"}


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def local_name(tag: str) -> str:
    return tag.rsplit("}", 1)[-1]


def markdown_link_problems() -> list[str]:
    problems: list[str] = []
    link_pattern = re.compile(r"(?<!!)\[[^\]]+\]\(([^)]+)\)")
    for markdown in sorted(ROOT.rglob("*.md")):
        if "relays" in markdown.parts and markdown.suffix == ".zip":
            continue
        text = markdown.read_text(encoding="utf-8")
        for raw_target in link_pattern.findall(text):
            target = raw_target.strip().split(" ", 1)[0].strip("<>")
            if not target or target.startswith(("#", "http://", "https://", "mailto:")):
                continue
            file_target = target.split("#", 1)[0]
            resolved = (markdown.parent / file_target).resolve()
            if not resolved.exists():
                problems.append(f"{markdown.relative_to(ROOT)} -> {target}")
    return problems


def command_path_problems() -> list[str]:
    problems: list[str] = []
    command_pattern = re.compile(r"\bpython\s+([A-Za-z0-9_./-]+\.py)\b")
    for markdown in sorted(ROOT.rglob("*.md")):
        for script_path in command_pattern.findall(markdown.read_text(encoding="utf-8")):
            if not (ROOT / script_path).exists():
                problems.append(f"{markdown.relative_to(ROOT)} -> {script_path}")
    return problems


def main() -> None:
    failures: list[str] = []
    passes: list[str] = []

    missing = sorted(path for path in REQUIRED_FILES if not (ROOT / path).exists())
    if missing:
        failures.append("Missing required files: " + ", ".join(missing))
    else:
        passes.append(f"Required structure: {len(REQUIRED_FILES)} required files exist")

    root_entries = {path.name for path in ROOT.iterdir()}
    intended_root = {
        "AGENTS.md", "CLAUDE.md", "README.md", ".editorconfig", ".gitignore",
        "apps", "packages", "pipelines", "brand", "docs", "scripts", "tests", "relays",
    }
    unexpected_root = sorted(root_entries - intended_root)
    if unexpected_root:
        failures.append("Unexpected root entries: " + ", ".join(unexpected_root))
    else:
        passes.append("Root hygiene: only intentional files and directories remain")

    master_problems = []
    for filename, expected in LOCKED_HASHES.items():
        matches = list(ROOT.rglob(filename))
        if matches != [MASTER_DIR / filename]:
            master_problems.append(f"{filename}: expected one canonical path, found {[str(path.relative_to(ROOT)) for path in matches]}")
        elif sha256(matches[0]) != expected:
            master_problems.append(f"{filename}: SHA-256 mismatch")
    if master_problems:
        failures.extend(master_problems)
    else:
        passes.append("Locked masters: one canonical copy each; all five SHA-256 hashes match")

    junk = []
    for path in ROOT.rglob("*"):
        if any(part == "__pycache__" for part in path.parts) or path.name == ".DS_Store" or path.suffix == ".pyc":
            junk.append(str(path.relative_to(ROOT)))
        if path.is_file() and path.suffix.lower() in FONT_SUFFIXES:
            junk.append(str(path.relative_to(ROOT)))
    if junk:
        failures.append("Caches, junk, or font binaries remain: " + ", ".join(sorted(set(junk))))
    else:
        passes.append("Cleanup: no caches, bytecode, .DS_Store, or bundled font binaries")

    package_files = sorted(str(path.relative_to(ROOT)) for path in ROOT.rglob("*") if path.is_file() and path.name in PACKAGE_FILES)
    if package_files:
        failures.append("Application/package scaffolding found: " + ", ".join(package_files))
    else:
        passes.append("Scaffolding boundary: no package manager or application manifests")

    placeholder_code = []
    for directory in (ROOT / "apps", ROOT / "packages", ROOT / "pipelines"):
        placeholder_code.extend(
            str(path.relative_to(ROOT)) for path in directory.rglob("*")
            if path.is_file() and path.name != "README.md"
        )
    if placeholder_code:
        failures.append("Unexpected placeholder implementation files: " + ", ".join(placeholder_code))
    else:
        passes.append("Structural placeholders: README-only; no application code")

    claude_expected = """@AGENTS.md

# Claude Code

- Treat AGENTS.md as the canonical shared repository guidance.
- Do not duplicate shared rules in this file.
- Put Claude-specific local preferences in CLAUDE.local.md, which must remain gitignored.
"""
    if (ROOT / "CLAUDE.md").read_text(encoding="utf-8") != claude_expected:
        failures.append("CLAUDE.md does not match the canonical import contract")
    else:
        passes.append("Agent compatibility: CLAUDE.md imports canonical AGENTS.md exactly")
    agent_lines = len((ROOT / "AGENTS.md").read_text(encoding="utf-8").splitlines())
    if agent_lines >= 200:
        failures.append(f"AGENTS.md is not concise: {agent_lines} lines")
    else:
        passes.append(f"Agent guidance: AGENTS.md is concise at {agent_lines} lines")

    ignore_lines = {
        line.strip() for line in (ROOT / ".gitignore").read_text(encoding="utf-8").splitlines()
        if line.strip() and not line.lstrip().startswith("#")
    }
    missing_ignores = sorted(REQUIRED_IGNORE_LINES - ignore_lines)
    if missing_ignores:
        failures.append(".gitignore missing: " + ", ".join(missing_ignores))
    else:
        passes.append("Git hygiene: all required local-artifact patterns are ignored")

    markdown_problems = markdown_link_problems()
    if markdown_problems:
        failures.append("Broken Markdown links: " + "; ".join(markdown_problems))
    else:
        passes.append("Path references: all local Markdown links resolve")
    command_problems = command_path_problems()
    if command_problems:
        failures.append("Broken documented script paths: " + "; ".join(command_problems))
    else:
        passes.append("Path references: all documented Python command paths exist")

    svg_problems = []
    for svg in sorted((ROOT / "brand").rglob("*.svg")):
        root = ET.parse(svg).getroot()
        names = [local_name(element.tag) for element in root.iter()]
        text = svg.read_text(encoding="utf-8").lower()
        if "image" in names or "data:image" in text or "base64" in text:
            svg_problems.append(str(svg.relative_to(ROOT)))
    if svg_problems:
        failures.append("Raster embedding found in production SVG: " + ", ".join(svg_problems))
    else:
        passes.append("SVG safety: no production SVG embeds raster data")

    forbidden_reference_files = sorted(
        str(path.relative_to(ROOT)) for path in ROOT.rglob("*")
        if path.is_file() and any(term in path.name.lower() for term in ("checkerboard-reference", "dimensional-reference", "vector-deliverables-reference"))
    )
    if forbidden_reference_files:
        failures.append("Obsolete baked-checkerboard references remain: " + ", ".join(forbidden_reference_files))
    else:
        passes.append("Reference cleanup: no baked-checkerboard development files remain")

    env_files = sorted(
        str(path.relative_to(ROOT)) for path in ROOT.rglob(".env*")
        if path.name != ".env.example"
    )
    secret_hits = []
    secret_pattern = re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|\bsk-[A-Za-z0-9]{20,}")
    for path in ROOT.rglob("*"):
        if path.is_file() and path.suffix.lower() in TEXT_SUFFIXES:
            if secret_pattern.search(path.read_text(encoding="utf-8", errors="ignore")):
                secret_hits.append(str(path.relative_to(ROOT)))
    if env_files or secret_hits:
        failures.append("Potential secret files/content: " + ", ".join(env_files + secret_hits))
    else:
        passes.append("Secret hygiene: no real .env file or key-like content detected")

    extracted_relay_dirs = sorted(
        str(path.relative_to(ROOT)) for path in ROOT.rglob("*")
        if path.is_dir() and path.name in {"changed-files", "validation", "previews"} and "relays" in path.parts
    )
    if extracted_relay_dirs:
        failures.append("Extracted relay directory remains: " + ", ".join(extracted_relay_dirs))
    else:
        passes.append("Relay hygiene: no extracted relay trees remain under relays/")

    for message in passes:
        print(f"PASS: {message}")
    for message in failures:
        print(f"FAIL: {message}")
    print(f"SUMMARY: {len(passes)} passed, {len(failures)} failed")
    if failures:
        sys.exit(1)


if __name__ == "__main__":
    main()
