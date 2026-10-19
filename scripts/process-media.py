#!/usr/bin/env python
"""
Turn the briefing screenshots and the field photographs into shippable assets.

    python scripts/process-media.py

Reads  assets/study-coach-source.png        (Agent Development Kit, dark UI)
       assets/northbridge-source.png        (Cisco Packet Tracer topology, grey canvas)
       assets/red-cypher-*-source.jpg       (two photographs from the finals)
       assets/outreach-*-source.*           (four volunteering photographs)
Writes public/media/*.webp

OPTIONAL SOURCES. A job marked optional is skipped with a note when its source
is missing, rather than failing the run, so a picture that has been promised
can have its job written before it arrives. Nothing is optional at the moment:
the Red Cypher photographs were the last outstanding pair and they are in.

After any run, paste the `width`/`height` it prints into the matching entry in
`src/data/`. Nothing reads the files to find out.

TWO PIPELINES, BECAUSE THERE ARE TWO KINDS OF SOURCE.

A *capture* is a screenshot. It keeps its own shape, because its shape is
information: the Packet Tracer topology runs edge to edge, and a crop takes a
router off the end of it.

A *photo* is cropped to a fixed shape, because photographs of four different
shapes in one grid is a ragged wall, and the grid is the point of those
blocks. The field photographs are 4:3; the two Red Cypher photographs are
16:9, because a 4:3 window is too narrow to hold a row of three people
standing in front of a backdrop without cutting one of them in half.

Most of these arrived as tall phone portraits, so the crop is a window slid
along the frame rather than a centred guess; `focus` below says where the
subject actually is in each one, on whichever axis is being cut. Cropping in
the asset beats `object-cover` in CSS: this way nothing ships that the page
will not draw, which across six photographs is well over a megabyte.

THE RED CYPHER PHOTOGRAPHS ARE THE ORGANISER'S. They carry REF Media branding
bars, which `trim` cuts off before anything else happens: a white logo strip
is the same slab of daylight problem as the Packet Tracer canvas, and these
sit on the same obsidian page. The credit does not disappear with the bar. It
moves to a line under the pair, in `src/data/achievements.ts`, where it is
readable rather than 9px tall.

WHY THE TWO CAPTURES ARE TREATED DIFFERENTLY. The study coach screenshot is
already a dark interface, so it needs nothing but a resize and an encode. The
Packet Tracer capture is the opposite problem: a 156,155,153 canvas with black
labels on it. Dropped onto an obsidian page it is a slab of daylight, and the
usual escape hatches are both bad. A CSS `invert()` turns mid grey into mid
grey and the diagram still glares. Leaving it on a light plate turns the card
into a window with the lights on.

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

THE SUSSEX PHOTOGRAPH IS MIRRORED AT THE SOURCE. Every sign in it reads
backwards, which is what a phone does when it saves a selfie camera frame the
way the viewfinder showed it. `mirror=True` flips it back, so the room is the
room that was actually there and `SMART BOARD ROOM` is readable. Set it to
False to ship the file exactly as it arrived.

WHY WEBP. Same answer as the portrait: one format, alpha, and support
everywhere that matters. These carry no CSS mask, so the single URL argument
from `process-portrait.py` does not apply, but a `<picture>` with a JPEG
fallback would buy nothing. Northbridge needs the alpha channel, study coach
is a dark UI screenshot, and the photographs are shown desaturated under a
caption, which hides exactly the artefacts WebP is accused of.

WIDTH. Captures cap at 1280, roughly 2x the widest a card ever draws them.
Photos cap at 1000, roughly 2x their widest, and carry a lower quality number
because a photograph tolerates one where a screenshot full of 1px text does
not. No upscaling anywhere: every source here is coming down.
"""

from __future__ import annotations

import pathlib
import sys
from dataclasses import dataclass

from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / 'public' / 'media'

CAPTURE_WIDTH = 1280
CAPTURE_QUALITY = 80
PHOTO_WIDTH = 1000
PHOTO_QUALITY = 72
PHOTO_ASPECT = 4 / 3
WIDE_ASPECT = 16 / 9

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


@dataclass(frozen=True)
class Job:
    source: str
    out: str
    #: Screenshots keep their shape; photographs are cropped to `aspect`.
    photo: bool = False
    #: The shape a photograph is cropped to. Ignored unless `photo`.
    aspect: float = PHOTO_ASPECT
    #: Rows to cut off the top and the bottom before anything else, for the
    #: branding bars on the organiser's photographs. Measured off the source.
    trim: tuple[int, int] = (0, 0)
    #: Split the grey Packet Tracer canvas out into the alpha channel.
    strip: bool = False
    #: Skip with a note when the source is missing instead of failing.
    optional: bool = False
    #: Where the subject sits along whichever axis the crop cuts, 0 at the
    #: top or left edge and 1 at the bottom or right.
    focus: float = 0.5
    #: Flip horizontally. See the note about the Sussex photograph above.
    mirror: bool = False


JOBS = [
    Job('study-coach-source.png', 'study-coach.webp'),
    Job('northbridge-source.png', 'northbridge.webp', strip=True),
    # The branding bar starts at row 868 in one and the frame is boxed in by
    # bars at 210 and 1259 in the other. Both come out 16:9 so that the row of
    # three in front of the backdrop survives the crop intact.
    Job(
        'red-cypher-floor-source.jpg',
        'red-cypher-floor.webp',
        photo=True,
        aspect=WIDE_ASPECT,
        trim=(0, 101),
        focus=0.46,
    ),
    Job(
        'red-cypher-team-source.jpg',
        'red-cypher-team.webp',
        photo=True,
        aspect=WIDE_ASPECT,
        trim=(210, 101),
        focus=0.5,
    ),
    # The two standing figures and the table sit above centre in a frame that
    # is mostly the backs of heads.
    Job('outreach-anthonys-source.jpeg', 'outreach-anthonys.webp', photo=True, focus=0.44),
    # Already 4:3, so the crop is a no op and only the resize runs.
    Job('outreach-embedded-source.jpg', 'outreach-embedded.webp', photo=True),
    Job('outreach-sussex-source.jpeg', 'outreach-sussex.webp', photo=True, focus=0.48, mirror=True),
    # Speaker on the left, slide on the right, both in the upper half.
    Job('outreach-iot-challenge-source.jpeg', 'outreach-iot-challenge.webp', photo=True, focus=0.42),
]


def crop_to_aspect(image: Image.Image, aspect: float, focus: float) -> Image.Image:
    """Take the largest window of `aspect` the frame allows, placed at `focus`."""
    width, height = image.size
    target = round(width / aspect)

    if target <= height:
        # Taller than the target: slide a full width window vertically.
        top = round(focus * height - target / 2)
        top = max(0, min(height - target, top))
        return image.crop((0, top, width, top + target))

    # Wider than the target: slide a full height window horizontally. This is
    # the path both Red Cypher photographs take once their bars are off.
    keep = round(height * aspect)
    left = round(focus * width - keep / 2)
    left = max(0, min(width - keep, left))
    return image.crop((left, 0, left + keep, height))


def resize(image: Image.Image, max_width: int) -> Image.Image:
    if image.width <= max_width:
        return image
    height = round(image.height * max_width / image.width)
    return image.resize((max_width, height), Image.LANCZOS)


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


def write(image: Image.Image, name: str, quality: int, source_size: tuple[int, int]) -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    path = OUT_DIR / name
    # `exact=True` for the same reason as the portrait: without it the encoder
    # rewrites the RGB under transparent pixels and the invented colour bleeds
    # back out through the semi-opaque edges.
    image.save(path, 'WEBP', quality=quality, method=6, exact=True)
    kib = path.stat().st_size / 1024
    print(
        f'{source_size[0]}x{source_size[1]}  ->  media/{name}: '
        f'{image.width}x{image.height}  {kib:.1f} kB'
    )
    print(f'    width={image.width} height={image.height}')


def main() -> int:
    for job in JOBS:
        source = ROOT / 'assets' / job.source
        if not source.exists():
            if job.optional:
                print(f'skipped {job.out}: no {job.source} yet')
                continue
            print(f'missing source: {source}', file=sys.stderr)
            return 1

        image = Image.open(source).convert('RGBA')
        original = image.size

        top, bottom = job.trim
        if top or bottom:
            image = image.crop((0, top, image.width, image.height - bottom))

        if job.mirror:
            image = image.transpose(Image.FLIP_LEFT_RIGHT)

        # Strip first, resize second. Resizing a grey canvas before the split
        # blends the black labels into it, and the recovered ink comes out
        # muddy along every stroke.
        if job.strip:
            image = strip_canvas(image)

        if job.photo:
            image = crop_to_aspect(image, job.aspect, job.focus)
            write(resize(image, PHOTO_WIDTH), job.out, PHOTO_QUALITY, original)
        else:
            write(resize(image, CAPTURE_WIDTH), job.out, CAPTURE_QUALITY, original)

    return 0


if __name__ == '__main__':
    raise SystemExit(main())
