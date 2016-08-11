/**
 * Object to store shop data.
 */

var Shop = function(shopContents) {
	this.shopContents = shopContents;
};


// Checks if the player can buy the given quantity of an item. Should only be 
// called on items available in the shop contents.
Shop.prototype.canBuy = function(itemId, quantity) {
	return (GameState.player.money >= Item.getItem(itemId).price * quantity) && 
			(GameState.player.inventory.canAdd(Item.getItem(itemId), quantity));
};


// Carries out a transaction between the shop and player. Should only be called 
// on items available in the shop contents.
Shop.prototype.buy = function(itemId, quantity) {
	GameState.player.inventory.add(Item.getItem(itemId), quantity);
	GameState.player.money -= Item.getItem(itemId).price * quantity;
};
