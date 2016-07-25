/**
 * A set of behaviors for units. Each behavior has a getNexAction function that 
 * anticipates an empty queue (the condition that it will be called on).
 */

var UnitBehaviors = {};


// Behavior that provides a new Idle Action of 1 second on every call to 
// getNextAction.
UnitBehaviors.IdleBehavior = {};

UnitBehaviors.IdleBehavior.getNextAction = function(uam) {
	return new UnitActionManager.StayIdleAction(60, uam);
};

// Behavior that moves the unit in a random direction of a random dinstance 
// within the maximum move radius. Unit will stop upon collision. When the unit 
// is within attacking distance of the player, it will attack the player.
UnitBehaviors.PassiveBehavior = {};

UnitBehaviors.PassiveBehavior.MOVE_CHANCE = 0.5;
UnitBehaviors.PassiveBehavior.MAX_MOVE_RADIUS = 5;

UnitBehaviors.PassiveBehavior.getNextAction = function(uam) {
	// find distance from player
	var unitVisualInstance = uam.unit.visualInstance;
	var playerVisualInstance = uam.unit.containingMap.player.visualInstance;
	var distance = GridCalcs.getDistance(
			unitVisualInstance.x - playerVisualInstance.x, 
			unitVisualInstance.y - playerVisualInstance.y);
	var unitSpeed = 3 /* TODO: get actual speed */;
	var unitAttackDistance = 1 /* TODO: get actual attack distance */;
	// Increment by player width / 2
	unitAttackDistance += 0.5;
	if (distance < unitAttackDistance) {
		// conditions for attacking
		return new UnitActionManager.BasicAttackAction(uam, 
				Direction.getDirectionFromCoords(
						playerVisualInstance.x - unitVisualInstance.x, 
						playerVisualInstance.y - unitVisualInstance.y));
	} else if (Math.random() < UnitBehaviors.PassiveBehavior.MOVE_CHANCE) {
		var direction = Direction.getRandom();
		var angle = Direction.getAngle(direction);
		var randRadius = Math.random() * 
				UnitBehaviors.PassiveBehavior.MAX_MOVE_RADIUS;
		var targetX = uam.unit.visualInstance.x + randRadius * Math.sin(angle);
		var targetY = uam.unit.visualInstance.y - randRadius * Math.cos(angle);
		return new UnitActionManager.MoveWaypointAction(targetX, targetY, unitSpeed, 
				uam);
	} else {
	// conditions for idle
	return new UnitActionManager.StayIdleAction(60, uam);
	}
};


// Creates a variant of aggressive behavior given the minimum chase distance and 
// maximum chase distance.
UnitBehaviors._createAggressiveBehavior = function(minChaseDistance, 
		maxChaseDistance) {
	// Behavior that will attack if within minimum chase distance, chase if within 
	// a maximum chase distance but not within a minimum chase distnace, and stay
	// idle if outside a mazimum chase distance.
	var result = {};
	result.getNextAction = function(uam) {
		// find distance from player
		var unitVisualInstance = uam.unit.visualInstance;
		var playerVisualInstance = uam.unit.containingMap.player.visualInstance;
		var distance = GridCalcs.getDistance(
				unitVisualInstance.x - playerVisualInstance.x, 
				unitVisualInstance.y - playerVisualInstance.y);
		var unitSpeed = 3 /* TODO: get actual speed */;
		if (distance < minChaseDistance) {
			// conditions for attacking
			return new UnitActionManager.BasicAttackAction(uam, 
					Direction.getDirectionFromCoords(
							playerVisualInstance.x - unitVisualInstance.x, 
							playerVisualInstance.y - unitVisualInstance.y));
		} else if (distance < maxChaseDistance) {
			// conditions for chasing
			return new UnitActionManager.ChaseAction(uam, minChaseDistance, 
					maxChaseDistance, unitSpeed);
		} else {
			// conditions for idle
			return new UnitActionManager.StayIdleAction(60, uam);
		}
	};

	return result;
};


(function() {
	UnitBehaviors.AggressiveBehaviorNormal = 
			UnitBehaviors._createAggressiveBehavior(1.1, 10);
})();


UnitBehaviors.getBehavior = function(behaviorName) {
	return UnitBehaviors[behaviorName.substr(0, 1).toUpperCase() + 
			behaviorName.substr(1)];
};