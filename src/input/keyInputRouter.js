/**
 * Class responsible for tracking input and mapping tick-intervaled events
 * to appropriate object actions.
 */

var KeyInputRouter = {};

KeyInputRouter.Modes = {
	PLAYER_MAP_MOVEMENT: {
		tick: function() {
			KeyInputRouter._helperHandlePlayerMovement();
		}
	},
	DIALOG_INPUT: {
		tick: function() {
			KeyInputRouter._helperHandleDialogInput();
		}
	},
	DISABLED: {
		tick: function() {}
	}
};

// The current mode of the KeyInputRouter
KeyInputRouter._currentMode = KeyInputRouter.Modes.DISABLED;

// A set of keyCodes corresponding to all possbile inputs
KeyInputRouter.KeyMapping = {
	LEFT: 37,
	UP: 38,
	RIGHT: 39,
	DOWN: 40,
	ATTACK: 'z'.toUpperCase().charCodeAt(0),
 	ATTACK_ALT: 'x'.toUpperCase().charCodeAt(0),
 	DIALOG_ADV: 'c'.toUpperCase().charCodeAt(0),
 	TALK: 'c'.toUpperCase().charCodeAt(0),
 	ITEMS: 'i'.toUpperCase().charCodeAt(0),
 	EQUIPMENT: 'e'.toUpperCase().charCodeAt(0),
 	SETTINGS: 192,
 	EXIT_TABS: 27
};


// Respond to inputs on the tick, routing them to the appropriate handler for
// processing. Currently there is only one behavior, which is to move the
// player.
KeyInputRouter.tick = function() {
	KeyInputRouter._currentMode.tick();
};


// Sets the mode to one of the above input modes.
KeyInputRouter.setMode = function(mode) {
	KeyInputRouter._currentMode = mode;
};


// Gets the current input mode.
KeyInputRouter.getMode = function() {
	return KeyInputRouter._currentMode;
};


// Move the player in accordance to the arrow keys.
KeyInputRouter._helperHandlePlayerMovement = function() {
	var player = GameState.player;
	if (!player) {
		return;
	}
	if ((KeyTracker.getValue(KeyInputRouter.KeyMapping.ATTACK) <= 
					KeyTracker.KeyStatus.HELD || 
			KeyTracker.getValue(KeyInputRouter.KeyMapping.ATTACK_ALT) <= 
					KeyTracker.KeyStatus.HELD) && 
			player.canBasicAttack()) {
		var keyPressWasDown = KeyTracker.getValue(KeyInputRouter.KeyMapping.ATTACK) 
						== KeyTracker.KeyStatus.DOWN || 
				KeyTracker.getValue(KeyInputRouter.KeyMapping.ATTACK_ALT) == 
						KeyTracker.KeyStatus.DOWN;
		player.basicAttack();
		PlayerAttackApplier.BasicCloseRangedAttack.applyAttack(player, 
				keyPressWasDown);
	} else if (KeyTracker.getValue(KeyInputRouter.KeyMapping.TALK) == 
			KeyTracker.KeyStatus.UP && player.canTalk()) {
		player.tryTalk();
	} else if (KeyTracker.getValue(KeyInputRouter.KeyMapping.ITEMS) == 
			KeyTracker.KeyStatus.UP) {
		if (InventoryTabDrawer.currentTab == InventoryTabDrawer.ITEMS_TAB && 
				InventoryTabDrawer.isOpen) {
			InventoryTabDrawer.isOpen = false;
			MouseInputRouter.setMode(MouseInputRouter.Modes.PLAYER_MAP_MOVEMENT);

		} else {
			InventoryTabDrawer.isOpen = true;
			InventoryTabDrawer.currentTab = InventoryTabDrawer.ITEMS_TAB;
			MouseInputRouter.setMode(MouseInputRouter.Modes.INVENTORY_TAB_INPUT);
		}
	} else if (KeyTracker.getValue(KeyInputRouter.KeyMapping.EQUIPMENT) == 
			KeyTracker.KeyStatus.UP) {
		if (InventoryTabDrawer.currentTab == InventoryTabDrawer.EQUIPMENT_TAB &&
				InventoryTabDrawer.isOpen) {
			InventoryTabDrawer.isOpen = false;
			MouseInputRouter.setMode(MouseInputRouter.Modes.PLAYER_MAP_MOVEMENT);
		} else {
			InventoryTabDrawer.isOpen = true;
			InventoryTabDrawer.currentTab = InventoryTabDrawer.EQUIPMENT_TAB;
			MouseInputRouter.setMode(MouseInputRouter.Modes.INVENTORY_TAB_INPUT);
		}
	} else if (KeyTracker.getValue(KeyInputRouter.KeyMapping.SETTINGS) == 
			KeyTracker.KeyStatus.UP) {
		if (InventoryTabDrawer.currentTab == InventoryTabDrawer.SETTINGS_TAB && 
				InventoryTabDrawer.isOpen) {
			InventoryTabDrawer.isOpen = false;
			MouseInputRouter.setMode(MouseInputRouter.Modes.PLAYER_MAP_MOVEMENT);
		} else {
			InventoryTabDrawer.isOpen = true;
			InventoryTabDrawer.currentTab = InventoryTabDrawer.SETTINGS_TAB;
			MouseInputRouter.setMode(MouseInputRouter.Modes.INVENTORY_TAB_INPUT);
		}
	} else if (KeyTracker.getValue(KeyInputRouter.KeyMapping.EXIT_TABS) == 
			KeyTracker.KeyStatus.UP && InventoryTabDrawer.isOpen) {
		InventoryTabDrawer.isOpen = false;
		MouseInputRouter.setMode(MouseInputRouter.Modes.PLAYER_MAP_MOVEMENT);
	} else if (player.canMove()) {
		var xVelocity = 0, yVelocity = 0;
		if (KeyTracker.getValue(KeyInputRouter.KeyMapping.LEFT) <= 
				KeyTracker.KeyStatus.HELD) {
			xVelocity--;
		}
		if (KeyTracker.getValue(KeyInputRouter.KeyMapping.RIGHT) <= 
				KeyTracker.KeyStatus.HELD) {
			xVelocity++;
		}
		if (KeyTracker.getValue(KeyInputRouter.KeyMapping.UP) <= 
				KeyTracker.KeyStatus.HELD) {
			yVelocity--;
		}
		if (KeyTracker.getValue(KeyInputRouter.KeyMapping.DOWN) <= 
				KeyTracker.KeyStatus.HELD) {
			yVelocity++;
		}
		if (xVelocity == 0 && yVelocity == 0) {
			player.tryMove(xVelocity, yVelocity);
			return;	
		}
		if (xVelocity != 0 && yVelocity != 0) {
			xVelocity *= 0.70710678118;
			yVelocity *= 0.70710678118;
		}
		xVelocity *= Player.MIN_MOVE_SPEED;
		yVelocity *= Player.MIN_MOVE_SPEED;
		for (var i = 0; i < Player.WALK_SPEED; i++) {
			if (!player.tryMove(xVelocity, yVelocity)) {
				break;
			}
		}
	}
};


// Advance dialog and deal with dialog-specific inputs like choice selection.
KeyInputRouter._helperHandleDialogInput = function() {
	// Only advances dialog right now. This happens when the DIALOG_ADV key is
	// lifted up from a depressed state.
	if (KeyTracker.getValue(KeyInputRouter.KeyMapping.DIALOG_ADV) == 
			KeyTracker.KeyStatus.UP) {
		DialogDrawer.signalAdvance();
	}
};