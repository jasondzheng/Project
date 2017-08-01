var DashAttack = function(target) {
	this._target = target;
};

DashAttack.ID = "dashAttack";
DashAttack.NAME = "Dash Attack";
DashAttack.COOLDOWN = 0;
DashAttack._lockedOnUnit = null;
	
DashAttack.prototype.passiveEffect = function() {
	var unitsInRange = player.containingMap.findUnitCollisions(
			player.visualInstance.x, player.visualInstance.y, 
			PlayerAttackApplier.DEBUGBasicSkill.SKILL_DIAMETER, 
			PlayerAttackApplier.DEBUGBasicSkill.SKILL_DIAMETER, 
			true /* isRounded */);
	var closestUnit = undefisned;
	var closestUnitDistance = Number.MAX_VALUE;
	for (var i = 0; i < unitsInRange.length; i++) {
		var unit = unitsInRange[i];
		var distance = GridCalcs.getDistance(
				unit.visualInstance.x - player.visualInstance.x,
				unit.visualInstance.y - player.visualInstance.y);
		if (distance < closestUnitDistance && Direction.getDirectionFromCoords(
						unit.visualInstance.x - player.visualInstance.x, 
						unit.visualInstance.y - player.visualInstance.y) == 
				player._direction) {
			closestUnitDistance = distance;
			closestUnit = unit;
		}
	}
	this.lockedOnUnit = closestUnit;
};

DashAttack.prototype.condition = function() { 
	// Look for target in direction.
	var canAttack = this.attack != 0 && 
		this._animationState != Player.AnimationStates.DAMAGE_RECEIVING && 
		(this._animationState != Player.AnimationStates.BASIC_ATTACKING || 
				this.visualInstance.isAtLastFrameOfAnimation());
	var hasTarget = this.lockedOnUnit != undefined;
	return canAttack && hasTarget/*TODO cooldowns*/;
};
	
DashAttack.prototype.onStart = function() { 
	// Set beginning animation state.
};

DashAttack.prototype.tick = function() {
	// Move gradually towards that unit.
	var x = closestUnit.visualInstance.x - player.visualInstance.x;
	var y = closestUnit.visualInstance.y - player.visualInstance.y;
	var distance = GridCalcs.getDistance(x, y);
	this.visualInstance.x += x / distance;
	this.visualInstance.y += y / distance;
};
	
DashAttack.prototype.isDone = function() {
	// Until colliding with anything.
	var targetX = closestUnit.visualInstance.x - player.visualInstance.x;
	var targetY = closestUnit.visualInstance.y - player.visualInstance.y;
	return this.containingMap.isColliding(targetX, targetY, 
			this.visualInstance.getCollisionWidth(), 
			this.visualInstance.getCollisionHeight(), 
			this.visualInstance.isRounded(), 
			this._collisionIgnoreList) || 
	this.containingMap.isOutOfBounds(targetX, targetY, 
			this.visualInstance.getCollisionWidth(), 
			this.visualInstance.getCollisionHeight());
};


DashAttack.prototype.onEnd = function() {
	// Do similar to basic attack.
	var collidingUnits = player.containingMap.findUnitCollisions(
			player.visualInstance.x, player.visualInstance.y, 
					PlayerAttackApplier.BasicCloseRangedAttack.ATTACK_DIAMETER, 
					PlayerAttackApplier.BasicCloseRangedAttack.ATTACK_DIAMETER, 
			true /* isRounded */);
	var bonusApplied = false;
	for (var i = 0; i < collidingUnits.length; i++) {
		var unit = collidingUnits[i];
		if (unit.hp > 0 && Direction.getDirectionFromCoords(
						unit.visualInstance.x - player.visualInstance.x, 
						unit.visualInstance.y - player.visualInstance.y) == 
				player._direction) {
			if (!bonusApplied) {
				bonusApplied = true;
				if (BeatDrawer.isInHold()) {
					player.attackCombo += 1;
					console.log(player.attackCombo);
				} else {
					if (BeatDrawer.consumeHitNote()) {
						player.attackCombo += 1;
					} else {
						player.attackCombo = 0;
					}
					console.log(player.attackCombo);	
				} 
			}
			// TODO: integrate multiplier into damage.
			unit.hp -= player.attack;
			unit.actionManager.forceEnqueue(unit.hp == 0 ? 
					new UnitActionManager.DespawnAction(unit.actionManager) : 
					new UnitActionManager.DamageTakenAction(unit.actionManager, 
							player._direction));
		}
	}
};
	
