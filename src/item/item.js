/**
 * Dynamic class for Item. Each item has a name, id, description, useability, 
 * and sprite. Functions for consumebales are  included for each item as well.
 */

var Item = function(id, name, sprite, description, isUseable, consumeCount, 
		usageProperties, price, isKeyItem, equipData){
	this.id = id;
	this.name = name;
	this.sprite = sprite;
	this.description = description;
	this.isUseable = isUseable;
	this.consumeCount = consumeCount;
	this.usageProperties = usageProperties;
	this.price = price;
	this.isKeyItem = isKeyItem;
	this.equipData = equipData;
};


Item.SPRITE_PATH = '../assets/img/items/';
Item.CATALOG_PATH = '../assets/items/itemCatalogCompiled.json';
// A catalog of items by their IDs.
Item._catalog;

// Loader that loads all items into the item catalog. Needs to be called at the
// beginning of the game so items are preloaded and can be looked up.
Item.loadItems = function(callback) {
	Item._catalog = {};
	JSONLoader.load(Item.CATALOG_PATH, function(data) {
		var images = {};
		var imagesToLoad = Object.keys(data).length;
		for (var itemId in data) {
			if (!data.hasOwnProperty(itemId)) {
				continue;
			}
			(function(itemId) {
				ImgUtils.loadImage(Item.SPRITE_PATH + itemId + '.png', function(img) {
					images[itemId] = img;
					if (--imagesToLoad == 0) {
						for (var id in data) {
							var props = data[id];
							Item._catalog[id] = new Item(id, props.name, images[id], 
									props.description, props.isUseable, props.consumeCount || 0, 
									props.usageProperties || null, props.price, props.isKeyItem, 
									props.equipData || null);
						}
						callback();
					}
				});
			})(itemId);
		}
	});
};


// Gets an item's data from its ID.
Item.getItem = function(id) {
	return Item._catalog[id];
};


// Evaluates a function included in the item .json
// Cleanup will be done by the caller based on isConsumed
Item.prototype.use = function() {
};

