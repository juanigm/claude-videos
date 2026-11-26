# Vista previa de la foto de perfil como la muestran las redes: recortada en círculo, en tamaño grande y chico,
# sobre fondo claro y oscuro. usage: py -3.13 scripts/avatar_preview.py out/perfil/perfil.png out/perfil/preview.png
import sys
from PIL import Image, ImageDraw

src = Image.open(sys.argv[1]).convert("RGBA")
mask = Image.new("L", src.size, 0)
ImageDraw.Draw(mask).ellipse((0, 0, src.size[0] - 1, src.size[1] - 1), fill=255)
circ = Image.new("RGBA", src.size, (0, 0, 0, 0))
circ.paste(src, (0, 0), mask)

sizes = [320, 160, 110, 48]
W = 40 + sum(s + 30 for s in sizes)
out = Image.new("RGB", (W, 2 * 380), (255, 255, 255))
d = ImageDraw.Draw(out)
d.rectangle((0, 380, W, 760), fill=(18, 18, 18))
for row, y0 in enumerate((30, 410)):
    x = 30
    for s in sizes:
        im = circ.resize((s, s), Image.LANCZOS)
        out.paste(im, (x, y0 + (320 - s) // 2), im)
        x += s + 30
out.save(sys.argv[2])
print("ok", sys.argv[2])
