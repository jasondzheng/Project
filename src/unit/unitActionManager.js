/*
waypoint movement
move towards player until radius
move away from player until radius
stay idle for time
chase player
begin basic attack
finish basic attack
die
get hit
spawn
*/


var UnitActionManager = function(unit) {
	this.unit = unit;
	this._actionQueue = [];
	this._behavior = unit.unitEntity.behaviorPattern; // TODO: get actual behavior
	this._animationState;
	this._collisionIgnoreList = [unit];
};

// Minimum distance to move within a tick
UnitActionManager.MIN_MOVE_DISTANCE = 0.01;	 

// Possible unit animation states
UnitActionManager.AnimationStates = {
	IDLE: 'idle',
	WALKING: 'walk',
	SPAWNING: 'spawn'
}


// Consumes the queue, requesting new actions if the queue is empty
UnitActionManager.prototype.tick = function() {
	while (this._actionQueue.length > 0 && this._actionQueue[0].isDone()) {
		this._actionQueue.shift();
	}
	if (this._actionQueue.length > 0) {
		this._actionQueue[0].tick();
	} else {
		// TODO: grab the next queueable since theres nothing to do
	}
}


/** 
 * Represents static movement to a fixed waypoint at a fixed speed.
 */
UnitActionManager.MoveWaypointAction = function(targetX, targetY, speed, uam) {
	this._targetX = targetX;
	this._targetY = targetY;
	this._speed = speed;
	// The deploying Unit Action Manager
	this._uam = uam;
	// Holds the status of completedness based on the results of tick
	this._complete = false;
};


UnitActionManager.MoveWaypointAction.prototype.tick = function() {
	var deltaX = (this._targetX - this._uam.unit.visualInstance.x);
	var deltaY = (this._targetY - this._uam.unit.visualInstance.y);
	var targetDirection, targetAnimationState;
	if (deltaX == 0 && deltaY == 0) {
		targetDirection = this._uam.unit.direction;
		targetAnimationState = UnitActionManager.AnimationStates.IDLE;
		this._complete = true;
	} else {
		targetDirection = Direction.getDirectionFromCoords(deltaX, deltaY);
		var angle = Math.atan2(-deltaY, deltaX);
		var minimalXDelta = UnitActionManager.MIN_MOVE_DISTANCE * Math.cos(angle);
		var minimalYDelta = UnitActionManager.MIN_MOVE_DISTANCE * -Math.sin(angle);
		for (var i = 0; i < this._speed; i++) {
			var midTargetX = this._uam.unit.visualInstance.x + minimalXDelta;
			var midTargetY = this._uam.unit.visualInstance.y + minimalYDelta;
			if ((midTargetX < this._targetX != 
							this._uam.unit.visualInstance.x < this._targetX) || 
					(midTargetY < this._targetY != 
							this._uam.unit.visualInstance.y < this._targetY)) {
				midTargetX = this._targetX;
				midTargetY = this._targetY;
			}
			if (!this._uam.unit.containingMap.isColliding(midTargetX, midTargetY, 
							this._uam.unit.visualInstance.getCollisionWidth(), 
							this._uam.unit.visualInstance.getCollisionHeight(), 
							this._uam.unit.visualInstance.isRounded(), 
							this._uam._collisionIgnoreList) && 
					!this._uam.unit.containingMap.isOutOfBounds(midTargetX, midTargetY, 
							this._uam.unit.visualInstance.getCollisionWidth(), 
							this._uam.unit.visualInstance.getCollisionHeight())) {
				targetAnimationState = UnitActionManager.AnimationStates.WALKING;
				this._uam.unit.visualInstance.x = midTargetX;
				this._uam.unit.visualInstance.y = midTargetY;
			} else {
				targetAnimationState = UnitActionManager.AnimationStates.IDLE;
				this._complete = true;
				break;
			}
		}
	}
	if (targetAnimationState != this._uam._animationState || 
			targetDirection != this._uam.unit.direction) {
		this._uam.unit.visualInstance.setAnimation(
				this._uam.unit.visualInstance.getAnimNameFromFamily(
						DynamicMapEntity.getActionDirectionFamilyName(
								targetAnimationState, targetDirection)));
		this._uam.unit.direction = targetDirection;
		this._uam._animationState = targetAnimationState;
	}
};


UnitActionManager.MoveWaypointAction.prototype.isDone = function() {
	return this._complete;
};


UnitActionManager.StayIdleAction = function(duration, uam) {
	this._uam = uam;
	this._duration = duration;
};


UnitActionManager.StayIdleAction.prototype.tick = function() {
	if (this._uam._animationState != UnitActionManager.AnimationStates.IDLE) {
		this._uam.unit.visualInstance.setAnimation(
				this._uam.unit.visualInstance.getAnimNameFromFamily(
						DynamicMapEntity.getActionDirectionFamilyName(
								UnitActionManager.AnimationStates.IDLE, 
								this._uam.unit.direction)));
		this._uam._animationState = UnitActionManager.AnimationStates.IDLE;
	}
	this._duration--;
};


UnitActionManager.StayIdleAction.prototype.isDone = function() {
	return this._duration == 0;
};


UnitActionManager.SpawnAction = function(uam) {
	this._uam = uam;
	this._isCompleted = false;
};


UnitActionManager.SpawnAction.prototype.tick = function() {
	if (this._uam.unit.visualInstance.isAtLastFrameOfAnimation()) {
		this._uam.unit.visualInstance.setAnimation(
				this._uam.unit.visualInstance.getAnimNameFromFamily(
						DynamicMapEntity.getActionDirectionFamilyName(
								UnitActionManager.AnimationStates.IDLE, 
								this._uam.unit.direction)));
		this._isCompleted = true;
	}
	if (this._uam._animationState != UnitActionManager.AnimationStates.SPAWNING) {
		this._uam.unit.visualInstance.setAnimation(
				this._uam.unit.visualInstance.getAnimNameFromFamily(
						DynamicMapEntity.getActionDirectionFamilyName(
								UnitActionManager.AnimationStates.SPAWNING, 
								this._uam.unit.direction)));
		this._uam._animationState = UnitActionManager.AnimationStates.SPAWNING;
	}
};


UnitActionManager.SpawnAction.prototype.isDone = function() {
	return this._isCompleted;
};