/**
 * A list of helper functions that supplement event gamescripts. Used to keep
 * gamescript code as concise as possible (as testing/reading gamescript code
 * is extremely difficult). Contains actions that event gamescripts may use.
 */

var GameEventHelper = {};


// Switches maps, loading in the next map and moving the player to the
// designated location.
GameEventHelper.switchMap = function(event, mapId, x, y, opt_callback) {
	var player = event.containingMap.player;
	ScreenEffectDrawer.fadeOut(function() {
		ScreenEffectDrawer.stayBlack();
		// Detach player from the map, then load new map
		player.containingMap = GameState.map = null;
		event.containingMap.player = null;
		GameMapLoader.unload(event.containingMap);
		GameMapLoader.load(mapId, function(newMap) {
			GameState.map = newMap;
			// Reattach player to the given coordinates
			newMap.registerPlayer(player);
			player.visualInstance.x = x;
			player.visualInstance.y = y;
			// TODO: decide whether its appropriate to spawnfill map based on map
			// settings
			newMap.unitSpawner.fillUnitQuotas();
			SoundPlayer.setTrack(newMap.tracks[Object.keys(newMap.tracks)[0]]);
			ScreenEffectDrawer.fadeIn(function() {
				if (opt_callback) {
					opt_callback();
				}
			});
		});
	});
};