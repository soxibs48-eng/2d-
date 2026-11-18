extends Node

@onready var world_container: Node2D = $WorldContainer
@onready var hud: Control = $UI/HUD
@onready var main_menu: Control = $UI/MainMenu
@onready var pause_menu: Control = $UI/PauseMenu
@onready var game_over_menu: Control = $UI/GameOverMenu
@onready var shop_menu: Control = $UI/ShopMenu
@onready var settings_menu: Control = $UI/SettingsMenu

var world_scene: PackedScene = preload("res://scenes/levels/runner_world.tscn")
var current_world: Node2D = null

func _ready() -> void:
	# UI Event wiring
	main_menu.play_pressed.connect(_on_play_game)
	main_menu.shop_pressed.connect(_on_open_shop)
	main_menu.settings_pressed.connect(_on_open_settings)
	
	pause_menu.open_settings.connect(_on_open_settings)
	pause_menu.return_to_main_menu.connect(_on_return_to_menu)
	
	game_over_menu.return_to_main_menu.connect(_on_return_to_menu)
	game_over_menu.open_shop.connect(_on_open_shop)
	
	shop_menu.close_shop.connect(_on_close_overlay)
	settings_menu.close_settings.connect(_on_close_overlay)
	
	GameManager.game_paused.connect(_on_game_paused)
	GameManager.game_started.connect(_on_game_started)
	
	_setup_menu_state()

func _setup_menu_state() -> void:
	GameManager.current_state = GameManager.GameState.MENU
	get_tree().paused = false
	
	if current_world:
		current_world.queue_free()
		current_world = null
	
	current_world = world_scene.instantiate()
	world_container.add_child(current_world)
	
	main_menu.visible = true
	hud.visible = false
	pause_menu.visible = false
	game_over_menu.visible = false
	shop_menu.visible = false
	settings_menu.visible = false
	
	SoundManager.play_music()

func _on_play_game() -> void:
	main_menu.visible = false
	hud.visible = true
	pause_menu.visible = false
	game_over_menu.visible = false
	shop_menu.visible = false
	settings_menu.visible = false
	
	if current_world:
		current_world.queue_free()
	current_world = world_scene.instantiate()
	world_container.add_child(current_world)
	
	GameManager.start_game()

func _on_game_started() -> void:
	hud.visible = true
	pause_menu.visible = false
	game_over_menu.visible = false

func _on_game_paused(is_paused: bool) -> void:
	pause_menu.visible = is_paused

func _on_open_shop() -> void:
	shop_menu.visible = true
	shop_menu.refresh_ui()

func _on_open_settings() -> void:
	settings_menu.visible = true

func _on_close_overlay() -> void:
	pass

func _on_return_to_menu() -> void:
	_setup_menu_state()

func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("pause"):
		if GameManager.current_state == GameManager.GameState.PLAYING:
			GameManager.pause_game()
		elif GameManager.current_state == GameManager.GameState.PAUSED:
			GameManager.resume_game()
