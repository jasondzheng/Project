/**
 * Object to store shop data.
 */

var Shop = function(shopContents) {
	this.shopContents = shopContents;
};


Shop.SELL_FRACTION = 0.5;


// Checks if a player can sell an item; currently only based on if it is a key 
// item.
Shop.canSellItemAtIndex = function(index, isFromEquip) {
	var entries = (isFromEquip) ? GameState.player.inventory.equipEntries : 
			GameState.player.inventory.itemEntries;
	return !(entries[index].item.isKeyItem);
};


// Sells an item in the player inventory to the shop. Items are currently sold 
// back at a constant fraction of price (0.5).
Shop.sellItemAtIndex = function(index, quantity, isFromEquip) {
	var entries = (isFromEquip) ? GameState.player.inventory.equipEntries : 
			GameState.player.inventory.itemEntries;
	var item = entries[index].item;
	GameState.player.inventory.remove(index, quantity, isFromEquip)
	// Consider making MSRP fraction dpecific to the shop.
	GameState.player.money += Math.floor(item.price  * Shop.SELL_FRACTION) * 
			quantity;
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
	GameState.player.inventory.add(this.shopContents[index], quantity);
	GameState.player.money -= item.price * quantity;
};


