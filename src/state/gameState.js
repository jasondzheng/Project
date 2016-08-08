/**
 * Static object for tracking the current state of the game, including current
 * player, map, etc.
 */

var GameState = {};

GameState.player = null;

GameState.map = null;

GameState.saveData = null;

// Convenience methods for gamescript access
var GS = GameState;

GameState.setVar = function(name, value) {
	GameState.saveData.setVar(name, value);
};

GameState.getVar = function(name) {
	return GameState.saveData.getVar(name);
};