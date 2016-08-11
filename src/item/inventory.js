/** 
 * Class to manage player inventory. Includes both an array and object of all 
 * items included the inventory. Provides methods for using and tossing items.
 */

var Inventory = function() {
	this.itemEntries = [];
	this.itemEntries.length = Inventory.NUM_ITEM_SLOTS;
	this.equipEntries = [];
	this.equipEntries.length = Inventory.NUM_EQUIP_SLOTS;
};


// Number of maximum item slots available 
Inventory.NUM_ITEM_SLOTS = 48;
// Number of maximum equip item slots available
Inventory.NUM_EQUIP_SLOTS = 48;
// Number of max stack amount of normal items
Inventory.MAX_ITEM_COUNT = 999;


// Loads an inventory from a save data's JSON
Inventory.load = function(inventoryData) {
	var result = new Inventory();
	if (inventoryData) {
		for (var key in inventoryData.itemEntries) {
			result.itemEntries[parseInt(key)] = {
				item: Item.getItem(inventoryData.itemEntries[key].id),
				quantity: inventoryData.itemEntries[key].quantity
			}
		}
		for (var key in inventoryData.equipEntries) {
			result.equipEntries[parseInt(key)] = {
				item: Item.getItem(inventoryData.equipEntries[key].id),
				quantity: inventoryData.equipEntries[key].quantity
			}
		}
	}
	return result;
};


// Writes an inventory into a JSON object
Inventory.prototype.write = function() {
	var savedItemEntries = {}, savedEquipEntries = {};
	for (var i = 0; i < this.itemEntries.length; i++) {
		if (this.itemEntries[i] == null) {
			continue;
		}
		savedItemEntries[i + ''] = {
			id: this.itemEntries[i].item.id,
			quantity: this.itemEntries[i].quantity
		};
	}
	for (var i = 0; i < this.equipEntries.length; i++) {
		if (this.equipEntries[i] == null) {
			continue;
		}
		savedEquipEntries[i + ''] = {
			id: this.equipEntries[i].item.id,
			quantity: this.equipEntries[i].quantity
		};
	}
	return {
		itemEntries: savedItemEntries,
		equipEntries: savedEquipEntries
	};
};


// Function to add an item to the inventory
Inventory.prototype.add = function(itemId, quantity) {
	var item = Item.getItem(itemId);
	if (item.equipData) {
		for (var i = 0; i < quantity; i++) {
			// Equips are 1 per slot
			for (var freeIndex = 0; freeIndex < this.equipEntries.length && 
					this.equipEntries[freeIndex] != null; freeIndex++);
			if (freeIndex != this.equipEntries.length) {
				this.equipEntries[freeIndex] = {
					item: item,
					quantity: 1
					// TODO: add fields as needed
				};
			} else {
				throw 'Tried to add an equip when no available slots were found';
			}
		}
	} else {
		// For any non-equips, merge if possible; error out if quantity exceeds
		var freeIndex = -1, mergeIndex = -1;
		for (var i = 0; i < this.itemEntries.length && mergeIndex == -1; i++) {
			if (this.itemEntries[i] == null && freeIndex == -1) {
				freeIndex = i;
			} else if (this.itemEntries[i] != null && 
					this.itemEntries[i].item == item) {
				mergeIndex = i;
			}
		}
		if (mergeIndex != -1) {
			if (this.itemEntries[mergeIndex].quantity + quantity > 
					Inventory.MAX_ITEM_COUNT) {
				throw 'Tried to add too many of an item';
			}
			this.itemEntries[mergeIndex].quantity += quantity;
		} else if (quantity <= Inventory.MAX_ITEM_COUNT && freeIndex != -1) {
			this.itemEntries[freeIndex] = {
				item: item,
				quantity: quantity
			};
		} else {
			throw 'Tried to add too many of an item';
		}
	}
};


// Checks if the quantity of an item with itemID can be added to the inventory
Inventory.prototype.canAdd = function(itemId, quantity) {
	var item = Item.getItem(itemId);
	if (item.equipData) {
		for (var i = 0; i < this.equipEntries.length; i++) {
			if (this.equipEntries[i] == null && --quantity == 0) {
				return true;
			}
		}
		return false;
	} else {
		var hasEmptySlot = false;
		for (var i = 0; i < this.itemEntries.length; i++) {
			if (this.itemEntries[i] != null && this.itemEntries[i].item == item) {
				return this.itemEntries[i].quantity + quantity <= 
						Inventory.MAX_ITEM_COUNT;
			}
			if (this.itemEntries[i] == null) {
				var hasEmptySlot = true;
			}
		}
		return hasEmptySlot && (quantity <= Inventory.MAX_ITEM_COUNT);
	}
};


// Either destroys an item instance or decrememnts a counts value by 'number' of 
// the provided item instance.
Inventory.prototype.remove = function(slotNumber, quantity, isFromEquip) {
	var entry = (isFromEquip ? this.equipEntries : this.itemEntries)[slotNumber];
	if (entry == null) {
		throw 'Remove incorrectly referencing null slot';
	}
	if (entry.quantity > quantity) {
		entry.quantity -= quantity;
	} else if (entry.quantity == quantity) {
		(isFromEquip ? this.equipEntries : this.itemEntries)[slotNumber] = null;
	} else {
		throw 'Tried to remove inexistent items';
	}
};


// Finds the slot number for a given item, or -1 if not found.
Inventory.prototype.findSlotIndex = function(itemId, isFromEquip) {
	var entries = isFromEquip ? this.equipEntries : this.itemEntries;
	for (var i = 0; i < entries.length; i++) {
		var entry = entries[i];
		if (entry != null && entry.item.id == itemId) {
			return i;
		}
	}
	return -1;
};


// Gets the quantity of a given item in the inventory by its id.
Inventory.prototype.getCount = function(itemId) {
	for (var i = 0; i < this.itemEntries.length; i++) {
		var entry = this.itemEntries[i];
		if (entry != null && entry.item.id == itemId) {
			return entry.quantity;
		}
	}
	for (var i = 0; i < this.equipEntries.length; i++) {
		var entry = this.equipEntries[i];
		if (entry != null && entry.item.id == itemId) {
			return entry.quantity;
		}
	}
	return 0;
};