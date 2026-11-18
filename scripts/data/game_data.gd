extends Node
class_name GameData

static var items_data: Dictionary = {}
static var hazards_data: Dictionary = {}
static var speed_curve: Dictionary = {}
static var achievements_data: Dictionary = {}

static func load_all_data() -> void:
	items_data = load_json_file("res://data/items/items.json")
	hazards_data = load_json_file("res://data/enemies/hazards.json")
	speed_curve = load_json_file("res://data/levels/speed_curve.json")
	achievements_data = load_json_file("res://data/quests/achievements.json")

static func load_json_file(path: String) -> Dictionary:
	if not FileAccess.file_exists(path):
		push_warning("JSON file not found: " + path)
		return {}
	
	var file := FileAccess.open(path, FileAccess.READ)
	if not file:
		return {}
	
	var text := file.get_as_text()
	var json := JSON.new()
	var err := json.parse(text)
	if err == OK and json.data is Dictionary:
		return json.data
	return {}
