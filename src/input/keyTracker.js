

var KeyTracker = {};

// Enum that tracks all possible key states. Duplication of DOWN and UP states
// to ensure at least 1 tick worth of detection time. Enum values are not
// assigned randomly; assigned to ensure that HELD proceeds DOWN1 and DOWN,
// and that OPEN proceeds UP1 and UP. Additionally, all valid return values
// are even and related DOWN and UP values are separated into their own modulo
// sections (mod 4).
KeyTracker.KeyStatus = {
	DOWN: 	0,
	DOWN1: 	1,
	HELD:  	2,
	UP:    	4,
	UP1:   	5,
	OPEN:  	6
};

// Object holding all keyCodes and their current states
KeyTracker._states = {};


// Attaches key listeners to capture key down and up events on the specified
// screen element. Tracks events using the states object, indexed by key
// code.
KeyTracker.attachToScreen = function(canvas) {
	canvas.onkeydown = function(e) {
		KeyTracker._states[e.keyCode] = KeyTracker.KeyStatus.DOWN;
	};

	canvas.onkeyup = function(e) {
		KeyTracker._states[e.keyCode] = KeyTracker.KeyStatus.UP;
	};
};


// Advances the states of each key. States need to be advanced so that UP events
// naturally proceed to OPEN events in time, and same for DOWN to HELD. .
KeyTracker.tick = function() {
	for (var keyCode in KeyTracker._states) {
		if (!KeyTracker._states.hasOwnProperty(keyCode)) {
			continue;
		}
		if (KeyTracker._states[keyCode] % 4 != 2) {
			KeyTracker._states[keyCode]++;
		}
	}
};

// DOWN and UP events are frame specific, and guarantee at least 1 tick and no 
// more than 2 ticks for each state
KeyTracker.getValue = function(keyCode) {
	return KeyTracker._states[keyCode] == undefined ? KeyTracker.KeyStatus.OPEN : 
			KeyTracker._states[keyCode] - KeyTracker._states[keyCode] % 2;
};