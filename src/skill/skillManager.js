SkillManager = function(user, skills) {
	this._user = user;
	this._skillsArray = skills;
	this._skillsLookupTable = {};
	for (var  i = 0; i < skills.length; i++) {
		this._skillsLookupTable[skills[i].skilId] = skill[i];
	}
	this._currentSkill = undefined;
};

SkillManager.prototype.canUseSkill = function(skillId) {
	return this.skillsLookupTable[skillId].canUse();
};

SkillManager.prototype.useSkill = function(skillId) {
	this._currentSkill = this.skillsLookupTable[skillId];
	return this.skillsLookupTable[skillId].onStart();
};

SkillManager.prototype.tick = function() {
	for (var  i = 0; i < this._skillsArray.length; i++) {
		this._skillsArray[i].passiveEffect();
	}
	if (this._currentSkill != undefined) {
		if (this._currentSkill.isDone()) {
			this._currentSkill.onEnd();
			this._currentSkill = undefined;
		} else {
			this._currentSkill.tick();
		}
	}
};