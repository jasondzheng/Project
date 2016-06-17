/**
 * Utility for loading maps.
 */


var MapLoader = {};

// Expected map directory
MapLoader.DIR = '/assets/maps/';

// Expected tileset directory
MapLoader.TILESET_DIR = '/assets/img/tilesets/';


// Static function to load a map.
MapLoader.load = function(mapName, opt_callback) {
	JSONLoader.load(MapLoader.DIR + mapName + '.json', function(mapData) {
		TileLoader.load(MapLoader.TILESET_DIR + mapData.tileset, function(tileset) {
			if (opt_callback) {
				opt_callback(new Map(mapData.name, mapData.data, mapData.width, tileset, 
						mapData.dummyTile));
			}
		});
	});
};