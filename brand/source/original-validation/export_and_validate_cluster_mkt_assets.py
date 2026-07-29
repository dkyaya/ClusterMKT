#!/usr/bin/env python3
"""Export and validate the production Cluster MKT SVG asset family."""

from __future__ import annotations

import json
import tempfile
from pathlib import Path
from xml.etree import ElementTree as ET

from PIL import Image
from playwright.sync_api import Browser, sync_playwright


BRAND = Path(__file__).resolve().parents[2]
MASTER_DIR = BRAND / "source" / "locked-masters"
REFERENCE_EXPORT_DIR = BRAND / "source" / "reference-exports"
REPORT_PATH = BRAND / "source" / "original-validation" / "cluster-mkt-asset-validation-report.json"
SVG_NS = "http://www.w3.org/2000/svg"

SVG_FILES = [
    MASTER_DIR / "cluster-mkt-mark-dimensional-light.svg",
    MASTER_DIR / "cluster-mkt-mark-dimensional-dark.svg",
    MASTER_DIR / "cluster-mkt-mark-flat.svg",
    MASTER_DIR / "cluster-mkt-mark-monochrome-black.svg",
    MASTER_DIR / "cluster-mkt-mark-monochrome-white.svg",
]

EXPORTS = {
    MASTER_DIR / "cluster-mkt-mark-dimensional-light.svg": (
        REFERENCE_EXPORT_DIR / "cluster-mkt-mark-dimensional-light-2048.png",
        2048,
    ),
    MASTER_DIR / "cluster-mkt-mark-dimensional-dark.svg": (
        REFERENCE_EXPORT_DIR / "cluster-mkt-mark-dimensional-dark-2048.png",
        2048,
    ),
    MASTER_DIR / "cluster-mkt-mark-flat.svg": (
        REFERENCE_EXPORT_DIR / "cluster-mkt-mark-flat-1024.png",
        1024,
    ),
    MASTER_DIR / "cluster-mkt-mark-monochrome-black.svg": (
        REFERENCE_EXPORT_DIR / "cluster-mkt-mark-monochrome-black-1024.png",
        1024,
    ),
    MASTER_DIR / "cluster-mkt-mark-monochrome-white.svg": (
        REFERENCE_EXPORT_DIR / "cluster-mkt-mark-monochrome-white-1024.png",
        1024,
    ),
}

TEST_SIZES = (32, 128, 512, 2048)
EXPECTED_STACK = (
    "rear-top-rust",
    "back-left-rust",
    "back-right-sage",
    "upper-forest",
    "right-rust",
    "small-left-sage",
    "front-ink",
    "front-ochre",
)


def local_name(tag: str) -> str:
    return tag.rsplit("}", 1)[-1]


def sphere_geometry(root: ET.Element) -> list[dict[str, str]]:
    spheres = [element for element in root.iter() if element.get("data-sphere")]
    spheres.sort(key=lambda element: int(element.get("data-stack", "0")))
    return [
        {
            "name": sphere.attrib["data-sphere"],
            "stack": sphere.attrib["data-stack"],
            "element": local_name(sphere.tag),
            "cx": sphere.attrib["cx"],
            "cy": sphere.attrib["cy"],
            "r": sphere.attrib["r"],
        }
        for sphere in spheres
    ]


def validate_svg_structure() -> dict[str, object]:
    parsed = {path: ET.parse(path).getroot() for path in SVG_FILES}
    geometry_by_file: dict[Path, list[dict[str, str]]] = {}

    for path, root in parsed.items():
        names = [local_name(element.tag) for element in root.iter()]
        assert "image" not in names, f"{path.name}: embedded <image> found"
        assert "pattern" not in names, f"{path.name}: pattern found"
        assert "rect" not in names, f"{path.name}: rectangle found"
        assert root.attrib.get("viewBox") == "0 0 1100 1100", (
            f"{path.name}: unexpected viewBox"
        )

        ids = [element.get("id") for element in root.iter() if element.get("id")]
        assert len(ids) == len(set(ids)), f"{path.name}: duplicate IDs found"

        geometry = sphere_geometry(root)
        assert len(geometry) == 8, f"{path.name}: expected 8 spheres"
        assert tuple(item["name"] for item in geometry) == EXPECTED_STACK, (
            f"{path.name}: sphere stack differs"
        )
        assert all(item["element"] in {"circle", "ellipse"} for item in geometry)
        geometry_by_file[path] = geometry

        for element in root.iter():
            name = local_name(element.tag)
            if name in {"radialGradient", "linearGradient", "mask", "filter", "clipPath"}:
                element_id = element.get("id", "")
                assert element_id and len(element_id) >= 12, (
                    f"{path.name}: non-descriptive {name} ID"
                )
        for sphere in (element for element in root.iter() if element.get("data-sphere")):
            sphere_id = sphere.get("id", "")
            assert sphere_id.startswith("sphere-") and sphere.get("data-sphere") in sphere_id

    canonical = geometry_by_file[SVG_FILES[0]]
    for path, geometry in geometry_by_file.items():
        assert geometry == canonical, f"{path.name}: underlying geometry differs"

    flat_root = parsed[MASTER_DIR / "cluster-mkt-mark-flat.svg"]
    flat_names = {local_name(element.tag) for element in flat_root.iter()}
    assert not flat_names.intersection(
        {"defs", "radialGradient", "linearGradient", "filter", "mask", "clipPath"}
    ), "Flat asset contains effects"

    for color_name, expected_fill in (("black", "#000000"), ("white", "#FFFFFF")):
        mono_root = parsed[MASTER_DIR / f"cluster-mkt-mark-monochrome-{color_name}.svg"]
        for element in mono_root.iter():
            if element.get("data-sphere"):
                assert element.get("fill") == expected_fill
                assert "stroke" not in element.attrib

    return {
        "svg_count": len(SVG_FILES),
        "sphere_count_per_svg": 8,
        "shared_view_box": "0 0 1100 1100",
        "shared_geometry": True,
        "embedded_images": 0,
        "rectangles": 0,
        "patterns": 0,
    }


def render_svg(browser: Browser, svg_path: Path, output_path: Path, size: int) -> None:
    svg_markup = svg_path.read_text(encoding="utf-8")
    page = browser.new_page(
        viewport={"width": size, "height": size},
        device_scale_factor=1,
    )
    page.set_content(
        "<!doctype html><html><head><style>"
        "html,body{margin:0;width:100%;height:100%;background:transparent;overflow:hidden}"
        "svg{display:block;width:100%;height:100%}"
        "</style></head><body>"
        f"{svg_markup}"
        "</body></html>",
        wait_until="load",
    )
    page.screenshot(path=str(output_path), omit_background=True)
    page.close()


def inspect_render(path: Path, expected_size: int) -> dict[str, object]:
    with Image.open(path) as source:
        image = source.convert("RGBA")
        assert image.size == (expected_size, expected_size), (
            f"{path.name}: expected {expected_size}px square PNG"
        )
        alpha = image.getchannel("A")
        corners = (
            alpha.getpixel((0, 0)),
            alpha.getpixel((expected_size - 1, 0)),
            alpha.getpixel((0, expected_size - 1)),
            alpha.getpixel((expected_size - 1, expected_size - 1)),
        )
        assert corners == (0, 0, 0, 0), f"{path.name}: opaque corner found"
        bounds = alpha.getbbox()
        assert bounds is not None, f"{path.name}: empty render"
        histogram = alpha.histogram()
        fractional_alpha_pixels = sum(histogram[1:255])
        opaque_pixels = histogram[255]
        assert fractional_alpha_pixels > 0, f"{path.name}: no antialiased vector edge"
        assert opaque_pixels > 0, f"{path.name}: no opaque sphere interior"
        return {
            "size": expected_size,
            "corners_alpha": list(corners),
            "alpha_bounds": list(bounds),
            "fractional_alpha_pixels": fractional_alpha_pixels,
            "opaque_pixels": opaque_pixels,
        }


def export_and_validate_renders() -> tuple[dict[str, object], dict[str, object]]:
    export_results: dict[str, object] = {}
    sharpness_results: dict[str, object] = {}
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        try:
            for svg_path, (png_path, size) in EXPORTS.items():
                render_svg(browser, svg_path, png_path, size)
                export_results[png_path.name] = inspect_render(png_path, size)

            with tempfile.TemporaryDirectory(prefix="cluster-mkt-render-check-") as temp_dir:
                temp_root = Path(temp_dir)
                for svg_path in SVG_FILES:
                    asset_checks: dict[str, object] = {}
                    normalized_bounds: list[tuple[float, float, float, float]] = []
                    for size in TEST_SIZES:
                        output = temp_root / f"{svg_path.stem}-{size}.png"
                        render_svg(browser, svg_path, output, size)
                        result = inspect_render(output, size)
                        bounds = result["alpha_bounds"]
                        normalized_bounds.append(tuple(value / size for value in bounds))
                        asset_checks[str(size)] = result

                    baseline = normalized_bounds[-1]
                    for size, bounds in zip(TEST_SIZES, normalized_bounds):
                        tolerance = max(2 / size, 0.004)
                        assert all(
                            abs(actual - expected) <= tolerance
                            for actual, expected in zip(bounds, baseline)
                        ), f"{svg_path.name}: inconsistent scaling at {size}px"
                    sharpness_results[svg_path.name] = asset_checks
        finally:
            browser.close()
    return export_results, sharpness_results


def main() -> None:
    structure = validate_svg_structure()
    exports, sharpness = export_and_validate_renders()
    report = {
        "status": "PASS",
        "structure": structure,
        "exports": exports,
        "sharpness_sizes": list(TEST_SIZES),
        "sharpness": sharpness,
    }
    REPORT_PATH.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(f"PASS: {structure['svg_count']} SVG masters validated")
    print("PASS: no <image>, <pattern>, or <rect> elements")
    print("PASS: no full-canvas background rectangles")
    print("PASS: 8 shared sphere geometries and identical stack order")
    print("PASS: PNG corner alpha is 0 for every export")
    print("PASS: all masters render as vectors at 32, 128, 512, and 2048 px")
    print(f"REPORT: {REPORT_PATH.relative_to(BRAND.parent)}")


if __name__ == "__main__":
    main()
