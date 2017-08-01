/**
 * Static loader for all different playable entity data. Each player has 
 * different supported animations, skills, etc.
 */

var PlayerLoader = {};

PlayerLoader.PLAYER_PATH = '../assets/players/';
PlayerLoader.SOUND_DIR = '../assets/sounds/players/';

// Loads a player given its id
PlayerLoader.load = function(id, callback) {
	JSONLoader.load(PlayerLoader.PLAYER_PATH + id + '.json', function(data) {
		DynamicMapEntityLoader.load(id, data.entity, 
				DynamicMapEntityLoader.Types.PLAYER, function(entity) {
			var soundUrls = {};
			for (var i = 0; i < data.sounds.length; i++) {
				var soundName = data.sounds[i];
				soundUrls[soundName] = PlayerLoader.SOUND_DIR + soundName + '.mp3';
			}
			SoundUtils.loadSounds(soundUrls, function(sounds) {
				callback(new Player(id, new DynamicMapInstance(entity, 0, 0), sounds));
			});	
		});
	});
};


// Unloads a Player, including all loaded entities and references to images.
PlayerLoader.unload = function(player) {
	DynamicMapEntityLoader.unloadFromInstance(player.visualInstance);
	player.visualInstance = null;
};