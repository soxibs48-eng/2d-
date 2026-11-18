extends Area2D
class_name Obstacle

enum ObstacleType {
	SPIKE_FLOOR,
	SPIKE_CEILING,
	LASER_BARRIER,
	FLOATING_MINE,
	GRAVITY_PORTAL
}

@export var obstacle_type: ObstacleType = ObstacleType.SPIKE_FLOOR
@export var damage_on_touch: bool = true
@export var bobbing_amplitude: float = 0.0
@export var bobbing_frequency: float = 3.0

var initial_y: float = 0.0
var time_elapsed: float = 0.0

func _ready() -> void:
	initial_y = position.y
	body_entered.connect(_on_body_entered)
	add_to_group("obstacles")

func _physics_process(delta: float) -> void:
	if GameManager.current_state != GameManager.GameState.PLAYING:
		return
	
	# Scroll left with dynamic game speed
	position.x -= GameManager.game_speed * delta
	
	# Bobbing oscillation for flying mines
	if bobbing_amplitude > 0.0:
		time_elapsed += delta
		position.y = initial_y + sin(time_elapsed * bobbing_frequency) * bobbing_amplitude
	
	# Despawn when off screen to the left
	if position.x < -150.0:
		queue_free()

func _on_body_entered(body: Node2D) -> void:
	if body is Player:
		if obstacle_type == ObstacleType.GRAVITY_PORTAL:
			# Anti-Gravity Zone / Portal flips gravity without damaging!
			GameManager.toggle_gravity()
			# Subtle visual trigger effect
			modulate = Color(2, 2, 2, 1)
			var tween := create_tween()
			tween.tween_property(self, "modulate", Color(1, 1, 1, 0.4), 0.2)
		elif damage_on_touch:
			var survived: bool = body.take_damage()
			if survived:
				# Shield broke, destroy the obstacle so player isn't hit repeatedly
				queue_free()
