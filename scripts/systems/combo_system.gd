extends Node
class_name ComboSystem

## Combo and Fever Mode System (TZ v3.0)

@export var max_multiplier: float = 5.0
@export var fever_duration: float = 9.0

var combo_count: int = 0
var combo_multiplier: float = 1.0
var fever_meter: float = 0.0 # 0.0 to 100.0
var is_fever_active: bool = false
var fever_timer: float = 0.0

signal combo_updated(multiplier: float)
signal fever_meter_updated(percent: float)
signal fever_started()
signal fever_ended()

func _process(delta: float) -> void:
	if is_fever_active:
		fever_timer -= delta
		fever_meter = max(0.0, (fever_timer / fever_duration) * 100.0)
		fever_meter_updated.emit(fever_meter)
		if fever_timer <= 0.0:
			end_fever()

func add_action(action_type: String) -> void:
	combo_count += 1
	var meter_gain: float = 4.0
	var mult_gain: float = 0.1
	
	match action_type:
		"coin":
			meter_gain = 6.0
			mult_gain = 0.15
		"dodge":
			meter_gain = 10.0
			mult_gain = 0.25
		"flip":
			meter_gain = 8.0
			mult_gain = 0.2
	
	combo_multiplier = min(max_multiplier, combo_multiplier + mult_gain)
	combo_updated.emit(combo_multiplier)
	
	if not is_fever_active:
		fever_meter = min(100.0, fever_meter + meter_gain)
		fever_meter_updated.emit(fever_meter)
		if fever_meter >= 100.0:
			start_fever()

func start_fever() -> void:
	is_fever_active = true
	fever_timer = fever_duration
	fever_meter = 100.0
	fever_started.emit()

func end_fever() -> void:
	is_fever_active = false
	fever_timer = 0.0
	fever_meter = 0.0
	fever_ended.emit()

func get_coin_multiplier() -> int:
	return 3 if is_fever_active else 1
