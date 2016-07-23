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