# PIXEL RUNNER: ANTI-GRAVITY PROTOCOL (Versiya 3.0)
**Full-Stack Game Development — 2D Runner (HTML5 Web & Godot Engine 4.x)**

[![Test Suite](https://img.shields.io/badge/CI%2FQA%20Tests-61%20PASSED-brightgreen.svg)]()
[![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20Windows%20%7C%20Mobile-blue.svg)]()
[![GitHub Repo](https://img.shields.io/badge/GitHub-2d--runner-orange.svg)](https://github.com/soxibs48-eng/2d-)

---

## 🎮 Jonli O'yin (Live Demo)
O'yin mahalliy kompyuteringizda quyidagi manzilda ishga tushirilgan:
- **Web URL:** [http://localhost:8000](http://localhost:8000)
- **GitHub Repozitoriyasi:** [https://github.com/soxibs48-eng/2d-](https://github.com/soxibs48-eng/2d-)

---

## 🌟 Versiya 3.0: Kengaytirilgan Yangi Funksiyalar (TZ v3.0)

1. ☀️ **Dinamik Ob-havo va Vaqt Sikli (Weather & Time Cycle System):**
   - **Vaqt sikli:** Tong (Dawn), Kunduz (Day), Shom (Sunset) va Tun (Night — miltillovchi yulduzlar bilan).
   - **Ob-havo turlari:** Musaffo (Clear), Kiber Yomg'ir (Rain — polda suv to'lqinlari), Kiber Qor (Snow) va Kiber Bo'ron (Cyber Storm — chaqmoq chaqnashi va guldurash SFX).
   - Canvas Modulate va ambient yorug'lik silliq o'zgaradi (60 FPS barqaror).

2. 🤖 **Hamroh Jonzotlar / Dronlar (Companion Pet System):**
   - Qahramonga silliq ergashuvchi (spring lerp), vertikal suzuvchi va gravitatsiya o'zgarganda teskari buriluvchi kiber hamrohlar:
     - **Magno (Magnet Bot):** 240px radiusdagi tangalarni avtomatik o'ziga tortadi.
     - **Aegis (Shield Drone):** Har 60 sekundda o'yinchiga bepul himoya qalqoni (Shield) hadya etadi.
     - **Sparky (Neo Fox):** Har 75 metrda +1 bonus tanga va +30% tezroq Combo/Fever beradi.
   - Tanlash va ochish: Yangi **HAMROHLAR (PETS)** do'koni orqali.

3. 🏆 **Kunlik Vazifalar va Yutuqlar (Daily Quests & Missions):**
   - Haqiqiy sana (`YYYY-MM-DD`) bo'yicha har kuni yangilanuvchi 3 ta dinamik vazifa:
     - *Marafonchi:* 1000m masofa bosib o'tish (+150 tanga)
     - *Tanga ovchisi:* 50 ta tanga yig'ish (+200 tanga)
     - *Gravitatsiya hakkeri:* 3 marta shiftga sakrash (+150 tanga)
     - *Fever ustasi:* 1 marta Fever Hyper Mode ga erishish (+250 tanga)
   - Jonli progress shkalasi va **MUKOFOTNI OLISH (CLAIM)** tizimi.

4. 🔥 **Combo & Fever Hyper Drive Rejimi (ComboSystem):**
   - Tangalar, to'siqlardan qochish, double jump va sirpanish orqali Combo shkalasi to'ladi.
   - Shkala 100% ga yetganda **FEVER HYPER DRIVE** rejimiga o'tadi:
     - Qahramon super daxlsizlik (invulnerable aura) oladi.
     - Ekranda kiber tezlik chiziqlari va neon vinyetka paydo bo'ladi.
     - **Barcha yig'ilgan tangalar 3x baravarga ko'paytiriladi!**

---

## 🎮 Boshqaruv (Controls)

| Harakat | Klaviatura | Sensorli Tugmalar (Mobile) |
| :--- | :--- | :--- |
| **Sakrash (1x/2x Jump)** | `Space` / `W` / `Up Arrow` | **JUMP (2X)** |
| **Yotish / Sirpanish (Slide)** | `S` / `Down Arrow` (bosib turish) | **SLIDE (YOTISH)** |
| **Cyber Dash (Tezlanish)** | `E` | **DASH** |
| **Antigravitatsiya (Flip)** | `Shift` / `F` | **FLIP GRAVITY** |
| **Pauza** | `Escape` / `P` | **II** tugmasi |

---

## 🧪 Avtomatlashtirilgan Testlash
Loyiha CI/QA sinovlarini o'tkazish uchun:
```powershell
python tests/run_tests.py
```
Natija: **61 ta testdan 61 tasi muvaffaqiyatli (0 xato)**.
