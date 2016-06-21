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
							tileset, mapData.dummyTile, mapData.staticMapInstances));
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


// Helper to load static map entities
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
				mapData.staticMapEntities[entityKey].sprite = 
						images[mapData.staticMapEntities[entityKey].sprite];
			}
		}
		for (var i = 0; i < mapData.staticMapInstances.length; i++) {
			mapData.staticMapInstances[i].entity = 
					mapData.staticMapEntities[mapData.staticMapInstances[i].entity];
		}
		if (callback) {
			callback();
		}
	});
};


// Helper to unload static map entities
MapLoader._helperUnloadStaticMapEntities = function(mapData) {
	var urls = [];
	for (var i = 0; i < mapData.staticMapEntities.length; i++) {
		urls.push(mapData.staticMapEntities[i].sprite.src);
		mapData.staticMapEntities[i].sprite = null;
	}
	ImgUtils.unloadImages(urls);
};