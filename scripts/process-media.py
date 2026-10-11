#!/usr/bin/env python
"""
Turn the briefing screenshots into the assets the project cards actually ship.

    python scripts/process-media.py

Reads  assets/study-coach-source.png   (Agent Development Kit, dark UI)
       assets/northbridge-source.png   (Cisco Packet Tracer topology, grey canvas)
       assets/red-cypher-source.jpeg   (optional, see OPTIONAL SOURCES below)
Writes public/media/*.webp

OPTIONAL SOURCES. A job marked optional is skipped with a note when its source
is missing, rather than failing the run. `red-cypher` is one: the file was
announced but never arrived, so the Battle Station panel that would show it is
built, wired and currently rendering nothing. Drop the picture in under the
name above, run this again, and paste the two numbers it prints into
`ACHIEVEMENTS[0].image` in `src/data/achievements.ts`.

WHY THE TWO ARE TREATED DIFFERENTLY. The study coach screenshot is already a
dark interface, so it needs nothing but a resize and an encode. The Packet
Tracer capture is the opposite problem: a 156,155,153 canvas with black labels
on it. Dropped onto an obsidian page it is a slab of daylight, and the usual
escape hatches are both bad. A CSS `invert()` turns mid grey into mid grey and
the diagram still glares. Leaving it on a light plate turns the card into a
window with the lights on.

So the canvas is removed in the asset instead. Pixels are split by chroma:

  * achromatic pixels are the canvas, the black labels and the white screens.
    Their alpha becomes their distance from the canvas lightness, and their
    colour becomes the page's own ink. The canvas lands on alpha 0, the labels
    land on opaque light ink, and the antialiased edges in between fade rather
    than staircase.
  * coloured pixels are the Cisco device icons and the green link lights.
    Those are the diagram, so they are kept exactly as they are.

The result is a schematic drawn in the site's ink on the site's background,
which is what a network diagram in a portfolio should look like anyway.

WHY WEBP. Same answer as the portrait: one format, alpha, and support
everywhere that matters. These two carry no CSS mask, so the single URL
argument from `process-portrait.py` does not apply, but a `<picture>` with a
JPEG fallback would buy nothing. Northbridge needs the alpha channel and
study coach is a dark UI screenshot, which is where WebP beats JPEG hardest.

WIDTH. Capped at 1280, which is roughly 2x the widest the card ever renders
them (the feature tile tops out near 620px). No upscaling: the sources are
1919 and 1717 wide, so both are coming down.
"""

from __future__ import annotations

import pathlib
import sys

from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / 'public' / 'media'

MAX_WIDTH = 1280
QUALITY = 80

# The Packet Tracer canvas, read off the source: it is 93% of the pixels.
CANVAS = (156, 155, 153)
# Anything with less spread than this between its channels is grey, not a
# device icon. 30 clears the bluest antialiasing on the black label text and
# still leaves the palest part of a Cisco PC icon (144,187,203, spread 59) well
# on the coloured side.
CHROMA_CUTOFF = 30
# How far from the canvas lightness a grey pixel has to be before it is fully
# opaque. 110 keeps the label strokes solid without hardening their edges.
ALPHA_RAMP = 110
# --color-obsidian-200, resolved to sRGB. The labels are drawn in this.
INK = (200, 203, 211)


def resize(image: Image.Image) -> Image.Image:
    if image.width <= MAX_WIDTH:
        return image
    height = round(image.height * MAX_WIDTH / image.width)
    return image.resize((MAX_WIDTH, height), Image.LANCZOS)


def strip_canvas(image: Image.Image) -> Image.Image:
    """Grey becomes alpha, black becomes ink, colour is left alone."""
    out = Image.new('RGBA', image.size)
    source = image.load()
    target = out.load()
    assert source is not None and target is not None

    canvas_l = sum(CANVAS) // 3

    for y in range(image.height):
        for x in range(image.width):
            r, g, b, _ = source[x, y]

            if max(r, g, b) - min(r, g, b) >= CHROMA_CUTOFF:
                target[x, y] = (r, g, b, 255)
                continue

            lightness = (r + g + b) // 3
            alpha = min(255, abs(lightness - canvas_l) * 255 // ALPHA_RAMP)
            target[x, y] = (*INK, alpha)

    return out


def write(image: Image.Image, name: str, source_size: tuple[int, int]) -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    path = OUT_DIR / name
    # `exact=True` for the same reason as the portrait: without it the encoder
    # rewrites the RGB under transparent pixels and the invented colour bleeds
    # back out through the semi-opaque edges.
    image.save(path, 'WEBP', quality=QUALITY, method=6, exact=True)
    kib = path.stat().st_size / 1024
    print(
        f'{source_size[0]}x{source_size[1]}  ->  media/{name}: '
        f'{image.width}x{image.height}  {kib:.1f} kB'
    )
    print(f'    width={image.width} height={image.height}')


def main() -> int:
    # (source, output, strip the grey canvas, optional)
    jobs = [
        ('study-coach-source.png', 'study-coach.webp', False, False),
        ('northbridge-source.png', 'northbridge.webp', True, False),
        ('red-cypher-source.jpeg', 'red-cypher.webp', False, True),
    ]

    for source_name, out_name, needs_canvas_strip, optional in jobs:
        source = ROOT / 'assets' / source_name
        if not source.exists():
            if optional:
                print(f'skipped {out_name}: no {source_name} yet')
                continue
            print(f'missing source: {source}', file=sys.stderr)
            return 1

        image = Image.open(source).convert('RGBA')
        original = image.size
        # Strip first, resize second. Resizing a grey canvas before the split
        # blends the black labels into it, and the recovered ink comes out
        # muddy along every stroke.
        if needs_canvas_strip:
            image = strip_canvas(image)
        write(resize(image), out_name, original)

    return 0


if __name__ == '__main__':
    raise SystemExit(main())
