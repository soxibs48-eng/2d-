extends Control

signal return_to_main_menu
signal open_shop

@onready var distance_label: Label = $PanelContainer/VBoxContainer/ScoreBox/DistanceLabel
@onready var coins_label: Label = $PanelContainer/VBoxContainer/ScoreBox/CoinsLabel
@onready var high_score_label: Label = $PanelContainer/VBoxContainer/HighScoreBox/HighScoreLabel
@onready var new_record_label: Label = $PanelContainer/VBoxContainer/NewRecordLabel

@onready var restart_btn: Button = $PanelContainer/VBoxContainer/ButtonsBox/RestartBtn
@onready var shop_btn: Button = $PanelContainer/VBoxContainer/ButtonsBox/ShopBtn
@onready var menu_btn: Button = $PanelContainer/VBoxContainer/ButtonsBox/MenuBtn

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	GameManager.game_over.connect(_on_game_over)
	
	restart_btn.pressed.connect(_on_restart_pressed)
	shop_btn.pressed.connect(_on_shop_pressed)
	menu_btn.pressed.connect(_on_menu_pressed)

func _on_game_over(dist: float, coins: int, is_new_record: bool) -> void:
	distance_label.text = "%d m" % int(dist)
	coins_label.text = "%d" % coins
	high_score_label.text = "%d m" % int(SaveSystem.high_score)
	new_record_label.visible = is_new_record
	visible = true

func _on_restart_pressed() -> void:
	SoundManager.play_sfx("click")
	visible = false
	GameManager.start_game()

func _on_shop_pressed() -> void:
	SoundManager.play_sfx("click")
	open_shop.emit()

func _on_menu_pressed() -> void:
	SoundManager.play_sfx("click")
	visible = false
	return_to_main_menu.emit()
