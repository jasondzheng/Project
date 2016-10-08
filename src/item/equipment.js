/**
 * Class used to store what equips the player currently has on. Provides methods
 * for equipping items.
 */

var Equipment = function() {
	this.equipmentArray = [];
	for (var slotKey in Equipment.SlotIndices) {
		if (!Equipment.SlotIndices.hasOwnProperty(slotKey)) {
			continue;
		}
		this.equipmentArray.push(null);
	}
};


Equipment.SlotIndices = {
	HEADGEAR: 0,
	SHOES: 1,
	WEAPON: 2,
	BATTERY: 3
};


// Array of default stats with indices that correspond to the slot indices.
// TODO: test to make official.
Equipment.defaultStats = {
	beatMaxAlpha: 0,
	beatMaxFactor: 5, 
	beatMaxHeight: 31,
	beatMaxWidth: 48,
	beatWindow: 1.75 / 6,
	attack: 0,
	capacity: 100
};


// Interprets the equipment data and fills in the equipment array with the 
// appropriate items. 
Equipment.load = function(equipmentData) {
	var result = new Equipment();
	for (var slotIndex in equipmentData) {
		result.equipmentArray[parseInt(slotIndex)] = 
				Item.getItem(equipmentData[slotIndex]);
	}
	return result;
};


// Returns an object with indices as keys and item ids as values.
Equipment.prototype.write = function() {
	var savedEquipment = {};
	for (var i = 0; i < this.equipmentArray.length; i++) {
		if (this.equipmentArray[i] == null) {
			continue;
		}
		savedEquipment[i + ""] = this.equipmentArray[i].id;
	}
	return savedEquipment;
};


// Equips an item with the given itemId. Expects only equipment itemIds to be 
// passed. If another item is equiped, add it to the inventory.
Equipment.prototype.equip = function(itemId) {
	var item = Item.getItem(itemId);
	// TODO: implement type in equips
	var index = Equipment.SlotIndices[item.equipData.type];
	if (this.equipmentArray[index]) {
		GameState.player.inventory.add(this.equipmentArray[index].id, 1);
	}
	this.equipmentArray[index] = item;
	this.applyStatBoosts();
};


// Checks a gamestate map property(TODO/maybe); returns true if in non-combat 
// map, otherwise checks if the possible existing equipment can be added to the 
// inventory.
Equipment.prototype.canEquip = function(itemId) {
	var item = Item.getItem(itemId);
	var index = Equipment.SlotIndices[item.equipData.type];
	if (this.equipmentArray[index]) {
		return GameState.player.inventory.canAdd(equipmentArray[index].id, 1);
	} else {
		return true;
	}
};


// Removes equipment at the given index, leaving that slot null.
Equipment.prototype.dequip = function(index) {
	GameState.player.inventory.add(this.equipmentArray[index].id, 1);
	this.equipmentArray[index] = null;
	this.applyStatBoosts()
};


// Checks a gamestate map property(TODO/maybe); returns true if in non-combat 
// map, otherwise checks if the possible existing equipment can be added to the 
// inventory.
Equipment.prototype.canDequip = function(index) {
	return GameState.player.inventory.canAdd(equipmentArray[index].id, 1)
};


// Applies the stat boosts of all equipped items.
Equipment.prototype.applyStatBoosts = function() {
	if (this.equipmentArray[Equipment.SlotIndices.BATTERY]) {
		// Set capacity
		this.applyIndexStatBoost(Equipment.SlotIndices.BATTERY);
		if (this.equipmentArray[Equipment.SlotIndices.WEAPON]) {
			// Set attack
			this.applyIndexStatBoost(Equipment.SlotIndices.WEAPON);
		} else {
			// Set default attack
			this.applyIndexDefaultStat(Equipment.SlotIndices.WEAPON);
		}
		if (BeatDrawer.isEnabled = (
				this.equipmentArray[Equipment.SlotIndices.HEADGEAR] &&  
				this.equipmentArray[Equipment.SlotIndices.SHOES])) {
			// Set headgear stats
			this.applyIndexStatBoost(Equipment.SlotIndices.HEADGEAR);
			// Set shoe stats
			this.applyIndexStatBoost(Equipment.SlotIndices.SHOES);
		} else {
			// Set default headgear/shoes 
			this.applyIndexDefaultStat(Equipment.SlotIndices.HEADGEAR);
			this.applyIndexDefaultStat(Equipment.SlotIndices.SHOES);
		}
	} else {
		// Disable beat drawer
		BeatDrawer.isEnabled = false;
		// Set all stats to default
		for (var i = 0; i < this.equipmentArray.length; i++) {
			this.applyIndexDefaultStat(i);
		}
	}
};


// Applies the stat boost of the item at the given index. Item at that index 
// must be defined!
Equipment.prototype.applyIndexStatBoost = function(index) {
	switch (index) {
		case Equipment.SlotIndices.HEADGEAR:
			BeatDrawer.BEAT_MAX_ALPHA = this.equipmentArray[index].equipData.clarity
			break;
		case Equipment.SlotIndices.SHOES:
			var factor = (1 + this.equipmentArray[index].equipData.range * 
					Equipment.defaultStats.beatMaxFactor);
			BeatDrawer.OUTER_RAD_1 = Equipment.defaultStats.beatMaxWidth * 
					factor;
			BeatDrawer.OUTER_RAD_2 = Equipment.defaultStats.beatMaxHeight *
					factor;
			BeatDrawer.setWindowInterval(Equipment.defaultStats.beatWindow *
					factor);
			break;
		case Equipment.SlotIndices.WEAPON:
			GameState.player.attack = this.equipmentArray[index].equipData.attack
			break;
		case Equipment.SlotIndices.BATTERY:
			GameState.player.battery = Equipment.defaultStats.capacity + 
					this.equipmentArray[index].equipData.capacity
			break;
	}
};


// Applies the default stat boost of the item index.
Equipment.prototype.applyIndexDefaultStat = function(index) {
	switch (index) {
		case Equipment.SlotIndices.HEADGEAR:
			BeatDrawer.BEAT_MAX_ALPHA = Equipment.defaultStats.beatMaxAlpha;
			break;
		case Equipment.SlotIndices.SHOES:
			BeatDrawer.OUTER_RAD_1 = Equipment.defaultStats.beatMaxWidth;
			BeatDrawer.OUTER_RAD_2 = Equipment.defaultStats.beatMaxHeight;
			BeatDrawer.setWindowInterval(Equipment.defaultStats.beatWindow);
			break;
		case Equipment.SlotIndices.WEAPON:
			GameState.player.attack = Equipment.defaultStats.attack;
			break;
		case Equipment.SlotIndices.BATTERY:
			GameState.player.batteryCapacity = Equipment.defaultStats.capacity;
			GameState.player.batteryLevel = Math.min(GameState.player.batteryLevel, 
					GameState.player.batteryCapacity);
			break;
	}
};
