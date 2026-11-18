extends CharacterBody2D
class_name PlayerController

const NORMAL_GRAVITY: float = 1400.0
const JUMP_VELOCITY: float = 580.0
const FAST_FALL_ACCEL: float = 2400.0
const SLIDE_DURATION: float = 0.6
const MAGNET_RADIUS: float = 260.0

@onready var sprite: Sprite2D = $Sprite2D
@onready var collision_shape: CollisionShape2D = $CollisionShape2D
@onready var shield_sprite: Sprite2D = $ShieldSprite
@onready var magnet_area: Area2D = $MagnetArea

var is_sliding: bool = false
var slide_timer: float = 0.0
var anim_timer: float = 0.0
var current_run_frame: int = 1

var normal_extents: Vector2 = Vector2(14, 24)
var slide_extents: Vector2 = Vector2(22, 11)

var skin_textures: Dictionary = {}

func _ready() -> void:
	load_skin(SaveSystem.equipped_skin)
	SaveSystem.data_updated.connect(_on_save_data_updated)
	GameManager.gravity_flipped.connect(_on_gravity_flipped)
	GameManager.powerup_activated.connect(_on_powerup_changed)
	GameManager.powerup_expired.connect(_on_powerup_changed)
	
	shield_sprite.visible = GameManager.has_shield()
	update_collision_shape()

func _on_save_data_updated() -> void:
	load_skin(SaveSystem.equipped_skin)

func load_skin(skin_name: String) -> void:
	var valid_skins := ["default", "ninja", "mech"]
	if not valid_skins.has(skin_name):
		skin_name = "default"
		
	skin_textures["run1"] = load("res://assets/sprites/player/player_%s_run1.png" % skin_name)
	skin_textures["run2"] = load("res://assets/sprites/player/player_%s_run2.png" % skin_name)
	skin_textures["run3"] = load("res://assets/sprites/player/player_%s_run3.png" % skin_name)
	skin_textures["run4"] = load("res://assets/sprites/player/player_%s_run4.png" % skin_name)
	skin_textures["jump"] = load("res://assets/sprites/player/player_%s_jump.png" % skin_name)
	skin_textures["slide"] = load("res://assets/sprites/player/player_%s_slide.png" % skin_name)

func _physics_process(delta: float) -> void:
	if GameManager.current_state != GameManager.GameState.PLAYING:
		return
	
	var is_inverted: bool = GameManager.is_gravity_inverted
	var current_gravity: float = -NORMAL_GRAVITY if is_inverted else NORMAL_GRAVITY
	var on_surface: bool = is_on_ceiling() if is_inverted else is_on_floor()
	
	# Jump Input (Keyboard, Gamepad, Touch)
	if Input.is_action_just_pressed("jump"):
		if on_surface:
			velocity.y = JUMP_VELOCITY if is_inverted else -JUMP_VELOCITY
			is_sliding = false
			SoundManager.play_sfx("jump")
	
	# Slide / Fast Fall Input
	if Input.is_action_pressed("slide"):
		if on_surface:
			if not is_sliding:
				start_slide()
		else:
			if is_inverted:
				velocity.y -= FAST_FALL_ACCEL * delta
			else:
				velocity.y += FAST_FALL_ACCEL * delta
	
	# Anti-Gravity Flip Input
	if Input.is_action_just_pressed("flip_gravity"):
		if GameManager.is_gravity_boost_active():
			GameManager.toggle_gravity()
	
	# Gravity Application
	if not on_surface:
		velocity.y += current_gravity * delta
		velocity.y = clampf(velocity.y, -1200.0, 1200.0)
	else:
		velocity.y = -10.0 if is_inverted else 10.0
	
	# Slide Duration Timer
	if is_sliding:
		slide_timer -= delta
		if slide_timer <= 0.0 or not on_surface:
			stop_slide()
	
	move_and_slide()
	
	update_visuals(delta, on_surface, is_inverted)
	
	if GameManager.is_magnet_active():
		attract_nearby_coins(delta)

func start_slide() -> void:
	is_sliding = true
	slide_timer = SLIDE_DURATION
	SoundManager.play_sfx("slide")
	update_collision_shape()

func stop_slide() -> void:
	is_sliding = false
	slide_timer = 0.0
	update_collision_shape()

func update_collision_shape() -> void:
	if collision_shape and collision_shape.shape is RectangleShape2D:
		if is_sliding:
			collision_shape.shape.size = slide_extents * 2
			collision_shape.position = Vector2(0, 12 if not GameManager.is_gravity_inverted else -12)
		else:
			collision_shape.shape.size = normal_extents * 2
			collision_shape.position = Vector2.ZERO

func update_visuals(delta: float, on_surface: bool, is_inverted: bool) -> void:
	if is_inverted:
		sprite.scale.y = -abs(sprite.scale.y)
		shield_sprite.scale.y = -abs(shield_sprite.scale.y)
	else:
		sprite.scale.y = abs(sprite.scale.y)
		shield_sprite.scale.y = abs(shield_sprite.scale.y)
	
	shield_sprite.visible = GameManager.has_shield()
	if shield_sprite.visible:
		shield_sprite.rotation += 2.0 * delta
	
	if is_sliding:
		if skin_textures.has("slide") and skin_textures["slide"]:
			sprite.texture = skin_textures["slide"]
	elif not on_surface:
		if skin_textures.has("jump") and skin_textures["jump"]:
			sprite.texture = skin_textures["jump"]
	else:
		anim_timer += delta * (GameManager.game_speed / 40.0)
		if anim_timer >= 1.0:
			anim_timer = 0.0
			current_run_frame = (current_run_frame % 4) + 1
			var key: String = "run%d" % current_run_frame
			if skin_textures.has(key) and skin_textures[key]:
				sprite.texture = skin_textures[key]

func _on_gravity_flipped(inverted: bool) -> void:
	update_collision_shape()
	velocity.y = -350.0 if inverted else 350.0

func _on_powerup_changed(_type: String, _duration: float = 0.0) -> void:
	shield_sprite.visible = GameManager.has_shield()

func attract_nearby_coins(delta: float) -> void:
	var areas := magnet_area.get_overlapping_areas()
	for area in areas:
		if area.is_in_group("coins"):
			var coin_node := area.get_parent()
			if coin_node:
				var dir: Vector2 = (global_position - coin_node.global_position).normalized()
				var dist: float = global_position.distance_to(coin_node.global_position)
				var pull_speed: float = lerp(900.0, 400.0, clampf(dist / MAGNET_RADIUS, 0.0, 1.0))
				coin_node.global_position += dir * pull_speed * delta

func take_damage() -> bool:
	if GameManager.consume_shield():
		return true
	
	GameManager.end_game()
	return false
