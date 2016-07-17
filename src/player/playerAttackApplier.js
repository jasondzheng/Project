var PlayerAttackApplier = {};


/**
 * Basic close ranged attack: hits all targets within a certain radius of
 * the player and within the octant that they are currently facing. There is
 * no knock-back as of now, and inflicts 1 true damage. No weapon is needed
 * as of now.
 */
PlayerAttackApplier.BasicCloseRangedAttack = {
	ATTACK_RADIUS: 2,
	apply: function(player) {
		var collidingUnits = player.containingMap.findUnitCollisions(
				player.visualInstance.x, player.visualInstance.y, 
				PlayerAttackApplier.BasicCloseRangedAttack.ATTACK_RADIUS, 
				PlayerAttackApplier.BasicCloseRangedAttack.ATTACK_RADIUS, 
				true /* isRounded */);
		for (var i = 0; i < collidingUnits.length; i++) {
			var unit = collidingUnits[i];
			if (unit.hp > 0 && Direction.getDirectionFromCoords(
							unit.visualInstance.x - player.visualInstance.x, 
							unit.visualInstance.y - player.visualInstance.y) == 
					player._direction) {
				unit.hp -= 1;
				unit.actionManager.forceEnqueue(unit.hp == 0 ? 
						new UnitActionManager.DespawnAction(unit.actionManager) : 
						new UnitActionManager.DamageTakenAction(unit.actionManager));
			}
		}
	}
};
