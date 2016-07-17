/**
 * Holds the different types of movement patterns for NPC movement.
 */

var MovePattern = {};

var MoveInstruction = function(x, y, speed, direction) {
	this.x = x;
	this.y = y;
	this.speed = speed;
	this.direction = direction;
};


MovePattern._genRandomClassPattern = function(speed, walkRate, turnRate, 
		boxWidth, boxHeight) {
	var result = {};

	result.WIDTH_BOUND_HALF = boxWidth / 2;
	result.HEIGHT_BOUND_HALF = boxHeight / 2;
	result.PROB_MOVE = walkRate;
	result.PROB_TURN_WHILE_IDLE = turnRate;
	result.MIN_MOVE_LEN = 0.05;
	result.SPEED = speed;

	result.genWaypoint = function(npc) {
		if (Math.random() < result.PROB_MOVE) {
			while (true) {
				var randAngle = Math.floor(Math.random() * 8) * Math.PI / 4;
				var yLimit = npc.startingLocation.y + (randAngle < Math.PI ? 
						result.HEIGHT_BOUND_HALF : 
						-result.HEIGHT_BOUND_HALF);
				var xLimit = npc.startingLocation.x + 
						((randAngle > Math.PI / 2 && randAngle <= 3 * Math.PI / 2) ? 
								-result.WIDTH_BOUND_HALF : 
								result.WIDTH_BOUND_HALF);
				var relXLimit = xLimit - npc.visualInstance.x;
				var relYLimit = yLimit - npc.visualInstance.y;
				var maxLen;
				if (randAngle == 0 || randAngle == Math.PI) {
					maxLen = Math.abs(relXLimit);
				} else if (randAngle ==  Math.PI / 2 || randAngle == 3 * Math.PI / 2) {
					maxLen = Math.abs(relYLimit);
				} else {
					var maxLen = (relXLimit / Math.cos(randAngle) < 
							relYLimit / Math.sin(randAngle)) ? 
							relXLimit / Math.cos(randAngle) : relYLimit / Math.sin(randAngle);
				}
				if (Math.abs(maxLen - 0) < result.MIN_MOVE_LEN) {
					continue; 
				}
				var randLen = Math.random() * maxLen;
				return new MoveInstruction(
						randLen * Math.cos(randAngle) + npc.visualInstance.x, 
						randLen * Math.sin(randAngle) + npc.visualInstance.y, 
						result.SPEED, undefined /* direction */);
			}
		} else if (Math.random() < result.PROB_TURN_WHILE_IDLE) {
			return new MoveInstruction(undefined /* x */, undefined /* y */, 
					undefined /* speed */, Direction.getRandom());
		}
		return null;
	};

	return result;
};


(function() {
	var speedNames = ['Slow', 'Mid', 'Fast'];
	var sizeNames = ['Small', 'Med', 'Large'];
	var speeds = [1 / 90, 1 / 60, 1 / 30];
	var speedDictatedTurnRates = [1 / 480, 1 / 360, 1 / 240];
	var sizes = [2, 3, 4];
	for (var i = 0; i < speedNames.length; i++) {
		for (var j = 0; j < sizeNames.length; j++) {
			MovePattern['Random' + speedNames[i] + sizeNames[j]] = 
					MovePattern._genRandomClassPattern(speeds[i], 1 / 240 /* walkRate */, 
							speedDictatedTurnRates[i], sizes[j], sizes[j]);
		}	
	}
})();


// Gets a move pattern by its string representation.
MovePattern.getType = function(patternName) {
	return MovePattern[patternName.substr(0, 1).toUpperCase() + 
			patternName.substr(1)];
};