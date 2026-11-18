extends Node2D
class_name SpawnerSystem

# Preload obstacle scenes
var spike_floor_scene: PackedScene = preload("res://scenes/obstacles/spike_floor.tscn")
var spike_ceiling_scene: PackedScene = preload("res://scenes/obstacles/spike_ceiling.tscn")
var laser_barrier_scene: PackedScene = preload("res://scenes/obstacles/laser_barrier.tscn")
var floating_mine_scene: PackedScene = preload("res://scenes/obstacles/floating_mine.tscn")
var gravity_portal_scene: PackedScene = preload("res://scenes/obstacles/gravity_portal.tscn")

# Preload pickup scenes
var coin_scene: PackedScene = preload("res://scenes/pickups/coin.tscn")
var powerup_shield_scene: PackedScene = preload("res://scenes/pickups/powerup_shield.tscn")
var powerup_magnet_scene: PackedScene = preload("res://scenes/pickups/powerup_magnet.tscn")
var powerup_gravity_scene: PackedScene = preload("res://scenes/pickups/powerup_gravity.tscn")
var powerup_double_scene: PackedScene = preload("res://scenes/pickups/powerup_double.tscn")

const SPAWN_X: float = 1380.0
const FLOOR_Y: float = 556.0
const CEILING_Y: float = 164.0
const MID_Y: float = 360.0

var spawn_timer: float = 1.2
var rng: RandomNumberGenerator = RandomNumberGenerator.new()

func _ready() -> void:
	rng.randomize()
	GameManager.game_started.connect(_on_game_started)

func _on_game_started() -> void:
	for child in get_children():
		child.queue_free()
	spawn_timer = 1.2

func _process(delta: float) -> void:
	if GameManager.current_state != GameManager.GameState.PLAYING:
		return
	
	spawn_timer -= delta
	if spawn_timer <= 0.0:
		spawn_random_pattern()
		var base_gap: float = rng.randf_range(480.0, 700.0)
		spawn_timer = clampf(base_gap / GameManager.game_speed, 0.75, 2.0)

func spawn_random_pattern() -> void:
	var pattern_roll: int = rng.randi_range(0, 7)
	
	match pattern_roll:
		0:
			spawn_obstacle(spike_floor_scene, Vector2(SPAWN_X, FLOOR_Y))
			if rng.randf() > 0.6:
				spawn_obstacle(spike_floor_scene, Vector2(SPAWN_X + 60.0, FLOOR_Y))
			spawn_coin_arc(SPAWN_X - 40.0, FLOOR_Y - 80.0, 4)
		1:
			spawn_obstacle(spike_ceiling_scene, Vector2(SPAWN_X, CEILING_Y))
			if rng.randf() > 0.6:
				spawn_obstacle(spike_ceiling_scene, Vector2(SPAWN_X + 60.0, CEILING_Y))
			spawn_coin_arc(SPAWN_X - 40.0, CEILING_Y + 80.0, 4)
		2:
			spawn_obstacle(spike_floor_scene, Vector2(SPAWN_X, FLOOR_Y))
			spawn_obstacle(spike_ceiling_scene, Vector2(SPAWN_X + 180.0, CEILING_Y))
			spawn_coin_line(SPAWN_X, MID_Y, 4)
		3:
			var mine_y: float = rng.randf_range(280.0, 440.0)
			spawn_obstacle(floating_mine_scene, Vector2(SPAWN_X, mine_y))
			spawn_coin_line(SPAWN_X + 60.0, FLOOR_Y - 20.0, 3)
		4:
			var laser_y: float = FLOOR_Y - 50.0 if rng.randf() > 0.5 else CEILING_Y + 50.0
			spawn_obstacle(laser_barrier_scene, Vector2(SPAWN_X, laser_y))
			var safe_y: float = CEILING_Y + 40.0 if laser_y > MID_Y else FLOOR_Y - 40.0
			spawn_coin_line(SPAWN_X - 30.0, safe_y, 4)
		5:
			spawn_obstacle(gravity_portal_scene, Vector2(SPAWN_X, MID_Y))
			spawn_coin_line(SPAWN_X - 100.0, FLOOR_Y - 30.0, 3)
			spawn_coin_line(SPAWN_X + 80.0, CEILING_Y + 30.0, 3)
		6:
			var y_pos: float = CEILING_Y + 30.0 if GameManager.is_gravity_inverted else FLOOR_Y - 30.0
			spawn_coin_line(SPAWN_X, y_pos, 6)
			if rng.randf() > 0.4:
				spawn_random_powerup(Vector2(SPAWN_X + 300.0, y_pos))
		7:
			spawn_random_powerup(Vector2(SPAWN_X, MID_Y))
			spawn_obstacle(floating_mine_scene, Vector2(SPAWN_X - 120.0, FLOOR_Y - 30.0))
			spawn_obstacle(floating_mine_scene, Vector2(SPAWN_X + 120.0, CEILING_Y + 30.0))

func spawn_obstacle(scene: PackedScene, pos: Vector2) -> void:
	var obs := scene.instantiate() as Node2D
	obs.position = pos
	add_child(obs)

func spawn_coin_line(start_x: float, y_pos: float, count: int) -> void:
	for i in range(count):
		var coin := coin_scene.instantiate() as Node2D
		coin.position = Vector2(start_x + (i * 45.0), y_pos)
		add_child(coin)

func spawn_coin_arc(start_x: float, peak_y: float, count: int) -> void:
	for i in range(count):
		var progress: float = float(i) / float(max(1, count - 1))
		var arc_y: float = peak_y - sin(progress * PI) * 60.0
		var coin := coin_scene.instantiate() as Node2D
		coin.position = Vector2(start_x + (i * 40.0), arc_y)
		add_child(coin)

func spawn_random_powerup(pos: Vector2) -> void:
	var roll: float = rng.randf()
	var scene: PackedScene
	if roll < 0.30:
		scene = powerup_shield_scene
	elif roll < 0.60:
		scene = powerup_magnet_scene
	elif roll < 0.85:
		scene = powerup_double_scene
	else:
		scene = powerup_gravity_scene
	
	var p := scene.instantiate() as Node2D
	p.position = pos
	add_child(p)
