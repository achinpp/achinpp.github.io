#!/usr/bin/env python
"""
Turn the source portrait into the asset the hero actually ships.

    python scripts/process-portrait.py

Reads  assets/portrait-source.png   (cut-out with a transparent background)
Writes public/portrait.webp         (trimmed, premultiplied-safe, lossy+alpha)

WHY WEBP AND ONLY WEBP. The hero uses the very same URL twice: once as the
`<img>` and once as a CSS `mask-image`, which is what paints the mint sheen in
the exact shape of the silhouette rather than over a rectangle. Two formats
behind a `<picture>` would mean the mask either points at a file the browser
did not otherwise need — doubling the bytes — or at a format it cannot read.
One URL, one fetch, one decode. WebP with alpha is Chrome 32+, Firefox 65+,
Safari 14+ and Edge 18+; there is no browser in current use that gets the
`<img>` but not the mask.

WHY THE TRIM. The source has 40px of fully transparent padding across the top
and a transparent column down the left. Shipping that means the layout box is
bigger than the subject, so the figure never lines up with anything. Cropping
to the alpha bounding box makes the box and the silhouette the same thing.

NO UPSCALING. The source is 452x654. The hero renders it around 270px wide, so
it is roughly 1.6x on a 2x display — sharp. Rendering it much larger than that
would be visibly soft, which is why the component caps its width rather than
letting it fill the column.
"""

from __future__ import annotations

import pathlib
import sys

from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'assets' / 'portrait-source.png'
OUT = ROOT / 'public' / 'portrait.webp'

# 82 was picked by inspection, not by habit: at 78 the gradient across the
# cheek banded, and above 86 the file grew with nothing to show for it.
QUALITY = 82


def main() -> int:
    if not SOURCE.exists():
        print(f'missing source: {SOURCE}', file=sys.stderr)
        return 1

    image = Image.open(SOURCE).convert('RGBA')
    before = image.size

    box = image.getchannel('A').getbbox()
    if box is None:
        print('source is fully transparent', file=sys.stderr)
        return 1
    image = image.crop(box)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    # `exact=True` keeps the RGB values under fully transparent pixels intact.
    # Without it the encoder is free to rewrite them to whatever compresses
    # best, and those invented colours bleed back out through the semi-opaque
    # pixels along the cut-out edge as a halo.
    image.save(OUT, 'WEBP', quality=QUALITY, method=6, exact=True)

    kib = OUT.stat().st_size / 1024
    print(f'{SOURCE.name}: {before[0]}x{before[1]}  ->  {OUT.name}: '
          f'{image.width}x{image.height}  {kib:.1f} kB')
    print(f'set width={image.width} height={image.height} on the <img>')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
