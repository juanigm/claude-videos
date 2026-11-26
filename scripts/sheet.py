# Contact sheet of stills, labelled with their frame numbers.
# usage: python scripts/sheet.py out.jpg cols prefix frame,frame,...   (reads <prefix><frame>.jpg)
import sys
from PIL import Image, ImageDraw, ImageFont
dst, cols, prefix, frames = sys.argv[1], int(sys.argv[2]), sys.argv[3], [int(x) for x in sys.argv[4].split(",")]
ims = [Image.open(f"{prefix}{f}.jpg").convert("RGB") for f in frames]
w, h = ims[0].size; W, H = w // 2, h // 2
rows = (len(ims) + cols - 1) // cols
sheet = Image.new("RGB", (W * cols, H * rows), "white")
d = ImageDraw.Draw(sheet); font = ImageFont.truetype(r"C:\Windows\Fonts\arialbd.ttf", 22)
for i, (f, im) in enumerate(zip(frames, ims)):
    x, y = (i % cols) * W, (i // cols) * H
    sheet.paste(im.resize((W, H)), (x, y))
    d.rectangle([x, y, x + 70, y + 28], fill="black"); d.text((x + 6, y + 3), f"f{f}", font=font, fill="white")
sheet.save(dst, quality=88)
