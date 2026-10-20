#!/usr/bin/env python
"""
Turn the briefing screenshots and the field photographs into shippable assets.

    python scripts/process-media.py

Reads  assets/study-coach-source.png        (Agent Development Kit, dark UI)
       assets/adaptive-surveillance-source.png (the IASS console, dark UI)
       assets/shield-ctf-source.png         (the CTF title card, dark artwork)
       assets/ai-system-source.jpg          (a CONFIDENTIAL stamp on black)
       assets/northbridge-source.png        (Cisco Packet Tracer topology, grey canvas)
       assets/devsecops-pipeline-source.png (a failing pipeline run, dark UI)
       assets/devsecops-webgoat-source.png  (a path traversal response, light page)
       assets/red-cypher-*-source.jpg       (two photographs from the finals)
       assets/red-cypher-leaderboard-*.png  (the finals scoreboard, dark UI)
       assets/volunteering-*-source.*       (four volunteering photographs)
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
    #: Pixels to cut off each edge before anything else, as (left, top,
    #: right, bottom). Measured off the source, never guessed. Branding bars,
    #: dead space and panels that repeat the frame all come off here.
    trim: tuple[int, int, int, int] = (0, 0, 0, 0)
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
    # The REF Media bar is 101 rows deep on one and 102 on the other, measured
    # off each source rather than assumed. Both come out 16:9 so that the row
    # of three in front of the backdrop survives the crop intact.
    Job(
        'red-cypher-floor-source.jpg',
        'red-cypher-floor.webp',
        photo=True,
        aspect=WIDE_ASPECT,
        trim=(0, 0, 0, 102),
        focus=0.45,
    ),
    Job(
        'red-cypher-team-source.jpg',
        'red-cypher-team.webp',
        photo=True,
        aspect=WIDE_ASPECT,
        trim=(0, 0, 0, 101),
        focus=0.5,
    ),
    # The finals scoreboard, and a capture rather than a photograph: it is a
    # dark interface already, so it keeps its own shape and needs nothing but
    # an encode. The 28 rows off the bottom land the cut on a row separator,
    # measured at y=796. The source ends part way through rank 22, and half a
    # table row reads as a screenshot taken carelessly rather than as a list
    # that continues.
    Job(
        'red-cypher-leaderboard-source.png',
        'red-cypher-leaderboard.webp',
        trim=(0, 0, 0, 28),
    ),
    # The surveillance console is a dark interface too. The 74 rows off the
    # bottom are empty page under the device bar: dead space in a picture that
    # a card draws 240px tall is dead space the reader pays for.
    Job(
        'adaptive-surveillance-source.png',
        'adaptive-surveillance.webp',
        trim=(0, 0, 0, 74),
    ),
    # The pipeline run is a dark interface at 956 wide, so it needs nothing
    # but an encode and 49 rows off the top. Those 49 are the repository tab
    # bar, and they cost more than they look: a card clamps this picture to
    # 240px, and with the tab bar in it the clamp lands just above the row
    # that says the secrets gate failed, which is the only reason the picture
    # is there. The cut is on the tab bar's own bottom border, measured.
    Job('devsecops-pipeline-source.png', 'devsecops-pipeline.webp', trim=(0, 49, 0, 0)),
    # The WebGoat frame is a 1624x423 strip, of which the right 592 columns
    # are a devtools pane repeating the response that is already readable in
    # the page, and the bottom 173 rows are empty white. Both come off, which
    # leaves the two things that are the evidence: the traversal payload in
    # the address bar and the directory listing it came back with.
    Job('devsecops-webgoat-source.png', 'devsecops-webgoat.webp', trim=(0, 0, 592, 173)),
    # The last two are the only pair in this file trimmed to a shape rather
    # than to cut something off, because they are the only pair that sits in
    # one row of the grid and the only pair that arrived at 16:9.
    #
    # 16:9 is the wrong shape here. A card draws a capture at most 516px
    # wide, which is `max-w-6xl` less the gap, halved, less the padding, and
    # it clamps the result at 240px tall. 16:9 at 516 wide is 290px, so both
    # of these were clamped, and a clamp cuts off the bottom: on the title
    # card that took the line `clearance level 7 agents only` through the
    # middle. So both are trimmed to about 0.43 high by wide, which draws at
    # 222px and clears the clamp with room to spare.
    #
    # The same ratio for both is deliberate. They are side by side in the
    # last row, and two pictures a few pixels different in height there reads
    # as a mistake rather than as two different pictures.
    #
    # Title card: the composition runs y=134 to y=918 of 1080, measured by
    # row profile rather than guessed, and the trim leaves about 20px of the
    # background streaks above the wing tips and below the subtitle.
    Job('shield-ctf-source.png', 'shield-ctf.webp', trim=(0, 113, 0, 141)),
    # The CONFIDENTIAL stamp on flat black, and the only picture published of
    # a classified briefing. 736 wide is under the 1280 cap, so it is passed
    # through at source resolution. The stamp runs y=104 to y=314 of 414, and
    # the trim is centred on it, so it has about 50px of plate on each side
    # rather than sitting high in a frame the clamp cut the bottom off.
    Job('ai-system-source.jpg', 'ai-system.webp', trim=(0, 51, 0, 47)),
    # The two standing figures and the table sit above centre in a frame that
    # is mostly the backs of heads.
    Job('volunteering-anthonys-source.jpeg', 'volunteering-anthonys.webp', photo=True, focus=0.44),
    # Already 4:3, so the crop is a no op and only the resize runs.
    Job('volunteering-embedded-source.jpg', 'volunteering-embedded.webp', photo=True),
    Job('volunteering-sussex-source.jpeg', 'volunteering-sussex.webp', photo=True, focus=0.55, mirror=True),
    # Speaker on the left, slide on the right, both in the upper half.
    Job('volunteering-iot-challenge-source.jpeg', 'volunteering-iot-challenge.webp', photo=True, focus=0.42),
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

        left, top, right, bottom = job.trim
        if left or top or right or bottom:
            image = image.crop((left, top, image.width - right, image.height - bottom))

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
