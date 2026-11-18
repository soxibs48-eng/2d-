extends Node

enum GameState {
	MENU,
	PLAYING,
	PAUSED,
	GAME_OVER,
	VICTORY
}

var current_state: GameState = GameState.MENU

# Difficulty scaling parameters from TZ v2.0
var base_speed: float = 380.0
var acceleration_rate: float = 0.04
var max_speed: float = 950.0
var game_speed: float = 380.0
var current_distance: float = 0.0
var session_coins: int = 0
var flip_count: int = 0

# Gravity state
var is_gravity_inverted: bool = false

# Active power-ups
var powerup_timers: Dictionary = {
	"shield": false,
	"magnet": 0.0,
	"gravity": 0.0,
	"double": 0.0
}

signal game_started
signal game_paused(is_paused: bool)
signal game_over(distance: float, coins: int, is_new_record: bool)
signal victory_reached
signal distance_updated(distance: float)
signal coins_updated(coins: int)
signal powerup_activated(type: String, duration: float)
signal powerup_expired(type: String)
signal gravity_flipped(is_inverted: bool)
signal shake_requested(amount: float)
signal achievement_unlocked(id: String, name: String)

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	GameData.load_all_data()

func _process(delta: float) -> void:
	if current_state != GameState.PLAYING:
		return
	
	# Update distance
	current_distance += (game_speed * delta) / 10.0
	distance_updated.emit(current_distance)
	
	# Check distance achievements
	if current_distance >= 500.0:
		SaveSystem.check_and_unlock_achievement("runner_500")
	
	# Update game speed using TZ v2.0 formula
	game_speed = minf(base_speed + (current_distance * acceleration_rate), max_speed)
	
	# Update timed powerups
	for p_type in ["magnet", "gravity", "double"]:
		if powerup_timers[p_type] > 0.0:
			powerup_timers[p_type] -= delta
			if powerup_timers[p_type] <= 0.0:
				powerup_timers[p_type] = 0.0
				powerup_expired.emit(p_type)

func start_game() -> void:
	current_distance = 0.0
	session_coins = 0
	flip_count = 0
	game_speed = base_speed
	is_gravity_inverted = false
	
	powerup_timers["shield"] = false
	powerup_timers["magnet"] = 0.0
	powerup_timers["gravity"] = 0.0
	powerup_timers["double"] = 0.0
	
	current_state = GameState.PLAYING
	get_tree().paused = false
	
	SaveSystem.check_and_unlock_achievement("first_run")
	SoundManager.play_music()
	
	game_started.emit()
	distance_updated.emit(0.0)
	coins_updated.emit(0)

func pause_game() -> void:
	if current_state == GameState.PLAYING:
		current_state = GameState.PAUSED
		get_tree().paused = true
		game_paused.emit(true)

func resume_game() -> void:
	if current_state == GameState.PAUSED:
		current_state = GameState.PLAYING
		get_tree().paused = false
		game_paused.emit(false)

func end_game() -> void:
	if current_state == GameState.GAME_OVER:
		return
	
	current_state = GameState.GAME_OVER
	SoundManager.stop_music()
	SoundManager.play_sfx("hit")
	shake_requested.emit(0.8)
	
	var is_record: bool = SaveSystem.update_high_score(current_distance)
	SaveSystem.add_coins(session_coins)
	
	game_over.emit(current_distance, session_coins, is_record)

func collect_coin(base_amount: int = 1) -> void:
	var multiplier: int = 2 if powerup_timers["double"] > 0.0 else 1
	var total: int = base_amount * multiplier
	session_coins += total
	coins_updated.emit(session_coins)
	SoundManager.play_sfx("coin")
	
	if SaveSystem.total_coins + session_coins >= 50:
		SaveSystem.check_and_unlock_achievement("coins_50")

func activate_powerup(type: String, duration: float) -> void:
	SoundManager.play_sfx("powerup")
	shake_requested.emit(0.2)
	if type == "shield":
		powerup_timers["shield"] = true
	else:
		powerup_timers[type] = max(powerup_timers[type], duration)
	
	powerup_activated.emit(type, duration)

func has_shield() -> bool:
	return powerup_timers["shield"] == true

func consume_shield() -> bool:
	if powerup_timers["shield"]:
		powerup_timers["shield"] = false
		powerup_expired.emit("shield")
		SoundManager.play_sfx("shield_break")
		shake_requested.emit(0.5)
		return true
	return false

func is_magnet_active() -> bool:
	return powerup_timers["magnet"] > 0.0

func is_double_active() -> bool:
	return powerup_timers["double"] > 0.0

func is_gravity_boost_active() -> bool:
	return powerup_timers["gravity"] > 0.0

func toggle_gravity() -> void:
	is_gravity_inverted = !is_gravity_inverted
	flip_count += 1
	SoundManager.play_sfx("gravity_flip")
	gravity_flipped.emit(is_gravity_inverted)
	
	if flip_count >= 5:
		SaveSystem.check_and_unlock_achievement("gravity_flipper")

func set_gravity(inverted: bool) -> void:
	if is_gravity_inverted != inverted:
		is_gravity_inverted = inverted
		flip_count += 1
		SoundManager.play_sfx("gravity_flip")
		gravity_flipped.emit(is_gravity_inverted)
		
		if flip_count >= 5:
			SaveSystem.check_and_unlock_achievement("gravity_flipper")
