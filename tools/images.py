#!/usr/bin/env python3
"""Draws the icons, favicon and social preview images of Toneday. Run from the project root."""
import colorsys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
NIGHT = (11, 13, 20)
INK = (235, 232, 242)
WEEK = [(212, .55, .42), (228, .10, .40), (336, .50, .62), (140, .50, .44), (24, .78, .55), (276, .42, .45), (48, .80, .66)]


def rgb(h, s, l):
    r, g, b = colorsys.hls_to_rgb(h / 360, l, s)
    return int(r * 255), int(g * 255), int(b * 255)


def blobs(w, h, spots, blur, base=(34, 33, 50)):
    img = Image.new("RGB", (w, h), base)
    for (cx, cy, r, col) in spots:
        layer = Image.new("RGB", (w, h), col)
        mask = Image.new("L", (w, h), 0)
        d = ImageDraw.Draw(mask)
        R = int(r * max(w, h))
        d.ellipse([cx * w - R, cy * h - R, cx * w + R, cy * h + R], fill=235)
        mask = mask.filter(ImageFilter.GaussianBlur(R * .55))
        img = Image.composite(layer, img, mask)
    return img.filter(ImageFilter.GaussianBlur(blur))


def font(name, size):
    src = ROOT / "assets" / "fonts" / name
    ttf = Path("/tmp") / (src.stem + ".ttf")
    if not ttf.exists():
        f = TTFont(str(src)); f.flavor = None; f.save(str(ttf))
    return ImageFont.truetype(str(ttf), size)


def icon(size, padded=False):
    img = Image.new("RGB", (size, size), NIGHT)
    spots = [(.34, .36, .24, rgb(*WEEK[0])), (.66, .34, .22, rgb(*WEEK[6])), (.62, .64, .24, rgb(*WEEK[4])),
             (.36, .66, .22, rgb(*WEEK[2])), (.5, .5, .16, rgb(*WEEK[5]))]
    inner = int(size * (.62 if padded else .78))
    art = blobs(inner, inner, spots, inner * .03, base=(40, 38, 58))
    mask = Image.new("L", (inner, inner), 0)
    m = int(inner * .03); ImageDraw.Draw(mask).ellipse([m, m, inner - 1 - m, inner - 1 - m], fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(inner * .01))
    off = (size - inner) // 2
    img.paste(art, (off, off), mask)
    return img


def og(lang):
    W, H = 1200, 630
    spots = [(.62, .22, .30, rgb(*WEEK[3])), (.86, .28, .26, rgb(*WEEK[1])), (.72, .52, .32, rgb(*WEEK[0])),
             (.95, .62, .26, rgb(*WEEK[2])), (.58, .80, .28, rgb(*WEEK[4])), (.84, .92, .30, rgb(*WEEK[5])), (.98, .05, .2, rgb(*WEEK[6]))]
    img = blobs(W, H, spots, 26)
    shade = Image.new("L", (W, H))
    sd = ImageDraw.Draw(shade)
    for x in range(W):
        sd.line([(x, 0), (x, H)], fill=int(255 * max(0, min(1, 1.15 - x / (W * .62)))))
    img = Image.composite(Image.new("RGB", (W, H), NIGHT), img, shade)
    d = ImageDraw.Draw(img)
    eyebrow = "A COLOR A DAY" if lang == "en" else "UN COLORE AL GIORNO"
    line = ["One artwork a week,", "to see and to hear."] if lang == "en" else ["Un’opera a settimana,", "da guardare e da ascoltare."]
    d.text((72, 150), eyebrow, font=font("figtree-latin-600-normal.woff2", 22), fill=(165, 163, 184), spacing=4)
    d.text((64, 190), "Toneday", font=font("cormorant-garamond-latin-300-italic.woff2", 168), fill=INK)
    body = font("figtree-latin-400-normal.woff2", 34)
    d.text((72, 410), line[0], font=body, fill=INK)
    d.text((72, 456), line[1], font=body, fill=INK)
    return img


def main():
    (ROOT / "icons").mkdir(exist_ok=True)
    icon(512).save(ROOT / "icons" / "icon-512.png", optimize=True)
    icon(192).save(ROOT / "icons" / "icon-192.png", optimize=True)
    icon(512, padded=True).save(ROOT / "icons" / "maskable-512.png", optimize=True)
    icon(180).save(ROOT / "icons" / "apple-touch-icon.png", optimize=True)
    icon(64).save(ROOT / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
    for lang in ("en", "it"):
        og(lang).save(ROOT / f"og-{lang}.png", optimize=True)
    (ROOT / "favicon.svg").write_text(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs>'
        '<radialGradient id="a" cx=".3" cy=".3" r=".6"><stop offset="0" stop-color="#3f6fb0"/><stop offset="1" stop-color="#3f6fb0" stop-opacity="0"/></radialGradient>'
        '<radialGradient id="b" cx=".72" cy=".32" r=".55"><stop offset="0" stop-color="#ead36b"/><stop offset="1" stop-color="#ead36b" stop-opacity="0"/></radialGradient>'
        '<radialGradient id="c" cx=".66" cy=".72" r=".55"><stop offset="0" stop-color="#e0773a"/><stop offset="1" stop-color="#e0773a" stop-opacity="0"/></radialGradient>'
        '<radialGradient id="d" cx=".3" cy=".72" r=".55"><stop offset="0" stop-color="#cf6f98"/><stop offset="1" stop-color="#cf6f98" stop-opacity="0"/></radialGradient>'
        '</defs><rect width="64" height="64" rx="14" fill="#0b0d14"/><circle cx="32" cy="32" r="25" fill="#2b2a40"/>'
        '<circle cx="32" cy="32" r="25" fill="url(#a)"/><circle cx="32" cy="32" r="25" fill="url(#b)"/>'
        '<circle cx="32" cy="32" r="25" fill="url(#c)"/><circle cx="32" cy="32" r="25" fill="url(#d)"/></svg>\n',
        encoding="utf-8")
    print("images done")


if __name__ == "__main__":
    main()
