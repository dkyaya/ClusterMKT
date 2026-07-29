#!/usr/bin/env python3
"""Build the Cluster MKT brand package from the locked SVG masters."""

from __future__ import annotations

import hashlib
import html
import json
import math
import re
from pathlib import Path
from xml.etree import ElementTree as ET

from PIL import Image, ImageDraw, ImageFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.ttLib import TTFont
from playwright.sync_api import Browser, sync_playwright


ROOT = Path(__file__).resolve().parent.parent
BRAND = ROOT / "brand"
SVG_DIR = BRAND / "svg"
PNG_DIR = BRAND / "png"
ICON_DIR = BRAND / "icons"
SOCIAL_DIR = BRAND / "social"
PREVIEW_DIR = BRAND / "previews"
SOURCE_DIR = BRAND / "source"
MASTER_DIR = SOURCE_DIR / "locked-masters"
REFERENCE_EXPORT_DIR = SOURCE_DIR / "reference-exports"
MOTION_DIR = BRAND / "motion"

MASTER_HASHES = {
    "cluster-mkt-mark-dimensional-light.svg": "66496cfe8dc2d6abb51c5b5a58824ca751db2de0d9a65be621f083bc075b11a1",
    "cluster-mkt-mark-dimensional-dark.svg": "b8c4d7a36ae24daf5bb6e785dc41d9e6c4b01649e5eb5c55959763b5faa3405b",
    "cluster-mkt-mark-flat.svg": "2dfae7aaf3524a80fe86a56f2fb3a1fa01b866c55abf11e3faf86aa6ef8ca992",
    "cluster-mkt-mark-monochrome-black.svg": "037232276468c91ce7bb70daac33bc615f83ee3942855d4bd7b337e074fe5850",
    "cluster-mkt-mark-monochrome-white.svg": "b676c0856aaa5b0c2bca0a687df8519b5c2c069044fa2e40ce0605c44b703542",
}

COLORS = {
    "forest-green": "#21483A",
    "muted-rust": "#A55D47",
    "warm-ochre": "#C69A4A",
    "ink-blue": "#26374A",
    "soft-sage": "#9DAF9D",
    "warm-ivory": "#F7F4EC",
    "near-black": "#111210",
    "white": "#FFFFFF",
}

HELVETICA_NEUE = Path("/System/Library/Fonts/HelveticaNeue.ttc")
INTERFACE_FACE_INDEX = 10  # Helvetica Neue Medium
REGULAR_FACE_INDEX = 0
FONT_CACHE: dict[int, TTFont] = {}


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def verify_locked_masters() -> None:
    for filename, expected in MASTER_HASHES.items():
        path = MASTER_DIR / filename
        if not path.exists():
            raise FileNotFoundError(f"Locked master missing: {filename}")
        actual = sha256(path)
        if actual != expected:
            raise RuntimeError(
                f"Locked master changed: {filename}\nexpected {expected}\nactual   {actual}"
            )


def write_text(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content.rstrip() + "\n", encoding="utf-8")


def svg_document(title: str, description: str, view_box: str, content: str) -> str:
    title_id = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-") + "-title"
    desc_id = title_id.replace("-title", "-description")
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="{view_box}" role="img" aria-labelledby="{title_id} {desc_id}">
  <title id="{title_id}">{html.escape(title)}</title>
  <desc id="{desc_id}">{html.escape(description)}</desc>
{content}
</svg>'''


def master_inner(filename: str) -> str:
    ET.register_namespace("", "http://www.w3.org/2000/svg")
    root = ET.parse(MASTER_DIR / filename).getroot()
    children = []
    for child in list(root):
        if child.tag.rsplit("}", 1)[-1] in {"title", "desc"}:
            continue
        serialized = ET.tostring(child, encoding="unicode", short_empty_elements=True)
        children.append("    " + serialized.replace("\n", "\n    "))
    return "\n".join(children)


def nested_master(filename: str, element_id: str, x: float, y: float, size: float) -> str:
    return (
        f'  <svg id="{element_id}" x="{x:g}" y="{y:g}" width="{size:g}" height="{size:g}" '
        f'viewBox="0 0 1100 1100" overflow="visible">\n'
        f'{master_inner(filename)}\n'
        "  </svg>"
    )


def font(face_index: int) -> TTFont:
    if face_index not in FONT_CACHE:
        FONT_CACHE[face_index] = TTFont(HELVETICA_NEUE, fontNumber=face_index)
    return FONT_CACHE[face_index]


def outline_run(
    text: str,
    font_size: float,
    x: float,
    baseline: float,
    letter_spacing: float,
    prefix: str,
    face_index: int = INTERFACE_FACE_INDEX,
) -> tuple[str, float]:
    selected = font(face_index)
    glyph_set = selected.getGlyphSet()
    cmap = selected.getBestCmap()
    hmtx = selected["hmtx"]
    units_per_em = selected["head"].unitsPerEm
    scale = font_size / units_per_em
    cursor = x
    paths: list[str] = []
    for index, character in enumerate(text):
        glyph_name = cmap.get(ord(character), ".notdef")
        advance, _ = hmtx[glyph_name]
        if character != " ":
            pen = SVGPathPen(glyph_set)
            glyph_set[glyph_name].draw(pen)
            commands = pen.getCommands()
            safe_character = re.sub(r"[^a-z0-9]", "symbol", character.lower())
            paths.append(
                f'    <path id="{prefix}-glyph-{index + 1:02d}-{safe_character}" '
                f'd="{commands}" transform="matrix({scale:.8f} 0 0 {-scale:.8f} {cursor:.4f} {baseline:.4f})"/>'
            )
        cursor += advance * scale
        if index < len(text) - 1:
            cursor += letter_spacing
    return "\n".join(paths), cursor


def outlined_wordmark(fill: str, include_tm: bool, prefix: str) -> tuple[str, float]:
    cluster_paths, cluster_end = outline_run(
        "Cluster", 132, 8, 136, 0.2, f"{prefix}-cluster"
    )
    mkt_x = cluster_end + 42
    mkt_paths, mkt_end = outline_run(
        "MKT", 58, mkt_x, 136, 14, f"{prefix}-mkt"
    )
    tm_paths = ""
    final_x = mkt_end
    if include_tm:
        tm_paths, final_x = outline_run(
            "™", 24, mkt_end + 8, 57, 0, f"{prefix}-trademark", REGULAR_FACE_INDEX
        )
    content = (
        f'  <g id="{prefix}-outlined-wordmark" fill="{fill}">\n'
        f"{cluster_paths}\n{mkt_paths}"
        + (f"\n{tm_paths}" if tm_paths else "")
        + "\n  </g>"
    )
    return content, final_x


def text_wordmark(fill: str, prefix: str) -> str:
    return f'''  <g id="{prefix}-editable-wordmark" fill="{fill}" font-family="DM Sans, Inter, Arial, sans-serif">
    <text id="{prefix}-editable-cluster" x="8" y="136" font-size="132" font-weight="600">Cluster</text>
    <text id="{prefix}-editable-mkt" x="472" y="136" font-size="58" font-weight="600" letter-spacing="14">MKT</text>
  </g>'''


def create_wordmarks() -> None:
    variants = (("light", COLORS["near-black"]), ("dark", COLORS["warm-ivory"]))
    for variant, fill in variants:
        text_svg = svg_document(
            f"Cluster MKT {variant} editable wordmark",
            "Editable Cluster MKT wordmark with Cluster dominant and a smaller tracked MKT.",
            "0 0 900 180",
            text_wordmark(fill, f"wordmark-{variant}"),
        )
        write_text(SVG_DIR / f"cluster-mkt-wordmark-{variant}-text.svg", text_svg)

        outline, _ = outlined_wordmark(fill, False, f"wordmark-{variant}")
        outlined_svg = svg_document(
            f"Cluster MKT {variant} outlined wordmark",
            "Portable outlined Cluster MKT wordmark with no font dependency.",
            "0 0 900 180",
            outline,
        )
        write_text(SVG_DIR / f"cluster-mkt-wordmark-{variant}-outlined.svg", outlined_svg)

        outline_tm, _ = outlined_wordmark(fill, True, f"wordmark-{variant}-tm")
        outlined_tm_svg = svg_document(
            f"Cluster MKT trademark {variant} outlined wordmark",
            "Portable outlined Cluster MKT wordmark with the trademark symbol.",
            "0 0 900 180",
            outline_tm,
        )
        write_text(
            SVG_DIR / f"cluster-mkt-wordmark-{variant}-tm-outlined.svg",
            outlined_tm_svg,
        )


def lockup_svg(variant: str, stacked: bool, include_tm: bool) -> str:
    dark = variant == "dark"
    fill = COLORS["warm-ivory"] if dark else COLORS["near-black"]
    master = "cluster-mkt-mark-dimensional-dark.svg" if dark else "cluster-mkt-mark-dimensional-light.svg"
    arrangement = "stacked" if stacked else "horizontal"
    prefix = f"lockup-{arrangement}-{variant}" + ("-tm" if include_tm else "")
    wordmark, _ = outlined_wordmark(fill, include_tm, prefix)
    if stacked:
        mark = nested_master(master, f"{prefix}-locked-sphere-mark", 250, 40, 700)
        wordmark = wordmark.replace('  <g id=', f'  <g transform="translate(150 900)" id=', 1)
        view_box = "0 0 1200 1200"
    else:
        mark = nested_master(master, f"{prefix}-locked-sphere-mark", 25, 25, 550)
        wordmark = wordmark.replace('  <g id=', f'  <g transform="translate(620 205) scale(1.25)" id=', 1)
        view_box = "0 0 1800 600"
    return svg_document(
        f"Cluster MKT {arrangement} {variant} lockup" + (" with trademark" if include_tm else ""),
        "The locked Cluster MKT sphere mark paired with the outlined wordmark on a transparent canvas.",
        view_box,
        mark + "\n" + wordmark,
    )


def tagline_lockup_svg(variant: str, stacked: bool) -> str:
    dark = variant == "dark"
    fill = COLORS["warm-ivory"] if dark else COLORS["near-black"]
    secondary = "#C9C6BD" if dark else "#51544E"
    master = "cluster-mkt-mark-dimensional-dark.svg" if dark else "cluster-mkt-mark-dimensional-light.svg"
    arrangement = "stacked" if stacked else "horizontal"
    prefix = f"tagline-{arrangement}-{variant}"
    wordmark, _ = outlined_wordmark(fill, True, prefix)
    tagline_paths, _ = outline_run(
        "All your sources, in one Cluster™",
        49 if stacked else 52,
        0,
        0,
        0,
        f"{prefix}-tagline",
        REGULAR_FACE_INDEX,
    )
    if stacked:
        mark = nested_master(master, f"{prefix}-locked-sphere-mark", 275, 20, 650)
        wordmark = wordmark.replace('  <g id=', f'  <g transform="translate(150 790)" id=', 1)
        tagline_group = (
            f'  <g id="{prefix}-tagline-copy" fill="{secondary}" '
            'transform="translate(210 1105)">\n'
            f"{tagline_paths}\n  </g>"
        )
        view_box = "0 0 1200 1400"
    else:
        mark = nested_master(master, f"{prefix}-locked-sphere-mark", 35, 35, 620)
        wordmark = wordmark.replace('  <g id=', f'  <g transform="translate(720 155) scale(1.42)" id=', 1)
        tagline_group = (
            f'  <g id="{prefix}-tagline-copy" fill="{secondary}" '
            'transform="translate(730 530)">\n'
            f"{tagline_paths}\n  </g>"
        )
        view_box = "0 0 2200 700"
    return svg_document(
        f"Cluster MKT {arrangement} {variant} tagline lockup",
        "Cluster MKT with the secondary tagline All your sources, in one Cluster.",
        view_box,
        mark + "\n" + wordmark + "\n" + tagline_group,
    )


def create_lockups() -> None:
    for variant in ("light", "dark"):
        for stacked in (False, True):
            arrangement = "stacked" if stacked else "horizontal"
            for include_tm in (False, True):
                suffix = "-tm" if include_tm else ""
                write_text(
                    SVG_DIR / f"cluster-mkt-lockup-{arrangement}-{variant}{suffix}.svg",
                    lockup_svg(variant, stacked, include_tm),
                )
            write_text(
                SVG_DIR / f"cluster-mkt-tagline-lockup-{arrangement}-{variant}.svg",
                tagline_lockup_svg(variant, stacked),
            )


def flat_icon_svg(padding_scale: float = 1.0, background: str | None = None) -> str:
    source = master_inner("cluster-mkt-mark-flat.svg")
    if padding_scale != 1:
        offset = 550 * (1 - padding_scale)
        source = f'  <g id="maskable-safe-area-mark" transform="translate({offset:g} {offset:g}) scale({padding_scale:g})">\n{source}\n  </g>'
    if background:
        # This markup is used only as an in-memory PNG render source for maskable icons.
        source = f'  <rect width="1100" height="1100" fill="{background}"/>\n' + source
    return svg_document(
        "Cluster MKT flat application icon",
        "Centered flat eight-sphere Cluster MKT application mark.",
        "0 0 1100 1100",
        source,
    )


def create_safari_icon() -> None:
    root = ET.parse(MASTER_DIR / "cluster-mkt-mark-flat.svg").getroot()
    circles = []
    for circle in root:
        if circle.tag.rsplit("}", 1)[-1] == "circle" and circle.get("data-sphere"):
            name = circle.get("data-sphere")
            circles.append(
                f'  <circle id="safari-pinned-sphere-{name}" cx="{circle.get("cx")}" cy="{circle.get("cy")}" r="{circle.get("r")}" fill="#000000"/>'
            )
    write_text(
        ICON_DIR / "cluster-mkt-safari-pinned-tab.svg",
        svg_document(
            "Cluster MKT Safari pinned tab icon",
            "Solid monochrome Cluster MKT silhouette for Safari pinned tabs.",
            "0 0 1100 1100",
            "\n".join(circles),
        ),
    )


def render_svg_markup(
    browser: Browser,
    markup: str,
    output: Path,
    width: int,
    height: int,
    omit_background: bool = True,
) -> None:
    page = browser.new_page(viewport={"width": width, "height": height}, device_scale_factor=1)
    page.set_content(
        "<!doctype html><html><head><style>"
        "html,body{margin:0;width:100%;height:100%;background:transparent;overflow:hidden}"
        "svg{display:block;width:100%;height:100%}"
        "</style></head><body>" + markup + "</body></html>",
        wait_until="load",
    )
    page.screenshot(path=str(output), omit_background=omit_background)
    page.close()


def render_svg_file(browser: Browser, source: Path, output: Path, width: int, height: int) -> None:
    render_svg_markup(browser, source.read_text(encoding="utf-8"), output, width, height)


def social_svg(kind: str, dark: bool, width: int, height: int) -> str:
    background = COLORS["near-black"] if dark else (COLORS["warm-ivory"] if kind != "og-light" else COLORS["white"])
    foreground = COLORS["warm-ivory"] if dark else COLORS["near-black"]
    secondary = "#C9C6BD" if dark else "#51544E"
    master = "cluster-mkt-mark-dimensional-dark.svg" if dark else "cluster-mkt-mark-dimensional-light.svg"
    prefix = re.sub(r"[^a-z0-9]+", "-", kind.lower()).strip("-")
    if kind == "profile":
        mark_size = min(width, height) * 0.72
        mark = nested_master(
            "cluster-mkt-mark-flat.svg",
            f"social-{prefix}-flat-mark",
            (width - mark_size) / 2,
            (height - mark_size) / 2,
            mark_size,
        )
        content = f'  <rect id="social-{prefix}-background" width="{width}" height="{height}" fill="{background}"/>\n{mark}'
        return svg_document("Cluster MKT social profile", "Cluster MKT social profile asset.", f"0 0 {width} {height}", content)

    wordmark, _ = outlined_wordmark(foreground, True, f"social-{prefix}")
    tagline_paths, _ = outline_run(
        "All your sources, in one Cluster™", 38, 0, 0, 0,
        f"social-{prefix}-tagline", REGULAR_FACE_INDEX,
    )
    if width / height > 2.4:
        mark_size = height * 0.82
        mark = nested_master(master, f"social-{prefix}-mark", height * 0.08, height * 0.09, mark_size)
        word_transform = f"translate({height * 1.02:g} {height * 0.24:g}) scale(0.78)"
        tagline_transform = f"translate({height * 1.04:g} {height * 0.77:g})"
    else:
        mark_size = height * 0.8
        mark = nested_master(master, f"social-{prefix}-mark", width * 0.045, height * 0.1, mark_size)
        word_transform = f"translate({width * 0.47:g} {height * 0.30:g}) scale(0.82)"
        tagline_transform = f"translate({width * 0.48:g} {height * 0.76:g})"
    wordmark = wordmark.replace('  <g id=', f'  <g transform="{word_transform}" id=', 1)
    tagline = (
        f'  <g id="social-{prefix}-tagline-copy" fill="{secondary}" transform="{tagline_transform}">\n'
        f"{tagline_paths}\n  </g>"
    )
    content = (
        f'  <rect id="social-{prefix}-background" width="{width}" height="{height}" fill="{background}"/>\n'
        f"{mark}\n{wordmark}\n{tagline}"
    )
    return svg_document("Cluster MKT social sharing asset", "Cluster MKT social sharing composition.", f"0 0 {width} {height}", content)


def create_raster_assets() -> None:
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        try:
            lockup_exports = {
                "cluster-mkt-lockup-horizontal-light.svg": (2048, 683),
                "cluster-mkt-lockup-horizontal-dark.svg": (2048, 683),
                "cluster-mkt-lockup-horizontal-light-tm.svg": (2048, 683),
                "cluster-mkt-lockup-horizontal-dark-tm.svg": (2048, 683),
                "cluster-mkt-lockup-stacked-light.svg": (2048, 2048),
                "cluster-mkt-lockup-stacked-dark.svg": (2048, 2048),
                "cluster-mkt-tagline-lockup-horizontal-light.svg": (2048, 652),
                "cluster-mkt-tagline-lockup-horizontal-dark.svg": (2048, 652),
                "cluster-mkt-tagline-lockup-stacked-light.svg": (2048, 2048),
                "cluster-mkt-tagline-lockup-stacked-dark.svg": (2048, 2048),
            }
            for source_name, dimensions in lockup_exports.items():
                output_name = source_name.replace(".svg", "-2048.png")
                render_svg_file(browser, SVG_DIR / source_name, PNG_DIR / output_name, *dimensions)

            standard_icons = {
                "favicon-16.png": 16,
                "favicon-32.png": 32,
                "favicon-48.png": 48,
                "favicon-64.png": 64,
                "apple-touch-icon-180.png": 180,
                "cluster-mkt-icon-192.png": 192,
                "cluster-mkt-icon-512.png": 512,
            }
            icon_markup = flat_icon_svg()
            for name, size in standard_icons.items():
                render_svg_markup(browser, icon_markup, ICON_DIR / name, size, size)

            maskable_markup = flat_icon_svg(0.68, COLORS["warm-ivory"])
            for size in (192, 512):
                render_svg_markup(
                    browser,
                    maskable_markup,
                    ICON_DIR / f"cluster-mkt-icon-maskable-{size}.png",
                    size,
                    size,
                    omit_background=False,
                )

            social_specs = {
                "cluster-mkt-og-default-1200x630.png": ("og-default", False, 1200, 630),
                "cluster-mkt-og-light-1200x630.png": ("og-light", False, 1200, 630),
                "cluster-mkt-og-dark-1200x630.png": ("og-dark", True, 1200, 630),
                "cluster-mkt-profile-light-1080.png": ("profile", False, 1080, 1080),
                "cluster-mkt-profile-dark-1080.png": ("profile", True, 1080, 1080),
                "cluster-mkt-social-banner-light-1500x500.png": ("banner", False, 1500, 500),
                "cluster-mkt-social-banner-dark-1500x500.png": ("banner", True, 1500, 500),
            }
            for filename, (kind, dark, width, height) in social_specs.items():
                render_svg_markup(
                    browser,
                    social_svg(kind, dark, width, height),
                    SOCIAL_DIR / filename,
                    width,
                    height,
                    omit_background=False,
                )
        finally:
            browser.close()

    favicon_images = [
        Image.open(ICON_DIR / f"favicon-{size}.png").convert("RGBA")
        for size in (16, 32, 48, 64)
    ]
    favicon_images[-1].save(
        ICON_DIR / "favicon.ico",
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48), (64, 64)],
        append_images=favicon_images[:-1],
    )


def create_tokens() -> None:
    tokens = {
        "$schema": "https://design-tokens.github.io/community-group/format/",
        "name": "Cluster MKT brand tokens",
        "core": {
            "color": {name: {"value": value, "type": "color"} for name, value in COLORS.items()},
            "supporting": {
                "ivory-raised": {"value": "#FBFAF6", "type": "color"},
                "ivory-muted": {"value": "#EEEAE0", "type": "color"},
                "border-warm": {"value": "#D7D1C5", "type": "color"},
                "text-muted-light": {"value": "#51544E", "type": "color"},
                "text-muted-dark": {"value": "#C9C6BD", "type": "color"},
                "forest-lift": {"value": "#789689", "type": "color"},
                "rust-light": {"value": "#D08A72", "type": "color"},
                "ink-light": {"value": "#9AA9BD", "type": "color"},
                "ochre-dim": {"value": "#9F7C3D", "type": "color"},
                "dusky-neutral": {"value": "#202629", "type": "color"},
            },
        },
        "typography": {
            "font-editorial": {"value": '"Newsreader", "Source Serif 4", Georgia, serif', "type": "fontFamily", "status": "provisional"},
            "font-interface": {"value": '"DM Sans", Inter, Arial, sans-serif', "type": "fontFamily"},
            "font-numeric": {"value": '"DM Sans", Inter, Arial, sans-serif', "type": "fontFamily", "features": ["tabular-nums"]},
        },
        "semantic": {
            "light": {
                "color-page-background": "#F7F4EC",
                "color-surface-primary": "#FFFFFF",
                "color-surface-secondary": "#EEEAE0",
                "color-text-primary": "#111210",
                "color-text-secondary": "#51544E",
                "color-border-subtle": "#D7D1C5",
                "color-accent-primary": "#21483A",
                "color-accent-secondary": "#A55D47",
                "color-edition-wash": "#E4ECE6",
                "color-audio-progress": "#21483A",
                "color-positive": "#2F6A4F",
                "color-negative": "#98483D",
                "color-caution": "#76561C",
            },
            "dark": {
                "color-page-background": "#111210",
                "color-surface-primary": "#1B1D1A",
                "color-surface-secondary": "#252925",
                "color-text-primary": "#F7F4EC",
                "color-text-secondary": "#C9C6BD",
                "color-border-subtle": "#3D423C",
                "color-accent-primary": "#9DAF9D",
                "color-accent-secondary": "#D08A72",
                "color-edition-wash": "#1B2925",
                "color-audio-progress": "#C69A4A",
                "color-positive": "#8FC3A3",
                "color-negative": "#E0A095",
                "color-caution": "#DAB66A",
            },
        },
        "editions": {
            "morning": {
                "period-et": "06:00–11:59",
                "mood": ["warm", "fresh", "anticipatory"],
                "light": {
                    "color-edition-wash": "#F3E7C8",
                    "color-accent-primary": "#21483A",
                    "color-accent-secondary": "#9F7C3D",
                    "color-audio-progress": "#A55D47",
                },
                "dark": {
                    "color-edition-wash": "#2B261D",
                    "color-accent-primary": "#C6A85E",
                    "color-accent-secondary": "#D08A72",
                    "color-audio-progress": "#C6A85E",
                },
            },
            "midday": {
                "period-et": "12:00–17:59",
                "mood": ["clear", "bright", "active"],
                "light": {
                    "color-edition-wash": "#E4ECE6",
                    "color-accent-primary": "#21483A",
                    "color-accent-secondary": "#26374A",
                    "color-audio-progress": "#21483A",
                },
                "dark": {
                    "color-edition-wash": "#1B2925",
                    "color-accent-primary": "#9DAF9D",
                    "color-accent-secondary": "#9AA9BD",
                    "color-audio-progress": "#9DAF9D",
                },
            },
            "closing": {
                "period-et": "18:00–05:59",
                "mood": ["reflective", "settled", "analytical"],
                "light": {
                    "color-edition-wash": "#E5E1DC",
                    "color-accent-primary": "#26374A",
                    "color-accent-secondary": "#A55D47",
                    "color-audio-progress": "#9F7C3D",
                },
                "dark": {
                    "color-edition-wash": "#20242B",
                    "color-accent-primary": "#9AA9BD",
                    "color-accent-secondary": "#D08A72",
                    "color-audio-progress": "#B18C48",
                },
            },
        },
    }
    write_text(BRAND / "brand-tokens.json", json.dumps(tokens, indent=2, ensure_ascii=False))

    def css_block(selector: str, values: dict[str, str]) -> str:
        lines = [f"{selector} {{"]
        lines.extend(f"  --{name}: {value};" for name, value in values.items())
        lines.append("}")
        return "\n".join(lines)

    css = [
        "/* Cluster MKT brand tokens. The editorial face remains provisional by design. */",
        ":root {",
        f'  --font-editorial: "Newsreader", "Source Serif 4", Georgia, serif;',
        f'  --font-interface: "DM Sans", Inter, Arial, sans-serif;',
        f'  --font-numeric: "DM Sans", Inter, Arial, sans-serif;',
    ]
    css.extend(f"  --color-{name}: {value};" for name, value in COLORS.items())
    css.append("  font-variant-numeric: tabular-nums;")
    css.append("}")
    css.append(css_block(':root, [data-theme="light"]', tokens["semantic"]["light"]))
    css.append(css_block('[data-theme="dark"]', tokens["semantic"]["dark"]))
    for edition, edition_values in tokens["editions"].items():
        for mode in ("light", "dark"):
            selector = f'[data-theme="{mode}"][data-edition="{edition}"]'
            css.append(css_block(selector, edition_values[mode]))
    css.append(
        """.numeric, time, [data-numeric] {
  font-family: var(--font-numeric);
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum" 1;
}"""
    )
    write_text(BRAND / "brand-tokens.css", "\n\n".join(css))


def create_web_manifest() -> None:
    manifest = {
        "name": "Cluster MKT™",
        "short_name": "Cluster",
        "description": "All your sources, in one Cluster™",
        "start_url": "/",
        "display": "standalone",
        "background_color": COLORS["warm-ivory"],
        "theme_color": COLORS["forest-green"],
        "icons": [
            {"src": "cluster-mkt-icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any"},
            {"src": "cluster-mkt-icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any"},
            {"src": "cluster-mkt-icon-maskable-192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable"},
            {"src": "cluster-mkt-icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"},
        ],
    }
    write_text(ICON_DIR / "site.webmanifest", json.dumps(manifest, indent=2, ensure_ascii=False))


def create_source_notes() -> None:
    lines = [
        "# Locked logo sources",
        "",
        "The validated masters live once under `locked-masters/`. All generated package assets read those files directly and verify the hashes below before building.",
        "",
        "| Master | SHA-256 |",
        "| --- | --- |",
    ]
    lines.extend(f"| `locked-masters/{name}` | `{digest}` |" for name, digest in MASTER_HASHES.items())
    lines.extend(
        [
            "",
            "Do not edit these masters as part of downstream lockup, icon, social, or motion work. Generated lockups contain native vector copies of the relevant master geometry so they remain standalone and do not rely on raster embedding.",
        ]
    )
    write_text(SOURCE_DIR / "README.md", "\n".join(lines))


def create_motion_files() -> None:
    spec = """# Cluster MKT motion identity

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
"""
    write_text(MOTION_DIR / "cluster-mkt-motion-spec.md", spec)
    css = """/* Cluster MKT motion tokens */
:root {
  --motion-interface-fast: 180ms;
  --motion-interface-default: 220ms;
  --motion-interface-slow: 260ms;
  --motion-logo-convergence: 420ms;
  --motion-edition-transition: 600ms;
  --ease-cluster-settle: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-interface: cubic-bezier(0.2, 0, 0, 1);
}

.edition-transition {
  transition-duration: var(--motion-edition-transition);
  transition-property: background-color, border-color, color;
  transition-timing-function: var(--ease-interface);
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --motion-interface-fast: 1ms;
    --motion-interface-default: 1ms;
    --motion-interface-slow: 1ms;
    --motion-logo-convergence: 1ms;
    --motion-edition-transition: 1ms;
  }

  *, *::before, *::after {
    animation-duration: 1ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 1ms !important;
  }
}
"""
    write_text(MOTION_DIR / "cluster-mkt-motion-tokens.css", css)

    circles = []
    root = ET.parse(MASTER_DIR / "cluster-mkt-mark-flat.svg").getroot()
    offsets = [(-120, -80), (-40, -120), (110, 70), (-90, -100), (120, -40), (-110, 60), (-50, 120), (70, 70)]
    for circle, (dx, dy) in zip([c for c in root if c.get("data-sphere")], offsets):
        circles.append(
            f'<circle id="demo-{circle.get("data-sphere")}" class="sphere" cx="{circle.get("cx")}" cy="{circle.get("cy")}" r="{circle.get("r")}" fill="{circle.get("fill")}" style="--dx:{dx}px;--dy:{dy}px"/>'
        )
    demo = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Cluster MKT logo convergence prototype</title>
<link rel="stylesheet" href="cluster-mkt-motion-tokens.css">
<style>
  body {{ margin: 0; min-height: 100vh; display: grid; place-items: center; background: #F7F4EC; color: #111210; font-family: "DM Sans", Inter, Arial, sans-serif; }}
  main {{ display: grid; justify-items: center; gap: 1.5rem; }}
  svg {{ width: min(68vw, 420px); height: auto; }}
  .sphere {{ transform: translate(var(--dx), var(--dy)); opacity: .72; transition: transform var(--motion-logo-convergence) var(--ease-cluster-settle), opacity var(--motion-logo-convergence) ease-out; }}
  .settled .sphere {{ transform: translate(0, 0); opacity: 1; }}
  button {{ border: 1px solid #21483A; border-radius: 999px; padding: .75rem 1.1rem; background: #21483A; color: #F7F4EC; font: inherit; cursor: pointer; }}
  @media (prefers-reduced-motion: reduce) {{ .sphere {{ transform: none; opacity: 1; }} }}
</style>
</head>
<body>
<main>
  <svg id="cluster-demo" class="settled" viewBox="0 0 1100 1100" role="img" aria-label="Cluster MKT sphere convergence demonstration">{''.join(circles)}</svg>
  <button id="replay" type="button">Replay convergence</button>
</main>
<script>
  const mark = document.querySelector('#cluster-demo');
  document.querySelector('#replay').addEventListener('click', () => {{
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    mark.classList.remove('settled');
    requestAnimationFrame(() => requestAnimationFrame(() => mark.classList.add('settled')));
  }});
</script>
</body>
</html>"""
    write_text(MOTION_DIR / "cluster-mkt-logo-convergence-demo.html", demo)


def load_ui_font(size: int, medium: bool = False) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(HELVETICA_NEUE), size=size, index=INTERFACE_FACE_INDEX if medium else REGULAR_FACE_INDEX)


def checkerboard(width: int, height: int, tile: int = 20) -> Image.Image:
    image = Image.new("RGB", (width, height), "#F2F2F0")
    draw = ImageDraw.Draw(image)
    for y in range(0, height, tile):
        for x in range(0, width, tile):
            if (x // tile + y // tile) % 2:
                draw.rectangle((x, y, x + tile - 1, y + tile - 1), fill="#D9D9D5")
    return image


def contain(image: Image.Image, box: tuple[int, int, int, int]) -> tuple[Image.Image, tuple[int, int]]:
    left, top, right, bottom = box
    max_width, max_height = right - left, bottom - top
    scale = min(max_width / image.width, max_height / image.height)
    resized = image.resize((max(1, round(image.width * scale)), max(1, round(image.height * scale))), Image.Resampling.LANCZOS)
    return resized, (left + (max_width - resized.width) // 2, top + (max_height - resized.height) // 2)


def paste_contained(canvas: Image.Image, source: Path, box: tuple[int, int, int, int]) -> None:
    image = Image.open(source).convert("RGBA")
    resized, position = contain(image, box)
    canvas.paste(resized, position, resized)


def create_previews() -> None:
    title_font = load_ui_font(46, True)
    label_font = load_ui_font(24, True)
    small_font = load_ui_font(19)

    light = Image.new("RGB", (1600, 1200), COLORS["warm-ivory"])
    d = ImageDraw.Draw(light)
    d.text((70, 52), "Cluster MKT™ — light brand sheet", font=title_font, fill=COLORS["near-black"])
    d.text((72, 112), "Calm, editorial, credible, and human-centered", font=small_font, fill="#51544E")
    paste_contained(light, PNG_DIR / "cluster-mkt-lockup-horizontal-light-tm-2048.png", (60, 150, 1540, 600))
    paste_contained(light, REFERENCE_EXPORT_DIR / "cluster-mkt-mark-flat-1024.png", (100, 650, 610, 1130))
    swatches = list(COLORS.items())
    for i, (name, color) in enumerate(swatches):
        x = 660 + (i % 4) * 220
        y = 660 + (i // 4) * 210
        d.rounded_rectangle((x, y, x + 180, y + 120), radius=16, fill=color, outline="#CFC9BC")
        d.text((x, y + 132), name.replace("-", " ").title(), font=small_font, fill=COLORS["near-black"])
        d.text((x, y + 158), color, font=small_font, fill="#51544E")
    light.save(PREVIEW_DIR / "cluster-mkt-brand-sheet-light.png")

    dark = Image.new("RGB", (1600, 1200), COLORS["near-black"])
    d = ImageDraw.Draw(dark)
    d.text((70, 52), "Cluster MKT™ — dark brand sheet", font=title_font, fill=COLORS["warm-ivory"])
    d.text((72, 112), "Palette preserved with restrained edge separation", font=small_font, fill="#C9C6BD")
    paste_contained(dark, PNG_DIR / "cluster-mkt-lockup-horizontal-dark-tm-2048.png", (60, 150, 1540, 600))
    paste_contained(dark, REFERENCE_EXPORT_DIR / "cluster-mkt-mark-dimensional-dark-2048.png", (100, 650, 610, 1130))
    for i, (name, color) in enumerate(swatches):
        x = 660 + (i % 4) * 220
        y = 660 + (i // 4) * 210
        d.rounded_rectangle((x, y, x + 180, y + 120), radius=16, fill=color, outline="#4B4F48")
        d.text((x, y + 132), name.replace("-", " ").title(), font=small_font, fill=COLORS["warm-ivory"])
        d.text((x, y + 158), color, font=small_font, fill="#C9C6BD")
    dark.save(PREVIEW_DIR / "cluster-mkt-brand-sheet-dark.png")

    icon_test = checkerboard(1600, 720, 24)
    d = ImageDraw.Draw(icon_test)
    d.rectangle((0, 0, 1600, 105), fill=COLORS["warm-ivory"])
    d.text((55, 30), "Cluster MKT flat-mark legibility test", font=title_font, fill=COLORS["near-black"])
    sizes = [16, 24, 32, 48, 64, 180, 192, 512]
    x = 60
    for size in sizes:
        display = min(size, 340)
        if size == 24:
            source = Image.open(ICON_DIR / "cluster-mkt-icon-192.png").convert("RGBA").resize((24, 24), Image.Resampling.LANCZOS)
        else:
            candidates = [ICON_DIR / f"favicon-{size}.png", ICON_DIR / f"cluster-mkt-icon-{size}.png", ICON_DIR / f"apple-touch-icon-{size}.png"]
            source_path = next(path for path in candidates if path.exists())
            source = Image.open(source_path).convert("RGBA")
        if size == 512:
            source = source.resize((340, 340), Image.Resampling.LANCZOS)
        y = 190 + (340 - source.height) // 2
        icon_test.paste(source, (x, y), source)
        d.text((x, 565), f"{size}px", font=label_font, fill=COLORS["near-black"])
        x += max(source.width + 70, 130)
    icon_test.save(PREVIEW_DIR / "cluster-mkt-icon-size-test.png")

    palette = Image.new("RGB", (1600, 1000), COLORS["warm-ivory"])
    d = ImageDraw.Draw(palette)
    d.text((60, 40), "Time-of-day edition accents", font=title_font, fill=COLORS["near-black"])
    token_data = json.loads((BRAND / "brand-tokens.json").read_text(encoding="utf-8"))
    for row, edition in enumerate(("morning", "midday", "closing")):
        y = 145 + row * 270
        d.text((60, y), edition.title() + " Edition", font=label_font, fill=COLORS["near-black"])
        for col, mode in enumerate(("light", "dark")):
            values = token_data["editions"][edition][mode]
            x = 300 + col * 620
            base = COLORS["warm-ivory"] if mode == "light" else COLORS["near-black"]
            text_color = COLORS["near-black"] if mode == "light" else COLORS["warm-ivory"]
            d.rounded_rectangle((x, y - 15, x + 560, y + 205), radius=20, fill=base, outline="#817F77")
            d.text((x + 22, y + 5), mode.title(), font=label_font, fill=text_color)
            for i, (name, value) in enumerate(values.items()):
                sx = x + 22 + i * 128
                d.rounded_rectangle((sx, y + 58, sx + 104, y + 132), radius=10, fill=value)
                d.text((sx, y + 145), name.replace("color-", "").replace("-", " ")[:14], font=small_font, fill=text_color)
    palette.save(PREVIEW_DIR / "cluster-mkt-edition-palette-preview.png")

    lockup_preview = Image.new("RGB", (1800, 1400), "white")
    backgrounds = [
        ("White", Image.new("RGB", (1800, 250), COLORS["white"]), False),
        ("Warm Ivory", Image.new("RGB", (1800, 250), COLORS["warm-ivory"]), False),
        ("Near Black", Image.new("RGB", (1800, 250), COLORS["near-black"]), True),
        ("Forest Green", Image.new("RGB", (1800, 250), COLORS["forest-green"]), True),
        ("Validation checkerboard only", checkerboard(1800, 250, 20), False),
    ]
    d = ImageDraw.Draw(lockup_preview)
    d.rectangle((0, 0, 1800, 150), fill="#EEEAE0")
    d.text((60, 46), "Lockup visual-regression surfaces", font=title_font, fill=COLORS["near-black"])
    for index, (label, strip, use_dark) in enumerate(backgrounds):
        y = 150 + index * 250
        lockup_preview.paste(strip, (0, y))
        source = PNG_DIR / f"cluster-mkt-lockup-horizontal-{'dark' if use_dark else 'light'}-tm-2048.png"
        paste_contained(lockup_preview, source, (300, y + 25, 1700, y + 225))
        label_color = COLORS["warm-ivory"] if use_dark else COLORS["near-black"]
        d.text((28, y + 100), label, font=small_font, fill=label_color)
    lockup_preview.save(PREVIEW_DIR / "cluster-mkt-lockup-preview.png")


def file_usage(path: Path) -> str:
    name = path.name
    if "wordmark" in name:
        return "Standalone Cluster MKT wordmark."
    if "tagline-lockup" in name:
        return "Marketing placement where the brand promise should be stated."
    if "lockup-horizontal" in name:
        return "Primary navigation, masthead, partnership, and wide-format branding."
    if "lockup-stacked" in name:
        return "Login, splash, onboarding, and square-format branding."
    if "favicon" in name or "icon" in name or "pinned" in name:
        return "Browser, operating-system, or installed-application icon."
    if path.parent == SOCIAL_DIR:
        return "Social profile, sharing, or banner placement."
    if path.parent == PREVIEW_DIR:
        return "Validation-only visual regression preview; not a production logo asset."
    if path.suffix == ".css":
        return "Implementation tokens for product interfaces."
    if path.suffix == ".md":
        return "Brand-system documentation."
    return "Cluster MKT brand-system support asset."


def asset_type(path: Path) -> str:
    if path.suffix == ".svg":
        return "svg"
    if path.suffix in {".png", ".ico"}:
        return "raster"
    if path.suffix == ".css":
        return "design-tokens"
    if path.suffix == ".json" or path.suffix == ".webmanifest":
        return "manifest"
    if path.suffix == ".md":
        return "documentation"
    if path.suffix == ".html":
        return "prototype"
    if path.suffix == ".py":
        return "tooling"
    return "support"


def raster_dimensions(path: Path) -> str | None:
    if path.suffix.lower() in {".png", ".ico"}:
        with Image.open(path) as image:
            return f"{image.width}x{image.height}"
    if path.suffix == ".svg":
        root = ET.parse(path).getroot()
        return root.get("viewBox")
    return None


def create_asset_manifest() -> None:
    excluded = {
        BRAND / "brand-assets-manifest.json",
        BRAND / "validation" / "cluster-mkt-brand-validation-report.json",
        BRAND / "validation" / "cluster-mkt-brand-validation-summary.md",
    }
    paths = sorted(
        path for path in BRAND.rglob("*")
        if path.is_file()
        and path not in excluded
        and "relay" not in path.parts
        and "__pycache__" not in path.parts
        and path.suffix != ".pyc"
    )
    assets = []
    for path in paths:
        relative = path.relative_to(BRAND).as_posix()
        dark = "dark" in path.name
        transparent = None
        if path.suffix == ".svg":
            transparent = True
        elif path.suffix == ".png":
            with Image.open(path) as image:
                alpha = image.convert("RGBA").getchannel("A")
                transparent = alpha.getextrema()[0] < 255
        minimum = None
        if "wordmark" in path.name:
            minimum = "120px width"
        elif "tagline-lockup" in path.name:
            minimum = "280px width"
        elif "lockup-horizontal" in path.name:
            minimum = "140px width"
        elif "mark-dimensional" in path.name:
            minimum = "48px"
        elif "favicon" in path.name or "icon" in path.name:
            minimum = path.stem.rsplit("-", 1)[-1] + "px" if path.stem.rsplit("-", 1)[-1].isdigit() else None
        assets.append({
            "filename": relative,
            "assetType": asset_type(path),
            "variant": "dark" if dark else ("light" if "light" in path.name else "neutral"),
            "intendedBackground": "dark" if dark else ("light" if "light" in path.name else "context-dependent"),
            "dimensionsOrViewBox": raster_dimensions(path),
            "transparency": transparent,
            "recommendedUsage": file_usage(path),
            "minimumRecommendedSize": minimum,
            "textState": "editable" if "-text.svg" in path.name else ("outlined" if "outlined" in path.name or "lockup" in path.name else "not-applicable"),
            "sha256": sha256(path),
            "validationRequirements": [
                "filename and dimensions match manifest",
                "no raster embedding in production SVG",
                "contrast and transparency appropriate to intended background",
            ],
        })
    manifest = {
        "package": "Cluster MKT™ Full Brand Package",
        "version": "1.0.0",
        "lockedMasterHashes": MASTER_HASHES,
        "canonicalColors": COLORS,
        "assets": assets,
    }
    write_text(BRAND / "brand-assets-manifest.json", json.dumps(manifest, indent=2, ensure_ascii=False))


def main() -> None:
    verify_locked_masters()
    for directory in (SVG_DIR, PNG_DIR, ICON_DIR, SOCIAL_DIR, PREVIEW_DIR, SOURCE_DIR, MOTION_DIR):
        directory.mkdir(parents=True, exist_ok=True)
    create_source_notes()
    create_tokens()
    create_wordmarks()
    create_lockups()
    create_safari_icon()
    create_web_manifest()
    create_motion_files()
    create_raster_assets()
    create_previews()
    create_asset_manifest()
    verify_locked_masters()
    print("Built Cluster MKT brand assets without modifying locked masters.")


if __name__ == "__main__":
    main()
