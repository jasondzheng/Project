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

TradeDrawer.DESCRIPTION_FONT = 'test';

TradeDrawer.QUANTITY_FONT = 'test';

TradeDrawer.CANNOT_TRADE_OPACITY = 0.5;

// The position of the quantity text WRT the cell topleft corner.
TradeDrawer.QUANTITY_OFFSET_X = 26;
TradeDrawer.QUANTITY_DELTA_X = 12;
TradeDrawer.QUANTITY_OFFSET_Y = 42;
TradeDrawer.QUANTITY_MAX_GLYPHS = 3;

// Constant assets needed to display a trade.
TradeDrawer.BODY_IMG;
TradeDrawer.CELL_IMG;
TradeDrawer.EXIT_BUTTON_IMG;
TradeDrawer.CONFIRM_YES_BUTTON_IMG;
TradeDrawer.CONFIRM_NO_BUTTON_IMG;
TradeDrawer.CONFIRM_BODY_IMG;
TradeDrawer.CONFIRM_ARROWS_IMG;

TradeDrawer.SCROLL_BAR_MAX_SCROLL = 1000;
TradeDrawer.CELL_EDGE_OFFSET = 12;
TradeDrawer.CELL_SPACING = 8;
TradeDrawer.CELLS_PER_ROW = 4;

TradeDrawer.MIN_ROWS = 6;

TradeDrawer.CONFIRM_NUM_ROWS = 3;
TradeDrawer.CONFIRM_CELLS_PER_ROW = 3;


// Variable assets needed to display a trade.
TradeDrawer._trades;
TradeDrawer._leftPortrait1;
TradeDrawer._leftPortrait2;
TradeDrawer._rightPortrait1;
TradeDrawer._rightPortrait2;
TradeDrawer._bubbleSize;
TradeDrawer._bubbleIsFromLeft;
TradeDrawer._message;

// Indicates whether the player has entered a trade.
TradeDrawer.isOpen = false;

// Indicates whether the user has selected a cell to trade.
TradeDrawer._isInConfirmationMode = false;

// The selected trade.
TradeDrawer._selectedTrade;

// Button used to exit the trade interface.
TradeDrawer._exitButton;

// Confimation interface buttons.
TradeDrawer._confirmYesButton;
TradeDrawer._confirmNoButton;

TradeDrawer._scrollBar;

// Indicates whether the user is dragging the scroll bubble.
TradeDrawer._isDraggingScroll = false;

TradeDrawer._numCells;
TradeDrawer._numRows;

TradeDrawer._scrollablePixels;

// The last recorded start click position.
TradeDrawer._lastStartClickX;
TradeDrawer._lastStartClickY;

// Old input modes; used to restore previous state before entering trade.
TradeDrawer._oldKeyInputMode;
TradeDrawer._oldMouseInputMode;

TradeDrawer._currentHoveredCellIndex;


TradeDrawer.load = function (callback){
	// Load asstets.
	ImgUtils.loadImages({
		body: TradeDrawer.PATH + 'body.png',
		cell: TradeDrawer.PATH + 'cell.png',
		exitButton: TradeDrawer.PATH + 'exitButton.png',
		descriptionBack: TradeDrawer.PATH + 'descriptionBack.png',
		confirmBody: TradeDrawer.PATH + 'confirmBody.png',
		confirmYesButton: TradeDrawer.PATH + 'confirmYesButton.png',
		confirmNoButton: TradeDrawer.PATH + 'confirmNoButton.png',
		confirmArrows: TradeDrawer.PATH + 'confirmArrows.png'
	}, function(imgs) {
		// Assign loaded image assets.
		TradeDrawer.BODY_IMG = imgs.body;
		TradeDrawer.CELL_IMG = imgs.cell;
		TradeDrawer.EXIT_BUTTON_IMG = imgs.exitButton;
		TradeDrawer.DESCRIPTION_BACK = imgs.descriptionBack;
		TradeDrawer.CONFIRM_BODY_IMG = imgs.confirmBody;
		TradeDrawer.CONFIRM_YES_BUTTON_IMG = imgs.confirmYesButton;
		TradeDrawer.CONFIRM_NO_BUTTON_IMG = imgs.confirmNoButton;
		TradeDrawer.CONFIRM_ARROWS_IMG = imgs.confirmArrows;
		
		// Items/Select Trades interface preparations.
		// Centered coordinates for the body.
		TradeDrawer.BODY_X = 
				(ScreenProps.EXP_WIDTH - TradeDrawer.BODY_IMG.width) / 2;
		TradeDrawer.BODY_Y = 
				(ScreenProps.EXP_HEIGHT - TradeDrawer.BODY_IMG.height) / 2;

		// Window calculations.
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

		TradeDrawer._scrollBar = 
				new ScrollBar(TradeDrawer.SCROLL_BAR_MAX_SCROLL, 
						TradeDrawer.BODY_IMG.height - 
								2 * TradeDrawer.CELL_EDGE_OFFSET, false);

		TradeDrawer.CELL_POSITION_GAP =
				TradeDrawer.CELL_IMG.height + TradeDrawer.CELL_SPACING;

		TradeDrawer.SCROLLBAR_OFFSET_X = TradeDrawer.CELL_EDGE_OFFSET * 2 + 
				TradeDrawer.CELLS_PER_ROW * TradeDrawer.CELL_IMG.width + 
				(TradeDrawer.CELLS_PER_ROW - 1) * TradeDrawer.CELL_SPACING + 6;
		TradeDrawer.SCROLLBAR_OFFSET_Y = TradeDrawer.CELL_EDGE_OFFSET;

		TradeDrawer._exitButton = 
				new Button(TradeDrawer.EXIT_BUTTON_IMG, true, function() {
					TradeDrawer.exitTrade();
				});

		TradeDrawer.EXIT_BUTTON_X = 
				(ScreenProps.EXP_WIDTH - TradeDrawer.EXIT_BUTTON_IMG.width) / 2;
		TradeDrawer.EXIT_BUTTON_Y = ScreenProps.EXP_HEIGHT - 100;

		TradeDrawer.DESCRIPTION_X = TradeDrawer.BODY_X - imgs.descriptionBack.width;
		TradeDrawer.DESCRIPTION_Y = TradeDrawer.BODY_Y;

		// Confirmation dialog-specific preparations.
		TradeDrawer.CONFIRM_BODY_X = 
				(ScreenProps.EXP_WIDTH - imgs.confirmBody.width) / 2;
		TradeDrawer.CONFIRM_BODY_Y = 
				(ScreenProps.EXP_HEIGHT - imgs.confirmBody.height) / 2;

		TradeDrawer.CONFIRM_ARROWS_X = TradeDrawer.CONFIRM_BODY_X +
				(TradeDrawer.CONFIRM_BODY_IMG.width - 
						TradeDrawer.CONFIRM_ARROWS_IMG.width) / 2;

		TradeDrawer.CONFIRM_ARROWS_Y = TradeDrawer.CONFIRM_BODY_Y +
				(TradeDrawer.CONFIRM_BODY_IMG.height - 
						TradeDrawer.CONFIRM_ARROWS_IMG.height) / 2;

		// Starting coordinates for the trade results cell.
		TradeDrawer.CONFIRM_CELLS_LEFT_X = TradeDrawer.CONFIRM_BODY_X + 
				TradeDrawer.CELL_EDGE_OFFSET + TradeDrawer.CELL_POSITION_GAP;

		TradeDrawer.CONFIRM_CELLS_LEFT_Y = TradeDrawer.CONFIRM_BODY_Y + 
				TradeDrawer.CELL_EDGE_OFFSET + TradeDrawer.CELL_POSITION_GAP;

		// Starting coordinates for the ingredients results cells.
		TradeDrawer.CONFIRM_CELLS_RIGHT_X = TradeDrawer.CONFIRM_ARROWS_X + 
				TradeDrawer.CONFIRM_ARROWS_IMG.width + TradeDrawer.CELL_EDGE_OFFSET;

		TradeDrawer.CONFIRM_CELLS_RIGHT_Y = TradeDrawer.CONFIRM_BODY_Y + 
				TradeDrawer.CELL_EDGE_OFFSET;

		TradeDrawer._confirmYesButton = 
				new Button(TradeDrawer.CONFIRM_YES_BUTTON_IMG, true, function() {
					TradeDrawer._selectedTrade.applyTrade();
				});

		TradeDrawer.CONFIRM_YES_BUTTON_X = ScreenProps.EXP_WIDTH / 2 - 
				TradeDrawer.CELL_EDGE_OFFSET - TradeDrawer.CONFIRM_YES_BUTTON_IMG.width;

		TradeDrawer.CONFIRM_YES_BUTTON_Y = TradeDrawer.CONFIRM_BODY_Y + 
				TradeDrawer.CONFIRM_BODY_IMG.height + TradeDrawer.CELL_EDGE_OFFSET;

		TradeDrawer._confirmNoButton = 
				new Button(TradeDrawer.CONFIRM_NO_BUTTON_IMG, true, function() {
					TradeDrawer._isInConfirmationMode = false;
				});

		TradeDrawer.CONFIRM_NO_BUTTON_X = ScreenProps.EXP_WIDTH / 2 + 
				TradeDrawer.CELL_EDGE_OFFSET;

		TradeDrawer.CONFIRM_NO_BUTTON_Y = TradeDrawer.CONFIRM_BODY_Y + 
				TradeDrawer.CONFIRM_BODY_IMG.height + TradeDrawer.CELL_EDGE_OFFSET;
		
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

	// Reset the scroll.
	TradeDrawer._scrollBar.setScrollFraction = 0;

	// Disable/enable the scroll bar based on if its needed.
	if (TradeDrawer._scrollablePixels == 0) {
		TradeDrawer._scrollBar.disable();
	} else {
		TradeDrawer._scrollBar.enable();
	}

	TradeDrawer.isOpen = true;
	TradeDrawer._oldKeyInputMode = KeyInputRouter.getMode();
	TradeDrawer._oldMouseInputMode = MouseInputRouter.getMode();
	KeyInputRouter.setMode(KeyInputRouter.Modes.DISABLED);
	MouseInputRouter.setMode(MouseInputRouter.Modes.TRADE_INPUT);
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

	TradeDrawer._selectedTrade = null;

	TradeDrawer.isOpen = false;
	KeyInputRouter.setMode(TradeDrawer._oldKeyInputMode);
	MouseInputRouter.setMode(TradeDrawer._oldMouseInputMode);
	TradeDrawer._oldKeyInputMode = null;
	TradeDrawer._oldMouseInputMode = null;
};


TradeDrawer.updateCurrentScroll = function(delta) {
	TradeDrawer._scrollBar.updateScroll(delta);
};


TradeDrawer.onStartClick = function(x, y) {
	if (!TradeDrawer._isInConfirmationMode) {
		TradeDrawer._lastStartClickX = x;
		TradeDrawer._lastStartClickY = y;
		var normalizedX = x - TradeDrawer.BODY_X;
		var normalizedY = y - TradeDrawer.BODY_Y;
		// If in scroll bubble, set scroll mode.
		if (TradeDrawer._scrollBar.isInBubble(
				normalizedX - TradeDrawer.SCROLLBAR_OFFSET_X,
				normalizedY - TradeDrawer.SCROLLBAR_OFFSET_Y)) {
			TradeDrawer._isDraggingScroll = true;
		}
	}
};


TradeDrawer.onDrag = function(x, y) {
	if (!TradeDrawer._isInConfirmationMode) {
		var normalizedX = x - TradeDrawer.BODY_X;
		var normalizedY = y - TradeDrawer.BODY_Y;
		// If in scroll mode, update scrollbar.
		if (TradeDrawer._isDraggingScroll) {
			TradeDrawer._scrollBar.updateScrollFromDrag(
					normalizedX - TradeDrawer.SCROLLBAR_OFFSET_X,
					normalizedY - TradeDrawer.SCROLLBAR_OFFSET_Y);
		}
	}
};


TradeDrawer.onEndClick = function(x, y, isDoubleClick) {
	var startAndEndSameLoc = 
			Math.abs(TradeDrawer._lastStartClickX - x) < 
					MouseTracker.SAME_LOC_TOLERANCE && 
			Math.abs(TradeDrawer._lastStartClickY - y) < 
					MouseTracker.SAME_LOC_TOLERANCE;
	if (TradeDrawer._isInConfirmationMode) {
		if (TradeDrawer._confirmYesButton.isInButton(
				x - TradeDrawer.CONFIRM_YES_BUTTON_X, 
				y - TradeDrawer.CONFIRM_YES_BUTTON_Y)) {
			TradeDrawer._selectedTrade.applyTrade();
			TradeDrawer._isInConfirmationMode = false;
		} else if (TradeDrawer._confirmNoButton.isInButton(
				x - TradeDrawer.CONFIRM_NO_BUTTON_X,
				y - TradeDrawer.CONFIRM_NO_BUTTON_Y)) {
			TradeDrawer._isInConfirmationMode = false;
		}
	} else {
		var normalizedX = x - TradeDrawer.BODY_X;
		var normalizedY = y - TradeDrawer.BODY_Y;
		var possibleCellIndex;
		if ((possibleCellIndex =
				TradeDrawer._helperGetTradeSlotFromClickCoords(
						normalizedX, normalizedY)) != -1 && startAndEndSameLoc) {
			if (TradeDrawer._trades[possibleCellIndex] && 
					TradeDrawer._trades[possibleCellIndex].canTrade()) {
				TradeDrawer._selectedTrade = TradeDrawer._trades[possibleCellIndex];
				TradeDrawer._isInConfirmationMode = true;
			}
		} else if (TradeDrawer._scrollBar.isInLine(
				normalizedX - TradeDrawer.SCROLLBAR_OFFSET_X,
				normalizedY - TradeDrawer.SCROLLBAR_OFFSET_Y) && startAndEndSameLoc) {
			TradeDrawer._scrollBar.updateScrollFromDrag(
					normalizedX - TradeDrawer.SCROLLBAR_OFFSET_X,
					normalizedY - TradeDrawer.SCROLLBAR_OFFSET_Y);
		} else if (TradeDrawer._exitButton.isInButton(x - TradeDrawer.EXIT_BUTTON_X, 
				y - TradeDrawer.EXIT_BUTTON_Y) && startAndEndSameLoc) {
			TradeDrawer._exitButton.onClick();
		}
	}
	TradeDrawer._isDraggingScroll = false;
};


TradeDrawer.onHover = function(x, y) {
	var normalizedX = x - TradeDrawer.BODY_X;
	var normalizedY = y - TradeDrawer.BODY_Y;
	var possibleCellIndex;
	if (!TradeDrawer._isInConfirmationMode &&
			(possibleCellIndex = 
					TradeDrawer._helperGetTradeSlotFromClickCoords(normalizedX, 
					normalizedY)) != -1) {
		TradeDrawer._currentHoveredCellIndex = possibleCellIndex;
	} else {
		TradeDrawer._currentHoveredCellIndex = null;
	}
};


// Draws the entire Trade UI overlay
TradeDrawer.drawTradeOverlay = function(ctx) {
	if (TradeDrawer.isOpen) {
		// draw stuff here
		// Draw a backshade before drawing any other trade components
		ctx.fillStyle = TradeDrawer.BACKSHADE_COLOR;
		ctx.fillRect(0, 0, ScreenProps.EXP_WIDTH, ScreenProps.EXP_HEIGHT);
		// Draw Portraits
		TradeDrawer._drawPortraits(ctx);	

		if (TradeDrawer._isInConfirmationMode) {
			TradeDrawer._drawConfirmationInterface(ctx);
		} else {
			// Draw trade items
			TradeDrawer._drawItemsInterface(ctx, TradeDrawer.BODY_X, 
					TradeDrawer.BODY_Y);
			// Draw possible overlay with ingredients list
			TradeDrawer._maybeDrawIngredients(ctx);
			TradeDrawer._maybeDrawDescription(ctx);
			TradeDrawer._exitButton.draw(ctx, TradeDrawer.EXIT_BUTTON_X, 
				TradeDrawer.EXIT_BUTTON_Y);
		}
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
					// Grayed-out image if cannot trade.
					if (!trade.canTrade()) {
						ctx.globalAlpha = TradeDrawer.CANNOT_TRADE_OPACITY;
					}
					// Only shows first result atm.
					var itemId = trade.results[0].itemId;
					var itemQuantity = trade.results[0].quantity;
					var cellX = x + TradeDrawer.CELL_EDGE_OFFSET + 
							i * (TradeDrawer.CELL_POSITION_GAP);
					var drawY = y + windowBodyTop;
					ctx.drawImage(Item.getItem(itemId).sprite, 0, -yPos, cellWidth, 
							cellPartialHeight, cellX, drawY, cellWidth, cellPartialHeight);
					if (itemQuantity > 1) {
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
					ctx.globalAlpha = 1;
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
					// Grayed-out image if cannot trade.
					if (!trade.canTrade()) {
							ctx.globalAlpha = TradeDrawer.CANNOT_TRADE_OPACITY;
					}
					// Only shows first result atm.
					var itemId = trade.results[0].itemId;
					var itemQuantity = trade.results[0].quantity;
					var cellX = x + TradeDrawer.CELL_EDGE_OFFSET + 
							i * (TradeDrawer.CELL_POSITION_GAP);
					var cellY = y + windowBodyTop + yPos;
					ctx.drawImage(Item.getItem(itemId).sprite, 0, 0, cellWidth, 
							cellPartialHeight, cellX, cellY, cellWidth, cellPartialHeight);
					if (itemQuantity > 1 && cellPartialHeight > 
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
					ctx.globalAlpha = 1;
				}
			} else {
				ctx.drawImage(TradeDrawer.CELL_IMG, x + TradeDrawer.CELL_EDGE_OFFSET + 
						i * (TradeDrawer.CELL_POSITION_GAP), y + windowBodyTop + yPos);
				var trade = TradeDrawer._trades[itemIndex++];
				if (trade) {
					// Grayed-out image if cannot trade.
					if (!trade.canTrade()) {
							ctx.globalAlpha = TradeDrawer.CANNOT_TRADE_OPACITY;
					}
					// Only shows first result atm.
					var itemId = trade.results[0].itemId;
					var itemQuantity = trade.results[0].quantity;
					var cellX = x + TradeDrawer.CELL_EDGE_OFFSET + 
							i * (TradeDrawer.CELL_POSITION_GAP);
					var cellY = y + windowBodyTop + yPos;
					ctx.drawImage(Item.getItem(itemId).sprite, cellX, cellY);
					if (itemQuantity > 1) {
						var quantityStr = itemQuantity.toString();
						GlyphDrawer.drawText(ctx, TradeDrawer.QUANTITY_FONT, 
								quantityStr, cellX + TradeDrawer.QUANTITY_OFFSET_X + 
										(TradeDrawer.QUANTITY_MAX_GLYPHS - quantityStr.length) * 
										TradeDrawer.QUANTITY_DELTA_X, 
								cellY + TradeDrawer.QUANTITY_OFFSET_Y, 
								TradeDrawer.CELL_IMG.width - TradeDrawer.QUANTITY_OFFSET_X, 
								TradeDrawer.CELL_IMG.height - TradeDrawer.QUANTITY_OFFSET_Y);
					}
					ctx.globalAlpha = 1;
				}
			}
		}	
	} 
	// Draw Scroll Bar.
	// TODO: disable scroll bar if scrollable pixels is 0.
	TradeDrawer._scrollBar.draw(ctx, x + TradeDrawer.SCROLLBAR_OFFSET_X, 
			y + TradeDrawer.SCROLLBAR_OFFSET_Y);
};


// Draws the confirmation after a called trade is selected.
TradeDrawer._drawConfirmationInterface = function(ctx) {
	// Draw Body.
	ctx.drawImage(TradeDrawer.CONFIRM_BODY_IMG, TradeDrawer.CONFIRM_BODY_X, 
			TradeDrawer.CONFIRM_BODY_Y);
	// Draw Arrows.
	ctx.drawImage(TradeDrawer.CONFIRM_ARROWS_IMG, TradeDrawer.CONFIRM_ARROWS_X, 
			TradeDrawer.CONFIRM_ARROWS_Y);
	// Draw Buttons.
	TradeDrawer._confirmYesButton.draw(ctx, TradeDrawer.CONFIRM_YES_BUTTON_X, 
			TradeDrawer.CONFIRM_YES_BUTTON_Y);
	TradeDrawer._confirmNoButton.draw(ctx, TradeDrawer.CONFIRM_NO_BUTTON_X, 
			TradeDrawer.CONFIRM_NO_BUTTON_Y);
	// Draw Cells and item sprites.
	// Results Cells (Trader/Left side).
	// Draw cell.
	ctx.drawImage(TradeDrawer.CELL_IMG, TradeDrawer.CONFIRM_CELLS_LEFT_X, 
			TradeDrawer.CONFIRM_CELLS_LEFT_Y);
	// Draw item.
	ctx.drawImage(
			Item.getItem(TradeDrawer._selectedTrade.results[0].itemId).sprite, 
			TradeDrawer.CONFIRM_CELLS_LEFT_X, TradeDrawer.CONFIRM_CELLS_LEFT_Y);
	var itemQuantity = TradeDrawer._selectedTrade.results[0].quantity;
	if (itemQuantity > 1) {
		// Draw Quantity.
		var quantityStr = itemQuantity.toString();
		GlyphDrawer.drawText(ctx, TradeDrawer.QUANTITY_FONT, 
				quantityStr, cellX + TradeDrawer.QUANTITY_OFFSET_X + 
						(TradeDrawer.QUANTITY_MAX_GLYPHS - quantityStr.length) * 
						TradeDrawer.QUANTITY_DELTA_X, 
				cellY + TradeDrawer.QUANTITY_OFFSET_Y, 
				TradeDrawer.CELL_IMG.width - TradeDrawer.QUANTITY_OFFSET_X, 
				TradeDrawer.CELL_IMG.height - TradeDrawer.QUANTITY_OFFSET_Y);
	}
	// Ingredients Cells (Right/Player side).
	var cellX = TradeDrawer.CONFIRM_CELLS_RIGHT_X;
	var cellY = TradeDrawer.CONFIRM_CELLS_RIGHT_Y;
	for (var i = 0; i < TradeDrawer.CONFIRM_NUM_ROWS; i++) {
		for (var j = 0; j < TradeDrawer.CONFIRM_CELLS_PER_ROW; (j++) ) {
			var currentIndex = i * TradeDrawer.CONFIRM_CELLS_PER_ROW + j
			// Draw cell.
			ctx.drawImage(TradeDrawer.CELL_IMG, cellX, cellY);
			// Draw item.
			if (TradeDrawer._selectedTrade.ingredients[currentIndex]) {
				ctx.drawImage(Item.getItem(TradeDrawer._selectedTrade.ingredients[
						currentIndex].itemId).sprite, cellX, cellY);
				var itemQuantity = 
						TradeDrawer._selectedTrade.ingredients[currentIndex].quantity;
				if (itemQuantity > 1) {
					// Draw quantity.
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
			cellX += TradeDrawer.CELL_POSITION_GAP;
		}
		cellY += TradeDrawer.CELL_POSITION_GAP;  
		cellX = TradeDrawer.CONFIRM_CELLS_RIGHT_X;
	}
};


TradeDrawer._drawSpeechBubble = function(ctx) {
};


// Maybe draws the igredients list.
TradeDrawer._maybeDrawIngredients = function(ctx) {
// Has the trader show ingredients with speech bubble.
};

// Maybe draws the description.
TradeDrawer._maybeDrawDescription = function(ctx) {
	var trade;
	if (TradeDrawer._currentHoveredCellIndex != null && 
			(trade = TradeDrawer._trades[TradeDrawer._currentHoveredCellIndex])) {
		ctx.drawImage(TradeDrawer.DESCRIPTION_BACK, TradeDrawer.DESCRIPTION_X, 
				TradeDrawer.DESCRIPTION_Y);
		var description = Item.getItem(trade.results[0].itemId).description;
		GlyphDrawer.drawText(ctx, TradeDrawer.DESCRIPTION_FONT, description, 
				TradeDrawer.DESCRIPTION_X, TradeDrawer.DESCRIPTION_Y, 
				TradeDrawer.DESCRIPTION_BACK.width, 
				TradeDrawer.DESCRIPTION_BACK.height);
	}
};


// Helper to get the item slot index of a click location.
TradeDrawer._helperGetTradeSlotFromClickCoords = function(
		normalizedX, normalizedY) {
	var cellDelta = TradeDrawer.CELL_POSITION_GAP;
	if (normalizedX < TradeDrawer.WINDOW_BODY_LEFT || 
			normalizedX >= TradeDrawer.WINDOW_BODY_RIGHT || 
			normalizedY < TradeDrawer.WINDOW_BODY_TOP || 
			normalizedY >= TradeDrawer.WINDOW_BODY_BOT) {
		return -1;
	}
	var pixOffset = TradeDrawer._scrollBar.getScrollFraction() * 
			TradeDrawer._scrollablePixels;
	var cellPositionGap = 
			TradeDrawer.CELL_IMG.height + TradeDrawer.CELL_SPACING;
	var offset = pixOffset % cellPositionGap;
	normalizedX -= TradeDrawer.WINDOW_BODY_LEFT;
	normalizedY += offset - TradeDrawer.WINDOW_BODY_TOP;
	return (normalizedX % cellDelta >= TradeDrawer.CELL_IMG.width || 
			normalizedY % cellDelta >= TradeDrawer.CELL_IMG.height) ? -1 : 
			Math.floor(normalizedX / cellDelta) + 
					Math.floor(normalizedY / cellDelta) * TradeDrawer.CELLS_PER_ROW;
};


