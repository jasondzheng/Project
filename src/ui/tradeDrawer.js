/**
 * A class responsible for drawing the trade UI. Trde UI includes a maximum of 4
 * portraits, 1 speech bubble, and the view of items for trade.
 */

var TradeDrawer = {};

TradeDrawer.PATH = '../assets/img/ui/trade/';

// Positions of portraits
TradeDrawer.PORTRAIT_1_LEFT = 44;
TradeDrawer.PORTRAIT_2_LEFT = 300;
TradeDrawer.PORTRAIT_3_RIGHT = 1236;
TradeDrawer.PORTRAIT_4_RIGHT = 980;
TradeDrawer.PORTRAIT_BOTTOM = 720;

// Backshade color
TradeDrawer.BACKSHADE_COLOR = 'rgba(0, 0, 0, 0.25)';

TradeDrawer.INGREDIENTS_FONT = 'test';

TradeDrawer.QUANTITY_FONT = 'test';

// The position of the quantity text WRT the cell topleft corner.
TradeDrawer.QUANTITY_OFFSET_X = 26;
TradeDrawer.QUANTITY_DELTA_X = 12;
TradeDrawer.QUANTITY_OFFSET_Y = 42;
TradeDrawer.QUANTITY_MAX_GLYPHS = 3;

// Constant assets needed to display a trade.
TradeDrawer.BODY_IMG;
TradeDrawer.CELL_IMG;

TradeDrawer.SCROLLBAR_OFFSET_X;
TradeDrawer.SCROLLBAR_OFFSET_Y;

TradeDrawer.SCROLL_BAR_MAX_SCROLL = 1000;
TradeDrawer.CELL_EDGE_OFFSET = 12;
TradeDrawer.CELL_SPACING = 8;
TradeDrawer.CELLS_PER_ROW = 4;

TradeDrawer.MIN_ROWS = 6;


// Variable assets needed to display a trade.
TradeDrawer._trades;
TradeDrawer._leftPortrait1;
TradeDrawer._leftPortrait2;
TradeDrawer._rightPortrait1;
TradeDrawer._rightPortrait2;
TradeDrawer._bubbleSize;
TradeDrawer._bubbleIsFromLeft;
TradeDrawer._message;

TradeDrawer._tradeMode = false;

TradeDrawer._scrollBar;

TradeDrawer._numCells;
TradeDrawer._numRows;

TradeDrawer._scrollablePixels;

// Old input modes; used to restore previous state before entering trade
TradeDrawer._oldKeyInputMode;
TradeDrawer._oldMouseInputMode;

TradeDrawer._currentHoveredCellIndex;


TradeDrawer.load = function (callback){
	// Load asstets
	ImgUtils.loadImages({
		body: TradeDrawer.PATH + 'body.png',
		cell: TradeDrawer.PATH + 'cell.png'
	}, function(imgs) {
		TradeDrawer.BODY_IMG = imgs.body;
		TradeDrawer.CELL_IMG = imgs.cell;
		// Centered coordinates for the body.
		TradeDrawer.BODY_X = 
				(ScreenProps.EXP_WIDTH - TradeDrawer.BODY_IMG.width) / 2;
		TradeDrawer.BODY_Y = 
				(ScreenProps.EXP_HEIGHT - TradeDrawer.BODY_IMG.height) / 2;

		TradeDrawer.WINDOW_BODY_TOP = TradeDrawer.CELL_EDGE_OFFSET;
		TradeDrawer.WINDOW_BODY_BOT = TradeDrawer.BODY_IMG.height -
				TradeDrawer.CELL_EDGE_OFFSET;
		TradeDrawer.WINDOW_BODY_LEFT = TradeDrawer.CELL_EDGE_OFFSET;
		TradeDrawer.WINDOW_BODY_RIGHT = (TradeDrawer.CELLS_PER_ROW - 1) * 
				(TradeDrawer.CELL_IMG.width + TradeDrawer.CELL_SPACING) + 
				TradeDrawer.CELL_IMG.width + TradeDrawer.CELL_EDGE_OFFSET;
		TradeDrawer.WINDOW_BODY_WIDTH =
				TradeDrawer.WINDOW_BODY_RIGHT - TradeDrawer.WINDOW_BODY_LEFT;
		TradeDrawer.WINDOW_BODY_HEIGHT =
				TradeDrawer.WINDOW_BODY_BOT - TradeDrawer.WINDOW_BODY_TOP;

		TradeDrawer.CELL_POSITION_GAP =
				TradeDrawer.CELL_IMG.height + TradeDrawer.CELL_SPACING;

		TradeDrawer.SCROLLBAR_OFFSET_X = TradeDrawer.CELL_EDGE_OFFSET * 2 + 
				TradeDrawer.CELLS_PER_ROW * TradeDrawer.CELL_IMG.width + 
				(TradeDrawer.CELLS_PER_ROW - 1) * TradeDrawer.CELL_SPACING + 6;
		TradeDrawer.SCROLLBAR_OFFSET_Y = TradeDrawer.CELL_EDGE_OFFSET;

		TradeDrawer._scrollBar = 
				new ScrollBar(TradeDrawer.SCROLL_BAR_MAX_SCROLL, 
						TradeDrawer.BODY_IMG.height - 
								2 * TradeDrawer.CELL_EDGE_OFFSET, false);
		
	});
	callback();
};


// Used to set up the trade to be shown. 
TradeDrawer.displayTrade = function(trades, leftPortrait1, leftPortrait2, 
		rightPortrait1, rightPortrait2, bubbleSize, bubbleIsFromLeft, message) {
	TradeDrawer._trades = trades;
	TradeDrawer._leftPortrait1 = leftPortrait1;
	TradeDrawer._leftPortrait2 = leftPortrait2;
	TradeDrawer._rightPortrait1 = rightPortrait1;
	TradeDrawer._rightPortrait2 = rightPortrait2;
	TradeDrawer._bubbleSize = bubbleSize;
	TradeDrawer._bubbleIsFromLeft = bubbleIsFromLeft;
	TradeDrawer._message = message;
	
	// Number of rows.
	TradeDrawer._numRows = Math.max(TradeDrawer.MIN_ROWS, 
			Math.ceil(trades.length / TradeDrawer.CELLS_PER_ROW));

	// Number of drawn item cells.
	TradeDrawer._numCells = TradeDrawer._numRows * TradeDrawer.CELLS_PER_ROW;
	
	TradeDrawer._scrollablePixels = TradeDrawer._numRows * 
			TradeDrawer.CELL_IMG.height + (TradeDrawer._numRows - 1) * 
			TradeDrawer.CELL_SPACING - TradeDrawer.WINDOW_BODY_HEIGHT;


	TradeDrawer._tradeMode = true;
	TradeDrawer._oldKeyInputMode = KeyInputRouter.getMode();
	TradeDrawer._oldMouseInputMode = MouseInputRouter.getMode();
	KeyInputRouter.setMode(KeyInputRouter.Modes.DIALOG_INPUT /* Make trade modes */);
	MouseInputRouter.setMode(MouseInputRouter.Modes.DIALOG_INPUT /* Make trade modes */);
};


// Exits the current trade.
TradeDrawer.exitTrade = function() {
	TradeDrawer._trade = null;
	TradeDrawer._leftPortrait1 = null;
	TradeDrawer._leftPortrait2 = null;
	TradeDrawer._rightPortrait1 = null;
	TradeDrawer._rightPortrait2 = null;
	TradeDrawer._bubbleSize = null;
	TradeDrawer._bubbleIsFromLeft = null;
	TradeDrawer._message = null;

	TradeDrawer._numRows = null;

	TradeDrawer._numCells = null;

	TradeDrawer._scrollablePixels = null;

	TradeDrawer._tradeMode = false;
	KeyInputRouter.setMode(TradeDrawer._oldKeyInputMode);
	MouseInputRouter.setMode(TradeDrawer._oldMouseInputMode);
	TradeDrawer._oldKeyInputMode = null;
	TradeDrawer._oldMouseInputMode = null;
};


TradeDrawer.updateCurrentScroll = function(delta) {
	TradeDrawer._scrollBar.updateScroll(delta);
};

TradeDrawer.onStartClick = function(x, y) {
	var normalizedX = x - TradeDrawer.BODY_X;
	var normalizedY = y - TradeDrawer.BODY_Y;
};


TradeDrawer.onDrag = function(x, y) {
	// Nothing
};


TradeDrawer.onEndClick = function(x, y, isDoubleClick) {
	var normalizedX = x - TradeDrawer.BODY_X;
	var normalizedY = y - TradeDrawer.BODY_Y;
};


TradeDrawer.onHover = function(x, y) {
	var normalizedX = x - TradeDrawer.BODY_X;
	var normalizedY = y - TradeDrawer.BODY_Y;
};


// Draws the entire Trade UI overlay
TradeDrawer.drawTradeOverlay = function(ctx) {
	if (TradeDrawer._tradeMode) {
		// draw stuff here
		// Draw a backshade before drawing any other trade components
		ctx.fillStyle = TradeDrawer.BACKSHADE_COLOR;
		ctx.fillRect(0, 0, ScreenProps.EXP_WIDTH, ScreenProps.EXP_HEIGHT);
		// Draw Portraits
		TradeDrawer._drawPortraits(ctx);
		// Draw trade items
		TradeDrawer._drawItemsInterface(ctx, TradeDrawer.BODY_X, 
				TradeDrawer.BODY_Y);
		// Draw possible overlay with ingredients list
		TradeDrawer._maybeDrawIngredients(ctx);
		// Handle "Are you sure?" dialog
	}
};


// Draws the portraits of the Trade UI overlay
TradeDrawer._drawPortraits = function(ctx) {
	if (TradeDrawer._leftPortrait1) {
		ctx.drawImage(TradeDrawer._leftPortrait1, DialogDrawer.PORTRAIT_1_LEFT, 
				DialogDrawer.PORTRAIT_BOTTOM - TradeDrawer._leftPortrait1.height);
	}
	if (TradeDrawer._leftPortrait2) {
		ctx.drawImage(TradeDrawer._leftPortrait2, DialogDrawer.PORTRAIT_2_LEFT, 
				DialogDrawer.PORTRAIT_BOTTOM - TradeDrawer._leftPortrait2.height);
	}
	if (TradeDrawer._rightPortrait1) {
		ctx.drawImage(TradeDrawer._rightPortrait1, 
				DialogDrawer.PORTRAIT_3_RIGHT - TradeDrawer._rightPortrait1.width, 
				DialogDrawer.PORTRAIT_BOTTOM - TradeDrawer._rightPortrait1.height);
	}
	if (TradeDrawer._rightPortrait2) {
		ctx.drawImage(TradeDrawer._rightPortrait2, 
				DialogDrawer.PORTRAIT_4_RIGHT - TradeDrawer._rightPortrait2.width,
				DialogDrawer.PORTRAIT_BOTTOM - TradeDrawer._rightPortrait2.height);
	}
};


// Draws the Items View/Interface of the Trade UI overlay
TradeDrawer._drawItemsInterface = function(ctx, x, y) {
	// Draw Body.
	ctx.drawImage(TradeDrawer.BODY_IMG, x, y);
	
	// Draw Cells.
	var fraction = TradeDrawer._scrollBar.getScrollFraction();
	var pixOffset = fraction * TradeDrawer._scrollablePixels;
	var offset = pixOffset % TradeDrawer.CELL_POSITION_GAP;
	var itemIndex = Math.floor(pixOffset / TradeDrawer.CELL_POSITION_GAP) * 
			TradeDrawer.CELLS_PER_ROW;

	var cellHeight = TradeDrawer.CELL_IMG.height;
	var windowY = TradeDrawer.WINDOW_BODY_HEIGHT;
	var windowBodyTop = TradeDrawer.WINDOW_BODY_TOP;

	for (var yPos = -offset, 
			nextYPos = yPos + cellHeight + TradeDrawer.CELL_SPACING; 
			yPos < windowY; (yPos = nextYPos) && 
					(nextYPos += cellHeight + TradeDrawer.CELL_SPACING)) {
		for (var i = 0; i < TradeDrawer.CELLS_PER_ROW; i++) {
			if (yPos < 0) {
				var cellWidth = TradeDrawer.CELL_IMG.width;
				var cellPartialHeight = TradeDrawer.CELL_IMG.height + yPos;
				ctx.drawImage(TradeDrawer.CELL_IMG, 0, -yPos, cellWidth, 
							cellPartialHeight, x + TradeDrawer.CELL_EDGE_OFFSET + 
									i * (TradeDrawer.CELL_POSITION_GAP), 
							y + windowBodyTop, cellWidth, cellPartialHeight);
				var trade = TradeDrawer._trades[itemIndex++];
				if (trade) {
					// Only shows first result atm.
					var itemId = trade.results[0].itemId;
					var itemQuantity = trade.results[0].quantity;
					var cellX = x + TradeDrawer.CELL_EDGE_OFFSET + 
							i * (TradeDrawer.CELL_POSITION_GAP);
					var drawY = y + windowBodyTop;
					ctx.drawImage(Item.getItem(itemId).sprite, 0, -yPos, cellWidth, 
							cellPartialHeight, cellX, drawY, cellWidth, cellPartialHeight);
					if (itemQuantity > 0) {
						var cellY = drawY + yPos;
						var clipY = TradeDrawer.CELL_IMG.height - 
								TradeDrawer.QUANTITY_OFFSET_Y - cellPartialHeight;
						var quantityStr = itemQuantity.toString();
						GlyphDrawer.drawCutText(ctx, TradeDrawer.QUANTITY_FONT, 
								quantityStr, cellX + TradeDrawer.QUANTITY_OFFSET_X + 
										(TradeDrawer.QUANTITY_MAX_GLYPHS - quantityStr.length) * 
										TradeDrawer.QUANTITY_DELTA_X, 
								Math.max(cellY + TradeDrawer.QUANTITY_OFFSET_Y, drawY), 
								0, clipY, TradeDrawer.CELL_IMG.width - 
										TradeDrawer.QUANTITY_OFFSET_X, cellPartialHeight);
					}
				}
			} else if (nextYPos >= windowY) {
				var cellWidth = TradeDrawer.CELL_IMG.width;
				var cellPartialHeight = Math.min(windowY - yPos, 
						TradeDrawer.CELL_IMG.height);
				ctx.drawImage(TradeDrawer.CELL_IMG, 0, 0, cellWidth, 
						cellPartialHeight, x + TradeDrawer.CELL_EDGE_OFFSET + 
								i * (TradeDrawer.CELL_POSITION_GAP), 
						y + windowBodyTop + yPos, cellWidth, cellPartialHeight);
				var trade = TradeDrawer._trades[itemIndex++];
				if (trade) {
					// Only shows first result atm.
					var itemId = trade.results[0].itemId;
					var itemQuantity = trade.results[0].quantity;
					var cellX = x + TradeDrawer.CELL_EDGE_OFFSET + 
							i * (TradeDrawer.CELL_POSITION_GAP);
					var cellY = y + windowBodyTop + yPos;
					ctx.drawImage(Item.getItem(itemId).sprite, 0, 0, cellWidth, 
							cellPartialHeight, cellX, cellY, cellWidth, cellPartialHeight);
					if (itemQuantity > 0 && cellPartialHeight > 
							TradeDrawer.QUANTITY_OFFSET_Y) {
						var quantityStr = itemQuantity.toString();
						GlyphDrawer.drawCutText(ctx, TradeDrawer.QUANTITY_FONT, 
								quantityStr, cellX + TradeDrawer.QUANTITY_OFFSET_X + 
										(TradeDrawer.QUANTITY_MAX_GLYPHS - quantityStr.length) * 
										TradeDrawer.QUANTITY_DELTA_X, 
								cellY + TradeDrawer.QUANTITY_OFFSET_Y, 0, 0,
								TradeDrawer.CELL_IMG.width - TradeDrawer.QUANTITY_OFFSET_X, 
								cellPartialHeight - TradeDrawer.QUANTITY_OFFSET_Y);
					}
				}
			} else {
				ctx.drawImage(TradeDrawer.CELL_IMG, 
						x + TradeDrawer.CELL_EDGE_OFFSET + 
								i * (TradeDrawer.CELL_POSITION_GAP), y + windowBodyTop + yPos);
				var trade = TradeDrawer._trades[itemIndex++];
				if (trade) {
					// Only shows first result atm.
					var itemId = trade.results[0].itemId;
					var itemQuantity = trade.results[0].quantity;
					var cellX = x + TradeDrawer.CELL_EDGE_OFFSET + 
							i * (TradeDrawer.CELL_POSITION_GAP);
					var cellY = y + windowBodyTop + yPos;
					ctx.drawImage(Item.getItem(itemId).sprite, cellX, cellY);
					if (itemQuantity > 0) {
						var quantityStr = itemQuantity.toString();
						GlyphDrawer.drawText(ctx, TradeDrawer.QUANTITY_FONT, 
								quantityStr, cellX + TradeDrawer.QUANTITY_OFFSET_X + 
										(TradeDrawer.QUANTITY_MAX_GLYPHS - quantityStr.length) * 
										TradeDrawer.QUANTITY_DELTA_X, 
								cellY + TradeDrawer.QUANTITY_OFFSET_Y, 
								TradeDrawer.CELL_IMG.width - TradeDrawer.QUANTITY_OFFSET_X, 
								TradeDrawer.CELL_IMG.height - TradeDrawer.QUANTITY_OFFSET_Y);
					}
				}
			}
		}	
	} 

	// Draw Scroll Bar.
	TradeDrawer._scrollBar.draw(ctx, x + TradeDrawer.SCROLLBAR_OFFSET_X, 
			y + TradeDrawer.SCROLLBAR_OFFSET_Y);
};


// Maybe draws the igredients list
TradeDrawer._maybeDrawIngredients = function(ctx) {

};


