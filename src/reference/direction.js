/**
 * Enum representing cardinal (plus off-cardinal) directions. used to convert 
 * bewtween enum values as well as their string representations.
 */

var Direction = {
	UP: 'up',
	DOWN: 'down',
	LEFT: 'left',
	RIGHT: 'right',
	UP_LEFT: 'upLeft',
	UP_RIGHT: 'upRight',
	DOWN_LEFT: 'downLeft',
	DOWN_RIGHT: 'downRight'
};

// Structure to map angle segments to direction enum values
Direction._angleSegments = [
	Direction.LEFT,
	Direction.DOWN_LEFT,
	Direction.DOWN,
	Direction.DOWN_RIGHT,
	Direction.RIGHT,
	Direction.UP_RIGHT,
	Direction.UP,
	Direction.UP_LEFT
];


// Get a direction given a vector defined by a point.
Direction.getDirectionFromCoords = function(x, y) {
	var angle = Math.atan2(y, x);
	if (angle >= 7 * Math.PI / 8) {
		angle -= Math.PI * 2;
	}
	return Direction._angleSegments[
			Math.floor((angle + 9 * Math.PI / 8) * 4 / Math.PI)];
};

// Get a random direction
Direction.getRandom = function() {
	return Direction._angleSegments[
			Math.floor(Math.random() * Direction._angleSegments.length)];
};