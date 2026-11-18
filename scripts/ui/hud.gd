extends Control

@onready var distance_label: Label = $TopBar/MarginContainer/HBoxContainer/DistanceBox/DistanceLabel
@onready var coins_label: Label = $TopBar/MarginContainer/HBoxContainer/CoinsBox/CoinsLabel
@onready var pause_button: Button = $TopBar/MarginContainer/HBoxContainer/PauseButton

@onready var powerup_container: HBoxContainer = $PowerupBar/HBoxContainer
@onready var shield_badge: PanelContainer = $PowerupBar/HBoxContainer/ShieldBadge
@onready var magnet_badge: PanelContainer = $PowerupBar/HBoxContainer/MagnetBadge
@onready var magnet_timer_label: Label = $PowerupBar/HBoxContainer/MagnetBadge/VBox/Label
@onready var gravity_badge: PanelContainer = $PowerupBar/HBoxContainer/GravityBadge
@onready var gravity_timer_label: Label = $PowerupBar/HBoxContainer/GravityBadge/VBox/Label
@onready var double_badge: PanelContainer = $PowerupBar/HBoxContainer/DoubleBadge
@onready var double_timer_label: Label = $PowerupBar/HBoxContainer/DoubleBadge/VBox/Label

# Touch controls for mobile / web
@onready var jump_touch_btn: Button = $TouchControls/JumpTouchBtn
@onready var slide_touch_btn: Button = $TouchControls/SlideTouchBtn
@onready var flip_touch_btn: Button = $TouchControls/FlipTouchBtn

func _ready() -> void:
	GameManager.distance_updated.connect(_on_distance_updated)
	GameManager.coins_updated.connect(_on_coins_updated)
	GameManager.powerup_activated.connect(_on_powerup_changed)
	GameManager.powerup_expired.connect(_on_powerup_changed)
	
	pause_button.pressed.connect(_on_pause_pressed)
	
	# Touch button connections
	jump_touch_btn.button_down.connect(func(): Input.action_press("jump"))
	jump_touch_btn.button_up.connect(func(): Input.action_release("jump"))
	
	slide_touch_btn.button_down.connect(func(): Input.action_press("slide"))
	slide_touch_btn.button_up.connect(func(): Input.action_release("slide"))
	
	flip_touch_btn.pressed.connect(func(): 
		if GameManager.is_gravity_boost_active():
			GameManager.toggle_gravity()
	)
	
	update_all_powerup_ui()

func _process(_delta: float) -> void:
	if GameManager.current_state != GameManager.GameState.PLAYING:
		return
	
	# Update active countdown timers in UI
	if GameManager.is_magnet_active():
		magnet_badge.visible = true
		magnet_timer_label.text = "%.1fs" % GameManager.powerup_timers["magnet"]
	else:
		magnet_badge.visible = false
	
	if GameManager.is_gravity_boost_active():
		gravity_badge.visible = true
		gravity_timer_label.text = "%.1fs" % GameManager.powerup_timers["gravity"]
		flip_touch_btn.visible = true
	else:
		gravity_badge.visible = false
		flip_touch_btn.visible = false
	
	if GameManager.is_double_active():
		double_badge.visible = true
		double_timer_label.text = "%.1fs" % GameManager.powerup_timers["double"]
	else:
		double_badge.visible = false
	
	shield_badge.visible = GameManager.has_shield()

func _on_distance_updated(dist: float) -> void:
	distance_label.text = "%d m" % int(dist)

func _on_coins_updated(coins: int) -> void:
	coins_label.text = "%d" % coins

func _on_powerup_changed(_type: String, _duration: float = 0.0) -> void:
	update_all_powerup_ui()

func update_all_powerup_ui() -> void:
	shield_badge.visible = GameManager.has_shield()
	magnet_badge.visible = GameManager.is_magnet_active()
	gravity_badge.visible = GameManager.is_gravity_boost_active()
	double_badge.visible = GameManager.is_double_active()
	flip_touch_btn.visible = GameManager.is_gravity_boost_active()

func _on_pause_pressed() -> void:
	SoundManager.play_sfx("click")
	GameManager.pause_game()
