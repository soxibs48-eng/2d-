extends ParallaxBackground

func _process(delta: float) -> void:
	if GameManager.current_state == GameManager.GameState.PLAYING:
		scroll_offset.x -= GameManager.game_speed * delta
