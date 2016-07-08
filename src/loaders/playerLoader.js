/**
 * Static loader for all different playable entity data. Each player has 
 * different supported animations, skills, etc.
 */

var PlayerLoader = {};

PlayerLoader.PLAYER_PATH = '../assets/players/'

PlayerLoader.load = function(id, callback) {
	JSONLoader.load(PlayerLoader.PLAYER_PATH + id + '.json', function(data) {
		DynamicMapEntityLoader.load(id, obj.entity, function(entity) {
			opt_callback(new Player(id, entity));
		});
	});
};