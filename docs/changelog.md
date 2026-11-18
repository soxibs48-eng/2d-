# CHANGELOG: PIXEL RUNNER

Barcha versiyalar va loyiha yangilanishlari jurnali.

---

## [3.0.0] - 2026-11-18 (Feature Expansion)

### Qo‘shildi (Added)
- **Dynamic Weather & Time Cycle System (`WeatherManager.gd` / `js/weather.js`):**
  - Vaqt sikli: Tong (Dawn), Kunduz (Day), Shom (Sunset) va Tun (Night — yulduzlar bilan).
  - Ob-havo hodisalari: Musaffo, Kiber Yomg'ir (splash ripples), Kiber Qor va Kiber Bo'ron (chaqmoq flashelari va momaqaldiroq SFX).
  - Ambient yorug'lik ranglari silliq o'zgaradi (60 FPS barqaror).
- **Companion Pet System (`PetController.gd` / `js/pet.js`):**
  - Qahramonga silliq ergashuvchi (spring lerp lag) va unga maxsus qobiliyat beruvchi kiber hamrohlar:
    - *Magno (Magnet Bot):* 240px masofadagi tangalarni avtomatik tortadi.
    - *Aegis (Shield Drone):* Har 60 sekundda o'yinchiga bepul qalqon hadya etadi.
    - *Sparky (Neo Fox):* Har 75 metrda +1 bonus tanga va +30% tezroq Combo/Fever beradi.
  - UI dagi maxsus "HAMROHLAR (PETS)" paneli orqali xarid qilish va jihozlash.
- **Daily Quests & Mission System (`QuestManager.gd` / `js/quests.js`):**
  - Real sana bo'yicha har kuni yangilanuvchi 3 ta dinamik vazifa (masofa, tangalar, gravitatsiya, fever).
  - Progress shkalalari va "MUKOFOTNI OLISH (CLAIM)" tugmalari bilan interaktiv modal oyna.
- **Combo & Fever Mode System (`ComboSystem.gd` / `js/combo.js`):**
  - Xatolarsiz tanga yig'ish va to'siqlardan o'tish orqali Combo shkalasi to'ladi.
  - 100% bo'lganda **FEVER HYPER DRIVE** rejimiga o'tadi: daxlsizlik, ekranda kiber tezlik chiziqlari va yig'ilgan tangalar **3x baravar** oshiriladi!

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
