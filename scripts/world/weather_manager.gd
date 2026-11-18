extends Node
class_name WeatherManager

## Dynamic Weather and Day/Night Time Cycle System (TZ v3.0)

enum TimePhase { DAWN, DAY, SUNSET, NIGHT }
enum WeatherType { CLEAR, RAIN, SNOW, CYBER_STORM }

@export var cycle_duration_meters: float = 1200.0

var current_time_phase: TimePhase = TimePhase.DAY
var current_weather: WeatherType = WeatherType.CLEAR

var phase_colors: Dictionary = {
	TimePhase.DAWN: Color(0.85, 0.65, 0.75, 1.0),
	TimePhase.DAY: Color(1.0, 1.0, 1.0, 1.0),
	TimePhase.SUNSET: Color(1.0, 0.6, 0.4, 1.0),
	TimePhase.NIGHT: Color(0.35, 0.45, 0.7, 1.0)
}

var weather_timer: float = 0.0
var weather_switch_interval: float = 30.0
var lightning_timer: float = 0.0
var lightning_active: bool = false

signal time_phase_changed(phase: TimePhase)
signal weather_changed(weather: WeatherType)
signal lightning_flashed()

func _ready() -> void:
	if GameManager:
		GameManager.distance_updated.connect(_on_distance_updated)

func _process(delta: float) -> void:
	weather_timer += delta
	if weather_timer >= weather_switch_interval:
		weather_timer = 0.0
		_switch_random_weather()
	
	if current_weather == WeatherType.CYBER_STORM:
		lightning_timer -= delta
		if lightning_timer <= 0.0:
			lightning_timer = randf_range(5.0, 12.0)
			_trigger_lightning()

func _on_distance_updated(dist: float) -> void:
	var phase_idx: int = int(fposmod(dist, cycle_duration_meters) / (cycle_duration_meters / 4.0))
	var new_phase: TimePhase = phase_idx as TimePhase
	if new_phase != current_time_phase:
		current_time_phase = new_phase
		time_phase_changed.emit(current_time_phase)

func _switch_random_weather() -> void:
	var types = [WeatherType.CLEAR, WeatherType.RAIN, WeatherType.SNOW, WeatherType.CYBER_STORM]
	var pick: WeatherType = types[randi() % types.size()]
	if pick != current_weather:
		current_weather = pick
		weather_changed.emit(current_weather)

func _trigger_lightning() -> void:
	lightning_active = true
	lightning_flashed.emit()

func get_ambient_color() -> Color:
	return phase_colors.get(current_time_phase, Color.WHITE)
