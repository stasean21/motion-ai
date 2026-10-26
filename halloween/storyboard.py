"""Storyboard sheet: mockups in a grid with timecode and description (for approval)."""
import os
import sys

from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build_mockups import FRAMES, FRAMES2, OUT, TC2  # noqa: E402

COLS, TW, TH, CAP = 3, 480, 853, 130
FB = ImageFont.truetype("/usr/share/fonts/opentype/inter/Inter-Bold.otf", 30)
FR = ImageFont.truetype("/usr/share/fonts/opentype/inter/Inter-SemiBold.otf", 22)


def wrap(d, text, font, width):
    words, lines, cur = text.split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if d.textlength(t, font=font) > width and cur:
            lines.append(cur)
            cur = w
        else:
            cur = t
    return lines + [cur]


def main(path, frames=FRAMES):
    rows = (len(frames) + COLS - 1) // COLS
    sheet = Image.new("RGB", (COLS * TW + (COLS + 1) * 20, rows * (TH + CAP) + (rows + 1) * 20), (14, 10, 20))
    d = ImageDraw.Draw(sheet)
    for i, (name, _, tc, desc) in enumerate(frames):
        x = 20 + (i % COLS) * (TW + 20)
        y = 20 + (i // COLS) * (TH + CAP + 20)
        sheet.paste(Image.open(os.path.join(OUT, name + ".jpg")).resize((TW, TH), Image.LANCZOS), (x, y))
        d.text((x, y + TH + 10), f"{name[:3].upper()}  ·  {tc}", font=FB, fill=(255, 170, 60))
        for j, line in enumerate(wrap(d, desc, FR, TW)[:3]):
            d.text((x, y + TH + 50 + j * 27), line, font=FR, fill=(230, 225, 240))
    sheet.save(path, quality=90)


if __name__ == "__main__":
    if sys.argv[1:] == ["2"]:
        main(os.path.join(OUT, "storyboard_03-09.jpg"), [(n, f, tc, d) for (n, f, d), tc in zip(FRAMES2, TC2)])
    else:
        main(os.path.join(OUT, "storyboard_00-02.jpg"))
