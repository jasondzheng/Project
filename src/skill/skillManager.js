SkillManager = function() {
	this.unit = unit;
	this._actionQueue = [];
	// TODO: Remove forced idle behavior
	this._animationState;
	this._collisionIgnoreList = [unit];
	this._oldQueueLength = 0;
	this._attackParity = true;
};

SkillManager.canUse = function(skill) {
	if (this._actionQueue.length != 0) {
		return false;
	}
	return skill.canUse();
};

SkillManager.use = function(skill) {
}