extends Control

signal open_settings
signal return_to_main_menu

@onready var resume_btn: Button = $PanelContainer/VBoxContainer/ResumeBtn
@onready var restart_btn: Button = $PanelContainer/VBoxContainer/RestartBtn
@onready var settings_btn: Button = $PanelContainer/VBoxContainer/SettingsBtn
@onready var menu_btn: Button = $PanelContainer/VBoxContainer/MenuBtn

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	resume_btn.pressed.connect(_on_resume_pressed)
	restart_btn.pressed.connect(_on_restart_pressed)
	settings_btn.pressed.connect(_on_settings_pressed)
	menu_btn.pressed.connect(_on_menu_pressed)

func _on_resume_pressed() -> void:
	SoundManager.play_sfx("click")
	GameManager.resume_game()

func _on_restart_pressed() -> void:
	SoundManager.play_sfx("click")
	visible = false
	GameManager.start_game()

func _on_settings_pressed() -> void:
	SoundManager.play_sfx("click")
	open_settings.emit()

func _on_menu_pressed() -> void:
	SoundManager.play_sfx("click")
	visible = false
	get_tree().paused = false
	return_to_main_menu.emit()
