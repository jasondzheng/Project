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