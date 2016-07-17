/**
 * Draws the map onto a given canvas' context, drawing over whatever the canvas
 * had on it before. Requires a viewer coordinate and tilemap in order to draw.
 */

var MapDrawer = {};

// Default starting height for the grid's top row.
MapDrawer.BASE_HEIGHT = 59;

// The number of rows to show.
MapDrawer.TOTAL_ROWS = 10;
MapDrawer.HALF_ROWS = MapDrawer.TOTAL_ROWS / 2;

// The shrinkage coefficients.
MapDrawer.SHRINKAGE = {
	HEIGHT: 0.01
};

// The fixed width of all square tiles.
MapDrawer.TILE_DIM = 96;

// The number of tiles per row
MapDrawer.NUM_TILES_IN_ROW;
MapDrawer.NUM_TILES_IN_ROW_HALF;


// Deferred initializer
MapDrawer._deferredConstInit = function() {
	MapDrawer.NUM_TILES_IN_ROW = ScreenProps.EXP_WIDTH / MapDrawer.TILE_DIM;
	MapDrawer.NUM_TILES_IN_ROW_HALF = Math.ceil(MapDrawer.NUM_TILES_IN_ROW / 2);
};


// Function for drawing the map to a canvas context. Takes in a viewer position
// for x and y.
MapDrawer.drawMap = function(ctx, map, viewerX, viewerY) {
	var viewerXWhole = Math.floor(viewerX), viewerXFrac = viewerX - viewerXWhole,
			viewerYWhole = Math.floor(viewerY), viewerYFrac = viewerY - viewerYWhole;
	// Calculate dependent constants if unset
	if (MapDrawer.NUM_TILES_IN_ROW == undefined) {
		MapDrawer._deferredConstInit();
	}
	var currYPos = MapDrawer._helperCalcScreenY(-1 - viewerYFrac);
	for (var i = -1; i < MapDrawer.TOTAL_ROWS + 2; i++) {
		var viewerI = i - viewerYFrac;
		var nextYPos = MapDrawer._helperCalcScreenY(viewerI + 1);
		for (var j = -MapDrawer.NUM_TILES_IN_ROW_HALF - 1; 
				j < MapDrawer.NUM_TILES_IN_ROW_HALF + 1; j++) {
			var viewerJ = j - viewerXFrac;
			ctx.drawImage(MapDrawer._helperGetImgForTileCoords(map, 
					j + viewerXWhole, i - MapDrawer.HALF_ROWS + viewerYWhole), 
					ScreenProps.EXP_WIDTH / 2 + viewerJ * MapDrawer.TILE_DIM, currYPos,
					MapDrawer.TILE_DIM, nextYPos - currYPos);
		}
		currYPos = nextYPos;
	}
};


// Function for drawing all entities on the map. Draws on top of map after
// map has finished drawing. Separate from map draw to allow for things
// like beat display to draw between the two layers.
MapDrawer.drawEntities = function(ctx, map, viewerX, viewerY) {
	// Add static map entities
	var entitiesToDraw = map.staticMapInstances.slice(0);
	// Add npcs
	for (var i = 0; i < map.npcInstances.length; i++) {
		entitiesToDraw.push(map.npcInstances[i].visualInstance);
	}
	// Add units
	for (var i = 0; i < map.unitInstances.length; i++) {
		entitiesToDraw.push(map.unitInstances[i].visualInstance);
	}
	// Add player
	if (map.player) {
		entitiesToDraw.push(map.player.visualInstance);
	}
	entitiesToDraw.sort(function(a, b) {
		return a.y + a.getCollisionHeight() / 2 - b.y - b.getCollisionHeight() / 2;
	});
	for (var i = 0; i < entitiesToDraw.length; i++) {
		var footYGridPos = 
				(MapDrawer.TOTAL_ROWS + entitiesToDraw[i].getCollisionHeight()) / 2;
		var centerYRealGridPos = entitiesToDraw[i].y - 
				viewerY + MapDrawer.HALF_ROWS;
		var footYRealGridPos = entitiesToDraw[i].y + 
				entitiesToDraw[i].getCollisionHeight() / 2 - viewerY + 
				MapDrawer.HALF_ROWS;
		var realYDiff = MapDrawer._helperCalcScreenY(footYGridPos) - 
				MapDrawer._helperCalcScreenY(MapDrawer.HALF_ROWS);
		var gridYDiff = MapDrawer._helperCalcScreenY(footYRealGridPos) - 
				MapDrawer._helperCalcScreenY(centerYRealGridPos);
		var centerLoc = MapDrawer._helperLocatePixel(entitiesToDraw[i].x, 
				entitiesToDraw[i].y + entitiesToDraw[i].getCollisionHeight() / 2, 
				viewerX, viewerY, MapDrawer.TILE_DIM);
		// check if the boundingBox is in bounds
		var boundingRect = {
			x: centerLoc.x - entitiesToDraw[i].getEdge().x,
			y: centerLoc.y - entitiesToDraw[i].getEdge().y,
			width: entitiesToDraw[i].getSprite().width,
			height: entitiesToDraw[i].getSprite().height
		};
		if (MapDrawer._helperRectOnScreen(boundingRect)) {
			ctx.drawImage(entitiesToDraw[i].getSprite(), boundingRect.x, 
					boundingRect.y, boundingRect.width, boundingRect.height);
		}
	}
};


// Helper function to see if rectangles overlap
MapDrawer._helperRectOnScreen = function(r1) {
	return !(0 > r1.x + r1.width || ScreenProps.EXP_WIDTH < r1.x || 
			0 > r1.y + r1.height || ScreenProps.EXP_HEIGHT < r1.y);
};


// Helper function to calculate the on-screen position of a given grid
// coordinate and an viewer x and y coordinate and yBlockWidth.
MapDrawer._helperLocatePixel = function(x, y, viewerX, viewerY, yBlockWidth) {
	var result = {};
	result.x = ScreenProps.EXP_WIDTH / 2 + (x - viewerX) * yBlockWidth;
	result.y = MapDrawer._helperCalcScreenY(
			y - (viewerY - MapDrawer.HALF_ROWS));
	return result;
};


// Helper function for calculating the on-screen Y position of a given 
// coordinate.
MapDrawer._helperCalcScreenY = function(y) {
	return Math.floor(y * MapDrawer.BASE_HEIGHT * 
			(1 + (y - 1) / 2 * MapDrawer.SHRINKAGE.HEIGHT)) + 60;
};


// Helper function to get the image for a given coordinate on a map. Provides
// dummies if off the edge of the map.
MapDrawer._helperGetImgForTileCoords = function(map, x, y) {
	if (x < 0 || x >= map.width || y < 0 || y >= map.height) {
		return map.tileset[map.dummyTile].img;
	}
	return map.tileset[map.data[x + y * map.width]].img;
};