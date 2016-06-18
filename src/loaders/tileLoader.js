/**
 * Loads tilesets. Each tile will have an image and a set of properties.
 */

var TileLoader = {};


// Loads a tileset from a given directory. The tile directory should incllude an
// info.json that describes the tiles, as well as a set of images for the tiles'
// appearances.
TileLoader.load = function(path, opt_callback) {
	// Calculate the path of the info from the path of the tileset
	var infoPath = path + '/info.json';

	JSONLoader.load(infoPath, function(tileInfo) {
		tileInfo = tileInfo.tiles;
		var tilesToLoad = {};
		for (var i = 0; i < tileInfo.length; i++) {
			tilesToLoad[i + ''] = path + '/' + tileInfo[i].name + '.png';
		}
		ImgUtils.loadImages(tilesToLoad, function(images) {
			for (var i = 0; i < tileInfo.length; i++) {
				tileInfo[i].img = images[i + ''];
			}
			if (opt_callback) {
				opt_callback(tileInfo);
			}
		});
	});
};


// Unloads a tileset when it is no longer needed.
TileLoader.unload = function(tileInfo) {
	var urls = [];
	for (var i = 0; i < tileInfo.length; i++) {
		urls.push(tileInfo[i].img.src);
		tileInfo[i].img = null;
	}
	ImgUtils.unloadImages(urls);
};