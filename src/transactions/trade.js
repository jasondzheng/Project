/**
 * Object to store trade information from npc jsons.
 */

var Trade = function(id, ingredients, results, gameVarEnableFlag) {
	this.id = id;
	this.ingredients = ingredients;
	this.results = results;
	this.gameVarEnableFlag = gameVarEnableFlag;
};


// Checks if the current player can trade. A player can only trade if they have
// the ingredients at hand and will have enough room to store the resulting
// items after giving up the trade ingredients.
Trade.prototype.canTrade = function() {
	var numNewlyOpenedSlots = 0;
	var playerInventory = GameState.player.inventory;
	for (var i = 0; i < this.ingredients.length; i++) {
		var ingredient = this.ingredients[i];
		var playerInvCount = playerInventory.getCount(ingredient.itemId);
		if (playerInvCount < ingredient.quantity) {
			return false;
		} else if (playerInvCount == ingredient.quantity) {
			numNewlyOpenedSlots++;
		}
	}
	for (var i = 0; i < this.results.length; i++) {
		var result = this.results[i];
		if (!playerInventory.canAdd(result.itemId, result.quantity) &&
				playerInventory.getCount(result.itemId) == 0 &&
				numNewlyOpenedSlots-- == 0) {
			return false;
		}
	}
	return true;
};


// Applies a trade and swaps out items with resulting trade items.
Trade.prototype.applyTrade = function() {
	var playerInventory = GameState.player.inventory;
	for (var i = 0; i < this.ingredients.length; i++) {
		var ingredient = this.ingredients[i];
		var ingredientItem = Item.getItem(ingredient.itemId);
		playerInventory.remove(playerInventory.findSlotIndex(ingredient.itemId, 
						!!ingredientItem.equipData), ingredient.quantity, 
				!!ingredientItem.equipData);
	}
	for (var i = 0; i < this.results.length; i++) {
		var result = this.results[i];
		playerInventory.add(result.itemId, result.quantity);
	}
};