extends Node2D
class_name PetController

## Companion Pet / Drone System (TZ v3.0)

enum PetType { NONE, MAGNET_BOT, SHIELD_DRONE, SPARKY }

@export var pet_type: PetType = PetType.MAGNET_BOT
@export var follow_target: Node2D
@export var lerp_speed: float = 8.0
@export var magnet_radius: float = 240.0

var bob_timer: float = 0.0
var shield_recharge_timer: float = 0.0
var sparky_distance_acc: float = 0.0

signal shield_granted()
signal bonus_coin_generated()

func _ready() -> void:
	if not follow_target and get_parent() and get_parent().has_node("Player"):
		follow_target = get_parent().get_node("Player")

func _process(delta: float) -> void:
	if pet_type == PetType.NONE or not follow_target:
		return
	
	bob_timer += delta * 4.0
	var bob_y: float = sin(bob_timer) * 8.0
	
	# Smoothly lag behind the player
	var target_pos: Vector2 = follow_target.global_position + Vector2(-45.0, 10.0 + bob_y)
	if GameManager and GameManager.is_gravity_inverted:
		target_pos = follow_target.global_position + Vector2(-45.0, -10.0 - bob_y)
		scale.y = -1.0
	else:
		scale.y = 1.0
	
	global_position = global_position.lerp(target_pos, lerp_speed * delta)
	
	# Handle specific pet perks
	match pet_type:
		PetType.MAGNET_BOT:
			_process_magnet(delta)
		PetType.SHIELD_DRONE:
			_process_shield(delta)
		PetType.SPARKY:
			_process_sparky(delta)

func _process_magnet(delta: float) -> void:
	var coins = get_tree().get_nodes_in_group("coins")
	for coin in coins:
		if is_instance_valid(coin):
			var dist: float = global_position.distance_to(coin.global_position)
			if dist <= magnet_radius and dist > 1.0:
				var dir: Vector2 = (global_position - coin.global_position).normalized()
				coin.global_position += dir * 450.0 * delta

func _process_shield(delta: float) -> void:
	if GameManager and not GameManager.powerup_timers.get("shield", false):
		shield_recharge_timer += delta
		if shield_recharge_timer >= 60.0:
			shield_recharge_timer = 0.0
			GameManager.powerup_timers["shield"] = true
			shield_granted.emit()

func _process_sparky(delta: float) -> void:
	if GameManager and GameManager.current_state == GameManager.GameState.PLAYING:
		sparky_distance_acc += (GameManager.game_speed * delta) / 10.0
		if sparky_distance_acc >= 75.0:
			sparky_distance_acc = 0.0
			GameManager.add_coin()
			bonus_coin_generated.emit()
