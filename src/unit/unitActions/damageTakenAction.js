/**
 * An action that represents a unit taking damage
 */

// #AFTER src/unit/unitActionManager.js

//TODO comment
UnitActionManager.DamageTakenAction = function(uam, opt_direction, opt_speed) {
	this._uam = uam;
	// Optional parrameters for unit knockback;
	this._direction = opt_direction;
	this._speed = UnitActionManager.DamageTakenAction.DEFAULT_SPEED;
};


// Default knockback speed if not specified.
UnitActionManager.DamageTakenAction.DEFAULT_SPEED = 3;


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
	if (this._direction && this._speed) {
		this._helperIncrementalKnockBack();
	}
};


UnitActionManager.DamageTakenAction.prototype.isDone = function() {
	return this._uam._animationState == 
					UnitActionManager.AnimationStates.DAMAGE_TAKEN && 
			this._uam.unit.visualInstance.isAtLastFrameOfAnimation();
};


UnitActionManager.DamageTakenAction.prototype._helperIncrementalKnockBack = 
		function() {
	var unit = this._uam.unit;
	var minimalXDelta = UnitActionManager.MIN_MOVE_DISTANCE * 
			Math.cos(Direction.getAngle(this._direction));
	var minimalYDelta = UnitActionManager.MIN_MOVE_DISTANCE * 
			-Math.sin(Direction.getAngle(this._direction));
	for (var i = 0; i < this._speed; i++) {
		var midTargetX = unit.visualInstance.x + minimalXDelta;
		var midTargetY = unit.visualInstance.y + minimalYDelta;
		if (unit.containingMap.isColliding(midTargetX, midTargetY, 
						unit.visualInstance.getCollisionWidth(), 
						unit.visualInstance.getCollisionHeight(), 
						unit.visualInstance.isRounded(), 
						this._uam._collisionIgnoreList) || 
				unit.containingMap.isOutOfBounds(midTargetX, midTargetY, 
						unit.visualInstance.getCollisionWidth(), 
						unit.visualInstance.getCollisionHeight())) {
			break;
		} else {
			unit.visualInstance.x = midTargetX;
			unit.visualInstance.y = midTargetY;
		}
	}
};
