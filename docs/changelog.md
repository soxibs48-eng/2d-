# CHANGELOG: PIXEL RUNNER

Barcha versiyalar va loyiha yangilanishlari jurnali.

---

## [2.0.0] - 2026-11-18 (Capstone Release)

### Qo‘shildi (Added)
- **Modulli Arxitektura:** TZ v2.0 standartiga muvofiq 28 ta to‘liq tizimli papka ierarxiyasi (`scenes/`, `scripts/managers/`, `scripts/systems/`, `scripts/gameplay/`, `data/`, `docs/`, `tests/`, `export/`).
- **Data-Driven Tizim:** JSON konfiguratsiyalari (`items.json`, `hazards.json`, `speed_curve.json`, `achievements.json`) orqali dinamik kontent yuklash.
- **Camera System & Screen Shake:** To'qnashuv, qalqon sinishi va gravitatsiya o'zgarishida dinamik silkinish (trauma shake) va tezlikka bog'liq zoom.
- **Scene Manager:** Yumshoq kadr almashinuvlari (Fade in / Fade out) va sahna tranzitsiyalari.
- **Gamepad Support:** Xbox va PlayStation kontrollerlari uchun to'liq integratsiya (`InputMap` joypad tugmalari).
- **Yutuqlar (Achievements) Tizimi:** Masofa, tangalar va gravitatsiya aylantirishlari bo'yicha yutuqlar.
- **Hujjatlar Paketi:** To'liq Game Design Document (`GDD.md`), Boshqaruv qo'llanmasi (`controls.md`) va Texnik hisobot.

### Yaxshilandi (Improved)
- Spawner tizimi: to'siqlar va tangalar generatsiyasi yanada muvozanatli va adolatli qilindi.
- Audio arxitekturasi: BGM va SFX `assets/audio/music` hamda `assets/audio/sfx` papkalariga ajratildi va xotira optimizatsiyasi qilindi.
- Saqlash tizimi (SaveSystem): Yutuqlar va to'liq konfiguratsiyani avtomatik sinxronlash.

---

## [1.0.0] - 2026-11-18 (Prototype)
- Boshlang'ich 2D runner mexanikasi, CharacterBody2D fizika, sakrash, egilish va asosiy antigravitatsiya portali.
