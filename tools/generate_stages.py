import json

sectors = [
    ('NEON OUTSKIRTS', '#00f0ff', "Boshlang'ich kiber shahar: Sakrash va yotish"),
    ('GRAVITY LABS', '#d844ff', 'Gravitatsiya laboratoriyasi: Shiftda yugurish'),
    ('CYBER HIGHWAY', '#ffaa00', 'Kiber trassa: Tezkor patrul dronlari va arralar'),
    ('INDUSTRIAL FOUNDRY', '#ff2255', 'Sanoat quyuv sexi: Lazerlar va baland tikanlar'),
    ('ELECTRO MATRIX', '#00ffaa', "Elektr bo'roni: Goliath megabossi bilan jang"),
    ('CRYSTAL VOID', '#00e5ff', "Billur neon bo'shliq: Nozik antigravitatsiya"),
    ('CYBER RUINS', '#7788ff', 'Tungi kiber xarobalar: Suzuvchi minalar'),
    ('QUANTUM CORE', '#b030ff', "Kvant yadrosi: Tezkor polarite o'zgarishlari"),
    ('TITAN FORTRESS', '#ffd700', "Titan qalqon qasri: Zich lazer to'siqlari"),
    ('APEX MATRIX', '#ff00aa', "Yakuniy kiber cho'qqi: Omega Goliath afsonaviy jangi!")
]

sector_bases = [350, 850, 1500, 2300, 3300, 4500, 5900, 7500, 9400, 11600]
sector_steps = [50, 65, 80, 100, 120, 140, 160, 190, 220, 260]

stages = []
for s in range(1, 101):
    sec_idx = min(9, (s - 1) // 10)
    sec_name, sec_col, sec_desc = sectors[sec_idx]
    offset = (s - 1) % 10
    dist = sector_bases[sec_idx] + offset * sector_steps[sec_idx]
    coin_bonus = 40 + s * 12 + sec_idx * 25
    is_boss = (s % 10 == 0) or (s == 25) or (s == 75) or (s == 100)
    
    boss_info = None
    if is_boss:
        boss_hp = 50 + (s // 10) * 10
        boss_name = 'Mini Goliath'
        if s >= 90:
            boss_name = 'OMEGA GOLIATH (FINAL)'
        elif s >= 50:
            boss_name = 'Cyber Goliath'
        elif s >= 20:
            boss_name = 'Scout Titan'
            
        boss_info = {
            'name': boss_name,
            'hp': boss_hp,
            'attacks': ['plasma_torpedo', 'laser_beam', 'ceiling_rocket']
        }
    
    sub_num = offset + 1
    short_sec = sec_name.split()[0]
    st_name = f"{short_sec} {sub_num}"
    if is_boss:
        short_b = boss_info['name'].split()[0]
        st_name += f" 👑 [{short_b}]"
    
    stage_entry = {
        'id': s,
        'sector': sec_idx + 1,
        'sector_name': sec_name,
        'name': st_name,
        'target_distance': dist,
        'theme': sec_col,
        'coin_bonus': coin_bonus,
        'description': f"{s}-bosqich ({sec_name}). Masofa: {dist}m. Mukofot: +{coin_bonus} tanga.",
        'is_boss': is_boss
    }
    if boss_info:
        stage_entry['boss'] = boss_info
    stages.append(stage_entry)

data = {
    'total_stages': 100,
    'sectors': 10,
    'stages': stages
}

with open('data/levels/stages.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"Successfully updated stages.json with {len(stages)} stages.")
print(f"Stage 1: {stages[0]['target_distance']}m, Stage 10: {stages[9]['target_distance']}m, Stage 50: {stages[49]['target_distance']}m, Stage 100: {stages[99]['target_distance']}m")
