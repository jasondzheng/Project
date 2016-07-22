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
	// this._behavior = unit.unitEntity.behaviorPattern; // TODO: get actual behavior
	this._behavior = UnitBehaviors.IdleBehavior;
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
		(this._actionQueue[0] = this._behavior.getNextBehavior(this)).tick();
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


/** 
 * Represents staying idle for a given number of ticks.
 */
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


/** 
 * Represents playing a spawn animation.
 */
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


// TODO: test this code below
/** 
 * Represents chasing a player, randomly moving if unable to continue chase.
 * Terminates when either close enough or too far from the player.
 */
UnitActionManager.ChaseAction = function(uam, minRadius, maxRadius, speed) {
	this._uam = uam;
	this._minRadius = minRadius;
	this._maxRadius = maxRadius;
	this._speed = speed;
	this._lockedMoveTime = 0;
	this._lockedDirection;
};


UnitActionManager.ChaseAction.LOCKED_MOVEMENT_MAX = 180;
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
			that._lockedDirection = this._helperFindUnoccupiedDir(currentAngle);
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
	for (var i = 0; i < UnitActionManager.ChaseAction.MAX_UNOCCUPIED_ANGLE_TRIES; 
			i++) {
		var angle;
		var direction;
		if (i == 0) {
			angle = (currentAngle - Math.PI / 2) % Math.PI * 2;
			direction = Direction.lockAngleToDirection(angle);
		} else if (i == 1) {
			angle = (currentAngle + Math.PI / 2) % Math.PI * 2;
			direction = Direction.lockAngleToDirection(angle);
		} else {
			direction = Direction.getRandom();
			angle = Direction.getAngle(direction);
		}
		var targetX = this._uam.unit.visualInstance.x + Math.cos(angle) * 
				UnitActionManager.MIN_MOVE_DISTANCE;
		var targetY = this._uam.unit.visualInstance.y - Math.sin(angle) * 
				UnitActionManager.MIN_MOVE_DISTANCE;
		if (!unit.containingMap.isColliding(midTargetX, midTargetY, 
						unit.visualInstance.getCollisionWidth(), 
						unit.visualInstance.getCollisionHeight(), 
						unit.visualInstance.isRounded(), 
						collisionIgnoreList) && 
				!unit.containingMap.isOutOfBounds(midTargetX, midTargetY, 
						unit.visualInstance.getCollisionWidth(), 
						unit.visualInstance.getCollisionHeight())) {
			return direction;
		}
	}
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
// TODO: test this code above


UnitActionManager.DamageTakenAction = function(uam) {
	this._uam = uam;
};


UnitActionManager.DamageTakenAction.prototype.tick = function() {
	if (this._uam._animationState != 
			UnitActionManager.AnimationStates.DAMAGE_TAKEN) {
		this._uam.unit.visualInstance.setAnimation(
				this._uam.unit.visualInstance.getAnimNameFromFamily(
						DynamicMapEntity.getActionDirectionFamilyName(
								UnitActionManager.AnimationStates.DAMAGE_TAKEN, 
								this._uam.unit.direction)));
		this._uam._animationState = UnitActionManager.AnimationStates.DAMAGE_TAKEN;
	}
};


UnitActionManager.DamageTakenAction.prototype.isDone = function() {
	return this._uam._animationState == 
					UnitActionManager.AnimationStates.DAMAGE_TAKEN && 
			this._uam.unit.visualInstance.isAtLastFrameOfAnimation();
};


UnitActionManager.DespawnAction = function(uam) {
	this._uam = uam;
	this._isCompleted = false;
};


UnitActionManager.DespawnAction.prototype.tick = function() {
	if (this._uam._animationState == 
			UnitActionManager.AnimationStates.DESPAWNING && 
			this._uam.unit.visualInstance.isAtLastFrameOfAnimation()) {
		// Remove monster from map and update monster counts
		this._uam.unit.containingMap.unitSpawner.notifyOnUnitDeath(this._uam.unit);
		this._uam.unit.containingMap.deregisterUnitInstance(this._uam.unit);
		this._isCompleted = true;
	}
	if (this._uam._animationState != 
			UnitActionManager.AnimationStates.DESPAWNING) {
		this._uam.unit.visualInstance.setAnimation(
				this._uam.unit.visualInstance.getAnimNameFromFamily(
						DynamicMapEntity.getActionDirectionFamilyName(
								UnitActionManager.AnimationStates.DESPAWNING, 
								this._uam.unit.direction)));
		this._uam._animationState = UnitActionManager.AnimationStates.DESPAWNING;
	}
};


UnitActionManager.DespawnAction.prototype.isDone = function() {
	return this._isCompleted;
};


UnitActionManager.BasicAttackAction = function(uam, direction) {
	this._uam = uam;
	this._direction = direction;
	this._attackRadius = 1;
	this._isCompleted = false;
};


UnitActionManager.BasicAttackAction.prototype.onStart = function() {
	// Do damage calcs
	this._uam.unit.direction = this._direction;

	var unitVisualInstance = this._uam.unit.visualInstance;
	var playerVisualInstance = GameState.player.visualInstance;
	if (this._uam.unit.direction == 
					Direction.getDirectionFromCoords(playerVisualInstance.x - 
					unitVisualInstance.x, playerVisualInstance.y - 
							unitVisualInstance.y) &&
			CollisionDetector.areShapesColliding(unitVisualInstance.x, 
					unitVisualInstance.y, 2 * this._attackRadius, 
					2 * this._attackRadius, unitVisualInstance.isRounded, 
					playerVisualInstance.x, playerVisualInstance.y, 
					playerVisualInstance.getCollisionWidth, 
					playerVisualInstance.getCollisionHeight, 
					playerVisualInstance.isRounded)) {
		GameState.player.receiveDamage(this._uam.unit.unitEntity.atk);
	}

	this._uam.unit.visualInstance.setAnimation(
			this._uam.unit.visualInstance.getAnimNameFromFamily(
					DynamicMapEntity.getActionDirectionFamilyName(
							UnitActionManager.AnimationStates.BASIC_ATTACKING, 
							this._direction)));
	this._uam._animationState = 
			UnitActionManager.AnimationStates.BASIC_ATTACKING;
};


UnitActionManager.BasicAttackAction.prototype.tick = function() {
	this._isCompleted = this._uam.unit.visualInstance.isAtLastFrameOfAnimation();
};


UnitActionManager.BasicAttackAction.prototype.isDone = function() {
	return this._isCompleted;
};