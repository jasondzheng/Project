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


// Interprets the equipment data and fills in the equipment array with the 
// appropriate items. 
Equipment.load = function(equipmentData) {
	var result = new Equipment();
	for (var slotIndex in equipmentData) {
		result.equipmentArray[parseInt(slotIndex)] = equipmentData[slotIndex]
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


// Method to apply changes in stats based on the equipped equipment. Call when
// save data is applied.
Equipment.prototype.applyIndexStatBoosts = function() {
	for (var i = 0; i < this.equipmentArray; i++) {
		this.applyIndexStatBoost(i);
	}
};


// Equips an item with the given itemId. Expects only equipment itemIds to be 
// passed. If another item is equiped, add it to the inventory.
Equipment.prototype.equip = function(itemId) {
	var item = Item.getItem(itemId);
	// TODO: implement type in equips
	var index = Equipment.SlotIndices[item.equipData.type];
	if (this.equipmentArray[index]) {
		GameState.player.inventory.add(equipmentArray[index]);
	}
	this.equipmentArray[index] = item;
	this.applyIndexStatBoost(index);
};


// Checks a gamestate map property; returns true if in non-combat map, otherwise
// checks if the possible existing equipment can be added to the inventory.
Equipment.prototype.canEquip = function(itemId) {
	var item = Item.getItem(itemId);
	var index = Equipment.SlotIndices[item.equipData.type];
	// TODO: implement map type.
	if (this.equipmentArray[index]) {
		return GameState.player.inventory.canAdd(equipmentArray[index].id);
	} else {
		return true;
	}
};


Equipment.prototype.dequip = function() {};


// Applies the stat boost of the item at the given index.
Equipment.prototype.applyIndexStatBoost = function(index) {
	if (!this.equipmentArray[index]) {
		return;
	}
	var equipData = this.equipmentArray[index].equipData;
	if (equipData.range) {
		
	}
	if (equipData.clarity) {

	}
	if (equipData.power) {

	}
	if (equipData.capacity) {

	}
};

