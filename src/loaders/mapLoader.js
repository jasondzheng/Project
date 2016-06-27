/**
 * Utility for loading maps.
 */


var MapLoader = {};

// Expected map directory
MapLoader.DIR = '../assets/maps/';

// Expected tileset directory
MapLoader.TILESET_DIR = '../assets/img/tilesets/';


// Static function to load a map.
MapLoader.load = function(mapName, opt_callback) {
	var deferrer = new CallbackDeferrer();
	deferrer.add(JSONLoader.load, function(accumulatedArgs) {
		return [MapLoader.DIR + mapName + '.json'];
	}, ['mapData']);
	deferrer.add(TileLoader.load, function(accumulatedArgs) {
		return [MapLoader.TILESET_DIR + accumulatedArgs[0].mapData.tileset];
	}, ['tileset']);
	deferrer.add(StaticMapEntityLoader.loadAll, function(accumulatedArgs) {
		return [accumulatedArgs[0].mapData.staticMapEntities, mapName];
	}, ['staticMapEntities']);
	deferrer.after(function(accumulatedArgs) {
		var mapData = accumulatedArgs[0].mapData;
		var tileset = accumulatedArgs[1].tileset;
		var staticMapEntities = accumulatedArgs[2].staticMapEntities;
		mapData.staticMapEntities = staticMapEntities;
		for (var i = 0; i < mapData.staticMapInstances.length; i++) {
			// Convert to StaticMapInstance
			mapData.staticMapInstances[i] = new StaticMapInstance(
					mapData.staticMapEntities[mapData.staticMapInstances[i].entity], 
					mapData.staticMapInstances[i].x, mapData.staticMapInstances[i].y);
		}
		if (opt_callback) {
			opt_callback(new Map(mapData.name, mapData.data, mapData.width, 
					tileset, mapData.dummyTile, mapData.staticMapEntities, 
					mapData.staticMapInstances));
		};
	});
};


// Function to unload map.
MapLoader.unload = function(map) {
	TileLoader.unload(map.tileset);
	for (var i = 0; i < map.staticMapEntities.length; i++) {
		StaticMapEntityLoader.unload(map.staticMapEntities[i]);
	}
};