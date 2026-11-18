extends Node

var sounds: Dictionary = {}
var music_player: AudioStreamPlayer
var sfx_players: Array[AudioStreamPlayer] = []
const SFX_POOL_SIZE: int = 8
var current_sfx_index: int = 0

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	
	# Load sound streams with v2.0 hierarchy support
	sounds["jump"] = load_audio("res://assets/audio/sfx/jump.wav", "res://assets/audio/jump.wav")
	sounds["slide"] = load_audio("res://assets/audio/sfx/slide.wav", "res://assets/audio/slide.wav")
	sounds["gravity_flip"] = load_audio("res://assets/audio/sfx/gravity_flip.wav", "res://assets/audio/gravity_flip.wav")
	sounds["coin"] = load_audio("res://assets/audio/sfx/coin.wav", "res://assets/audio/coin.wav")
	sounds["powerup"] = load_audio("res://assets/audio/sfx/powerup.wav", "res://assets/audio/powerup.wav")
	sounds["hit"] = load_audio("res://assets/audio/sfx/hit.wav", "res://assets/audio/hit.wav")
	sounds["shield_break"] = load_audio("res://assets/audio/sfx/shield_break.wav", "res://assets/audio/shield_break.wav")
	sounds["click"] = load_audio("res://assets/audio/sfx/click.wav", "res://assets/audio/click.wav")
	sounds["bgm"] = load_audio("res://assets/audio/music/bgm.wav", "res://assets/audio/bgm.wav")
	
	# Setup Music Player
	music_player = AudioStreamPlayer.new()
	music_player.bus = "Master"
	music_player.stream = sounds["bgm"]
	add_child(music_player)
	
	music_player.finished.connect(_on_music_finished)
	
	# Setup SFX Player Pool
	for i in range(SFX_POOL_SIZE):
		var p := AudioStreamPlayer.new()
		p.bus = "Master"
		add_child(p)
		sfx_players.append(p)
	
	update_volumes()

func load_audio(primary: String, fallback: String) -> AudioStream:
	if ResourceLoader.exists(primary):
		return load(primary)
	elif ResourceLoader.exists(fallback):
		return load(fallback)
	return null

func _on_music_finished() -> void:
	if music_player and music_player.stream:
		music_player.play()

func play_sfx(sfx_name: String, pitch_scale: float = 1.0) -> void:
	if not sounds.has(sfx_name) or sounds[sfx_name] == null:
		return
	
	var player: AudioStreamPlayer = sfx_players[current_sfx_index]
	current_sfx_index = (current_sfx_index + 1) % SFX_POOL_SIZE
	
	player.stream = sounds[sfx_name]
	player.pitch_scale = pitch_scale
	
	var effective_vol: float = SaveSystem.master_volume * SaveSystem.sfx_volume
	if effective_vol <= 0.001:
		player.volume_db = -80.0
	else:
		player.volume_db = linear_to_db(effective_vol)
	
	player.play()

func play_music() -> void:
	if music_player and not music_player.playing:
		update_volumes()
		music_player.play()

func stop_music() -> void:
	if music_player and music_player.playing:
		music_player.stop()

func update_volumes() -> void:
	if music_player:
		var effective_music: float = SaveSystem.master_volume * SaveSystem.music_volume
		if effective_music <= 0.001:
			music_player.volume_db = -80.0
		else:
			music_player.volume_db = linear_to_db(effective_music)
