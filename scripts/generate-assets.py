"""
Generate the favicon set and the Open Graph card.

Run from the repo root:

    python scripts/generate-assets.py

Writes into `public/`:
    favicon.ico           16 / 32 / 48, for browsers and tooling without SVG
    icon-192.png          webmanifest
    icon-512.png          webmanifest, maskable-safe padding
    apple-touch-icon.png  180x180, no transparency (iOS composites on white)
    og.png                1200x630 link preview card

`favicon.svg` is hand-written and NOT generated here — it is the primary
favicon for every current browser, and a vector is the right format for
something rendered at a dozen sizes.

Colours are converted from the OKLCH tokens in `src/styles/globals.css`
rather than hard-coded hex, so the assets cannot drift from the design system.

FONT SUBSTITUTION, deliberate and worth knowing: the brand fonts ship as
woff2, and decompressing woff2 needs Brotli, which is not available here. So
the card renders with the closest system faces - Consolas for the monospace
rows, Segoe UI Semibold for the name. At the size a link preview is actually
displayed the difference is not perceptible, but if you want it exact,
install `brotli` and `fonttools`, convert the woff2 files in
`node_modules/@fontsource-variable/*/files/`, and point FONTS below at them.
"""

from __future__ import annotations

import math
import pathlib

from PIL import Image, ImageDraw, ImageFont

ROOT = pathlib.Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"

# --------------------------------------------------------------------------
# OKLCH -> sRGB, so the assets read the same tokens the stylesheet does.
# --------------------------------------------------------------------------


def oklch(lightness: float, chroma: float, hue_deg: float) -> tuple[int, int, int]:
    hue = math.radians(hue_deg)
    a = chroma * math.cos(hue)
    b = chroma * math.sin(hue)

    l_ = lightness + 0.3963377774 * a + 0.2158037573 * b
    m_ = lightness - 0.1055613458 * a - 0.0638541728 * b
    s_ = lightness - 0.0894841775 * a - 1.2914855480 * b

    l, m, s = l_**3, m_**3, s_**3

    linear = (
        4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
        -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
        -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
    )

    def encode(value: float) -> int:
        value = min(1.0, max(0.0, value))
        srgb = 12.92 * value if value <= 0.0031308 else 1.055 * value ** (1 / 2.4) - 0.055
        return round(srgb * 255)

    return tuple(encode(channel) for channel in linear)  # type: ignore[return-value]


OBSIDIAN_950 = oklch(0.105, 0.012, 265)
OBSIDIAN_900 = oklch(0.14, 0.013, 265)
OBSIDIAN_300 = oklch(0.682, 0.013, 265)
OBSIDIAN_500 = oklch(0.422, 0.016, 265)
MINT_400 = oklch(0.888, 0.145, 168)
MINT_600 = oklch(0.718, 0.138, 168)

FONTS = {
    "mono": "C:/Windows/Fonts/consola.ttf",
    "mono_bold": "C:/Windows/Fonts/consolab.ttf",
    "display": "C:/Windows/Fonts/seguisb.ttf",
}


def font(kind: str, size: int) -> ImageFont.FreeTypeFont:
    try:
        return ImageFont.truetype(FONTS[kind], size)
    except OSError:
        print(f"  ! {FONTS[kind]} unavailable — falling back to Arial")
        return ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", size)


# --------------------------------------------------------------------------
# The monogram: `>_`, drawn as geometry rather than type.
#
# Geometry, not a glyph, for two reasons: it stays identical whatever fonts
# the machine has, and a hand-placed chevron survives being scaled to 16px in
# a way that a rasterised glyph does not. Drawn at 8x and downsampled, which
# is cheaper than any antialiasing PIL offers for strokes.
# --------------------------------------------------------------------------

SUPERSAMPLE = 8


def monogram(size: int, *, pad_ratio: float = 0.0, background=OBSIDIAN_950) -> Image.Image:
    big = size * SUPERSAMPLE
    image = Image.new("RGB", (big, big), background)
    draw = ImageDraw.Draw(image)

    # `pad_ratio` shrinks the mark for maskable icons, where a platform may
    # crop up to 10% off every edge.
    inset = big * pad_ratio
    box = big - 2 * inset
    unit = box / 100

    def point(x: float, y: float) -> tuple[float, float]:
        return (inset + x * unit, inset + y * unit)

    stroke = max(1, round(9 * unit))

    draw.line(
        [point(22, 30), point(48, 50), point(22, 70)],
        fill=MINT_400,
        width=stroke,
        joint="curve",
    )
    # Long enough to read as an underscore rather than a hyphen, and sitting
    # on the chevron's baseline so the pair reads as one mark.
    draw.rounded_rectangle(
        [point(56, 63), point(80, 70)],
        radius=stroke / 2,
        fill=MINT_400,
    )

    return image.resize((size, size), Image.LANCZOS)


def write_icons() -> None:
    # PIL writes a genuine multi-size ICO; 16/32/48 is what Windows, the
    # address bar and most feed readers actually ask for.
    master = monogram(256)
    master.save(PUBLIC / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
    print("  favicon.ico          16/32/48")

    monogram(192).save(PUBLIC / "icon-192.png")
    print("  icon-192.png")

    # Extra padding so a maskable crop can't clip the mark.
    monogram(512, pad_ratio=0.10).save(PUBLIC / "icon-512.png")
    print("  icon-512.png         maskable padding")

    # iOS ignores transparency and composites on white, so this one is opaque
    # on the darker obsidian rather than on the canvas colour.
    monogram(180, background=OBSIDIAN_950).save(PUBLIC / "apple-touch-icon.png")
    print("  apple-touch-icon.png 180x180 opaque")


# --------------------------------------------------------------------------
# Open Graph card
# --------------------------------------------------------------------------

OG_WIDTH, OG_HEIGHT = 1200, 630
GRID_CELL = 32  # matches --grid-cell


def write_og() -> None:
    image = Image.new("RGB", (OG_WIDTH, OG_HEIGHT), OBSIDIAN_900)
    draw = ImageDraw.Draw(image, "RGBA")

    # Dot matrix, the same 32px cell as <GridBackdrop />.
    for y in range(0, OG_HEIGHT, GRID_CELL):
        for x in range(0, OG_WIDTH, GRID_CELL):
            draw.point((x, y), fill=(255, 255, 255, 20))

    # A corner glow where the cursor light would be.
    glow = Image.new("RGBA", (OG_WIDTH, OG_HEIGHT), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    for radius in range(520, 0, -8):
        alpha = int(14 * (1 - radius / 520) ** 2)
        glow_draw.ellipse(
            [1080 - radius, 120 - radius, 1080 + radius, 120 + radius],
            fill=(*MINT_400, alpha),
        )
    image = Image.alpha_composite(image.convert("RGBA"), glow).convert("RGB")
    draw = ImageDraw.Draw(image, "RGBA")

    # Hairline frame.
    draw.rectangle([40, 40, OG_WIDTH - 41, OG_HEIGHT - 41], outline=(255, 255, 255, 28), width=1)

    left = 96
    draw.text((left, 118), "// SHADOW COMMAND CENTER", font=font("mono_bold", 22), fill=MINT_600)

    draw.text((left, 206), "ACHIN", font=font("display", 104), fill=(246, 247, 250))
    draw.text((left, 318), "CHANDRASIRI", font=font("display", 104), fill=MINT_400)

    draw.line([left, 468, left + 72, 468], fill=MINT_400, width=2)
    draw.text(
        (left, 496),
        "CYBERSECURITY  ·  DEVSECOPS  ·  AI RESEARCH",
        font=font("mono", 24),
        fill=OBSIDIAN_300,
    )

    footer = font("mono", 20)
    draw.text((left, 546), "github.com/achinpp", font=footer, fill=OBSIDIAN_500)

    mark = monogram(72, background=OBSIDIAN_900)
    image.paste(mark, (OG_WIDTH - 96 - 72, OG_HEIGHT - 96 - 72))

    image.save(PUBLIC / "og.png", optimize=True)
    print(f"  og.png               {OG_WIDTH}x{OG_HEIGHT}")


if __name__ == "__main__":
    PUBLIC.mkdir(exist_ok=True)
    print("tokens:")
    print(f"  obsidian-950 #{'%02x%02x%02x' % OBSIDIAN_950}")
    print(f"  obsidian-900 #{'%02x%02x%02x' % OBSIDIAN_900}")
    print(f"  mint-400     #{'%02x%02x%02x' % MINT_400}")
    print("writing:")
    write_icons()
    write_og()
    print("done")
