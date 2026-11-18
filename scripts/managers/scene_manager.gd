extends Node

signal transition_started
signal transition_finished

var overlay_layer: CanvasLayer
var fade_rect: ColorRect

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	
	overlay_layer = CanvasLayer.new()
	overlay_layer.layer = 100
	add_child(overlay_layer)
	
	fade_rect = ColorRect.new()
	fade_rect.color = Color(0, 0, 0, 0)
	fade_rect.mouse_filter = Control.MOUSE_FILTER_IGNORE
	fade_rect.set_anchors_preset(Control.PRESET_FULL_RECT)
	overlay_layer.add_child(fade_rect)

func change_scene(scene_path: String, duration: float = 0.3) -> void:
	transition_started.emit()
	var tween := create_tween()
	tween.tween_property(fade_rect, "color:a", 1.0, duration)
	await tween.finished
	
	get_tree().change_scene_to_file(scene_path)
	
	var tween_in := create_tween()
	tween_in.tween_property(fade_rect, "color:a", 0.0, duration)
	await tween_in.finished
	transition_finished.emit()

func reload_current_scene(duration: float = 0.25) -> void:
	transition_started.emit()
	var tween := create_tween()
	tween.tween_property(fade_rect, "color:a", 1.0, duration)
	await tween.finished
	
	get_tree().reload_current_scene()
	
	var tween_in := create_tween()
	tween_in.tween_property(fade_rect, "color:a", 0.0, duration)
	await tween_in.finished
	transition_finished.emit()

func flash_screen(color: Color = Color(1, 1, 1, 0.5), duration: float = 0.2) -> void:
	fade_rect.color = color
	var tween := create_tween()
	tween.tween_property(fade_rect, "color:a", 0.0, duration)
