"""Render the simple Night Voyage compass favicon at two raster sizes."""

from pathlib import Path

from PIL import Image, ImageDraw


DEST = Path(__file__).resolve().parents[1] / "public" / "favicon"
SCALE = 4
SIZE = 192 * SCALE

canvas = Image.new("RGB", (SIZE, SIZE), "#123f60")
draw = ImageDraw.Draw(canvas)
draw.rounded_rectangle((0, 0, SIZE - 1, SIZE - 1), radius=48 * SCALE, fill="#123f60")
draw.ellipse((36 * SCALE, 36 * SCALE, 156 * SCALE, 156 * SCALE), outline="#d9f4f4", width=6 * SCALE)
draw.line((96 * SCALE, 36 * SCALE, 96 * SCALE, 156 * SCALE), fill="#a7d8df", width=4 * SCALE)
draw.line((36 * SCALE, 96 * SCALE, 156 * SCALE, 96 * SCALE), fill="#a7d8df", width=4 * SCALE)
draw.polygon(
    [(117 * SCALE, 75 * SCALE), (102 * SCALE, 114 * SCALE),
     (75 * SCALE, 117 * SCALE), (90 * SCALE, 78 * SCALE)],
    fill="#d4f1ec",
)
draw.ellipse((90 * SCALE, 90 * SCALE, 102 * SCALE, 102 * SCALE), fill="#0b3659")

for size in (32, 192):
    canvas.resize((size, size), Image.Resampling.LANCZOS).save(
        DEST / f"night-voyage-{size}.png", optimize=True
    )
