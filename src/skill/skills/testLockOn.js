var TestLockOn = function(user) {
	this._user = user;
};

TestLockOn.ID = "TestLockOn";
TestLockOn.NAME = "Test Lock On";
TestLockOn.COOLDOWN = 0;
TestLockOn._lockedOnUnit = null;
	
TestLockOn.prototype.passiveEffect = function() {
	var unitsInRange = player.containingMap.findUnitCollisions(
			player.visualInstance.x, player.visualInstance.y, 
			PlayerAttackApplier.DEBUGBasicSkill.SKILL_DIAMETER, 
			PlayerAttackApplier.DEBUGBasicSkill.SKILL_DIAMETER, 
			true /* isRounded */);
	var closestUnit = undefisned;
	var closestUnitDistance = Number.MAX_VALUE;
	var DEBUGClosestUnitIndex = undefined;
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
			DEBUGClosestUnitIndex = i;
		}
	}
	this.lockedOnUnit = closestUnit;
	console.log(DEBUGClosestUnitIndex);
};

TestLockOn.prototype.canUse = function() { 
	return true;
};
	
TestLockOn.prototype.onStart = function() { 
	return;
};

TestLockOn.prototype.tick = function() {
	// Move gradually towards that unit.
	var x = closestUnit.visualInstance.x - player.visualInstance.x;
	var y = closestUnit.visualInstance.y - player.visualInstance.y;
	var distance = GridCalcs.getDistance(x, y);
	this.visualInstance.x += x / distance;
	this.visualInstance.y += y / distance;
};
	
TestLockOn.prototype.isDone = function() {
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


TestLockOn.prototype.onEnd = function() {
	// Do similar to basic attack.
	var collidingUnits = player.containingMap.findUnitCollisions(
			player.visualInstance.x, player.visualInstance.y, 
					PlayerAttackApplier.BasicCloseRangedAttack.ATTACK_DIAMETER, 
					PlayerAttackApplier.BasicCloseRangedAttack.ATTACK_DIAMETER, 
			true /* isRounded */);
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
	
