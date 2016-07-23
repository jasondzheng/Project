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
		var that = this;
		UnitActionManager._helperIncrementalMove(this._uam.unit, this._targetX, 
				this._targetY, angle, this._speed, this._uam._collisionIgnoreList, 
				function() {
			targetAnimationState = UnitActionManager.AnimationStates.WALKING;
		}, function() {
			targetAnimationState = UnitActionManager.AnimationStates.IDLE;
			that._complete = true;
			return true;
		});
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
