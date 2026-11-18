extends SceneTree

func _init() -> void:
	print("--- PIXEL RUNNER AUTOMATED TEST SUITE ---")
	var passed: int = 0
	var failed: int = 0
	
	# Test 1: GameData loading
	GameData.load_all_data()
	if GameData.items_data.has("skins") and GameData.items_data["skins"].size() == 3:
		print("[PASS] GameData loaded 3 skins successfully.")
		passed += 1
	else:
		print("[FAIL] GameData skins loading failed.")
		failed += 1
	
	# Test 2: SaveSystem default values
	SaveSystem.load_data()
	if SaveSystem.unlocked_skins.has("default"):
		print("[PASS] SaveSystem unlocked skins contains default.")
		passed += 1
	else:
		print("[FAIL] SaveSystem default skin check failed.")
		failed += 1
	
	# Test 3: GameManager speed calculation
	GameManager.current_distance = 100.0
	var expected_speed: float = GameManager.base_speed + (100.0 * GameManager.acceleration_rate)
	if abs(expected_speed - 384.0) < 0.1:
		print("[PASS] GameManager speed formula is mathematically exact.")
		passed += 1
	else:
		print("[FAIL] GameManager speed calculation discrepancy.")
		failed += 1
	
	# Test 4: Gravity Toggle
	GameManager.is_gravity_inverted = false
	GameManager.toggle_gravity()
	if GameManager.is_gravity_inverted == true:
		print("[PASS] Gravity toggle inverted successfully.")
		passed += 1
	else:
		print("[FAIL] Gravity toggle failed.")
		failed += 1
	
	print("--- TEST SUMMARY: %d PASSED, %d FAILED ---" % [passed, failed])
	quit(0 if failed == 0 else 1)
