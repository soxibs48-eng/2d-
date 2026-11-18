extends Control

signal close_settings

@onready var master_slider: HSlider = $PanelContainer/VBoxContainer/Sliders/MasterBox/HSlider
@onready var music_slider: HSlider = $PanelContainer/VBoxContainer/Sliders/MusicBox/HSlider
@onready var sfx_slider: HSlider = $PanelContainer/VBoxContainer/Sliders/SfxBox/HSlider
@onready var fullscreen_check: CheckBox = $PanelContainer/VBoxContainer/FullscreenBox/CheckBox
@onready var back_btn: Button = $PanelContainer/VBoxContainer/BackBtn

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	master_slider.value = SaveSystem.master_volume
	music_slider.value = SaveSystem.music_volume
	sfx_slider.value = SaveSystem.sfx_volume
	fullscreen_check.button_pressed = SaveSystem.is_fullscreen
	
	master_slider.value_changed.connect(_on_master_changed)
	music_slider.value_changed.connect(_on_music_changed)
	sfx_slider.value_changed.connect(_on_sfx_changed)
	fullscreen_check.toggled.connect(_on_fullscreen_toggled)
	back_btn.pressed.connect(_on_back_pressed)

func _on_master_changed(val: float) -> void:
	SaveSystem.master_volume = val
	SaveSystem.save_data()
	SoundManager.update_volumes()

func _on_music_changed(val: float) -> void:
	SaveSystem.music_volume = val
	SaveSystem.save_data()
	SoundManager.update_volumes()

func _on_sfx_changed(val: float) -> void:
	SaveSystem.sfx_volume = val
	SaveSystem.save_data()

func _on_fullscreen_toggled(is_toggled: bool) -> void:
	SaveSystem.is_fullscreen = is_toggled
	SaveSystem.save_data()
	if is_toggled:
		DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_FULLSCREEN)
	else:
		DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_WINDOWED)

func _on_back_pressed() -> void:
	SoundManager.play_sfx("click")
	visible = false
	close_settings.emit()
