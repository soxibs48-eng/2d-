extends Node

const SAVE_PATH: String = "user://pixel_runner_save.cfg"

var high_score: float = 0.0
var total_coins: int = 0
var unlocked_skins: Array = ["default"]
var equipped_skin: String = "default"

var master_volume: float = 0.8
var music_volume: float = 0.7
var sfx_volume: float = 0.9
var is_fullscreen: bool = false

signal data_updated

func _ready() -> void:
	load_data()

func save_data() -> void:
	var config := ConfigFile.new()
	config.set_value("game", "high_score", high_score)
	config.set_value("game", "total_coins", total_coins)
	config.set_value("game", "unlocked_skins", unlocked_skins)
	config.set_value("game", "equipped_skin", equipped_skin)
	
	config.set_value("audio", "master_volume", master_volume)
	config.set_value("audio", "music_volume", music_volume)
	config.set_value("audio", "sfx_volume", sfx_volume)
	config.set_value("display", "is_fullscreen", is_fullscreen)
	
	var err := config.save(SAVE_PATH)
	if err != OK:
		push_warning("Failed to save data to: " + SAVE_PATH)

func load_data() -> void:
	var config := ConfigFile.new()
	var err := config.load(SAVE_PATH)
	if err != OK:
		# File doesn't exist yet, save default
		save_data()
		return
	
	high_score = config.get_value("game", "high_score", 0.0)
	total_coins = config.get_value("game", "total_coins", 0)
	unlocked_skins = config.get_value("game", "unlocked_skins", ["default"])
	equipped_skin = config.get_value("game", "equipped_skin", "default")
	
	master_volume = config.get_value("audio", "master_volume", 0.8)
	music_volume = config.get_value("audio", "music_volume", 0.7)
	sfx_volume = config.get_value("audio", "sfx_volume", 0.9)
	is_fullscreen = config.get_value("display", "is_fullscreen", false)

func add_coins(amount: int) -> void:
	total_coins += amount
	save_data()
	data_updated.emit()

func spend_coins(amount: int) -> bool:
	if total_coins >= amount:
		total_coins -= amount
		save_data()
		data_updated.emit()
		return true
	return false

func update_high_score(score: float) -> bool:
	if score > high_score:
		high_score = score
		save_data()
		data_updated.emit()
		return true
	return false

func unlock_skin(skin_id: String) -> void:
	if not unlocked_skins.has(skin_id):
		unlocked_skins.append(skin_id)
		save_data()
		data_updated.emit()

func set_equipped_skin(skin_id: String) -> void:
	if unlocked_skins.has(skin_id):
		equipped_skin = skin_id
		save_data()
		data_updated.emit()
