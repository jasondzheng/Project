/**
 * Utility class containing item effects and how they ought to be applied to
 * the player when used.
 */

var ItemHelper = {};


// Generic entrypoint for using items
ItemHelper.useItem = function(item) {
	if (item.usageProperties.heal && 
			ItemHelper._Heal.canApply(item.usageProperties)) {
		ItemHelper._Heal.applyEffect(item.usageProperties);
	}
};


ItemHelper.canUseItem = function(item) {
	return (
		(item.isUseable && item.usageProperties.heal && 
				ItemHelper._Heal.canApply(item.usageProperties))
	);
};


// Basic healing effect that increases current HP.
ItemHelper._Heal = {
	canApply: function(usageProperties) {
		return GameState.player.hp < GameState.player.maxHp;
	},
	applyEffect: function(usageProperties) {
		GameState.player.increaseCurrentHp(usageProperties.heal);
	},
};