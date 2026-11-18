import os
import math
import struct
import wave
import random
from PIL import Image, ImageDraw

# ==========================================
# 1. PIXEL ART SPRITE GENERATION
# ==========================================

def create_sprite(width, height, draw_func):
    img = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw_func(draw, width, height)
    return img

# Player drawing helper
def draw_runner(draw, w, h, body_col, visor_col, accent_col, pose="run1"):
    # 32x32 pixel character
    # pose: run1, run2, run3, run4, jump, slide
    cx = 16
    
    if pose == "slide":
        # Crouched horizontal pose
        # Head/visor
        draw.rectangle([18, 18, 28, 26], fill=body_col)
        draw.rectangle([23, 20, 27, 23], fill=visor_col)
        # Body
        draw.rectangle([10, 21, 20, 27], fill=body_col)
        draw.rectangle([12, 23, 17, 25], fill=accent_col)
        # Legs stretched back
        draw.rectangle([2, 24, 11, 28], fill=body_col)
        draw.rectangle([0, 26, 4, 29], fill=accent_col)
        return

    # Head
    draw.rectangle([cx - 4, 4, cx + 5, 12], fill=body_col)
    # Cyber Visor
    draw.rectangle([cx + 1, 6, cx + 5, 8], fill=visor_col)
    
    # Body / Torso
    draw.rectangle([cx - 5, 13, cx + 4, 22], fill=body_col)
    # Chest neon stripe
    draw.rectangle([cx - 2, 15, cx + 2, 19], fill=accent_col)
    
    # Arms and Legs based on pose
    if pose == "run1":
        # Front leg forward, back leg back
        draw.rectangle([cx, 23, cx + 4, 30], fill=body_col)
        draw.rectangle([cx + 1, 29, cx + 5, 31], fill=accent_col)
        draw.rectangle([cx - 5, 23, cx - 2, 28], fill=body_col)
        draw.rectangle([cx - 7, 27, cx - 4, 29], fill=accent_col)
        # Arm
        draw.rectangle([cx + 3, 14, cx + 6, 19], fill=accent_col)
    elif pose == "run2":
        # Passing pose
        draw.rectangle([cx - 2, 23, cx + 1, 30], fill=body_col)
        draw.rectangle([cx - 2, 29, cx + 2, 31], fill=accent_col)
        draw.rectangle([cx - 4, 21, cx - 1, 26], fill=body_col)
        # Arm
        draw.rectangle([cx - 3, 15, cx + 1, 20], fill=accent_col)
    elif pose == "run3":
        # Opposite stride
        draw.rectangle([cx - 6, 23, cx - 2, 30], fill=body_col)
        draw.rectangle([cx - 7, 29, cx - 3, 31], fill=accent_col)
        draw.rectangle([cx + 2, 23, cx + 5, 27], fill=body_col)
        draw.rectangle([cx + 3, 26, cx + 6, 28], fill=accent_col)
        # Arm
        draw.rectangle([cx - 5, 14, cx - 2, 19], fill=accent_col)
    elif pose == "run4":
        # Passing 2
        draw.rectangle([cx - 1, 23, cx + 2, 30], fill=body_col)
        draw.rectangle([cx - 1, 29, cx + 3, 31], fill=accent_col)
        draw.rectangle([cx + 1, 21, cx + 4, 26], fill=body_col)
        # Arm
        draw.rectangle([cx + 2, 15, cx + 5, 20], fill=accent_col)
    elif pose == "jump":
        # Tucked legs
        draw.rectangle([cx - 4, 22, cx - 1, 27], fill=body_col)
        draw.rectangle([cx + 1, 22, cx + 4, 26], fill=body_col)
        draw.rectangle([cx - 4, 26, cx, 28], fill=accent_col)
        draw.rectangle([cx + 1, 25, cx + 5, 27], fill=accent_col)
        # Arms raised
        draw.rectangle([cx - 6, 12, cx - 3, 17], fill=accent_col)
        draw.rectangle([cx + 3, 12, cx + 6, 17], fill=accent_col)

# Generate 3 Skins
skins = [
    ("default", (25, 40, 80), (0, 240, 255), (0, 180, 255)),     # Cyan Runner
    ("ninja", (30, 20, 45), (255, 30, 140), (200, 50, 220)),     # Cyber Pink Ninja
    ("mech", (70, 60, 20), (255, 215, 0), (255, 80, 20))         # Golden Mech
]

for skin_name, body, visor, accent in skins:
    for pose in ["run1", "run2", "run3", "run4", "jump", "slide"]:
        img = create_sprite(32, 32, lambda d, w, h, b=body, v=visor, a=accent, p=pose: draw_runner(d, w, h, b, v, a, p))
        img.save(f"assets/sprites/player/player_{skin_name}_{pose}.png")

# Shield Bubble Effect
def draw_shield_bubble(draw, w, h):
    # Glowing translucent sphere
    draw.ellipse([2, 2, w - 3, h - 3], outline=(0, 240, 255, 220), width=2)
    draw.ellipse([6, 6, w - 7, h - 7], fill=(0, 200, 255, 60))
    # Hexagon or energy dots
    draw.line([w//2 - 10, 10, w//2 + 10, 10], fill=(255, 255, 255, 180), width=1)
    draw.line([10, h//2, 14, h//2], fill=(255, 255, 255, 200), width=2)
create_sprite(48, 48, draw_shield_bubble).save("assets/sprites/player/shield_bubble.png")

# Obstacle: Spikes Floor
def draw_spike_floor(draw, w, h):
    # Two sharp triangles
    draw.polygon([(2, h - 2), (8, 4), (14, h - 2)], fill=(220, 30, 60), outline=(255, 100, 120))
    draw.polygon([(16, h - 2), (23, 2), (30, h - 2)], fill=(220, 30, 60), outline=(255, 100, 120))
    # Base rail
    draw.rectangle([0, h - 4, w - 1, h - 1], fill=(50, 50, 65))
create_sprite(32, 32, draw_spike_floor).save("assets/sprites/obstacles/spike_floor.png")

# Obstacle: Spikes Ceiling (hanging down)
def draw_spike_ceiling(draw, w, h):
    draw.polygon([(2, 2), (8, h - 4), (14, 2)], fill=(220, 30, 60), outline=(255, 100, 120))
    draw.polygon([(16, 2), (23, h - 2), (30, 2)], fill=(220, 30, 60), outline=(255, 100, 120))
    draw.rectangle([0, 0, w - 1, 3], fill=(50, 50, 65))
create_sprite(32, 32, draw_spike_ceiling).save("assets/sprites/obstacles/spike_ceiling.png")

# Obstacle: Laser Barrier (vertical tall)
def draw_laser_barrier(draw, w, h):
    # Top and bottom emitters
    draw.rectangle([4, 0, w - 5, 8], fill=(60, 60, 80), outline=(100, 100, 130))
    draw.rectangle([4, h - 9, w - 5, h - 1], fill=(60, 60, 80), outline=(100, 100, 130))
    # Glowing laser beam
    draw.rectangle([12, 8, w - 13, h - 9], fill=(255, 30, 80, 220))
    draw.rectangle([14, 8, w - 15, h - 9], fill=(255, 230, 240, 255))
create_sprite(32, 64, draw_laser_barrier).save("assets/sprites/obstacles/laser_barrier.png")

# Obstacle: Floating Cyber Mine
def draw_floating_mine(draw, w, h):
    cx, cy = w // 2, h // 2
    # Spikes around circle
    for angle in [0, 45, 90, 135, 180, 225, 270, 315]:
        rad = math.radians(angle)
        x1 = cx + math.cos(rad) * 6
        y1 = cy + math.sin(rad) * 6
        x2 = cx + math.cos(rad) * 14
        y2 = cy + math.sin(rad) * 14
        draw.line([x1, y1, x2, y2], fill=(255, 50, 50), width=2)
    # Central sphere
    draw.ellipse([cx - 7, cy - 7, cx + 7, cy + 7], fill=(40, 40, 55), outline=(255, 50, 50), width=2)
    # Blinking red core
    draw.ellipse([cx - 3, cy - 3, cx + 3, cy + 3], fill=(255, 220, 0))
create_sprite(32, 32, draw_floating_mine).save("assets/sprites/obstacles/floating_mine.png")

# Obstacle/Trigger: Anti-Gravity Portal / Zone
def draw_gravity_portal(draw, w, h):
    # Vertical swirling portal
    draw.ellipse([4, 2, w - 5, h - 3], fill=(30, 10, 60, 160), outline=(180, 40, 255), width=2)
    # Up and down arrows inside
    cx = w // 2
    draw.polygon([(cx, 10), (cx - 6, 20), (cx + 6, 20)], fill=(0, 255, 255))
    draw.polygon([(cx, h - 11), (cx - 6, h - 21), (cx + 6, h - 21)], fill=(255, 0, 200))
    draw.rectangle([cx - 2, 20, cx + 2, h - 21], fill=(255, 255, 255))
create_sprite(32, 64, draw_gravity_portal).save("assets/sprites/obstacles/gravity_portal.png")

# Collectibles: Coins & Powerups (24x24)
def draw_coin(draw, w, h):
    draw.ellipse([2, 2, w - 3, h - 3], fill=(255, 200, 0), outline=(255, 240, 120), width=2)
    draw.ellipse([6, 6, w - 7, h - 7], fill=(230, 160, 0))
    # Star / Diamond in center
    cx, cy = w // 2, h // 2
    draw.polygon([(cx, cy - 4), (cx + 4, cy), (cx, cy + 4), (cx - 4, cy)], fill=(255, 255, 200))
create_sprite(24, 24, draw_coin).save("assets/sprites/pickups/coin.png")

def draw_powerup_shield(draw, w, h):
    draw.ellipse([1, 1, w - 2, h - 2], fill=(20, 40, 80), outline=(0, 220, 255), width=2)
    # Shield crest
    draw.polygon([(6, 6), (w - 7, 6), (w - 7, 13), (w//2, w - 6), (6, 13)], fill=(0, 220, 255), outline=(255, 255, 255))
create_sprite(24, 24, draw_powerup_shield).save("assets/sprites/pickups/powerup_shield.png")

def draw_powerup_magnet(draw, w, h):
    draw.ellipse([1, 1, w - 2, h - 2], fill=(40, 20, 25), outline=(255, 60, 80), width=2)
    # Horseshoe
    draw.arc([5, 5, w - 6, h - 6], start=0, end=180, fill=(220, 30, 40), width=4)
    # Tips (silver)
    draw.rectangle([5, 12, 8, 16], fill=(220, 220, 230))
    draw.rectangle([w - 9, 12, w - 6, 16], fill=(220, 220, 230))
create_sprite(24, 24, draw_powerup_magnet).save("assets/sprites/pickups/powerup_magnet.png")

def draw_powerup_gravity(draw, w, h):
    draw.ellipse([1, 1, w - 2, h - 2], fill=(40, 10, 60), outline=(180, 50, 255), width=2)
    # Central gyro with bidirectional vertical arrows
    cx, cy = w // 2, h // 2
    draw.polygon([(cx, 5), (cx - 4, 11), (cx + 4, 11)], fill=(0, 255, 255))
    draw.polygon([(cx, w - 6), (cx - 4, w - 12), (cx + 4, w - 12)], fill=(255, 50, 200))
    draw.line([cx, 11, cx, w - 12], fill=(255, 255, 255), width=2)
create_sprite(24, 24, draw_powerup_gravity).save("assets/sprites/pickups/powerup_gravity.png")

def draw_powerup_double(draw, w, h):
    draw.ellipse([1, 1, w - 2, h - 2], fill=(60, 50, 10), outline=(255, 215, 0), width=2)
    cx, cy = w // 2, h // 2
    # Draw '2'
    draw.line([cx - 6, cy - 5, cx - 2, cy - 5], fill=(255, 255, 255), width=2)
    draw.line([cx - 2, cy - 5, cx - 2, cy], fill=(255, 255, 255), width=2)
    draw.line([cx - 6, cy, cx - 2, cy], fill=(255, 255, 255), width=2)
    draw.line([cx - 6, cy, cx - 6, cy + 5], fill=(255, 255, 255), width=2)
    draw.line([cx - 6, cy + 5, cx - 2, cy + 5], fill=(255, 255, 255), width=2)
    # Draw 'X'
    draw.line([cx + 1, cy - 5, cx + 6, cy + 5], fill=(255, 215, 0), width=2)
    draw.line([cx + 6, cy - 5, cx + 1, cy + 5], fill=(255, 215, 0), width=2)
create_sprite(24, 24, draw_powerup_double).save("assets/sprites/pickups/powerup_double.png")

# Floor & Ceiling Platforms (128x32 repeating tile)
def draw_floor(draw, w, h):
    # Top neon runner rail
    draw.rectangle([0, 0, w - 1, 3], fill=(0, 240, 255))
    draw.rectangle([0, 4, w - 1, 7], fill=(0, 120, 180))
    # Metal tech plates
    draw.rectangle([0, 8, w - 1, h - 1], fill=(25, 28, 38))
    for x in range(0, w, 32):
        draw.line([x, 8, x, h - 1], fill=(15, 17, 24), width=2)
        draw.rectangle([x + 4, 12, x + 28, 20], fill=(35, 40, 55))
        # Tech bolts
        draw.point((x + 6, 14), fill=(0, 200, 255))
        draw.point((x + 26, 14), fill=(0, 200, 255))
create_sprite(128, 32, draw_floor).save("assets/sprites/background/floor.png")

def draw_ceiling(draw, w, h):
    # Inverted floor for top running track
    draw.rectangle([0, 0, w - 1, h - 9], fill=(25, 28, 38))
    for x in range(0, w, 32):
        draw.line([x, 0, x, h - 9], fill=(15, 17, 24), width=2)
        draw.rectangle([x + 4, 10, x + 28, 18], fill=(45, 30, 60))
        draw.point((x + 6, 16), fill=(200, 50, 255))
        draw.point((x + 26, 16), fill=(200, 50, 255))
    draw.rectangle([0, h - 8, w - 1, h - 5], fill=(140, 0, 200))
    draw.rectangle([0, h - 4, w - 1, h - 1], fill=(220, 50, 255))
create_sprite(128, 32, draw_ceiling).save("assets/sprites/background/ceiling.png")

# Parallax Backgrounds (640x360)
def draw_sky(draw, w, h):
    # Synthwave gradient night sky
    for y in range(h):
        r = int(10 + (35 - 10) * (y / h))
        g = int(8 + (15 - 8) * (y / h))
        b = int(25 + (60 - 25) * (y / h))
        draw.line([0, y, w, y], fill=(r, g, b))
    # Stars
    import random
    rng = random.Random(42)
    for _ in range(80):
        sx = rng.randint(0, w - 1)
        sy = rng.randint(0, h - 120)
        col = rng.choice([(255, 255, 255, 220), (180, 220, 255, 180), (255, 180, 240, 160)])
        draw.point((sx, sy), fill=col)
    # Synthwave digital sun on horizon
    sun_cx, sun_cy = w // 2, h - 90
    for radius in range(50, 0, -1):
        scol = (int(255 - radius), int(80 + radius * 2), int(160 + radius))
        draw.ellipse([sun_cx - radius, sun_cy - radius, sun_cx + radius, sun_cy + radius], fill=scol)
create_sprite(640, 360, draw_sky).save("assets/sprites/background/sky.png")

def draw_buildings_far(draw, w, h):
    # Distant cyber skyline
    rng = random.Random(101)
    x = 0
    while x < w:
        bw = rng.randint(28, 55)
        bh = rng.randint(90, 170)
        by = h - bh - 40
        draw.rectangle([x, by, x + bw, h], fill=(20, 18, 38, 220))
        # Windows
        for wy in range(by + 10, h - 50, 12):
            for wx in range(x + 5, x + bw - 5, 8):
                if rng.random() > 0.45:
                    wcol = rng.choice([(0, 200, 240, 140), (240, 50, 150, 120), (255, 220, 100, 110)])
                    draw.rectangle([wx, wy, wx + 3, wy + 5], fill=wcol)
        x += bw - 4
create_sprite(640, 360, draw_buildings_far).save("assets/sprites/background/buildings_far.png")

def draw_buildings_mid(draw, w, h):
    # Mid-ground cyber city with glowing neon pillars
    rng = random.Random(202)
    x = 0
    while x < w:
        bw = rng.randint(35, 70)
        bh = rng.randint(60, 120)
        by = h - bh - 32
        draw.rectangle([x, by, x + bw, h], fill=(30, 32, 48, 240))
        draw.rectangle([x + 2, by + 2, x + bw - 2, by + 5], fill=(0, 255, 240, 200))
        # Neon signs / lines
        draw.line([x + 8, by + 16, x + bw - 8, by + 16], fill=(255, 0, 140, 180), width=2)
        for wy in range(by + 26, h - 35, 14):
            for wx in range(x + 8, x + bw - 8, 10):
                if rng.random() > 0.4:
                    draw.rectangle([wx, wy, wx + 5, wy + 6], fill=(0, 230, 255, 190))
        x += bw - 2
create_sprite(640, 360, draw_buildings_mid).save("assets/sprites/background/buildings_mid.png")

# UI Elements
def draw_panel(draw, w, h):
    # Translucent cyber glass panel with bright cyan border
    draw.rectangle([0, 0, w - 1, h - 1], fill=(12, 16, 28, 220), outline=(0, 220, 255), width=2)
    draw.rectangle([4, 4, 8, 8], fill=(0, 255, 255))
    draw.rectangle([w - 9, 4, w - 5, 8], fill=(0, 255, 255))
    draw.rectangle([4, h - 9, 8, h - 5], fill=(0, 255, 255))
    draw.rectangle([w - 9, h - 9, w - 5, h - 5], fill=(0, 255, 255))
create_sprite(64, 64, draw_panel).save("assets/sprites/ui/panel_bg.png")

def draw_button(draw, w, h, state="normal"):
    border_col = (0, 220, 255) if state == "normal" else ((255, 230, 0) if state == "hover" else (0, 150, 180))
    bg_col = (20, 28, 48) if state == "normal" else ((40, 50, 80) if state == "hover" else (10, 16, 30))
    draw.rectangle([0, 0, w - 1, h - 1], fill=bg_col, outline=border_col, width=2)
    # Corner notches
    draw.point((0, 0), fill=(0, 0, 0, 0))
    draw.point((w - 1, 0), fill=(0, 0, 0, 0))
    draw.point((0, h - 1), fill=(0, 0, 0, 0))
    draw.point((w - 1, h - 1), fill=(0, 0, 0, 0))
create_sprite(120, 40, lambda d, w, h: draw_button(d, w, h, "normal")).save("assets/sprites/ui/button_normal.png")
create_sprite(120, 40, lambda d, w, h: draw_button(d, w, h, "hover")).save("assets/sprites/ui/button_hover.png")
create_sprite(120, 40, lambda d, w, h: draw_button(d, w, h, "pressed")).save("assets/sprites/ui/button_pressed.png")

# Small 16x16 HUD icons
create_sprite(16, 16, draw_coin).save("assets/sprites/ui/icon_coin.png")
create_sprite(16, 16, draw_powerup_shield).save("assets/sprites/ui/icon_shield.png")
create_sprite(16, 16, draw_powerup_magnet).save("assets/sprites/ui/icon_magnet.png")
create_sprite(16, 16, draw_powerup_gravity).save("assets/sprites/ui/icon_gravity.png")
create_sprite(16, 16, draw_powerup_double).save("assets/sprites/ui/icon_double.png")

print("All Pixel Art Sprites generated successfully!")

# ==========================================
# 2. RETRO 8-BIT SOUND GENERATION (WAV)
# ==========================================

SAMPLE_RATE = 22050

def save_wav(filename, samples):
    with wave.open(filename, "w") as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(SAMPLE_RATE)
        data = bytearray()
        for s in samples:
            val = max(-32767, min(32767, int(s * 32767)))
            data.extend(struct.pack("<h", val))
        wav.writeframes(data)

def synth_jump():
    dur = 0.16
    samples = []
    total = int(dur * SAMPLE_RATE)
    for i in range(total):
        t = i / total
        freq = 250 + (600 - 250) * (t ** 0.5)
        phase = 2 * math.pi * freq * (i / SAMPLE_RATE)
        # Square wave with envelope
        wave_val = 1.0 if math.sin(phase) > 0 else -1.0
        env = (1.0 - t) * 0.4
        samples.append(wave_val * env)
    return samples

def synth_slide():
    dur = 0.18
    samples = []
    total = int(dur * SAMPLE_RATE)
    import random
    rng = random.Random(123)
    for i in range(total):
        t = i / total
        noise = rng.uniform(-1, 1)
        env = (1.0 - t) * 0.3 * math.sin(t * math.pi)
        samples.append(noise * env)
    return samples

def synth_gravity_flip():
    dur = 0.28
    samples = []
    total = int(dur * SAMPLE_RATE)
    for i in range(total):
        t = i / total
        freq = 300 + 700 * math.sin(t * math.pi)
        phase = 2 * math.pi * freq * (i / SAMPLE_RATE)
        saw = (2 * ((i * freq / SAMPLE_RATE) % 1.0)) - 1.0
        env = math.sin(t * math.pi) * 0.45
        samples.append(saw * env)
    return samples

def synth_coin():
    dur = 0.22
    samples = []
    total = int(dur * SAMPLE_RATE)
    mid = total // 3
    for i in range(total):
        freq = 987 if i < mid else 1318  # B5 -> E6 chime
        phase = 2 * math.pi * freq * (i / SAMPLE_RATE)
        wave_val = 1.0 if math.sin(phase) > 0 else -1.0
        t = i / total
        env = (1.0 - t) * 0.35
        samples.append(wave_val * env)
    return samples

def synth_powerup():
    dur = 0.35
    samples = []
    total = int(dur * SAMPLE_RATE)
    notes = [523.25, 659.25, 783.99, 1046.50] # C5, E5, G5, C6
    for i in range(total):
        t = i / total
        idx = min(3, int(t * 4))
        freq = notes[idx]
        phase = 2 * math.pi * freq * (i / SAMPLE_RATE)
        tri = 2 * abs(2 * ((i * freq / SAMPLE_RATE) % 1.0) - 1.0) - 1.0
        env = (1.0 - (t % 0.25) * 2.5) * 0.4
        samples.append(tri * env)
    return samples

def synth_hit():
    dur = 0.35
    samples = []
    total = int(dur * SAMPLE_RATE)
    import random
    rng = random.Random(456)
    for i in range(total):
        t = i / total
        freq = max(60, 200 * (1.0 - t))
        noise = rng.uniform(-1, 1) * (1.0 - t)
        phase = 2 * math.pi * freq * (i / SAMPLE_RATE)
        sq = 1.0 if math.sin(phase) > 0 else -1.0
        env = (1.0 - t) * 0.5
        samples.append((0.6 * noise + 0.4 * sq) * env)
    return samples

def synth_shield_break():
    dur = 0.25
    samples = []
    total = int(dur * SAMPLE_RATE)
    import random
    rng = random.Random(789)
    for i in range(total):
        t = i / total
        noise = rng.uniform(-1, 1)
        freq = 1200 - 800 * t
        phase = 2 * math.pi * freq * (i / SAMPLE_RATE)
        tone = math.sin(phase)
        env = (1.0 - t) * 0.45
        samples.append((0.5 * noise + 0.5 * tone) * env)
    return samples

def synth_click():
    dur = 0.04
    samples = []
    total = int(dur * SAMPLE_RATE)
    for i in range(total):
        t = i / total
        phase = 2 * math.pi * 900 * (i / SAMPLE_RATE)
        wave_val = 1.0 if math.sin(phase) > 0 else -1.0
        env = (1.0 - t) * 0.3
        samples.append(wave_val * env)
    return samples

def synth_bgm():
    # 8-bar loopable chiptune music track (~7.6 seconds)
    bpm = 126
    beat_dur = 60.0 / bpm
    total_beats = 16
    total_dur = total_beats * beat_dur
    total = int(total_dur * SAMPLE_RATE)
    samples = [0.0] * total
    
    # Bass progression (A minor synthwave: Am - F - C - G)
    bass_chords = [220.0, 174.61, 261.63, 196.0] # A3, F3, C4, G3
    # Lead arpeggio notes
    melody = [
        440, 523, 659, 880,  349, 440, 523, 698,
        523, 659, 783, 1046, 392, 493, 587, 783
    ]
    
    for i in range(total):
        t = i / SAMPLE_RATE
        beat_idx = int(t / beat_dur) % 16
        chord_idx = (beat_idx // 4) % 4
        
        # Bassline (driving 1/8th notes)
        sub_beat = (t / (beat_dur / 2)) % 1.0
        bass_freq = bass_chords[chord_idx] / 2
        b_phase = 2 * math.pi * bass_freq * t
        bass_val = (1.0 if math.sin(b_phase) > 0 else -1.0) * (1.0 - sub_beat * 0.7) * 0.18
        
        # Arp lead (1/4th beat)
        m_freq = melody[beat_idx]
        m_phase = 2 * math.pi * m_freq * t
        m_env = (1.0 - ((t / beat_dur) % 1.0) * 0.8) * 0.14
        m_val = math.sin(m_phase) * m_env
        
        # Retro kick/hi-hat click on beats
        perc = 0.0
        beat_phase = (t / beat_dur) % 1.0
        if beat_phase < 0.1:
            perc = math.sin(2 * math.pi * 80 * (1.0 - beat_phase * 10) * t) * (1.0 - beat_phase * 10) * 0.22
        
        samples[i] = bass_val + m_val + perc
        
    return samples

save_wav("assets/audio/jump.wav", synth_jump())
save_wav("assets/audio/slide.wav", synth_slide())
save_wav("assets/audio/gravity_flip.wav", synth_gravity_flip())
save_wav("assets/audio/coin.wav", synth_coin())
save_wav("assets/audio/powerup.wav", synth_powerup())
save_wav("assets/audio/hit.wav", synth_hit())
save_wav("assets/audio/shield_break.wav", synth_shield_break())
save_wav("assets/audio/click.wav", synth_click())
save_wav("assets/audio/bgm.wav", synth_bgm())

print("All Retro Sound Effects and Music generated successfully!")
