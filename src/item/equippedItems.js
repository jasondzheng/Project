/**
 * Class used to store what equips the player currently has on. Provides methods
 * for equipping items.
 */

var EquippedItems = function() {
	this.items = [];
};

// TODO: currently used in inventory tab drawer; consider better solution.
EquippedItems.NUM_SLOTS = 4;

EquippedItems.SlotIndices = {
	HEADGEAR: 0,
	SHOES: 1,
	WEAPON: 2,
	BATTERY: 3
};


// Array of default stats with indices that correspond to the slot indices.
// TODO: test to make official.
EquippedItems.defaultStats = {
	beatMaxAlpha: 0,
	beatMaxFactor: 5, 
	beatMaxHeight: 36,
	beatMaxWidth: 48,
	beatWindow: 1.75 / 6,
	attack: 0,
	capacity: 0
};


// Interprets the equipment data and fills in the equipment array with the 
// appropriate items. 
EquippedItems.load = function(equippedItemsData) {
	var result = new EquippedItems();
	if (equippedItemsData) {
		for (var i = 0; i < equippedItemsData.length; i++) {
			result.items.push(equippedItemsData[i] ? 
					Item.getItem(equippedItemsData[i]) : null);
		}
	}
	return result;
};


// Returns an object with indices as keys and item ids as values.
EquippedItems.prototype.write = function() {
	var savedEquippedItems = [];
	for (var i = 0; i < this.items.length; i++) {
		savedEquippedItems[i] = this.items[i] ? 
				this.items[i].id : null;
	}
	return savedEquippedItems;
};


// Equips an item with the given itemId. Expects only equipment itemIds to be 
// passed. If another item is equiped, add it to the inventory.
EquippedItems.prototype.equip = function(item) {
	// TODO: implement type in equips
	var index = EquippedItems.SlotIndices[item.equipData.type];
	var dequippedItem = this.items[index];
	this.items[index] = item;
	if (dequippedItem) {
		GameState.player.inventory.add(this.items[index].id, 1);
	}
	this.applyStatBoosts();
};


// Checks a gamestate map property(TODO/maybe); returns true if in non-combat 
// map, otherwise checks if the possible existing equipment can be added to the 
// inventory.
EquippedItems.prototype.canEquip = function(item) {
	// TODO: check if is valid area to switch battery
	var index = EquippedItems.SlotIndices[item.equipData.type];
	if (this.items[index]) {
		return GameState.player.inventory.canAdd(this.items[index].id, 1) && 
				GameState.map.type == GameMap.Types.SHOP;
	} else {
		return GameState.map.type == GameMap.Types.SHOP;
	}
};


// Removes equipment at the given index, leaving that slot null.
EquippedItems.prototype.dequip = function(index) {
	GameState.player.inventory.add(this.items[index].id, 1);
	this.items[index] = null;
	this.applyStatBoosts()
};


// Checks a gamestate map property(TODO/maybe); returns true if in non-combat 
// map, otherwise checks if the possible existing equipment can be added to the 
// inventory.
EquippedItems.prototype.canDequip = function(index) {
	// TODO: check if is valid area to switch battery
	return GameState.player.inventory.canAdd(this.items[index].id, 1) && 
			GameState.map.type == GameMap.Types.SHOP;
};


// Applies the stat boosts of all equipped items.
EquippedItems.prototype.applyStatBoosts = function() {
	if (this.items[EquippedItems.SlotIndices.BATTERY]) {
		// Set capacity
		this.applyIndexStatBoost(EquippedItems.SlotIndices.BATTERY);
		if (this.items[EquippedItems.SlotIndices.WEAPON]) {
			// Set attack
			this.applyIndexStatBoost(EquippedItems.SlotIndices.WEAPON);
		} else {
			// Set default attack
			this.applyIndexDefaultStat(EquippedItems.SlotIndices.WEAPON);
		}
		if (BeatDrawer.isEnabled = (
				this.items[EquippedItems.SlotIndices.HEADGEAR] &&  
				this.items[EquippedItems.SlotIndices.SHOES])) {
			// Set headgear stats
			this.applyIndexStatBoost(EquippedItems.SlotIndices.HEADGEAR);
			// Set shoe stats
			this.applyIndexStatBoost(EquippedItems.SlotIndices.SHOES);
		} else {
			// Set default headgear/shoes 
			this.applyIndexDefaultStat(EquippedItems.SlotIndices.HEADGEAR);
			this.applyIndexDefaultStat(EquippedItems.SlotIndices.SHOES);
		}
	} else {
		// Disable beat drawer
		BeatDrawer.isEnabled = false;
		// Set all stats to default
		for (var i = 0; i < this.items.length; i++) {
			this.applyIndexDefaultStat(i);
		}
	}
	GameState.player.batteryDrain = this.calculateBatteryDrain();
};


// Applies the stat boost of the item at the given index. Item at that index 
// must be defined! Battery capacity is set to max when a battery is equipped.
EquippedItems.prototype.applyIndexStatBoost = function(index) {
	switch (index) {
		case EquippedItems.SlotIndices.HEADGEAR:
			BeatDrawer.BEAT_MAX_ALPHA = this.items[index].equipData.clarity
			break;
		case EquippedItems.SlotIndices.SHOES:
			var factor = (1 + this.items[index].equipData.range * 
					EquippedItems.defaultStats.beatMaxFactor);
			BeatDrawer.OUTER_RAD_1 = EquippedItems.defaultStats.beatMaxWidth * 
					factor;
			BeatDrawer.OUTER_RAD_2 = EquippedItems.defaultStats.beatMaxHeight *
					factor;
			BeatDrawer.setWindowInterval(EquippedItems.defaultStats.beatWindow *
					factor);
			break;
		case EquippedItems.SlotIndices.WEAPON:
			GameState.player.attack = this.items[index].equipData.attack
			break;
		case EquippedItems.SlotIndices.BATTERY:
			GameState.player.batteryCapacity = 
					GameState.player.batteryLevel = EquippedItems.defaultStats.capacity + 
					this.items[index].equipData.capacity;
			break;
	}
};


// Applies the default stat boost of the item index.
EquippedItems.prototype.applyIndexDefaultStat = function(index) {
	switch (index) {
		case EquippedItems.SlotIndices.HEADGEAR:
			BeatDrawer.BEAT_MAX_ALPHA = EquippedItems.defaultStats.beatMaxAlpha;
			break;
		case EquippedItems.SlotIndices.SHOES:
			BeatDrawer.OUTER_RAD_1 = EquippedItems.defaultStats.beatMaxWidth;
			BeatDrawer.OUTER_RAD_2 = EquippedItems.defaultStats.beatMaxHeight;
			BeatDrawer.setWindowInterval(EquippedItems.defaultStats.beatWindow);
			break;
		case EquippedItems.SlotIndices.WEAPON:
			GameState.player.attack = EquippedItems.defaultStats.attack;
			break;
		case EquippedItems.SlotIndices.BATTERY:
			GameState.player.batteryCapacity = 
					GameState.player.batteryLevel = EquippedItems.defaultStats.capacity;
			break;
	}
};


// Calculates the battery drain (per sec/60). Currently not tested, and should 
// be changed to match gameplay.
EquippedItems.prototype.calculateBatteryDrain = function() {
	// TODO: make legit function
	var headgearDrain = this.items[EquippedItems.SlotIndices.HEADGEAR] ? 
			this.items[EquippedItems.SlotIndices.HEADGEAR].equipData.clarity : 0;
	var shoeDrain = this.items[EquippedItems.SlotIndices.SHOES] ? 
			this.items[EquippedItems.SlotIndices.SHOES].equipData.range : 0; 
	var weaponDrain = this.items[EquippedItems.SlotIndices.WEAPON] ? 
			this.items[EquippedItems.SlotIndices.WEAPON].equipData.attack : 0;
	return (headgearDrain + shoeDrain + weaponDrain) / 60;
}
