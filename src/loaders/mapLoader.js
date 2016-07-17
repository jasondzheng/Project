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
	deferrer.add(MapLoader._helperLoadAllNPCInstances, function(accumulatedArgs) {
		return [accumulatedArgs[0].mapData];
	}, ['npcInstances']);
	deferrer.add(UnitLoader.preloadEntities, function(accumulatedArgs) {
		return [Object.keys(accumulatedArgs[0].mapData.spawnBehavior.monsterData)];
	}, []);
	deferrer.add(MapLoader._helperLoadAllTracks, function(accumulatedArgs) {
		return [accumulatedArgs[0].mapData];
	}, ['tracks']);
	deferrer.after(function(accumulatedArgs) {
		var mapData = accumulatedArgs[0].mapData;
		var tileset = accumulatedArgs[1].tileset;
		var staticMapEntities = accumulatedArgs[2].staticMapEntities;
		var npcInstances = accumulatedArgs[3].npcInstances;
		var tracks = accumulatedArgs[5].tracks;
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
					mapData.staticMapInstances, npcInstances, tracks, 
					mapData.spawnBehavior));
		};
	});
};


// Function to unload map.
MapLoader.unload = function(map) {
	TileLoader.unload(map.tileset);
	for (var i = 0; i < map.staticMapEntities.length; i++) {
		StaticMapEntityLoader.unload(map.staticMapEntities[i]);
	}
	// TODO: fill in all that debt and properly unload everything, including
	// npcs, unit entities, etc
};


// Helper to load NPC instances
MapLoader._helperLoadAllNPCInstances = function(mapData, callback) {
	if (mapData.npcs.length == 0) {
		callback([]);
		return;
	}
	var instanceQueue = [];
	for (var i = 0; i < mapData.npcs.length; i++) {
		instanceQueue.push(mapData.npcs[i]);
	}
	var resultingInstances = [];
	var aggregateCallback = function(instance) {
		resultingInstances.push(instance);
		if (instanceQueue.length > 0) {
			var nextInstanceData = instanceQueue.shift();
			NPCLoader.loadInstance(nextInstanceData.id, nextInstanceData.x, 
					nextInstanceData.y, nextInstanceData.startingDirection, 
					null /* containingMap */, aggregateCallback);
		} else {
			callback(resultingInstances);
		}
	};
	var nextInstanceData = instanceQueue.shift();
	NPCLoader.loadInstance(nextInstanceData.id, nextInstanceData.x, 
			nextInstanceData.y, nextInstanceData.startingDirection, 
			null /* containingMap */, aggregateCallback);
};


// Helper to load all tracks
MapLoader._helperLoadAllTracks = function(mapData, callback) {
	var tracksToLoad = {};
	for (var i = 0; i < mapData.tracks.length; i++) {
		tracksToLoad[mapData.tracks[i]] = mapData.tracks[i];
	}
	SoundLoader.loadBeatmaps(tracksToLoad, callback);
};