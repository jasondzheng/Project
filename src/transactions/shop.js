/**
 * Object to store shop data.
 */

var Shop = function(shopContents) {
	this.shopContents = shopContents;
};


// Checks if the player can buy the given quantity of an item.
Shop.prototype.canBuyItemAtIndex = function(index, quantity) {
	var item = Item.getItem(this.shopContents[index]);
	return (GameState.player.money >= item.price * quantity) && 
			(GameState.player.inventory.canAdd(this.shopContents[index], quantity));
};


// Carries out a transaction between the shop and player.
Shop.prototype.buyItemAtIndex = function(index, quantity) {
	var item = Item.getItem(this.shopContents[index]);
	GameState.player.inventory.add(item, quantity);
	GameState.player.money -= item.price * quantity;
};
