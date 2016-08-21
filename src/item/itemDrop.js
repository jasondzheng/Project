/**
 * Class representing dropped items in the overworld. Has behaviors to animate
 * and to move to player if picked up.
 */

// TODO RECONSIDER QUANTITY

var ItemDrop = function(itemId, quantity, x, y) {
	this.itemId = itemId;
	this.quantity = quantity;
	this.visualInstance = new DynamicMapInstance(ItemDrop.ENTITY, x, y);
	this.containingMap;
	this.visualInstance.setAnimation(itemId);
	// Whether or not this item is being attracted to the player
	this._attracted = false;
};

ItemDrop.ENTITY;

ItemDrop.ENTITY_PATH = '../assets/items/itemDropAnimations_compiled.json';

ItemDrop.ATTRACT_RADIUS = 1.5
ItemDrop.PICKUP_RADIUS = 0.5

ItemDrop.ATTRACT_AMOUNT = 0.01


ItemDrop.init = function(callback) {
	JSONLoader.load(ItemDrop.ENTITY_PATH, function(data) {
		DynamicMapEntityLoader.load('itemDropAnims', data, 
				DynamicMapEntityLoader.Types.ITEM_DROP_ANIMS, function(entity) {
			ItemDrop.ENTITY = entity;
			callback();		
		});
	});
};


ItemDrop.prototype.tick = function() {
	// Check for pickup by player
	var player = this.containingMap.player;
	if (player) {
		var xDiff = player.visualInstance.x - this.visualInstance.x;
		var yDiff = player.visualInstance.y - this.visualInstance.y;
		var distance = GridCalcs.getDistance(xDiff, yDiff);
		if (distance < ItemDrop.ATTRACT_RADIUS) {
			if (player.pickupMode && !this._attracted) {
				this._attracted = true;
			}
		}
		if (this._attracted && distance > ItemDrop.PICKUP_RADIUS) {
			this.visualInstance.x += xDiff / distance * ItemDrop.ATTRACT_AMOUNT;
			this.visualInstance.y += yDiff / distance * ItemDrop.ATTRACT_AMOUNT;
		} else if (this._attracted) {
			// Absorb the item if possible
			if (player.inventory.canAdd(this.itemId, this.quantity)) {
				player.inventory.add(this.itemId, this.quantity);
				this.containingMap.deregisterItemDrop(this);
				this.containingMap = null;
				this.visualInstance = null;
				return;
			}
		}
	}
	this.visualInstance.advanceFrame();
};