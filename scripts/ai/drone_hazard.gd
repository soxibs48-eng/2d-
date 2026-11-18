extends Area2D
class_name DroneHazard

@export var bobbing_amplitude: float = 30.0
@export var bobbing_frequency: float = 2.8

var initial_y: float = 0.0
var time_elapsed: float = 0.0

func _ready() -> void:
	initial_y = position.y
	body_entered.connect(_on_body_entered)
	add_to_group("obstacles")

func _physics_process(delta: float) -> void:
	if GameManager.current_state != GameManager.GameState.PLAYING:
		return
	
	# Scroll left
	position.x -= GameManager.game_speed * delta
	
	# Sinusoidal drone hovering
	time_elapsed += delta
	position.y = initial_y + sin(time_elapsed * bobbing_frequency) * bobbing_amplitude
	
	# Drone red eye blinking
	$Sprite2D.modulate = Color(1.0 + 0.3 * sin(time_elapsed * 8.0), 1.0, 1.0, 1.0)
	
	if position.x < -150.0:
		queue_free()

func _on_body_entered(body: Node2D) -> void:
	if body is Player:
		var survived: bool = body.take_damage()
		if survived:
			queue_free()
