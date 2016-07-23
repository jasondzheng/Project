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