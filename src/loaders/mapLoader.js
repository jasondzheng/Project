/**
 * Utility for loading maps.
 */


var MapLoader = {};

// Expected map directory
MapLoader.DIR = '/assets/maps/';

// Expected tileset directory
MapLoader.TILESET_DIR = '/assets/img/tilesets/';

// Expected static entity directory
MapLoader.STATIC_MAP_ENTITY_DIR = '/assets/img/staticEntities/';


// Static function to load a map.
MapLoader.load = function(mapName, opt_callback) {
	JSONLoader.load(MapLoader.DIR + mapName + '.json', function(mapData) {
		TileLoader.load(MapLoader.TILESET_DIR + mapData.tileset, function(tileset) {
			MapLoader._helperLoadStaticMapEntities(mapData, function() {
				if (opt_callback) {
					opt_callback(new Map(mapData.name, mapData.data, mapData.width, 
							tileset, mapData.dummyTile, mapData.staticMapEntities));
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
MapLoader._helperLoadStaticMapEntities = function(mapData, callback) {
	var entityImageSpecs = {};
	for (var i = 0; i < mapData.staticMapEntities.length; i++) {
		entityImageSpecs[mapData.staticMapEntities[i].sprite] = 
				MapLoader.STATIC_MAP_ENTITY_DIR + mapData.staticMapEntities[i].sprite + 
				'.png';
	}
	ImgUtils.loadImages(entityImageSpecs, function(images) {
		for (var i = 0; i < mapData.staticMapEntities.length; i++) {
			mapData.staticMapEntities[i].sprite = 
					images[mapData.staticMapEntities[i].sprite];
					// Calculate anchor point
			mapData.staticMapEntities[i].anchor = {
				x: mapData.staticMapEntities[i].sprite.width / 2,
				y: mapData.staticMapEntities[i].sprite.height - 
						(mapData.staticMapEntities[i].collisionDepth == undefined ? 
								mapData.staticMapEntities[i].sprite.width / 2 : 0)
			};
			if (mapData.staticMapEntities[i].collisionDepth == undefined) {
				mapData.staticMapEntities[i].collisionRadius = 
						mapData.staticMapEntities[i].sprite.width / 2 / MapDrawer.TILE_DIM;
			} else {
				mapData.staticMapEntities[i].collisionDepth /= MapDrawer.TILE_DIM;
			}
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