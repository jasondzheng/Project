var PlayerAttackApplier = {};


/**
 * Basic close ranged attack: hits all targets within a certain diameter of
 * the player and within the octant that they are currently facing. There is
 * no knock-back as of now, and inflicts 1 true damage. No weapon is needed
 * as of now.
 */
PlayerAttackApplier.BasicCloseRangedAttack = {
	ATTACK_DISTANCE: 1,
	ATTACK_DIAMETER: 2,
	applyAttack: function(player) {
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
	}
};


/**
 * Basic dash atttack to closest enemy.
 */
PlayerAttackApplier.DEBUGBasicSkill = {
	SKILL_RANGE: 5,
	SKILL_DIAMETER: 10,
	ATTACK_DISTANCE: 1,
	ATTACK_DIAMETER: 2,
	applyAttack: function(player) {
		var unitsInRange = player.containingMap.findUnitCollisions(
				player.visualInstance.x, player.visualInstance.y, 
				PlayerAttackApplier.DEBUGBasicSkill.SKILL_DIAMETER, 
				PlayerAttackApplier.DEBUGBasicSkill.SKILL_DIAMETER, 
				true /* isRounded */);
		var closestUnit = undefined;
		var closestUnitDistance = Number.MAX_VALUE;
		for (var i = 0; i < unitsInRange.length; i++) {
			var distance = GridCalcs.getDistance(
					unitsInRange[i].visualInstance.x - player.visualInstance.x,
					unitsInRange[i].visualInstance.y - player.visualInstance.y);
			if (distance < closestUnitDistance) {
				closestUnitDistance = distance;
				closestUnit = unitsInRange[i];
			}
		}
		if (closestUnit != undefined) {
			var x = closestUnit.visualInstance.x - player.visualInstance.x;
			var y = closestUnit.visualInstance.y - player.visualInstance.y;
			var angle = Math.abs(Math.atan(y / x));
			var radius = (PlayerAttackApplier.DEBUGBasicSkill.ATTACK_DIAMETER - player.visualInstance.getCollisionWidth()) / 2 - 0.05;
			var incrementDistanceX = 
					(x < 0 ? -1 : 1) * 
					radius * 
					Math.cos(angle);
			var incrementDistanceY = 
					(y < 0 ? -1 : 1) *
					radius * 
					Math.sin(angle);
			var numIncrements = Math.ceil(closestUnitDistance / 
					radius)
			for (var i = 0; i < numIncrements; i++) {
				player.tryMove(incrementDistanceX, incrementDistanceY)
			}
		}
		var collidingUnits = player.containingMap.findUnitCollisions(
				player.visualInstance.x, player.visualInstance.y, 
				PlayerAttackApplier.DEBUGBasicSkill.ATTACK_DIAMETER, 
				PlayerAttackApplier.DEBUGBasicSkill.ATTACK_DIAMETER, 
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
	}
}