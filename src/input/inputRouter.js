/**
 * Class responsible for tracking input and mapping tick-intervaled events
 * to appropriate object actions.
 */

var InputRouter = {};

// A set of keyCodes corresponding to all possbile inputs
InputRouter.KeyMapping = {
	LEFT: 37,
	UP: 38,
	RIGHT: 39,
	DOWN: 40,
	ATTACK: 'z'.toUpperCase().charCodeAt(0),
 	ATTACK_ALT: 'x'.toUpperCase().charCodeAt(0)
};

// Respond to inputs on the tick, routing them to the appropriate handler for
// processing. Currently there is only one behavior, which is to move the
// player.
InputRouter.tick = function() {
	InputRouter._helperHandlePlayerMovement();
};


// Move the player in accordance to the arrow keys.
InputRouter._helperHandlePlayerMovement = function() {
	if (!GameState.player) {
		return;
	}
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
		GameState.player.tryMove(xVelocity, yVelocity);
		return;	
	}
	if (xVelocity != 0 && yVelocity != 0) {
		xVelocity *= 0.70710678118;
		yVelocity *= 0.70710678118;
	}
	xVelocity *= Player.MIN_MOVE_SPEED;
	yVelocity *= Player.MIN_MOVE_SPEED;
	for (var i = 0; i < Player.WALK_SPEED; i++) {
		if (!GameState.player.tryMove(xVelocity, yVelocity)) {
			break;
		}
	}
};