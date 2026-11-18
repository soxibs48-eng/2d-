extends Area2D
class_name Pickup

enum PickupType {
	COIN,
	SHIELD,
	MAGNET,
	GRAVITY_CORE,
	DOUBLE_COIN
}

@export var pickup_type: PickupType = PickupType.COIN
@export var duration: float = 8.0

var time_elapsed: float = 0.0
var initial_y: float = 0.0

func _ready() -> void:
	initial_y = position.y
	body_entered.connect(_on_body_entered)
	add_to_group("pickups")
	if pickup_type == PickupType.COIN:
		add_to_group("coins")

func _physics_process(delta: float) -> void:
	if GameManager.current_state != GameManager.GameState.PLAYING:
		return
	
	# Scroll left with dynamic game speed
	position.x -= GameManager.game_speed * delta
	
	# Gentle floating animation
	time_elapsed += delta * 4.0
	position.y = initial_y + sin(time_elapsed) * 5.0
	
	# Visual coin spin or powerup pulsing
	if pickup_type == PickupType.COIN:
		$Sprite2D.scale.x = 2.0 * cos(time_elapsed * 1.5)
	else:
		var pulse: float = 1.8 + 0.3 * sin(time_elapsed * 2.0)
		$Sprite2D.scale = Vector2(pulse, pulse)
	
	# Despawn when off screen
	if position.x < -150.0:
		queue_free()

func _on_body_entered(body: Node2D) -> void:
	if body is Player:
		match pickup_type:
			PickupType.COIN:
				GameManager.collect_coin(1)
			PickupType.SHIELD:
				GameManager.activate_powerup("shield", 0.0)
			PickupType.MAGNET:
				GameManager.activate_powerup("magnet", 8.0)
			PickupType.GRAVITY_CORE:
				GameManager.activate_powerup("gravity", 10.0)
			PickupType.DOUBLE_COIN:
				GameManager.activate_powerup("double", 10.0)
		
		# Animate collect and remove
		queue_free()
