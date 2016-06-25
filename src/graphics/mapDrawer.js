/**
 * Draws the map onto a given canvas' context, drawing over whatever the canvas
 * had on it before. Requires a viewer coordinate and tilemap in order to draw.
 */

var MapDrawer = {};

// Default starting height for the grid's top row.
MapDrawer.BASE_HEIGHT = 59;

// The number of rows to show.
MapDrawer.TOTAL_ROWS = 10;

// The shrinkage coefficients.
MapDrawer.SHRINKAGE = {
	WIDTH: 1.5 / MapDrawer.TOTAL_ROWS, 
	HEIGHT: 0.05
};

// The fixed width of all square tiles.
MapDrawer.TILE_DIM = 96;

// The number of tiles on the bottom of the screen. Deferred calc due to
// dependency on ScreenProps.
MapDrawer.NUM_TILES_BOTTOM;

// The number of tiles on the top of the screen. Deferred calc due to
// dependency on ScreenProps.
MapDrawer.NUM_TILES_TOP;

// The top row tile width. Deferred calc due to dependency on ScreenProps.
MapDrawer.TOP_ROW_TILE_WIDTH;

// A canvas to draw onto for individual rows.
MapDrawer.ROW_CANVAS;

// Deferred initializer
MapDrawer._deferredConstInit = function() {
	MapDrawer.NUM_TILES_BOTTOM = ScreenProps.EXP_WIDTH / MapDrawer.TILE_DIM;
	MapDrawer.NUM_TILES_TOP = MapDrawer.NUM_TILES_BOTTOM + 
			MapDrawer.TOTAL_ROWS * MapDrawer.SHRINKAGE.WIDTH;
	MapDrawer.TOP_ROW_TILE_WIDTH = ScreenProps.EXP_WIDTH / 
			MapDrawer.NUM_TILES_TOP;
	MapDrawer.ROW_CANVAS = document.createElement('canvas');
	MapDrawer.ROW_CANVAS.height = MapDrawer.TILE_DIM;
};


// Function for drawing the map to a canvas context. Takes in a viewer position
// for x and y.
MapDrawer.drawMap = function(ctx, map, viewerX, viewerY) {
	var viewerXWhole = Math.floor(viewerX), viewerXFrac = viewerX - viewerXWhole,
			viewerYWhole = Math.floor(viewerY), viewerYFrac = viewerY - viewerYWhole;
	// Calculate dependent constants if unset
	if (MapDrawer.NUM_TILES_BOTTOM == undefined) {
		MapDrawer._deferredConstInit();
	}
	var currYPos = MapDrawer._helperCalcScreenY(-1 - viewerYFrac);
	for (var i = -1; i < MapDrawer.TOTAL_ROWS + 2; i++) {
		var viewerI = i - viewerYFrac;
		var nextYPos = MapDrawer._helperCalcScreenY(viewerI + 1);
		var numTilesToDraw = MapDrawer.NUM_TILES_TOP - 
				viewerI * MapDrawer.SHRINKAGE.WIDTH;
		var tileTopWidth = MapDrawer.TOP_ROW_TILE_WIDTH * 
				MapDrawer.NUM_TILES_TOP / numTilesToDraw;
		var tileBotWidth = MapDrawer.TOP_ROW_TILE_WIDTH * MapDrawer.NUM_TILES_TOP / 
				(MapDrawer.NUM_TILES_TOP - (viewerI + 1) * MapDrawer.SHRINKAGE.WIDTH);
		var halfTilesToDraw = Math.ceil(numTilesToDraw / 2);
		MapDrawer.ROW_CANVAS.width = (halfTilesToDraw + 1) * 2 * MapDrawer.TILE_DIM;
		var rowCtx = MapDrawer.ROW_CANVAS.getContext('2d');
		for (var j = -halfTilesToDraw - 1; j < halfTilesToDraw + 1; j++) {
			var viewerJ = j - viewerXFrac;
			rowCtx.drawImage(MapDrawer._helperGetImgForTileCoords(map, 
					j + viewerXWhole, i - MapDrawer.TOTAL_ROWS / 2 + viewerYWhole), 
					MapDrawer.ROW_CANVAS.width / 2 + viewerJ * MapDrawer.TILE_DIM, 0);
		}
		ImgUtils.drawTrapezium(ctx, MapDrawer.ROW_CANVAS, 
				ScreenProps.EXP_WIDTH / 2 + tileTopWidth * (-halfTilesToDraw - 1), 
				ScreenProps.EXP_WIDTH / 2 + tileBotWidth * (-halfTilesToDraw - 1), 
				currYPos, tileTopWidth * (halfTilesToDraw + 1) * 2, 
				tileBotWidth * (halfTilesToDraw + 1) * 2, nextYPos - currYPos);
		currYPos = nextYPos;
	}
	MapDrawer._helperDrawEntities(ctx, map, viewerX, viewerY);	
};


// Helper function for drawing all entities on the map.
MapDrawer._helperDrawEntities = function(ctx, map, viewerX, viewerY) {
	var entitiesToDraw = map.staticMapInstances.slice(0);
	entitiesToDraw.sort(function(a, b) {
		return a.y + a.getCollisionHeight() / 2 - b.y - b.getCollisionHeight() / 2;
	});
	for (var i = 0; i < entitiesToDraw.length; i++) {
		var footYGridPos = 
				(MapDrawer.TOTAL_ROWS + entitiesToDraw[i].getCollisionHeight()) / 2;
		var centerYRealGridPos = entitiesToDraw[i].y - 
				viewerY + MapDrawer.TOTAL_ROWS / 2;
		var footYRealGridPos = entitiesToDraw[i].y + 
				entitiesToDraw[i].getCollisionHeight() / 2 - viewerY + 
				MapDrawer.TOTAL_ROWS / 2;
		var realYDiff = MapDrawer._helperCalcScreenY(footYGridPos) - 
				MapDrawer._helperCalcScreenY(MapDrawer.TOTAL_ROWS / 2);
		var gridYDiff = MapDrawer._helperCalcScreenY(footYRealGridPos) - 
				MapDrawer._helperCalcScreenY(centerYRealGridPos);
		var yScale = 1;//gridYDiff / realYDiff;
		var widthAtMidFoot = MapDrawer.TOP_ROW_TILE_WIDTH * 
				MapDrawer.NUM_TILES_TOP / (MapDrawer.NUM_TILES_TOP - 
				(footYGridPos) * MapDrawer.SHRINKAGE.WIDTH);
		var widthAtRealFoot = MapDrawer._helperGetYBlockWidth(
				entitiesToDraw[i].y + entitiesToDraw[i].getCollisionHeight() / 2, 
				viewerY);
		var xScale = widthAtRealFoot / widthAtMidFoot;
		var centerLoc = MapDrawer._helperLocatePixel(entitiesToDraw[i].x, 
				entitiesToDraw[i].y + entitiesToDraw[i].getCollisionHeight() / 2, 
				viewerX, viewerY, MapDrawer._helperGetYBlockWidth(entitiesToDraw[i].y + 
						entitiesToDraw[i].getCollisionHeight() / 2, viewerY));
		// check if the boundingBox is in bounds
		var boundingRect = {
			x: centerLoc.x - entitiesToDraw[i].getCenter().x * xScale,
			y: centerLoc.y - entitiesToDraw[i].getSprite().height * yScale,
			width: entitiesToDraw[i].getSprite().width * xScale,
			height: entitiesToDraw[i].getSprite().height * yScale
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
			y - (viewerY - MapDrawer.TOTAL_ROWS / 2));
	return result;
};

// Helper function to get block width.
MapDrawer._helperGetYBlockWidth = function(y, viewerY) {
	return MapDrawer.TOP_ROW_TILE_WIDTH * MapDrawer.NUM_TILES_TOP / 
			(MapDrawer.NUM_TILES_TOP - (y - (viewerY - MapDrawer.TOTAL_ROWS / 2)) * 
			MapDrawer.SHRINKAGE.WIDTH)
};


// Helper function for calculating the on-screen Y position of a given 
// coordinate.
MapDrawer._helperCalcScreenY = function(y) {
	return Math.floor(y * MapDrawer.BASE_HEIGHT * 
			(1 + (y - 1) / 2 * MapDrawer.SHRINKAGE.HEIGHT));
};


// Helper function to get the image for a given coordinate on a map. Provides
// dummies if off the edge of the map.
MapDrawer._helperGetImgForTileCoords = function(map, x, y) {
	if (x < 0 || x >= map.width || y < 0 || y >= map.height) {
		return map.tileset[map.dummyTile].img;
	}
	return map.tileset[map.data[x + y * map.width]].img;
};