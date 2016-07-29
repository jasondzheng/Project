/**
 * Class responsible for tracking input and mapping tick-intervaled events
 * to appropriate object actions.
 */

var InputRouter = {};

InputRouter.Modes = {
	PLAYER_MAP_MOVEMENT: {
		tick: function() {
			InputRouter._helperHandlePlayerMovement();
		}
	},
	DIALOG_INPUT: {
		tick: function() {
			InputRouter._helperHandleDialogInput();
		}
	},
	DISABLED: {
		tick: function() {}
	}
};

// The current mode of the InputRouter
InputRouter._currentMode = InputRouter.Modes.PLAYER_MAP_MOVEMENT;

// A set of keyCodes corresponding to all possbile inputs
InputRouter.KeyMapping = {
	LEFT: 37,
	UP: 38,
	RIGHT: 39,
	DOWN: 40,
	ATTACK: 'z'.toUpperCase().charCodeAt(0),
 	ATTACK_ALT: 'x'.toUpperCase().charCodeAt(0),
 	DIALOG_ADV: 'c'.toUpperCase().charCodeAt(0),
 	TALK: 'c'.toUpperCase().charCodeAt(0)
};


// Respond to inputs on the tick, routing them to the appropriate handler for
// processing. Currently there is only one behavior, which is to move the
// player.
InputRouter.tick = function() {
	InputRouter._currentMode.tick();
};


// Sets the mode to one of the above input modes.
InputRouter.setMode = function(mode) {
	InputRouter._currentMode = mode;
};


// Gets the current input mode.
InputRouter.getMode = function() {
	return InputRouter._currentMode;
};


// Move the player in accordance to the arrow keys.
InputRouter._helperHandlePlayerMovement = function() {
	var player = GameState.player;
	if (!player) {
		return;
	}
	if ((KeyTracker.getValue(InputRouter.KeyMapping.ATTACK) <= 
					KeyTracker.KeyStatus.HELD || 
			KeyTracker.getValue(InputRouter.KeyMapping.ATTACK_ALT) <= 
					KeyTracker.KeyStatus.HELD) && 
			player.canBasicAttack()) {
		var keyPressWasDown = KeyTracker.getValue(InputRouter.KeyMapping.ATTACK) == 
						KeyTracker.KeyStatus.DOWN || 
				KeyTracker.getValue(InputRouter.KeyMapping.ATTACK_ALT) == 
						KeyTracker.KeyStatus.DOWN;
		player.basicAttack();
		PlayerAttackApplier.BasicCloseRangedAttack.applyAttack(player, 
				keyPressWasDown);
	} else if (KeyTracker.getValue(InputRouter.KeyMapping.TALK) == 
			KeyTracker.KeyStatus.UP && player.canTalk()) {
		player.tryTalk();
	} else if (player.canMove()) {
		var xVelocity = 0, yVelocity = 0;
		if (KeyTracker.getValue(InputRouter.KeyMapping.LEFT) <= 
				KeyTracker.KeyStatus.HELD) {
			xVelocity--;
		}
		if (KeyTracker.getValue(InputRouter.KeyMapping.RIGHT) <= 
				KeyTracker.KeyStatus.HELD) {
			xVelocity++;
		}
		if (KeyTracker.getValue(InputRouter.KeyMapping.UP) <= 
				KeyTracker.KeyStatus.HELD) {
			yVelocity--;
		}
		if (KeyTracker.getValue(InputRouter.KeyMapping.DOWN) <= 
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
InputRouter._helperHandleDialogInput = function() {
	// Only advances dialog right now. This happens when the DIALOG_ADV key is
	// lifted up from a depressed state.
	if (KeyTracker.getValue(InputRouter.KeyMapping.DIALOG_ADV) == 
			KeyTracker.KeyStatus.UP) {
		DialogDrawer.signalAdvance();
	}
};