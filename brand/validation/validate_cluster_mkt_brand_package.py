#!/usr/bin/env python3
"""Comprehensive validator for the Cluster MKT full brand package."""

from __future__ import annotations

import hashlib
import json
import math
import re
import sys
import tempfile
from collections import Counter
from pathlib import Path
from xml.etree import ElementTree as ET

from PIL import Image, ImageStat
from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[2]
BRAND = ROOT / "brand"
MASTER_DIR = BRAND / "source" / "locked-masters"
REPORT_PATH = BRAND / "validation" / "cluster-mkt-brand-validation-report.json"
SUMMARY_PATH = BRAND / "validation" / "cluster-mkt-brand-validation-summary.md"

LOCKED_HASHES = {
    "cluster-mkt-mark-dimensional-light.svg": "66496cfe8dc2d6abb51c5b5a58824ca751db2de0d9a65be621f083bc075b11a1",
    "cluster-mkt-mark-dimensional-dark.svg": "b8c4d7a36ae24daf5bb6e785dc41d9e6c4b01649e5eb5c55959763b5faa3405b",
    "cluster-mkt-mark-flat.svg": "2dfae7aaf3524a80fe86a56f2fb3a1fa01b866c55abf11e3faf86aa6ef8ca992",
    "cluster-mkt-mark-monochrome-black.svg": "037232276468c91ce7bb70daac33bc615f83ee3942855d4bd7b337e074fe5850",
    "cluster-mkt-mark-monochrome-white.svg": "b676c0856aaa5b0c2bca0a687df8519b5c2c069044fa2e40ce0605c44b703542",
}

EXPECTED_FILES = [
    "README.md",
    "BRAND_GUIDELINES.md",
    "brand-tokens.json",
    "brand-tokens.css",
    "brand-assets-manifest.json",
    "source/README.md",
    "source/locked-masters/cluster-mkt-mark-dimensional-light.svg",
    "source/locked-masters/cluster-mkt-mark-dimensional-dark.svg",
    "source/locked-masters/cluster-mkt-mark-flat.svg",
    "source/locked-masters/cluster-mkt-mark-monochrome-black.svg",
    "source/locked-masters/cluster-mkt-mark-monochrome-white.svg",
    "source/reference-exports/cluster-mkt-mark-dimensional-light-2048.png",
    "source/reference-exports/cluster-mkt-mark-dimensional-dark-2048.png",
    "source/reference-exports/cluster-mkt-mark-flat-1024.png",
    "source/reference-exports/cluster-mkt-mark-monochrome-black-1024.png",
    "source/reference-exports/cluster-mkt-mark-monochrome-white-1024.png",
    "source/original-validation/cluster-mkt-asset-validation-report.json",
    "source/original-validation/cluster-mkt-assets-manifest.md",
    "source/original-validation/export_and_validate_cluster_mkt_assets.py",
    "svg/cluster-mkt-wordmark-light-text.svg",
    "svg/cluster-mkt-wordmark-dark-text.svg",
    "svg/cluster-mkt-wordmark-light-outlined.svg",
    "svg/cluster-mkt-wordmark-dark-outlined.svg",
    "svg/cluster-mkt-wordmark-light-tm-outlined.svg",
    "svg/cluster-mkt-wordmark-dark-tm-outlined.svg",
    "svg/cluster-mkt-lockup-horizontal-light.svg",
    "svg/cluster-mkt-lockup-horizontal-dark.svg",
    "svg/cluster-mkt-lockup-horizontal-light-tm.svg",
    "svg/cluster-mkt-lockup-horizontal-dark-tm.svg",
    "svg/cluster-mkt-lockup-stacked-light.svg",
    "svg/cluster-mkt-lockup-stacked-dark.svg",
    "svg/cluster-mkt-lockup-stacked-light-tm.svg",
    "svg/cluster-mkt-lockup-stacked-dark-tm.svg",
    "svg/cluster-mkt-tagline-lockup-horizontal-light.svg",
    "svg/cluster-mkt-tagline-lockup-horizontal-dark.svg",
    "svg/cluster-mkt-tagline-lockup-stacked-light.svg",
    "svg/cluster-mkt-tagline-lockup-stacked-dark.svg",
    "png/cluster-mkt-lockup-horizontal-light-2048.png",
    "png/cluster-mkt-lockup-horizontal-dark-2048.png",
    "png/cluster-mkt-lockup-horizontal-light-tm-2048.png",
    "png/cluster-mkt-lockup-horizontal-dark-tm-2048.png",
    "png/cluster-mkt-lockup-stacked-light-2048.png",
    "png/cluster-mkt-lockup-stacked-dark-2048.png",
    "png/cluster-mkt-tagline-lockup-horizontal-light-2048.png",
    "png/cluster-mkt-tagline-lockup-horizontal-dark-2048.png",
    "png/cluster-mkt-tagline-lockup-stacked-light-2048.png",
    "png/cluster-mkt-tagline-lockup-stacked-dark-2048.png",
    "icons/favicon-16.png",
    "icons/favicon-32.png",
    "icons/favicon-48.png",
    "icons/favicon-64.png",
    "icons/favicon.ico",
    "icons/apple-touch-icon-180.png",
    "icons/cluster-mkt-icon-192.png",
    "icons/cluster-mkt-icon-512.png",
    "icons/cluster-mkt-icon-maskable-192.png",
    "icons/cluster-mkt-icon-maskable-512.png",
    "icons/cluster-mkt-safari-pinned-tab.svg",
    "icons/site.webmanifest",
    "social/cluster-mkt-og-default-1200x630.png",
    "social/cluster-mkt-og-light-1200x630.png",
    "social/cluster-mkt-og-dark-1200x630.png",
    "social/cluster-mkt-profile-light-1080.png",
    "social/cluster-mkt-profile-dark-1080.png",
    "social/cluster-mkt-social-banner-light-1500x500.png",
    "social/cluster-mkt-social-banner-dark-1500x500.png",
    "motion/cluster-mkt-motion-spec.md",
    "motion/cluster-mkt-motion-tokens.css",
    "motion/cluster-mkt-logo-convergence-demo.html",
    "previews/cluster-mkt-brand-sheet-light.png",
    "previews/cluster-mkt-brand-sheet-dark.png",
    "previews/cluster-mkt-icon-size-test.png",
    "previews/cluster-mkt-edition-palette-preview.png",
    "previews/cluster-mkt-lockup-preview.png",
    "validation/validate_cluster_mkt_brand_package.py",
]

EXPECTED_PNG_DIMENSIONS = {
    "png/cluster-mkt-lockup-horizontal-light-2048.png": (2048, 683),
    "png/cluster-mkt-lockup-horizontal-dark-2048.png": (2048, 683),
    "png/cluster-mkt-lockup-horizontal-light-tm-2048.png": (2048, 683),
    "png/cluster-mkt-lockup-horizontal-dark-tm-2048.png": (2048, 683),
    "png/cluster-mkt-lockup-stacked-light-2048.png": (2048, 2048),
    "png/cluster-mkt-lockup-stacked-dark-2048.png": (2048, 2048),
    "png/cluster-mkt-tagline-lockup-horizontal-light-2048.png": (2048, 652),
    "png/cluster-mkt-tagline-lockup-horizontal-dark-2048.png": (2048, 652),
    "png/cluster-mkt-tagline-lockup-stacked-light-2048.png": (2048, 2048),
    "png/cluster-mkt-tagline-lockup-stacked-dark-2048.png": (2048, 2048),
    "icons/favicon-16.png": (16, 16),
    "icons/favicon-32.png": (32, 32),
    "icons/favicon-48.png": (48, 48),
    "icons/favicon-64.png": (64, 64),
    "icons/apple-touch-icon-180.png": (180, 180),
    "icons/cluster-mkt-icon-192.png": (192, 192),
    "icons/cluster-mkt-icon-512.png": (512, 512),
    "icons/cluster-mkt-icon-maskable-192.png": (192, 192),
    "icons/cluster-mkt-icon-maskable-512.png": (512, 512),
    "social/cluster-mkt-og-default-1200x630.png": (1200, 630),
    "social/cluster-mkt-og-light-1200x630.png": (1200, 630),
    "social/cluster-mkt-og-dark-1200x630.png": (1200, 630),
    "social/cluster-mkt-profile-light-1080.png": (1080, 1080),
    "social/cluster-mkt-profile-dark-1080.png": (1080, 1080),
    "social/cluster-mkt-social-banner-light-1500x500.png": (1500, 500),
    "social/cluster-mkt-social-banner-dark-1500x500.png": (1500, 500),
    "previews/cluster-mkt-brand-sheet-light.png": (1600, 1200),
    "previews/cluster-mkt-brand-sheet-dark.png": (1600, 1200),
    "previews/cluster-mkt-icon-size-test.png": (1600, 720),
    "previews/cluster-mkt-edition-palette-preview.png": (1600, 1000),
    "previews/cluster-mkt-lockup-preview.png": (1800, 1400),
}

TRANSPARENT_PNGS = {
    name for name in EXPECTED_PNG_DIMENSIONS
    if name.startswith("png/")
    or (name.startswith("icons/") and "maskable" not in name)
}

SVG_NS = "http://www.w3.org/2000/svg"
CHECKS: list[dict[str, object]] = []


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def local_name(tag: str) -> str:
    return tag.rsplit("}", 1)[-1]


def record(name: str, passed: bool, detail: str) -> None:
    CHECKS.append({"name": name, "status": "PASS" if passed else "FAIL", "detail": detail})


def rgb(hex_color: str) -> tuple[int, int, int]:
    value = hex_color.lstrip("#")
    return tuple(int(value[index:index + 2], 16) for index in (0, 2, 4))


def relative_luminance(hex_color: str) -> float:
    channels = [value / 255 for value in rgb(hex_color)]
    linear = [value / 12.92 if value <= 0.04045 else ((value + 0.055) / 1.055) ** 2.4 for value in channels]
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]


def contrast_ratio(first: str, second: str) -> float:
    first_luminance = relative_luminance(first)
    second_luminance = relative_luminance(second)
    return (max(first_luminance, second_luminance) + 0.05) / (min(first_luminance, second_luminance) + 0.05)


def check_expected_files() -> None:
    missing = [name for name in EXPECTED_FILES if not (BRAND / name).exists()]
    record("Required filenames", not missing, "All required files exist." if not missing else "Missing: " + ", ".join(missing))


def check_locked_masters() -> None:
    failures = []
    for filename, expected in LOCKED_HASHES.items():
        path = MASTER_DIR / filename
        actual = sha256(path) if path.exists() else "missing"
        if actual != expected:
            failures.append(f"{filename}: {actual}")
    record("Locked master integrity", not failures, "All five masters retain their original SHA-256 hashes." if not failures else "; ".join(failures))


def collect_allowed_colors() -> set[str]:
    colors: set[str] = {"#000000", "#FFFFFF"}
    for path in [MASTER_DIR / name for name in LOCKED_HASHES]:
        colors.update(value.upper() for value in re.findall(r"#[0-9a-fA-F]{6}", path.read_text(encoding="utf-8")))
    tokens = json.loads((BRAND / "brand-tokens.json").read_text(encoding="utf-8"))
    colors.update(value.upper() for value in re.findall(r"#[0-9a-fA-F]{6}", json.dumps(tokens)))
    return colors


def sphere_geometry(root: ET.Element) -> list[tuple[str, str, str, str, str]]:
    spheres = [element for element in root.iter() if element.get("data-sphere")]
    spheres.sort(key=lambda element: int(element.get("data-stack", "0")))
    return [
        (element.get("data-sphere", ""), element.get("data-stack", ""), element.get("cx", ""), element.get("cy", ""), element.get("r", ""))
        for element in spheres
    ]


def check_svgs() -> None:
    svg_paths = sorted((BRAND / "svg").glob("*.svg")) + [BRAND / "icons" / "cluster-mkt-safari-pinned-tab.svg"]
    allowed_colors = collect_allowed_colors()
    problems: list[str] = []
    geometry_problems: list[str] = []
    flat_geometry = sphere_geometry(ET.parse(MASTER_DIR / "cluster-mkt-mark-flat.svg").getroot())
    for path in svg_paths:
        try:
            root = ET.parse(path).getroot()
        except ET.ParseError as error:
            problems.append(f"{path.name}: invalid XML ({error})")
            continue
        view_box = root.get("viewBox", "")
        parts = view_box.split()
        if len(parts) != 4 or any(not math.isfinite(float(part)) for part in parts) or float(parts[2]) <= 0 or float(parts[3]) <= 0:
            problems.append(f"{path.name}: invalid viewBox {view_box!r}")
        names = [local_name(element.tag) for element in root.iter()]
        text = path.read_text(encoding="utf-8")
        if "image" in names or "data:image" in text.lower() or "base64" in text.lower():
            problems.append(f"{path.name}: raster embedding found")
        if "pattern" in names or "checkerboard" in text.lower():
            problems.append(f"{path.name}: pattern/checkerboard found")
        if "rect" in names:
            problems.append(f"{path.name}: rectangle found on production SVG canvas")
        if re.search(r"background(?:-color)?\s*:", text, flags=re.I):
            problems.append(f"{path.name}: canvas background style found")
        ids = [element.get("id") for element in root.iter() if element.get("id")]
        if len(ids) != len(set(ids)):
            problems.append(f"{path.name}: duplicate IDs")
        for element in root.iter():
            name = local_name(element.tag)
            if name in {"radialGradient", "linearGradient", "filter", "mask", "clipPath"} and len(element.get("id", "")) < 10:
                problems.append(f"{path.name}: non-descriptive {name} ID")
            if (element.get("data-sphere") or name in {"path", "text"}) and not element.get("id"):
                problems.append(f"{path.name}: production {name} lacks ID")
        found_colors = {value.upper() for value in re.findall(r"#[0-9a-fA-F]{6}", text)}
        unknown = sorted(found_colors - allowed_colors)
        if unknown:
            problems.append(f"{path.name}: unexpected colors {unknown}")
        if "lockup" in path.name:
            geometry = sphere_geometry(root)
            if geometry != flat_geometry:
                geometry_problems.append(path.name)
        if "safari-pinned" in path.name:
            circles = [element for element in root.iter() if local_name(element.tag) == "circle"]
            safari_geometry = [(element.get("cx"), element.get("cy"), element.get("r")) for element in circles]
            expected = [(item[2], item[3], item[4]) for item in flat_geometry]
            if safari_geometry != expected:
                geometry_problems.append(path.name)
    record("SVG safety and structure", not problems, f"Validated {len(svg_paths)} production SVGs." if not problems else "; ".join(problems))
    record("Shared locked sphere geometry", not geometry_problems, "Every logo lockup and Safari derivative preserves the eight-sphere geometry and order." if not geometry_problems else "Geometry differs: " + ", ".join(geometry_problems))


def check_wordmarks_and_trademark() -> None:
    problems: list[str] = []
    for variant in ("light", "dark"):
        text_path = BRAND / "svg" / f"cluster-mkt-wordmark-{variant}-text.svg"
        outline_path = BRAND / "svg" / f"cluster-mkt-wordmark-{variant}-outlined.svg"
        tm_path = BRAND / "svg" / f"cluster-mkt-wordmark-{variant}-tm-outlined.svg"
        text_root = ET.parse(text_path).getroot()
        outline_root = ET.parse(outline_path).getroot()
        tm_root = ET.parse(tm_path).getroot()
        if len([node for node in text_root.iter() if local_name(node.tag) == "text"]) != 2:
            problems.append(f"{text_path.name}: editable text nodes missing")
        if any(local_name(node.tag) == "text" for node in outline_root.iter()):
            problems.append(f"{outline_path.name}: text remains in outlined variant")
        if not any(local_name(node.tag) == "path" for node in outline_root.iter()):
            problems.append(f"{outline_path.name}: outlines missing")
        if not any("trademark" in (node.get("id") or "") for node in tm_root.iter()):
            problems.append(f"{tm_path.name}: outlined trademark glyph missing")
    for path in sorted((BRAND / "svg").glob("*.svg")):
        ids = " ".join(node.get("id", "") for node in ET.parse(path).getroot().iter())
        designated = "-tm" in path.stem or "tagline-lockup" in path.stem
        has_tm_outline = "trademark" in ids or "glyph-" in ids and "symbol" in ids
        if designated and not has_tm_outline:
            problems.append(f"{path.name}: designated trademark artwork missing")
        if not designated and has_tm_outline:
            problems.append(f"{path.name}: trademark artwork appears in non-designated variant")
    registered_symbol_files = []
    for path in BRAND.rglob("*"):
        if path.is_file() and path.suffix.lower() in {".md", ".json", ".css", ".svg", ".html", ".py", ".webmanifest"}:
            if "\u00ae" in path.read_text(encoding="utf-8"):
                registered_symbol_files.append(path.relative_to(BRAND).as_posix())
    if registered_symbol_files:
        problems.append("registered-mark glyph found in " + ", ".join(registered_symbol_files))
    record("Wordmark and trademark variants", not problems, "Editable and outlined wordmarks exist; trademark outlines occur only in designated SVG variants; no registered-mark glyph appears." if not problems else "; ".join(problems))


def corner_alphas(image: Image.Image) -> tuple[int, int, int, int]:
    alpha = image.convert("RGBA").getchannel("A")
    width, height = image.size
    return (
        alpha.getpixel((0, 0)),
        alpha.getpixel((width - 1, 0)),
        alpha.getpixel((0, height - 1)),
        alpha.getpixel((width - 1, height - 1)),
    )


def corner_patch_uniform(image: Image.Image, patch_size: int = 12) -> bool:
    rgb_image = image.convert("RGB")
    width, height = image.size
    patches = [
        rgb_image.crop((0, 0, patch_size, patch_size)),
        rgb_image.crop((width - patch_size, 0, width, patch_size)),
        rgb_image.crop((0, height - patch_size, patch_size, height)),
        rgb_image.crop((width - patch_size, height - patch_size, width, height)),
    ]
    return all(max(stat.var) < 0.5 for stat in map(ImageStat.Stat, patches))


def check_pngs() -> None:
    problems: list[str] = []
    for relative, expected_size in EXPECTED_PNG_DIMENSIONS.items():
        path = BRAND / relative
        if not path.exists():
            continue
        with Image.open(path) as source:
            image = source.convert("RGBA")
            if source.size != expected_size:
                problems.append(f"{relative}: {source.size}, expected {expected_size}")
            if relative in TRANSPARENT_PNGS:
                if source.mode not in {"RGBA", "LA", "P"}:
                    problems.append(f"{relative}: mode {source.mode} lacks alpha")
                if corner_alphas(image) != (0, 0, 0, 0):
                    problems.append(f"{relative}: transparent corner check failed")
                bounds = image.getchannel("A").getbbox()
                if bounds is None:
                    problems.append(f"{relative}: empty transparent asset")
                elif bounds[0] <= 0 or bounds[1] <= 0 or bounds[2] >= image.width or bounds[3] >= image.height:
                    problems.append(f"{relative}: artwork touches/crops at canvas edge {bounds}")
            else:
                if source.mode not in {"RGB", "RGBA"}:
                    problems.append(f"{relative}: unexpected color mode {source.mode}")
                if not relative.startswith("previews/") and not corner_patch_uniform(source):
                    problems.append(f"{relative}: opaque corner patches are not uniform; possible baked pattern")
    record("PNG dimensions, modes, transparency, and cropping", not problems, f"Validated {len(EXPECTED_PNG_DIMENSIONS)} PNG files." if not problems else "; ".join(problems))


def normalized_alpha_center(path: Path) -> tuple[float, float, tuple[float, float, float, float]]:
    with Image.open(path) as source:
        alpha = source.convert("RGBA").getchannel("A")
        bounds = alpha.getbbox()
        if bounds is None:
            raise ValueError(f"Empty icon: {path}")
        center_x = (bounds[0] + bounds[2]) / 2 / source.width
        center_y = (bounds[1] + bounds[3]) / 2 / source.height
        normalized_bounds = tuple(value / (source.width if index % 2 == 0 else source.height) for index, value in enumerate(bounds))
        return center_x, center_y, normalized_bounds


def check_icons() -> None:
    problems: list[str] = []
    standard = [
        BRAND / "icons" / "favicon-16.png",
        BRAND / "icons" / "favicon-32.png",
        BRAND / "icons" / "favicon-48.png",
        BRAND / "icons" / "favicon-64.png",
        BRAND / "icons" / "apple-touch-icon-180.png",
        BRAND / "icons" / "cluster-mkt-icon-192.png",
        BRAND / "icons" / "cluster-mkt-icon-512.png",
    ]
    centers = [normalized_alpha_center(path) for path in standard]
    reference_center = centers[-1][:2]
    reference_bounds = centers[-1][2]
    for path, (center_x, center_y, bounds) in zip(standard, centers):
        tolerance = max(2 / Image.open(path).width, 0.012)
        if abs(center_x - reference_center[0]) > tolerance or abs(center_y - reference_center[1]) > tolerance:
            problems.append(f"{path.name}: inconsistent center")
        if any(abs(value - reference) > max(tolerance, 0.018) for value, reference in zip(bounds, reference_bounds)):
            problems.append(f"{path.name}: inconsistent crop/scale")
        with Image.open(path) as source:
            rgba = source.convert("RGBA")
            alpha_histogram = rgba.getchannel("A").histogram()
            occupied = 1 - alpha_histogram[0] / (source.width * source.height)
            color_stat = ImageStat.Stat(rgba.convert("RGB"))
            if not 0.2 < occupied < 0.9 or max(color_stat.var) < 80:
                problems.append(f"{path.name}: insufficient small-size legibility")
    for size in (192, 512):
        path = BRAND / "icons" / f"cluster-mkt-icon-maskable-{size}.png"
        with Image.open(path) as source:
            image = source.convert("RGB")
            background = rgb("#F7F4EC")
            mask = Image.new("L", image.size, 0)
            pixels = mask.load()
            source_pixels = image.load()
            for y in range(size):
                for x in range(size):
                    if max(abs(source_pixels[x, y][index] - background[index]) for index in range(3)) > 6:
                        pixels[x, y] = 255
            bounds = mask.getbbox()
            if bounds is None:
                problems.append(f"{path.name}: no mark found")
            else:
                safe = 0.1 * size
                if bounds[0] < safe or bounds[1] < safe or bounds[2] > size - safe or bounds[3] > size - safe:
                    problems.append(f"{path.name}: safe-area padding insufficient {bounds}")
    ico_path = BRAND / "icons" / "favicon.ico"
    with Image.open(ico_path) as ico:
        sizes = set(ico.ico.sizes()) if hasattr(ico, "ico") else {ico.size}
        if not {(16, 16), (32, 32), (48, 48), (64, 64)}.issubset(sizes):
            problems.append(f"favicon.ico: missing sizes, found {sorted(sizes)}")
    record("Icon sizes, legibility, centering, and maskable safe area", not problems, "All requested icon sizes are centered consistently; maskable marks remain inside the safe area; favicon bundle is complete." if not problems else "; ".join(problems))


def check_tokens_and_contrast() -> None:
    problems: list[str] = []
    tokens = json.loads((BRAND / "brand-tokens.json").read_text(encoding="utf-8"))
    required = {
        "color-page-background", "color-surface-primary", "color-surface-secondary",
        "color-text-primary", "color-text-secondary", "color-border-subtle",
        "color-accent-primary", "color-accent-secondary", "color-edition-wash",
        "color-audio-progress", "color-positive", "color-negative", "color-caution",
    }
    contrast_results = []
    for mode in ("light", "dark"):
        values = tokens["semantic"][mode]
        missing = required - values.keys()
        if missing:
            problems.append(f"{mode}: missing semantic tokens {sorted(missing)}")
        for foreground_name in ("color-text-primary", "color-text-secondary"):
            for background_name in ("color-page-background", "color-surface-primary", "color-surface-secondary"):
                ratio = contrast_ratio(values[foreground_name], values[background_name])
                contrast_results.append((mode, foreground_name, background_name, ratio))
                if ratio < 4.5:
                    problems.append(f"{mode}: {foreground_name} on {background_name} is {ratio:.2f}:1")
        for semantic in ("color-positive", "color-negative", "color-caution"):
            ratio = contrast_ratio(values[semantic], values["color-surface-primary"])
            contrast_results.append((mode, semantic, "color-surface-primary", ratio))
            if ratio < 4.5:
                problems.append(f"{mode}: {semantic} on primary surface is {ratio:.2f}:1")
    allowed_edition_keys = {"color-edition-wash", "color-accent-primary", "color-accent-secondary", "color-audio-progress"}
    for edition, edition_data in tokens["editions"].items():
        for mode in ("light", "dark"):
            values = edition_data[mode]
            if set(values) != allowed_edition_keys:
                problems.append(f"{edition}/{mode}: edition overrides exceed permitted scope")
            for accent in ("color-accent-primary", "color-accent-secondary"):
                ratio = contrast_ratio(values[accent], values["color-edition-wash"])
                contrast_results.append((f"{edition}/{mode}", accent, "color-edition-wash", ratio))
                if ratio < 3:
                    problems.append(f"{edition}/{mode}: {accent} on wash is {ratio:.2f}:1")
    css = (BRAND / "brand-tokens.css").read_text(encoding="utf-8")
    for token_name in required:
        if f"--{token_name}:" not in css:
            problems.append(f"CSS missing --{token_name}")
    if '"Newsreader", "Source Serif 4", Georgia, serif' not in css:
        problems.append("Editorial fallback stack missing")
    if '"DM Sans", Inter, Arial, sans-serif' not in css or "tabular-nums" not in css:
        problems.append("Interface/numeric typography tokens incomplete")
    record("Semantic tokens and WCAG contrast", not problems, f"Validated semantic and edition tokens; lowest tested contrast {min(result[3] for result in contrast_results):.2f}:1 at the appropriate 3:1 or 4.5:1 threshold." if not problems else "; ".join(problems))


def render_svg(browser, source: Path, output: Path, width: int, height: int) -> None:
    page = browser.new_page(viewport={"width": width, "height": height}, device_scale_factor=1)
    page.set_content(
        "<!doctype html><html><head><style>html,body{margin:0;width:100%;height:100%;background:transparent;overflow:hidden}svg{display:block;width:100%;height:100%}</style></head><body>"
        + source.read_text(encoding="utf-8") + "</body></html>",
        wait_until="load",
    )
    page.screenshot(path=str(output), omit_background=True)
    page.close()


def check_minimum_size_renders() -> None:
    tests = [
        (MASTER_DIR / "cluster-mkt-mark-dimensional-light.svg", 48, 48, "dimensional mark at 48px"),
        (MASTER_DIR / "cluster-mkt-mark-dimensional-dark.svg", 48, 48, "dimensional dark mark at 48px"),
        (MASTER_DIR / "cluster-mkt-mark-flat.svg", 16, 16, "flat mark at 16px"),
        (BRAND / "svg" / "cluster-mkt-lockup-horizontal-light-tm.svg", 140, 47, "horizontal lockup at 140px"),
        (BRAND / "svg" / "cluster-mkt-lockup-horizontal-dark-tm.svg", 140, 47, "horizontal dark lockup at 140px"),
        (BRAND / "svg" / "cluster-mkt-tagline-lockup-horizontal-light.svg", 280, 89, "tagline lockup at 280px"),
        (BRAND / "svg" / "cluster-mkt-tagline-lockup-horizontal-dark.svg", 280, 89, "tagline dark lockup at 280px"),
    ]
    problems: list[str] = []
    with tempfile.TemporaryDirectory(prefix="cluster-mkt-brand-minimums-") as temp_dir:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(headless=True)
            try:
                for index, (source, width, height, label) in enumerate(tests):
                    output = Path(temp_dir) / f"test-{index}.png"
                    render_svg(browser, source, output, width, height)
                    with Image.open(output) as image:
                        rgba = image.convert("RGBA")
                        alpha = rgba.getchannel("A")
                        bounds = alpha.getbbox()
                        histogram = alpha.histogram()
                        if bounds is None or histogram[255] == 0 or sum(histogram[1:255]) == 0:
                            problems.append(f"{label}: empty or non-vector render")
                        else:
                            edge_maxima = {
                                "left": max(alpha.crop((0, 0, 1, height)).getdata()),
                                "top": max(alpha.crop((0, 0, width, 1)).getdata()),
                                "right": max(alpha.crop((width - 1, 0, width, height)).getdata()),
                                "bottom": max(alpha.crop((0, height - 1, width, height)).getdata()),
                            }
                            # A one-pixel, very-low-alpha tail from the intentional blurred
                            # ground shadow is acceptable at tiny sizes; opaque artwork is not.
                            touched = [
                                edge for edge, maximum in edge_maxima.items()
                                if maximum > 8
                            ]
                            if touched:
                                problems.append(f"{label}: material artwork reaches {', '.join(touched)} edge")
            finally:
                browser.close()
    record("Validated minimum-size renders", not problems, "Dimensional 48px, flat 16px, horizontal 140px, and tagline 280px minimums render with opaque interiors, antialiased edges, and no cropping." if not problems else "; ".join(problems))


def check_motion_and_previews() -> None:
    problems: list[str] = []
    motion_css = (BRAND / "motion" / "cluster-mkt-motion-tokens.css").read_text(encoding="utf-8")
    motion_demo = (BRAND / "motion" / "cluster-mkt-logo-convergence-demo.html").read_text(encoding="utf-8")
    if "prefers-reduced-motion: reduce" not in motion_css or "prefers-reduced-motion: reduce" not in motion_demo:
        problems.append("Reduced-motion support missing")
    if "autoplay" in motion_demo.lower() or "<audio" in motion_demo.lower() or "<video" in motion_demo.lower():
        problems.append("Autoplay/audio/video found in motion demo")
    preview_names = {
        "cluster-mkt-brand-sheet-light.png",
        "cluster-mkt-brand-sheet-dark.png",
        "cluster-mkt-icon-size-test.png",
        "cluster-mkt-edition-palette-preview.png",
        "cluster-mkt-lockup-preview.png",
    }
    existing = {path.name for path in (BRAND / "previews").glob("*.png")}
    if not preview_names.issubset(existing):
        problems.append("Visual regression previews missing")
    checker_mentions = []
    for path in BRAND.rglob("*"):
        if path.is_file() and path.suffix.lower() in {".svg", ".css", ".html"} and "previews" not in path.parts:
            if "checkerboard" in path.read_text(encoding="utf-8").lower():
                checker_mentions.append(path.relative_to(BRAND).as_posix())
    # Documentation and build tooling may name the validation checkerboard; production artwork may not.
    production_mentions = [name for name in checker_mentions if name.startswith(("svg/", "icons/", "motion/"))]
    if production_mentions:
        problems.append("Checkerboard referenced by production asset: " + ", ".join(production_mentions))
    record("Motion accessibility and visual regression previews", not problems, "Reduced-motion support exists; no autoplay media exists; all five required previews exist, with checkerboard use confined to validation previews." if not problems else "; ".join(problems))


def check_manifest() -> None:
    problems: list[str] = []
    manifest = json.loads((BRAND / "brand-assets-manifest.json").read_text(encoding="utf-8"))
    required_fields = {
        "filename", "assetType", "variant", "intendedBackground", "dimensionsOrViewBox",
        "transparency", "recommendedUsage", "minimumRecommendedSize", "textState", "sha256", "validationRequirements",
    }
    for entry in manifest.get("assets", []):
        missing = required_fields - entry.keys()
        if missing:
            problems.append(f"{entry.get('filename', '?')}: missing fields {sorted(missing)}")
            continue
        path = BRAND / entry["filename"]
        if not path.exists():
            problems.append(f"{entry['filename']}: manifest target missing")
        elif sha256(path) != entry["sha256"]:
            problems.append(f"{entry['filename']}: checksum mismatch")
    if manifest.get("lockedMasterHashes") != LOCKED_HASHES:
        problems.append("Manifest locked-master hashes differ")
    record("Machine-readable asset manifest", not problems, f"Validated {len(manifest.get('assets', []))} manifest entries and SHA-256 checksums." if not problems else "; ".join(problems))


def write_reports() -> None:
    failures = [check for check in CHECKS if check["status"] == "FAIL"]
    report = {
        "package": "Cluster MKT™ Full Brand Package",
        "status": "FAIL" if failures else "PASS",
        "summary": {
            "checks": len(CHECKS),
            "passed": len(CHECKS) - len(failures),
            "failed": len(failures),
        },
        "lockedMasterHashes": LOCKED_HASHES,
        "checks": CHECKS,
    }
    REPORT_PATH.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    lines = [
        "# Cluster MKT brand validation summary",
        "",
        f"**Overall status: {report['status']}**",
        "",
        f"Checks passed: {report['summary']['passed']} of {report['summary']['checks']}.",
        "",
        "| Check | Status | Detail |",
        "| --- | --- | --- |",
    ]
    for check in CHECKS:
        detail = str(check["detail"]).replace("|", "\\|")
        lines.append(f"| {check['name']} | {check['status']} | {detail} |")
    lines.extend(
        [
            "",
            "The checkerboard shown in preview assets is a validation surface only and is not embedded in production artwork.",
        ]
    )
    SUMMARY_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    check_expected_files()
    check_locked_masters()
    check_svgs()
    check_wordmarks_and_trademark()
    check_pngs()
    check_icons()
    check_tokens_and_contrast()
    check_minimum_size_renders()
    check_motion_and_previews()
    check_manifest()
    write_reports()
    failures = [check for check in CHECKS if check["status"] == "FAIL"]
    for check in CHECKS:
        print(f"{check['status']}: {check['name']} — {check['detail']}")
    print(f"REPORT: {REPORT_PATH.relative_to(ROOT)}")
    print(f"SUMMARY: {SUMMARY_PATH.relative_to(ROOT)}")
    if failures:
        sys.exit(1)


if __name__ == "__main__":
    main()
