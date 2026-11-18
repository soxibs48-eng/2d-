extends Node
class_name QuestManager

## Daily Quests and Missions System (TZ v3.0)

var active_quests: Array[Dictionary] = []

signal quest_progress_updated(quest_id: String, current: int, target: int)
signal quest_completed(quest_id: String, reward: int)

func _ready() -> void:
	if GameManager:
		GameManager.distance_updated.connect(_on_distance_updated)
		GameManager.coins_updated.connect(_on_coins_updated)
		GameManager.gravity_flipped.connect(_on_gravity_flipped)
	_load_or_generate_quests()

func _load_or_generate_quests() -> void:
	# Default 3 active daily quests
	active_quests = [
		{
			"id": "dist_1000",
			"title": "Marafonchi",
			"desc": "1,000 metr masofa bosib o't",
			"target": 1000,
			"current": 0,
			"reward": 150,
			"completed": false,
			"claimed": false
		},
		{
			"id": "coins_50",
			"title": "Tanga Ovchisi",
			"desc": "50 ta tanga yig'",
			"target": 50,
			"current": 0,
			"reward": 200,
			"completed": false,
			"claimed": false
		},
		{
			"id": "gravity_3",
			"title": "Gravitatsiya Hakkeri",
			"desc": "3 marta Anti-Gravity ishlat",
			"target": 3,
			"current": 0,
			"reward": 150,
			"completed": false,
			"claimed": false
		}
	]

func _on_distance_updated(dist: float) -> void:
	add_progress("dist_1000", int(dist))

func _on_coins_updated(_total_coins: int) -> void:
	add_progress("coins_50", 1)

func _on_gravity_flipped(_is_inv: bool) -> void:
	add_progress("gravity_3", 1)

func add_progress(quest_id: String, amount: int) -> void:
	for q in active_quests:
		if q["id"] == quest_id and not q["completed"]:
			q["current"] = min(q["target"], q["current"] + amount)
			quest_progress_updated.emit(quest_id, q["current"], q["target"])
			if q["current"] >= q["target"]:
				q["completed"] = true
				quest_completed.emit(quest_id, q["reward"])

func claim_quest(quest_id: String) -> bool:
	for q in active_quests:
		if q["id"] == quest_id and q["completed"] and not q["claimed"]:
			q["claimed"] = true
			if SaveSystem:
				SaveSystem.add_coins(q["reward"])
			return true
	return false
