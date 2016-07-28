/**
 * A list of helper functions that supplement event gamescripts. Used to keep
 * gamescript code as concise as possible (as testing/reading gamescript code
 * is extremely difficult). Contains condition clauses that event gamescripts 
 * may use. Remember than a legal condition should always return a boolean.
 */

var ConditionHelper = {};


// Checks whether the player's center position is within a zone. Note that this
// is not the same as colliding with the zone's rectangle.
ConditionHelper.playerInRectZone = function(event, x, y, width, height) {
	width += x; height += y;
	var playerVI = event.containingMap.player.visualInstance;
	return playerVI.x >= x && playerVI.x <= width && 
			playerVI.y >= y && playerVI.y <= height;
};