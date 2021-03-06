/**
 * An attack action that amkes the unit attack in a specified direction. Applies
 * damage to the player if within bounds.
 */


// #AFTER src/unit/unitActionManager.js

UnitActionManager.BasicAttackAction = function(uam, direction) {
	this._uam = uam;
	this._direction = direction;
	this._attackRadius = uam.unit.unitEntity.attackDistance;
	this._isCompleted = false;
};


UnitActionManager.BasicAttackAction.prototype.onStart = function() {
	// Do damage calcs
	this._uam.unit.direction = this._direction;

	// Checks for application of damage before doing so
	var unitVisualInstance = this._uam.unit.visualInstance;
	var playerVisualInstance = this._uam.unit.containingMap.player.visualInstance;
	// Check if the player is in the same direction and within an attack radius 
	// from the unit attacking.
	if (this._uam.unit.direction == 
					Direction.getDirectionFromCoords(playerVisualInstance.x - 
							unitVisualInstance.x, playerVisualInstance.y - 
							unitVisualInstance.y) &&
			CollisionDetector.areShapesColliding(unitVisualInstance.x, 
					unitVisualInstance.y, 2 * this._attackRadius, 
					2 * this._attackRadius, unitVisualInstance.isRounded, 
					playerVisualInstance.x, playerVisualInstance.y, 
					playerVisualInstance.getCollisionWidth(), 
					playerVisualInstance.getCollisionHeight(), 
					playerVisualInstance.isRounded())) {
	this._uam.unit.containingMap.player.receiveDamage(
			this._uam.unit.unitEntity.atk);
	}

	// Animate attack regardless of damage
	this._uam.unit.visualInstance.setAnimation(
			this._uam.unit.visualInstance.getAnimNameFromFamily(
					DynamicMapEntity.getActionDirectionFamilyName(
							UnitActionManager.AnimationStates.BASIC_ATTACKING, 
							this._direction)));
	this._uam._animationState = 
			UnitActionManager.AnimationStates.BASIC_ATTACKING;
};


UnitActionManager.BasicAttackAction.prototype.tick = function() {
};


UnitActionManager.BasicAttackAction.prototype.isDone = function() {
	// Returns true if the unit state was attacking and the animation is at its 
	// last frame.
	return this._uam._animationState == 
					UnitActionManager.AnimationStates.BASIC_ATTACKING && 
			this._uam.unit.visualInstance.isAtLastFrameOfAnimation();
};
