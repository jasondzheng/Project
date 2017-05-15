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
	} else if (item.usageProperties.charge && 
			ItemHelper._Charge.canApply(item.usageProperties)) {
		ItemHelper._Charge.applyEffect(item.usageProperties);
	}
};


ItemHelper.canUseItem = function(item) {
	if (item.isUseable) {
		if (item.usageProperties.heal) {
			return ItemHelper._Heal.canApply(item.usageProperties);
		} else if (item.usageProperties.charge) {
			return ItemHelper._Charge.canApply(item.usageProperties);
		}
	}
	return false;
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


// Basic charging effect that increases current battery level.
ItemHelper._Charge = {
	canApply: function(usageProperties) {
		return GameState.player.batteryLevel < GameState.player.batteryCapacity;
	},
	applyEffect: function(usageProperties) {
		GameState.player.increaseBatteryLevel(usageProperties.charge);
	},
};