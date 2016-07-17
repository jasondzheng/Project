/**
 *
 */

var UnitBehaviors = {};

UnitBehaviors.IdleBehavior = {};

UnitBehaviors.IdleBehavior.getNextBehavior = function(uam) {
	return new UnitActionManager.StayIdleAction(60, uam);
};