extends Control

signal close_shop

@onready var total_coins_label: Label = $PanelContainer/VBoxContainer/TopBar/CoinsBox/TotalCoinsLabel
@onready var back_btn: Button = $PanelContainer/VBoxContainer/BottomBar/BackBtn

# Skin 1: Default
@onready var default_btn: Button = $PanelContainer/VBoxContainer/SkinsScroll/HBoxContainer/SkinDefault/ActionBtn

# Skin 2: Ninja
@onready var ninja_btn: Button = $PanelContainer/VBoxContainer/SkinsScroll/HBoxContainer/SkinNinja/ActionBtn

# Skin 3: Mech
@onready var mech_btn: Button = $PanelContainer/VBoxContainer/SkinsScroll/HBoxContainer/SkinMech/ActionBtn

const NINJA_PRICE: int = 50
const MECH_PRICE: int = 100

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	back_btn.pressed.connect(_on_back_pressed)
	
	default_btn.pressed.connect(func(): _on_skin_action("default", 0))
	ninja_btn.pressed.connect(func(): _on_skin_action("ninja", NINJA_PRICE))
	mech_btn.pressed.connect(func(): _on_skin_action("mech", MECH_PRICE))
	
	SaveSystem.data_updated.connect(refresh_ui)
	refresh_ui()

func refresh_ui() -> void:
	total_coins_label.text = "%d" % SaveSystem.total_coins
	update_skin_button(default_btn, "default", 0)
	update_skin_button(ninja_btn, "ninja", NINJA_PRICE)
	update_skin_button(mech_btn, "mech", MECH_PRICE)

func update_skin_button(btn: Button, skin_id: String, price: int) -> void:
	if SaveSystem.equipped_skin == skin_id:
		btn.text = "TANLANGAN"
		btn.disabled = true
	elif SaveSystem.unlocked_skins.has(skin_id):
		btn.text = "TANLASH"
		btn.disabled = false
	else:
		btn.text = "OCHISH (%d)" % price
		btn.disabled = SaveSystem.total_coins < price

func _on_skin_action(skin_id: String, price: int) -> void:
	SoundManager.play_sfx("click")
	if SaveSystem.unlocked_skins.has(skin_id):
		SaveSystem.set_equipped_skin(skin_id)
	else:
		if SaveSystem.spend_coins(price):
			SaveSystem.unlock_skin(skin_id)
			SaveSystem.set_equipped_skin(skin_id)
			SoundManager.play_sfx("powerup")
	refresh_ui()

func _on_back_pressed() -> void:
	SoundManager.play_sfx("click")
	visible = false
	close_shop.emit()
