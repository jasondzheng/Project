// #AFTER src/unit/unitActionManager.js

//TODO comment
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
