/**
 * Utility for loading maps.
 */


var MapLoader = {};

// Expected map directory
MapLoader.DIR = '../assets/maps/';

// Expected tileset directory
MapLoader.TILESET_DIR = '../assets/img/tilesets/';

// Expected static entity directory
MapLoader.STATIC_MAP_ENTITY_DIR = '../assets/img/staticEntities/';


// Static function to load a map.
MapLoader.load = function(mapName, opt_callback) {
	JSONLoader.load(MapLoader.DIR + mapName + '.json', function(mapData) {
		TileLoader.load(MapLoader.TILESET_DIR + mapData.tileset, function(tileset) {
			MapLoader._helperLoadStaticMapEntities(mapName, mapData, function() {
				if (opt_callback) {
					opt_callback(new Map(mapData.name, mapData.data, mapData.width, 
							tileset, mapData.dummyTile, mapData.staticMapEntities, 
							mapData.staticMapInstances));
				};
			});			
		});
	});
};


// Function to unload map.
MapLoader.unload = function(map) {
	TileLoader.unload(map.tileset);
	MapLoader._helperUnloadStaticMapEntities(map);
};


// Helper to load static map entities and convert static map instances
MapLoader._helperLoadStaticMapEntities = function(mapName, mapData, callback) {
	var entityImageSpecs = {};
	for (var entityKey in mapData.staticMapEntities) {
		if (mapData.staticMapEntities.hasOwnProperty(entityKey)) {
			entityImageSpecs[mapData.staticMapEntities[entityKey].sprite] = 
					MapLoader.STATIC_MAP_ENTITY_DIR + mapName + '/' +
					mapData.staticMapEntities[entityKey].sprite + '.png';
		}
	}
	ImgUtils.loadImages(entityImageSpecs, function(images) {
		for (var entityKey in mapData.staticMapEntities) {
			if (mapData.staticMapEntities.hasOwnProperty(entityKey)) {
				// Upon loading the image, we can finally construct a StaticMapEntity
				// for the JSON object
				var entityJSON = mapData.staticMapEntities[entityKey];
				mapData.staticMapEntities[entityKey] = new StaticMapEntity(
						entityJSON.name, 
						images[mapData.staticMapEntities[entityKey].sprite], 
						entityJSON.center.x, entityJSON.center.y, entityJSON.collisionWidth, 
						entityJSON.collisionHeight, entityJSON.isRounded);
			}
		}
		for (var i = 0; i < mapData.staticMapInstances.length; i++) {
			// Convert to StaticMapInstance
			mapData.staticMapInstances[i] = new StaticMapInstance(
					mapData.staticMapEntities[mapData.staticMapInstances[i].entity], 
					mapData.staticMapInstances[i].x, mapData.staticMapInstances[i].y);
		}
		if (callback) {
			callback();
		}
	});
};


// Helper to unload static map entities
MapLoader._helperUnloadStaticMapEntities = function(map) {
	for (var i = 0; i < map.staticMapEntities.length; i++) {
		map.staticMapEntities[i].unload();
	}
};