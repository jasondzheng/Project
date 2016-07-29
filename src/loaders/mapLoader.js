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
	deferrer.add(JSONLoader.loadWithoutWhitespace, function(accumulatedArgs) {
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
	deferrer.add(MapLoader._helperLoadAllEvents, function(accumulatedArgs) {
		return [accumulatedArgs[0].mapData];
	}, ['events']);
	deferrer.after(function(accumulatedArgs) {
		var mapData = accumulatedArgs[0].mapData;
		var tileset = accumulatedArgs[1].tileset;
		var staticMapEntities = accumulatedArgs[2].staticMapEntities;
		var npcInstances = accumulatedArgs[3].npcInstances;
		var tracks = accumulatedArgs[5].tracks;
		var events = accumulatedArgs[6].events;
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
					mapData.staticMapInstances, npcInstances, 
					events, tracks, mapData.spawnBehavior));
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

	// Empty out map constituent arrays
	map.npcInstances = {};
	map.unitInstances.length = 0;
	map.unitSpawner = null;
	map.player = null;
};


// Helper to load NPC instances
MapLoader._helperLoadAllNPCInstances = function(mapData, callback) {
	var resultingInstances = {};
	if (mapData.npcs.length == 0) {
		callback(resultingInstances);
		return;
	}
	var instancesToLoad = mapData.npcs.length;
	for (var i = 0; i < mapData.npcs.length; i++) {
		var nextInstanceData = mapData.npcs[i];
		NPCLoader.loadInstance(nextInstanceData.entityId, nextInstanceData.id, 
				nextInstanceData.x, nextInstanceData.y, 
				nextInstanceData.startingDirection, null /* containingMap */, 
				function(instance) {
			resultingInstances[instance.id] = instance;		
			if (--instancesToLoad == 0) {
				callback(resultingInstances);
			}
		});	
	}
};


// Helper to load all tracks
MapLoader._helperLoadAllTracks = function(mapData, callback) {
	var tracksToLoad = {};
	for (var i = 0; i < mapData.tracks.length; i++) {
		tracksToLoad[mapData.tracks[i]] = mapData.tracks[i];
	}
	SoundLoader.loadBeatmaps(tracksToLoad, callback);
};


// Helper to load all events
MapLoader._helperLoadAllEvents = function(mapData, callback) {
	var events = [];
	for (var i = 0; i < mapData.events.length; i++) {
		events.push(EventLoader.load(mapData.events[i]));
	}
	callback(events);
};