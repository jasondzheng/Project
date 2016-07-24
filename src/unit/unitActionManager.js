/**
 * Contains actions for each unit
 */

var UnitActionManager = function(unit) {
	this.unit = unit;
	this._actionQueue = [];
	// TODO: Remove forced idle behavior
	this._behavior = UnitBehaviors.getBehavior(unit.unitEntity.behaviorPattern) || 
			UnitBehaviors.IdleBehavior;
	this._animationState;
	this._collisionIgnoreList = [unit];
	this._oldQueueLength = 0;
};

// Minimum distance to move within a tick
UnitActionManager.MIN_MOVE_DISTANCE = 0.01;	 

// Possible unit animation states
UnitActionManager.AnimationStates = {
	IDLE: 'idle',
	WALKING: 'walk',
	SPAWNING: 'spawn',
	DAMAGE_TAKEN: 'damageTaken',
	DESPAWNING: 'despawn',
	BASIC_ATTACKING: 'basicAttack'
};


// Consumes the queue, requesting new actions if the queue is empty
UnitActionManager.prototype.tick = function() {
	var startQueueLength = this._actionQueue.length;
	while (this._actionQueue.length > 0 && this._actionQueue[0].isDone()) {
		if (this._actionQueue[0].onEnd) {
			this._actionQueue[0].onEnd();
		}
		this._actionQueue.shift();
	}	
	if (this._actionQueue.length > 0) {
		if ((startQueueLength != this._actionQueue.length || 
				(startQueueLength != this._oldQueueLength && 
						this._oldQueueLength == 0)) && this._actionQueue[0].onStart) {
			this._actionQueue[0].onStart();
		}
		this._actionQueue[0].tick();
	} else {
		this._actionQueue[0] = this._behavior.getNextAction(this);
		if (this._actionQueue[0].onStart) {
			this._actionQueue[0].onStart();
		}
		this._actionQueue[0].tick();
	}
	this._oldQueueLength = this._actionQueue.length;
};


// Force enqueues an action, killing all other actions previously in the queue.
UnitActionManager.prototype.forceEnqueue = function(action) {
	this._actionQueue.length = 1;
	this._actionQueue[0] = action;
};


// Helper for incremental movement of units. Minimum movement amount is used,
// using speed to attempt to move towards targetX and targetY. Sets position
// of a given unit, but does NOT do any animation changing for the
// unit. Requires two callbacks: onCanMove, which has params for the
// intermediate x and y coordinates of the move (already updated in the unit)
// and onFailMove, which ought to return true if breaking from the attempted
// moves is needed.
UnitActionManager._helperIncrementalMove = function(unit, targetX, targetY, 
		angle, speed, collisionIgnoreList, onCanMove, onFailMove) {
	var minimalXDelta = UnitActionManager.MIN_MOVE_DISTANCE * Math.cos(angle);
	var minimalYDelta = UnitActionManager.MIN_MOVE_DISTANCE * -Math.sin(angle);
	for (var i = 0; i < speed; i++) {
		var midTargetX = unit.visualInstance.x + minimalXDelta;
		var midTargetY = unit.visualInstance.y + minimalYDelta;
		if ((midTargetX < targetX != unit.visualInstance.x < targetX) || 
				(midTargetY < targetY != unit.visualInstance.y < targetY)) {
			midTargetX = targetX;
			midTargetY = targetY;
		}
		if (!unit.containingMap.isColliding(midTargetX, midTargetY, 
						unit.visualInstance.getCollisionWidth(), 
						unit.visualInstance.getCollisionHeight(), 
						unit.visualInstance.isRounded(), 
						collisionIgnoreList) && 
				!unit.containingMap.isOutOfBounds(midTargetX, midTargetY, 
						unit.visualInstance.getCollisionWidth(), 
						unit.visualInstance.getCollisionHeight())) {
			unit.visualInstance.x = midTargetX;
			unit.visualInstance.y = midTargetY;
			onCanMove(midTargetX, midTargetY);
		} else {
			if (onFailMove()) {
				break;
			}
		}
	}
};