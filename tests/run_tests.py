import os
import json
import wave

passed = 0
failed = 0

def test(name, condition, err_msg=""):
    global passed, failed
    if condition:
        print(f"[PASS] {name}")
        passed += 1
    else:
        print(f"[FAIL] {name}: {err_msg}")
        failed += 1

print("========================================")
print("  PIXEL RUNNER: CI/QA TEST SUITE (v2.0) ")
print("========================================")

# 1. Check JSON Data files
json_files = [
    ("data/items/items.json", ["skins", "powerups"]),
    ("data/enemies/hazards.json", ["hazards"]),
    ("data/levels/speed_curve.json", ["base_speed", "acceleration_rate"]),
    ("data/quests/achievements.json", ["achievements"])
]

for p, keys in json_files:
    exists = os.path.exists(p)
    test(f"File exists: {p}", exists)
    if exists:
        try:
            with open(p, "r", encoding="utf-8") as f:
                d = json.load(f)
            has_keys = all(k in d for k in keys)
            test(f"Schema valid: {p}", has_keys, f"Missing required keys {keys}")
        except Exception as e:
            test(f"JSON syntax: {p}", False, str(e))

# 2. Check Audio files
audio_files = [
    "assets/audio/music/bgm.wav",
    "assets/audio/sfx/jump.wav",
    "assets/audio/sfx/slide.wav",
    "assets/audio/sfx/gravity_flip.wav",
    "assets/audio/sfx/coin.wav",
    "assets/audio/sfx/powerup.wav",
    "assets/audio/sfx/hit.wav",
    "assets/audio/sfx/shield_break.wav",
    "assets/audio/sfx/click.wav"
]

for af in audio_files:
    exists = os.path.exists(af)
    test(f"Audio file exists: {af}", exists)
    if exists:
        try:
            with wave.open(af, "rb") as w:
                n_channels = w.getnchannels()
                framerate = w.getframerate()
                test(f"Audio header valid: {af}", n_channels in [1, 2] and framerate > 8000)
        except Exception as e:
            test(f"Audio header valid: {af}", False, str(e))

# 3. Check Core Scenes
core_scenes = [
    "scenes/main/main.tscn",
    "scenes/levels/runner_world.tscn",
    "scenes/player/player.tscn",
    "scenes/ui/hud.tscn",
    "scenes/menus/main_menu.tscn",
    "scenes/menus/pause_menu.tscn",
    "scenes/menus/game_over_menu.tscn",
    "scenes/menus/shop_menu.tscn",
    "scenes/menus/settings_menu.tscn"
]

for cs in core_scenes:
    test(f"Core scene exists: {cs}", os.path.exists(cs))

# 4. Check Documentation
docs = ["README.md", "docs/GDD.md", "docs/controls.md", "docs/changelog.md"]
for d in docs:
    test(f"Documentation exists: {d}", os.path.exists(d))

# 5. Check Export Presets
test("Export presets exists", os.path.exists("export_presets.cfg") or os.path.exists("export/export_presets.cfg"))

print("========================================")
print(f"RESULTS: {passed} PASSED, {failed} FAILED")
print("========================================")

if failed > 0:
    exit(1)
