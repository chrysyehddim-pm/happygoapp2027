"""Extract only illustration assets; all UI is rendered as DOM components."""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1] / 'assets'
out = root / 'visual'
out.mkdir(exist_ok=True)
regions = {
    'avatar': ('shopping', (64, 190, 173, 303)),
    'gift': ('shopping', (67, 1260, 256, 1400)),
    'robot': ('ai-chat', (231, 52, 354, 185)),
    'campaign': ('shopping', (67, 526, 374, 823)),
    'offers': ('shopping', (54, 971, 410, 1185)),
    'shopping': ('shopping', (461, 971, 817, 1185)),
    'birthday': ('games', (64, 525, 560, 864)),
    'game': ('games', (54, 971, 411, 1232)),
    'health': ('games', (460, 971, 817, 1232)),
    'ticket-event': ('lifestyle', (57, 512, 411, 850)),
    'coco': ('lifestyle', (462, 512, 816, 781)),
    'life-offers': ('lifestyle', (57, 1005, 411, 1240)),
    'utag': ('lifestyle', (459, 1005, 816, 1240)),
    'life-ticket': ('ai-chat', (459, 1011, 817, 1257)),
    'egg-gift': ('egg-popup', (274, 516, 595, 687)),
}
for name, (source, box) in regions.items():
    Image.open(root / f'design-{source}.png.png').crop(box).save(out / f'{name}.png')
