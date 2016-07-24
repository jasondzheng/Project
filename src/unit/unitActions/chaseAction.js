/** 
 * Represents chasing a player, randomly moving if unable to continue chase.
 * Terminates when either close enough or too far from the player.
 */

// #AFTER src/unit/unitActionManager.js

UnitActionManager.ChaseAction = function(uam, minRadius, maxRadius, speed) {
	this._uam = uam;
	this._minRadius = minRadius;
	this._maxRadius = maxRadius;
	this._speed = speed;
	this._lockedMoveTime = 0;
	this._lockedDirection;
};


UnitActionManager.ChaseAction.LOCKED_MOVEMENT_MAX = 120;
UnitActionManager.ChaseAction.MAX_UNOCCUPIED_ANGLE_TRIES = 10;


UnitActionManager.ChaseAction.prototype.tick = function() {
	if (this._lockedMoveTime != 0) {
		this._helperMoveLocked();
	} else {
		var playerVI = this._uam.unit.containingMap.player.visualInstance;
		var unitVI = this._uam.unit.visualInstance;
		var bestDir = Direction.getDirectionFromCoords(playerVI.x - unitVI.x, 
				playerVI.y - unitVI.y);
		var angle = Direction.getAngle(bestDir);
		var targetX = this._uam.unit.visualInstance.x + Math.cos(angle) * 
				this._speed * UnitActionManager.MIN_MOVE_DISTANCE;
		var targetY = this._uam.unit.visualInstance.y - Math.sin(angle) * 
				this._speed * UnitActionManager.MIN_MOVE_DISTANCE;
		var that = this;
		UnitActionManager._helperIncrementalMove(this._uam.unit, targetX, 
				targetY, angle, this._speed, this._uam._collisionIgnoreList, 
				function() {
			targetAnimationState = UnitActionManager.AnimationStates.WALKING;
		}, function() {
			targetAnimationState = UnitActionManager.AnimationStates.IDLE;
			that._lockedMoveTime = UnitActionManager.ChaseAction.LOCKED_MOVEMENT_MAX;
			that._lockedDirection = that._helperFindUnoccupiedDir(angle);
			return true;
		});
		if (targetAnimationState != this._uam._animationState || 
				bestDir != this._uam.unit.direction) {
			this._uam.unit.visualInstance.setAnimation(
					this._uam.unit.visualInstance.getAnimNameFromFamily(
							DynamicMapEntity.getActionDirectionFamilyName(
									targetAnimationState, bestDir)));
			this._uam.unit.direction = bestDir;
			this._uam._animationState = targetAnimationState;
		}
	}
};


UnitActionManager.ChaseAction.prototype._helperFindUnoccupiedDir = 
		function(currentAngle) {
	var angle;
	var direction;
	var strafeDirs = [(currentAngle - Math.PI / 2) % Math.PI * 2, 
			(currentAngle + Math.PI / 2) % Math.PI * 2];
	var strafeChoice;
	for (var i = 0; i < UnitActionManager.ChaseAction.MAX_UNOCCUPIED_ANGLE_TRIES; 
			i++) {
		if (i == 0) {
			angle = strafeDirs[strafeChoice = Math.random() > .5 ? 1 : 0];
			direction = Direction.lockAngleToDirection(angle);
		} else if (i == 1) {
			angle = strafeDirs[1 - strafeChoice];
			direction = Direction.lockAngleToDirection(angle);
		} else {
			direction = Direction.getRandom();
			angle = Direction.getAngle(direction);
		}
		var unit = this._uam.unit;
		var targetX = unit.visualInstance.x + Math.cos(angle) * 
				UnitActionManager.MIN_MOVE_DISTANCE;
		var targetY = unit.visualInstance.y - Math.sin(angle) * 
				UnitActionManager.MIN_MOVE_DISTANCE;
		if (!unit.containingMap.isColliding(targetX, targetY, 
						unit.visualInstance.getCollisionWidth(), 
						unit.visualInstance.getCollisionHeight(), 
						unit.visualInstance.isRounded(), 
						this._uam._collisionIgnoreList) && 
				!unit.containingMap.isOutOfBounds(targetY, targetY, 
						unit.visualInstance.getCollisionWidth(), 
						unit.visualInstance.getCollisionHeight())) {
			return direction;
		}
	}
	// If after all 10 fail, just return whatever direction
	return direction;
};


UnitActionManager.ChaseAction.prototype._helperMoveLocked = function() {
	var targetAnimationState;
	var angle = Direction.getAngle(this._lockedDirection);
	var targetX = this._uam.unit.visualInstance.x + Math.cos(angle) * 
			this._speed * UnitActionManager.MIN_MOVE_DISTANCE;
	var targetY = this._uam.unit.visualInstance.y - Math.sin(angle) * 
			this._speed * UnitActionManager.MIN_MOVE_DISTANCE;
	UnitActionManager._helperIncrementalMove(this._uam.unit, targetX, 
			targetY, angle, this._speed, this._uam._collisionIgnoreList, 
			function() {
		targetAnimationState = UnitActionManager.AnimationStates.WALKING;
	}, function() {
		targetAnimationState = UnitActionManager.AnimationStates.IDLE;
		return true;
	});
	if (targetAnimationState != this._uam._animationState || 
			this._lockedDirection != this._uam.unit.direction) {
		this._uam.unit.visualInstance.setAnimation(
				this._uam.unit.visualInstance.getAnimNameFromFamily(
						DynamicMapEntity.getActionDirectionFamilyName(
								targetAnimationState, this._lockedDirection)));
		this._uam.unit.direction = this._lockedDirection;
		this._uam._animationState = targetAnimationState;
	}
	this._lockedMoveTime--;
};


UnitActionManager.ChaseAction.prototype.isDone = function() {
	var unitVisualinstance = this._uam.unit.visualInstance;
	var playerVisualInstance = this._uam.unit.containingMap.player.visualInstance;
	var distance = GridCalcs.getDistance(
			unitVisualinstance.x - playerVisualInstance.x, 
			unitVisualinstance.y - playerVisualInstance.y);
	return distance < this._minRadius || distance > this._maxRadius;
};
