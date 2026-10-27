"""
Portrait grade for The Pilgrim page.

Turns the studio photo (violet backdrop) into a shadowed, near-black portrait with a warm
ember rim light on the right side, on a transparent background.

    pip install numpy scipy pillow
    python scripts/portrait_grade.py assets-src/portrait/original.png assets-src/portrait/pilgrim-graded.png
    # then export the web version:
    python -c "from PIL import Image; Image.open('assets-src/portrait/pilgrim-graded.png').save('public/images/pilgrim-portrait.webp','WEBP',quality=88,method=6)"

The background key assumes a saturated blue/violet backdrop. For a new photo on a different
backdrop, adjust `background_score` (or use a proper matting tool and skip to the grade step).
Tuning knobs are the CONSTANTS below.
"""
import sys

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

GAMMA = 1.1  # >1 darker midtones
RIM_WIDTH_PX = 9.0  # rim light falloff inside the silhouette
RIM_STRENGTH = 1.1
RIM_SIDE_START = 0.45  # rim only on the right part of the image (0..1 of width)
KEY_STRENGTH = 1.0  # soft key light on the face
KEY_FACE_Y = 0.27  # vertical centre of the face (0..1 of height)
EMBER = np.array([1.0, 0.62, 0.28])
MAX_SIZE = (1000, 1400)


def background_score(a: np.ndarray) -> np.ndarray:
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mx, mn = a.max(-1), a.min(-1)
    sat = (mx - mn) / (mx + 1e-6)
    return (
        np.clip(((b - g) - 0.25) / 0.25, 0, 1)
        * np.clip((sat - 0.45) / 0.2, 0, 1)
        * np.clip((mx - 0.35) / 0.15, 0, 1)
    )


def subject_mask(a: np.ndarray) -> np.ndarray:
    fg = ~(background_score(a) > 0.5)
    fg = ndimage.binary_opening(fg, iterations=3)
    lab, n = ndimage.label(fg)
    sizes = ndimage.sum(fg, lab, range(1, n + 1))
    fg = lab == (int(np.argmax(sizes)) + 1)
    fg = ndimage.binary_fill_holes(fg)
    return ndimage.binary_closing(fg, iterations=4)


def grade(src: str, dst: str) -> None:
    a = np.asarray(Image.open(src).convert("RGB")).astype(np.float32) / 255.0
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    fg = subject_mask(a)
    soft = Image.fromarray((fg * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(2.2))
    alpha = np.asarray(soft).astype(np.float32) / 255.0

    # desaturate with violet despill, warm tint
    lum = np.minimum(0.30 * r + 0.55 * g + 0.15 * b, (r + g) / 2 + 0.05)
    gray = np.clip((np.clip(lum, 0, 1) - 0.02) * 1.35, 0, 1) ** GAMMA
    base = np.stack([gray * 1.05, gray * 0.93, gray * 0.82], -1)

    h, w = fg.shape
    xs = np.linspace(0, 1, w)[None, :]
    ys = np.linspace(0, 1, h)[:, None]

    # ember rim light along the inside edge, right side only
    dist = ndimage.distance_transform_edt(fg)
    side = np.clip((xs - RIM_SIDE_START) / 0.35, 0, 1) * np.clip(1.1 - ys * 0.8, 0, 1)
    rim = np.exp(-dist / RIM_WIDTH_PX) * fg * side
    light = base + rim[..., None] * EMBER * RIM_STRENGTH

    # soft key light on the face from the right
    key = np.clip((xs - 0.35) / 0.4, 0, 1) * np.exp(-(((ys - KEY_FACE_Y) / 0.18) ** 2))
    light = light * (0.72 + KEY_STRENGTH * key[..., None])

    # fade the body into darkness toward the bottom
    fade = np.clip((0.98 - ys) / 0.35, 0, 1)
    light = np.clip(light * fade[..., None], 0, 1)
    alpha = alpha * fade

    out = Image.fromarray((np.dstack([light, alpha]) * 255).astype(np.uint8), "RGBA")
    out = out.crop(out.getbbox())
    out.thumbnail(MAX_SIZE, Image.LANCZOS)
    out.save(dst, optimize=True)
    print("saved", dst, out.size)


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit("usage: python scripts/portrait_grade.py <input> <output.png>")
    grade(sys.argv[1], sys.argv[2])
