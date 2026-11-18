extends Camera2D
class_name CameraSystem

@export var decay: float = 2.2
@export var max_offset: Vector2 = Vector2(24, 18)
@export var max_roll: float = 0.04
@export var target_node: Node2D

var trauma: float = 0.0
var trauma_power: int = 2
var base_zoom: Vector2 = Vector2(1.0, 1.0)

func _ready() -> void:
	# Set default camera limits for 1280x720 canvas
	limit_left = 0
	limit_top = 0
	limit_bottom = 720
	
	GameManager.shake_requested.connect(add_trauma)
	GameManager.gravity_flipped.connect(func(_inv): add_trauma(0.35))
	GameManager.game_over.connect(func(_d, _c, _r): add_trauma(0.8))

func _process(delta: float) -> void:
	# Smooth Follow if target exists
	if target_node:
		global_position.y = lerp(global_position.y, target_node.global_position.y, 4.0 * delta)
	
	# Dynamic Zoom based on speed
	if GameManager.current_state == GameManager.GameState.PLAYING:
		var speed_factor: float = clampf((GameManager.game_speed - GameManager.base_speed) / 500.0, 0.0, 1.0)
		var target_zoom: float = lerp(1.0, 0.95, speed_factor)
		zoom = zoom.lerp(Vector2(target_zoom, target_zoom), 2.0 * delta)
	else:
		zoom = zoom.lerp(base_zoom, 3.0 * delta)
	
	# Trauma Screen Shake
	if trauma > 0.0:
		trauma = maxf(trauma - decay * delta, 0.0)
		shake()
	else:
		offset = Vector2.ZERO
		rotation = 0.0

func add_trauma(amount: float) -> void:
	trauma = clampf(trauma + amount, 0.0, 1.0)

func shake() -> void:
	var amount: float = pow(trauma, trauma_power)
	rotation = max_roll * amount * randf_range(-1.0, 1.0)
	offset.x = max_offset.x * amount * randf_range(-1.0, 1.0)
	offset.y = max_offset.y * amount * randf_range(-1.0, 1.0)
