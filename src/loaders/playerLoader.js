/**
 * Static loader for all different playable entity data. Each player has 
 * different supported animations, skills, etc.
 */

var PlayerLoader = {};

PlayerLoader.PLAYER_PATH = '../assets/players/'

PlayerLoader.load = function(id, callback) {
	JSONLoader.load(PlayerLoader.PLAYER_PATH + id + '.json', function(data) {
		DynamicMapEntityLoader.load(id, data.entity, 
				DynamicMapEntityLoader.Types.PLAYER, function(entity) {
			callback(new Player(id, new DynamicMapInstance(entity, 0, 0)));
		});
	});
};


// Unloads a Player, including all loaded entities and references to images.
PlayerLoader.unload = function(player) {
	DynamicMapEntityLoader.unloadFromInstance(player.visualInstance);
	player.visualInstance = null;
};