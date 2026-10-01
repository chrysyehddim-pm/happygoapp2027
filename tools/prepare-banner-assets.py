"""Normalize banner canvases with padding only; never crop or stretch artwork."""
from pathlib import Path
from PIL import Image, ImageOps
root = Path(__file__).resolve().parents[1] / 'assets' / 'visual'
def fit(source, target, size, color, inset):
    image = Image.open(root / source).convert('RGB')
    fitted = ImageOps.contain(image, (size[0]-inset*2, size[1]-inset*2), Image.Resampling.LANCZOS)
    canvas = Image.new('RGB', size, color)
    canvas.paste(fitted, ((size[0]-fitted.width)//2, (size[1]-fitted.height)//2))
    canvas.save(root / target)
for name,color in [('offers','#fff1de'),('shopping','#ede3ff'),('game','#eee5ff'),('health','#e8f8ed'),('life-offers','#fff1de'),('utag','#e7f8f0')]:
    fit(name+'.png',name+'-safe.png',(800,500),color,16)
for name,color in [('ticket-event','#fff0f4'),('coco','#f9f2e9')]:
    fit(name+'.png',name+'-safe.png',(800,560),color,16)
for source in root.glob('*-raw.png'):
    name=source.stem.removesuffix('-raw')
    color='#eee5ff' if name.startswith(('shopping','game')) else '#e8f8ed' if name.startswith(('health','utag')) else '#fff1de'
    fit(source.name,name+'.png',(800,500),color,16)
