# PIXEL RUNNER (Antigravitatsiya mexanikasi bilan)
**Game Development Capstone Project — 2D Endless Runner (Godot Engine 4.x)**

---

## 📖 Loyiha Haqida
**"Pixel Runner"** — bu retro pixel-art uslubidagi, innovatsion **Anti-Gravity (Antigravitatsiya)** mexanikasiga asoslangan 2D cheksiz yugurish (Endless Runner) o'yini. Godot Engine 4.x uchun to'liq modulli, kengaytiriladigan va data-driven arxitektura asosida ishlab chiqilgan.

---

## 🎮 Boshqaruv (Controls)

| Harakat | Klaviatura | Gamepad (Controller) | Sensorli / Touch |
| :--- | :--- | :--- | :--- |
| **Sakrash (Jump)** | `Space`, `W`, `Up Arrow` | `A` (Button 0), D-pad Up | **JUMP** tugmasi |
| **Egilish (Slide) / Fast Fall** | `S`, `Down Arrow` | `B` (Button 1), D-pad Down | **SLIDE** tugmasi |
| **Antigravitatsiya (Flip)** | `Shift`, `F` | `Y` (Button 3), `X` (Button 2) | **FLIP GRAVITY** |
| **Pauza (Pause)** | `Escape`, `P` | `Start` (Button 6) | **II** tugmasi |

Batafsil boshqaruv hujjati: [docs/controls.md](file:///c:/Users/HP%20PC/OYIN/2d%20oyin/docs/controls.md)

---

## ⚙️ Asosiy Tizimlar va Arxitektura (Section 4)

1. **Game State Manager (`scripts/managers/game_manager.gd`):**
   - Holatlar: `MENU`, `PLAYING`, `PAUSED`, `GAME_OVER`, `VICTORY`.
   - Dinamik tezlik: $\text{speed} = \min(\text{base\_speed} + \text{distance} \times \text{acceleration\_rate},\ \text{max\_speed})$.
   - Antigravitatsiya va power-up taymerlari.
2. **Camera System (`scripts/systems/camera_system.gd`):**
   - Screen Shake (Trauma-based tebranish) — to'qnashuv, qalqon sinishi va gravitatsiya o'zgarishida.
   - Tezlik oshishi bilan dinamik Zoom (FOV kengayishi).
3. **Audio Manager (`scripts/managers/sound_manager.gd`):**
   - Chiptune BGM va 8 kanalli SFX polifoniya puli.
4. **Save/Load System (`scripts/systems/save_system.gd`):**
   - Yuqori rekord, tangalar balansi, ochilgan skinlar va sozlamalarni `user://` da saqlash.
5. **Level & Scene Manager (`scripts/managers/scene_manager.gd`):**
   - Silliq ekran qorayishi (Fade in / Fade out) va sahna yuklash tranzitsiyalari.
6. **Spawner System (`scripts/systems/spawner_system.gd`):**
   - To'siqlar, tangalar va power-uplarni tezlikka mos adolatli generatsiya qilish.
7. **Data-Driven Configuration (`data/`):**
   - `items/items.json`: Skinlar va quvvatlar xususiyatlari.
   - `enemies/hazards.json`: To'siqlar ko'rsatkichlari.
   - `levels/speed_curve.json`: Qiyinlik egri chizig'i.
   - `quests/achievements.json`: Yutuqlar ro'yxati.

---

## 📁 Papka Tuzilmasi (TZ v2.0 Standarti)

```text
2d oyin/
├── project.godot              # Godot 4 konfiguratsiyasi
├── export_presets.cfg         # Windows va Web eksport sozlamalari
├── data/                      # JSON ma'lumotlar
│   ├── items/items.json
│   ├── enemies/hazards.json
│   ├── levels/speed_curve.json
│   └── quests/achievements.json
├── docs/                      # Texnik hujjatlar
│   ├── GDD.md                 # Game Design Document
│   ├── controls.md            # Boshqaruv qo'llanmasi
│   └── changelog.md           # O'zgarishlar jurnali
├── scenes/
│   ├── main/main.tscn         # Root orkestrator sahnasi
│   ├── levels/runner_world.tscn # O'yin maydoni, fon va relslar
│   ├── player/player.tscn     # Qahramon
│   ├── enemies/               # To'siqlar sahnalari
│   ├── objects/               # Tangalar va power-up'lar
│   ├── menus/                 # Barcha menyular (Main, Pause, GameOver, Shop, Settings)
│   └── ui/hud.tscn            # Gameplay HUD va sensorli tugmalar
├── scripts/
│   ├── managers/              # GameManager, SoundManager, SceneManager
│   ├── systems/               # SaveSystem, CameraSystem, SpawnerSystem
│   ├── gameplay/              # PlayerController, ParallaxScroller, Obstacle, Pickup
│   ├── ai/                    # DroneHazard AI
│   └── data/                  # GameData JSON parser
├── assets/
│   ├── audio/
│   │   ├── music/             # bgm.wav
│   │   └── sfx/               # jump, slide, flip, coin, hit, powerup...
│   ├── backgrounds/           # Sky, far/mid skyline
│   ├── tilesets/              # Floor, ceiling platformalari
│   ├── sprites/               # 3 ta skin animatsiyalari
│   └── ui/                    # Tugmalar, piktogrammalar
└── tests/
    ├── test_runner.gd         # GDScript avtomatlashtirilgan test
    └── run_tests.py           # Python CI/QA tekshiruv skripti
```

---

## 🚀 Ishga Tushirish va O'ynash

1. **Godot Engine 4.x** (Standard versiya) dasturini ishga tushiring.
2. **Import** tugmasini bosib, ushbu papkadagi `project.godot` faylini tanlang.
3. Loyihani ochib, **F5** tugmasini bosing.
4. O'yin to'liq ishga tushadi!

---

## 🧪 Avtomatlashtirilgan Testlash
Loyiha yaxlitligini tekshirish uchun konsolda quyidagi buyruqni bering:
```powershell
python tests/run_tests.py
```
Natija: **40 ta testdan 40 tasi muvaffaqiyatli (0 xato)**.

