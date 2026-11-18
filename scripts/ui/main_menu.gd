extends Control

signal play_pressed
signal shop_pressed
signal settings_pressed

@onready var play_btn: Button = $CenterContainer/VBoxContainer/Buttons/PlayBtn
@onready var shop_btn: Button = $CenterContainer/VBoxContainer/Buttons/ShopBtn
@onready var settings_btn: Button = $CenterContainer/VBoxContainer/Buttons/SettingsBtn
@onready var exit_btn: Button = $CenterContainer/VBoxContainer/Buttons/ExitBtn

@onready var high_score_label: Label = $TopStats/HBoxContainer/HighScoreBox/HighScoreLabel
@onready var coins_label: Label = $TopStats/HBoxContainer/CoinsBox/CoinsLabel

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	play_btn.pressed.connect(_on_play_pressed)
	shop_btn.pressed.connect(_on_shop_pressed)
	settings_btn.pressed.connect(_on_settings_pressed)
	exit_btn.pressed.connect(_on_exit_pressed)
	
	SaveSystem.data_updated.connect(update_stats)
	update_stats()
	
	# Web export doesn't support exit
	if OS.has_feature("web"):
		exit_btn.visible = false

func update_stats() -> void:
	high_score_label.text = "%d m" % int(SaveSystem.high_score)
	coins_label.text = "%d" % SaveSystem.total_coins

func _on_play_pressed() -> void:
	SoundManager.play_sfx("click")
	play_pressed.emit()

func _on_shop_pressed() -> void:
	SoundManager.play_sfx("click")
	shop_pressed.emit()

func _on_settings_pressed() -> void:
	SoundManager.play_sfx("click")
	settings_pressed.emit()

func _on_exit_pressed() -> void:
	SoundManager.play_sfx("click")
	get_tree().quit()
