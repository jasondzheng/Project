/**
 * A class responsible for drawing the shop UI. Trde UI includes a maximum of 4
 * portraits, 1 speech bubble, and the view of items for shop.
 */

var ShopDrawer = {};

ShopDrawer.PATH = '../assets/img/ui/shop/';

// Positions of portraits
ShopDrawer.PORTRAIT_1_LEFT = 44;
ShopDrawer.PORTRAIT_2_LEFT = 300;
ShopDrawer.PORTRAIT_3_RIGHT = 1236;
ShopDrawer.PORTRAIT_4_RIGHT = 980;
ShopDrawer.PORTRAIT_BOTTOM = 720;

// Backshade color
ShopDrawer.BACKSHADE_COLOR = 'rgba(0, 0, 0, 0.25)';

ShopDrawer.INGREDIENTS_FONT = 'test';

ShopDrawer.DESCRIPTION_FONT = 'test';

ShopDrawer.QUANTITY_FONT = 'test';

ShopDrawer.CANNOT_BUY_OPACITY = 0.5;

// The position of the quantity text WRT the cell topleft corner.
ShopDrawer.QUANTITY_OFFSET_X = 26;
ShopDrawer.QUANTITY_DELTA_X = 12;
ShopDrawer.QUANTITY_OFFSET_Y = 42;
ShopDrawer.QUANTITY_MAX_GLYPHS = 3;

// Constant assets needed to display a shop.
ShopDrawer.BODY_IMG;
ShopDrawer.CELL_IMG;
ShopDrawer.EXIT_BUTTON_IMG;
ShopDrawer.CONFIRM_YES_BUTTON_IMG;
ShopDrawer.CONFIRM_NO_BUTTON_IMG;
ShopDrawer.CONFIRM_BODY_IMG;
ShopDrawer.CONFIRM_ARROWS_IMG;

ShopDrawer.SCROLL_BAR_MAX_SCROLL = 1000;
ShopDrawer.CELL_EDGE_OFFSET = 12;
ShopDrawer.CELL_SPACING = 8;
ShopDrawer.CELLS_PER_ROW = 4;

ShopDrawer.MIN_ROWS = 6;

ShopDrawer.CONFIRM_NUM_ROWS = 3;
ShopDrawer.CONFIRM_CELLS_PER_ROW = 3;


// Variable assets needed to display a shop.
ShopDrawer._shop;
ShopDrawer._shopContents;
ShopDrawer._leftPortrait1;
ShopDrawer._leftPortrait2;
ShopDrawer._rightPortrait1;
ShopDrawer._rightPortrait2;
ShopDrawer._bubbleSize;
ShopDrawer._bubbleIsFromLeft;
ShopDrawer._message;

// Indicates whether the player has entered a shop.
ShopDrawer.isOpen = false;

// Indicates whether the user has selected a cell to shop.
ShopDrawer._isInConfirmationMode = false;

// Selected resources.
ShopDrawer._selectedItem;
ShopDrawer._selectedItemIndex;

// Button used to exit the shop interface.
ShopDrawer._exitButton;

// Confimation interface buttons.
ShopDrawer._confirmYesButton;
ShopDrawer._confirmNoButton;

ShopDrawer._scrollBar;

// Indicates whether the user is dragging the scroll bubble.
ShopDrawer._isDraggingScroll = false;

ShopDrawer._numCells;
ShopDrawer._numRows;

ShopDrawer._scrollablePixels;

// The last recorded start click position.
ShopDrawer._lastStartClickX;
ShopDrawer._lastStartClickY;

// Old input modes; used to restore previous state before entering shop.
ShopDrawer._oldKeyInputMode;
ShopDrawer._oldMouseInputMode;

ShopDrawer._currentHoveredCellIndex;


ShopDrawer.load = function (callback){
	// Load asstets.
	ImgUtils.loadImages({
		body: ShopDrawer.PATH + 'body.png',
		cell: ShopDrawer.PATH + 'cell.png',
		exitButton: ShopDrawer.PATH + 'exitButton.png',
		descriptionBack: ShopDrawer.PATH + 'descriptionBack.png',
		confirmBody: ShopDrawer.PATH + 'confirmBody.png',
		confirmYesButton: ShopDrawer.PATH + 'confirmYesButton.png',
		confirmNoButton: ShopDrawer.PATH + 'confirmNoButton.png',
		confirmArrows: ShopDrawer.PATH + 'confirmArrows.png'
	}, function(imgs) {
		// Assign loaded image assets.
		ShopDrawer.BODY_IMG = imgs.body;
		ShopDrawer.CELL_IMG = imgs.cell;
		ShopDrawer.EXIT_BUTTON_IMG = imgs.exitButton;
		ShopDrawer.DESCRIPTION_BACK = imgs.descriptionBack;
		ShopDrawer.CONFIRM_BODY_IMG = imgs.confirmBody;
		ShopDrawer.CONFIRM_YES_BUTTON_IMG = imgs.confirmYesButton;
		ShopDrawer.CONFIRM_NO_BUTTON_IMG = imgs.confirmNoButton;
		ShopDrawer.CONFIRM_ARROWS_IMG = imgs.confirmArrows;
		
		// Items/Select Shops interface preparations.
		// Centered coordinates for the body.
		ShopDrawer.BODY_X = 
				(ScreenProps.EXP_WIDTH - ShopDrawer.BODY_IMG.width) / 2;
		ShopDrawer.BODY_Y = 
				(ScreenProps.EXP_HEIGHT - ShopDrawer.BODY_IMG.height) / 2;

		// Window calculations.
		ShopDrawer.WINDOW_BODY_TOP = ShopDrawer.CELL_EDGE_OFFSET;
		ShopDrawer.WINDOW_BODY_BOT = ShopDrawer.BODY_IMG.height -
				ShopDrawer.CELL_EDGE_OFFSET;
		ShopDrawer.WINDOW_BODY_LEFT = ShopDrawer.CELL_EDGE_OFFSET;
		ShopDrawer.WINDOW_BODY_RIGHT = (ShopDrawer.CELLS_PER_ROW - 1) * 
				(ShopDrawer.CELL_IMG.width + ShopDrawer.CELL_SPACING) + 
				ShopDrawer.CELL_IMG.width + ShopDrawer.CELL_EDGE_OFFSET;
		ShopDrawer.WINDOW_BODY_WIDTH =
				ShopDrawer.WINDOW_BODY_RIGHT - ShopDrawer.WINDOW_BODY_LEFT;
		ShopDrawer.WINDOW_BODY_HEIGHT =
				ShopDrawer.WINDOW_BODY_BOT - ShopDrawer.WINDOW_BODY_TOP;

		ShopDrawer._scrollBar = 
				new ScrollBar(ShopDrawer.SCROLL_BAR_MAX_SCROLL, 
						ShopDrawer.BODY_IMG.height - 
								2 * ShopDrawer.CELL_EDGE_OFFSET, false);

		ShopDrawer.CELL_POSITION_GAP =
				ShopDrawer.CELL_IMG.height + ShopDrawer.CELL_SPACING;

		ShopDrawer.SCROLLBAR_OFFSET_X = ShopDrawer.CELL_EDGE_OFFSET * 2 + 
				ShopDrawer.CELLS_PER_ROW * ShopDrawer.CELL_IMG.width + 
				(ShopDrawer.CELLS_PER_ROW - 1) * ShopDrawer.CELL_SPACING + 6;
		ShopDrawer.SCROLLBAR_OFFSET_Y = ShopDrawer.CELL_EDGE_OFFSET;

		ShopDrawer._exitButton = 
				new Button(ShopDrawer.EXIT_BUTTON_IMG, true, function() {
					ShopDrawer.exitShop();
				});

		ShopDrawer.EXIT_BUTTON_X = 
				(ScreenProps.EXP_WIDTH - ShopDrawer.EXIT_BUTTON_IMG.width) / 2;
		ShopDrawer.EXIT_BUTTON_Y = ScreenProps.EXP_HEIGHT - 100;

		ShopDrawer.DESCRIPTION_X = ShopDrawer.BODY_X - imgs.descriptionBack.width;
		ShopDrawer.DESCRIPTION_Y = ShopDrawer.BODY_Y;

		// Confirmation dialog-specific preparations.
		ShopDrawer.CONFIRM_BODY_X = 
				(ScreenProps.EXP_WIDTH - imgs.confirmBody.width) / 2;
		ShopDrawer.CONFIRM_BODY_Y = 
				(ScreenProps.EXP_HEIGHT - imgs.confirmBody.height) / 2;

		ShopDrawer.CONFIRM_ARROWS_X = ShopDrawer.CONFIRM_BODY_X +
				(ShopDrawer.CONFIRM_BODY_IMG.width - 
						ShopDrawer.CONFIRM_ARROWS_IMG.width) / 2;

		ShopDrawer.CONFIRM_ARROWS_Y = ShopDrawer.CONFIRM_BODY_Y +
				(ShopDrawer.CONFIRM_BODY_IMG.height - 
						ShopDrawer.CONFIRM_ARROWS_IMG.height) / 2;

		// Starting coordinates for the shop results cell.
		ShopDrawer.CONFIRM_CELLS_LEFT_X = ShopDrawer.CONFIRM_BODY_X + 
				ShopDrawer.CELL_EDGE_OFFSET + ShopDrawer.CELL_POSITION_GAP;

		ShopDrawer.CONFIRM_CELLS_LEFT_Y = ShopDrawer.CONFIRM_BODY_Y + 
				ShopDrawer.CELL_EDGE_OFFSET + ShopDrawer.CELL_POSITION_GAP;

		// Starting coordinates for the ingredients results cells.
		ShopDrawer.CONFIRM_CELLS_RIGHT_X = ShopDrawer.CONFIRM_ARROWS_X + 
				ShopDrawer.CONFIRM_ARROWS_IMG.width + ShopDrawer.CELL_EDGE_OFFSET;

		ShopDrawer.CONFIRM_CELLS_RIGHT_Y = ShopDrawer.CONFIRM_BODY_Y + 
				ShopDrawer.CELL_EDGE_OFFSET;

		ShopDrawer._confirmYesButton = 
				new Button(ShopDrawer.CONFIRM_YES_BUTTON_IMG, true, function() {
					ShopDrawer._selectedItem.applyShop();
				});

		ShopDrawer.CONFIRM_YES_BUTTON_X = ScreenProps.EXP_WIDTH / 2 - 
				ShopDrawer.CELL_EDGE_OFFSET - ShopDrawer.CONFIRM_YES_BUTTON_IMG.width;

		ShopDrawer.CONFIRM_YES_BUTTON_Y = ShopDrawer.CONFIRM_BODY_Y + 
				ShopDrawer.CONFIRM_BODY_IMG.height + ShopDrawer.CELL_EDGE_OFFSET;

		ShopDrawer._confirmNoButton = 
				new Button(ShopDrawer.CONFIRM_NO_BUTTON_IMG, true, function() {
					ShopDrawer._isInConfirmationMode = false;
				});

		ShopDrawer.CONFIRM_NO_BUTTON_X = ScreenProps.EXP_WIDTH / 2 + 
				ShopDrawer.CELL_EDGE_OFFSET;

		ShopDrawer.CONFIRM_NO_BUTTON_Y = ShopDrawer.CONFIRM_BODY_Y + 
				ShopDrawer.CONFIRM_BODY_IMG.height + ShopDrawer.CELL_EDGE_OFFSET;
		
		//TODO: make values constants
		ShopDrawer._valuePicker = new ValuePicker(300, 1, 999);
	});
	callback();
};


// Used to set up the shop to be shown. 
ShopDrawer.displayShop = function(shop, leftPortrait1, leftPortrait2, 
		rightPortrait1, rightPortrait2, bubbleSize, bubbleIsFromLeft, message) {
	ShopDrawer._shop = shop;
	ShopDrawer._shopContents = shop.shopContents;
	ShopDrawer._leftPortrait1 = leftPortrait1;
	ShopDrawer._leftPortrait2 = leftPortrait2;
	ShopDrawer._rightPortrait1 = rightPortrait1;
	ShopDrawer._rightPortrait2 = rightPortrait2;
	ShopDrawer._bubbleSize = bubbleSize;
	ShopDrawer._bubbleIsFromLeft = bubbleIsFromLeft;
	ShopDrawer._message = message;
	
	// Number of rows.
	ShopDrawer._numRows = Math.max(ShopDrawer.MIN_ROWS, 
			Math.ceil(ShopDrawer._shopContents.length / ShopDrawer.CELLS_PER_ROW));

	// Number of drawn item cells.
	ShopDrawer._numCells = ShopDrawer._numRows * ShopDrawer.CELLS_PER_ROW;
	
	ShopDrawer._scrollablePixels = ShopDrawer._numRows * 
			ShopDrawer.CELL_IMG.height + (ShopDrawer._numRows - 1) * 
			ShopDrawer.CELL_SPACING - ShopDrawer.WINDOW_BODY_HEIGHT;

	// Reset the scroll.
	ShopDrawer._scrollBar.setScrollFraction = 0;

	// Disable/enable the scroll bar based on if its needed.
	if (ShopDrawer._scrollablePixels == 0) {
		ShopDrawer._scrollBar.disable();
	} else {
		ShopDrawer._scrollBar.enable();
	}

	ShopDrawer.isOpen = true;
	ShopDrawer._oldKeyInputMode = KeyInputRouter.getMode();
	ShopDrawer._oldMouseInputMode = MouseInputRouter.getMode();
	KeyInputRouter.setMode(KeyInputRouter.Modes.DISABLED);
	MouseInputRouter.setMode(MouseInputRouter.Modes.SHOP_INPUT);
};


// Exits the current shop.
ShopDrawer.exitShop = function() {
	ShopDrawer._shop = null;
	ShopDrawer._shopContents = null;
	ShopDrawer._leftPortrait1 = null;
	ShopDrawer._leftPortrait2 = null;
	ShopDrawer._rightPortrait1 = null;
	ShopDrawer._rightPortrait2 = null;
	ShopDrawer._bubbleSize = null;
	ShopDrawer._bubbleIsFromLeft = null;
	ShopDrawer._message = null;

	ShopDrawer._numRows = null;

	ShopDrawer._numCells = null;

	ShopDrawer._scrollablePixels = null;

	ShopDrawer._selectedItem = null;
	ShopDrawer._selectedItemIndex = null;

	ShopDrawer.isOpen = false;
	KeyInputRouter.setMode(ShopDrawer._oldKeyInputMode);
	MouseInputRouter.setMode(ShopDrawer._oldMouseInputMode);
	ShopDrawer._oldKeyInputMode = null;
	ShopDrawer._oldMouseInputMode = null;
};


ShopDrawer.updateCurrentScroll = function(delta) {
	ShopDrawer._scrollBar.updateScroll(delta);
};


ShopDrawer.onStartClick = function(x, y) {
	if (!ShopDrawer._isInConfirmationMode) {
		ShopDrawer._lastStartClickX = x;
		ShopDrawer._lastStartClickY = y;
		var normalizedX = x - ShopDrawer.BODY_X;
		var normalizedY = y - ShopDrawer.BODY_Y;
		// If in scroll bubble, set scroll mode.
		if (ShopDrawer._scrollBar.isInBubble(
				normalizedX - ShopDrawer.SCROLLBAR_OFFSET_X,
				normalizedY - ShopDrawer.SCROLLBAR_OFFSET_Y)) {
			ShopDrawer._isDraggingScroll = true;
		}
	}
};


ShopDrawer.onDrag = function(x, y) {
	if (!ShopDrawer._isInConfirmationMode) {
		var normalizedX = x - ShopDrawer.BODY_X;
		var normalizedY = y - ShopDrawer.BODY_Y;
		// If in scroll mode, update scrollbar.
		if (ShopDrawer._isDraggingScroll) {
			ShopDrawer._scrollBar.updateScrollFromDrag(
					normalizedX - ShopDrawer.SCROLLBAR_OFFSET_X,
					normalizedY - ShopDrawer.SCROLLBAR_OFFSET_Y);
		}
	}
};


ShopDrawer.onEndClick = function(x, y, isDoubleClick) {
	var startAndEndSameLoc = 
			Math.abs(ShopDrawer._lastStartClickX - x) < 
					MouseTracker.SAME_LOC_TOLERANCE && 
			Math.abs(ShopDrawer._lastStartClickY - y) < 
					MouseTracker.SAME_LOC_TOLERANCE;
	if (ShopDrawer._isInConfirmationMode) {
		if (ShopDrawer._confirmYesButton.isInButton(
				x - ShopDrawer.CONFIRM_YES_BUTTON_X, 
				y - ShopDrawer.CONFIRM_YES_BUTTON_Y)) {
			ShopDrawer._shop.buy();
			ShopDrawer._isInConfirmationMode = false;
		} else if (ShopDrawer._confirmNoButton.isInButton(
				x - ShopDrawer.CONFIRM_NO_BUTTON_X,
				y - ShopDrawer.CONFIRM_NO_BUTTON_Y)) {
			ShopDrawer._isInConfirmationMode = false;
		}
	} else {
		var normalizedX = x - ShopDrawer.BODY_X;
		var normalizedY = y - ShopDrawer.BODY_Y;
		var possibleCellIndex;
		if ((possibleCellIndex =
				ShopDrawer._helperGetShopSlotFromClickCoords(
						normalizedX, normalizedY)) != -1 && startAndEndSameLoc) {
			if (ShopDrawer._shopContents[possibleCellIndex] && 
					ShopDrawer._shop.canBuyItemAtIndex(possibleCellIndex)) {
				var selectedItemId = ShopDrawer._shopContents[possibleCellIndex];
				ShopDrawer._selectedItem = Item.getItem(selectedItemId);
				ShopDrawer._selectedItemIndex = possibleCellIndex
				ShopDrawer._isInConfirmationMode = true;
			}
		} else if (ShopDrawer._scrollBar.isInLine(
				normalizedX - ShopDrawer.SCROLLBAR_OFFSET_X,
				normalizedY - ShopDrawer.SCROLLBAR_OFFSET_Y) && startAndEndSameLoc) {
			ShopDrawer._scrollBar.updateScrollFromDrag(
					normalizedX - ShopDrawer.SCROLLBAR_OFFSET_X,
					normalizedY - ShopDrawer.SCROLLBAR_OFFSET_Y);
		} else if (ShopDrawer._exitButton.isInButton(x - ShopDrawer.EXIT_BUTTON_X, 
				y - ShopDrawer.EXIT_BUTTON_Y) && startAndEndSameLoc) {
			ShopDrawer._exitButton.onClick();
		} else if (ShopDrawer._valuePicker.scrollBar.isInLine(
				x - ShopDrawer.CONFIRM_BODY_X,
				y - (ShopDrawer.CONFIRM_BODY_Y + ValuePicker.SCROLL_BAR_Y_OFFSET)) && startAndEndSameLoc) {
			// TEST
			ShopDrawer._valuePicker.scrollBar.updateScrollFromDrag(
					x - ShopDrawer.CONFIRM_BODY_X,
					y - (ShopDrawer.CONFIRM_BODY_Y + ValuePicker.SCROLL_BAR_Y_OFFSET));
		}
	}
	ShopDrawer._isDraggingScroll = false;
};


ShopDrawer.onHover = function(x, y) {
	var normalizedX = x - ShopDrawer.BODY_X;
	var normalizedY = y - ShopDrawer.BODY_Y;
	var possibleCellIndex;
	if (!ShopDrawer._isInConfirmationMode &&
			(possibleCellIndex = 
					ShopDrawer._helperGetShopSlotFromClickCoords(normalizedX, 
					normalizedY)) != -1) {
		ShopDrawer._currentHoveredCellIndex = possibleCellIndex;
	} else {
		ShopDrawer._currentHoveredCellIndex = null;
	}
};


// Draws the entire Shop UI overlay
ShopDrawer.drawShopOverlay = function(ctx) {
	if (ShopDrawer.isOpen) {
		// draw stuff here
		// Draw a backshade before drawing any other shop components
		ctx.fillStyle = ShopDrawer.BACKSHADE_COLOR;
		ctx.fillRect(0, 0, ScreenProps.EXP_WIDTH, ScreenProps.EXP_HEIGHT);
		// Draw Portraits
		ShopDrawer._drawPortraits(ctx);

		if (ShopDrawer._isInConfirmationMode) {
			ShopDrawer._drawConfirmationInterface(ctx);
		} else {
			// Draw shop items
			ShopDrawer._drawItemsInterface(ctx, ShopDrawer.BODY_X, 
					ShopDrawer.BODY_Y);
			// Draw possible overlay with ingredients list
			ShopDrawer._maybeDrawIngredients(ctx);
			ShopDrawer._maybeDrawDescription(ctx);
			ShopDrawer._exitButton.draw(ctx, ShopDrawer.EXIT_BUTTON_X, 
				ShopDrawer.EXIT_BUTTON_Y);
		}

		// TEST
		ShopDrawer._valuePicker.draw(ctx, ShopDrawer.CONFIRM_BODY_X, 
				ShopDrawer.CONFIRM_BODY_Y);
	}
};


// Draws the portraits of the Shop UI overlay
ShopDrawer._drawPortraits = function(ctx) {
	if (ShopDrawer._leftPortrait1) {
		ctx.drawImage(ShopDrawer._leftPortrait1, DialogDrawer.PORTRAIT_1_LEFT, 
				DialogDrawer.PORTRAIT_BOTTOM - ShopDrawer._leftPortrait1.height);
	}
	if (ShopDrawer._leftPortrait2) {
		ctx.drawImage(ShopDrawer._leftPortrait2, DialogDrawer.PORTRAIT_2_LEFT, 
				DialogDrawer.PORTRAIT_BOTTOM - ShopDrawer._leftPortrait2.height);
	}
	if (ShopDrawer._rightPortrait1) {
		ctx.drawImage(ShopDrawer._rightPortrait1, 
				DialogDrawer.PORTRAIT_3_RIGHT - ShopDrawer._rightPortrait1.width, 
				DialogDrawer.PORTRAIT_BOTTOM - ShopDrawer._rightPortrait1.height);
	}
	if (ShopDrawer._rightPortrait2) {
		ctx.drawImage(ShopDrawer._rightPortrait2, 
				DialogDrawer.PORTRAIT_4_RIGHT - ShopDrawer._rightPortrait2.width,
				DialogDrawer.PORTRAIT_BOTTOM - ShopDrawer._rightPortrait2.height);
	}
};


// Draws the Items View/Interface of the Shop UI overlay
// TODO: make the price labeling distinct from the existing quantity labels
ShopDrawer._drawItemsInterface = function(ctx, x, y) {
	// Draw Body.
	ctx.drawImage(ShopDrawer.BODY_IMG, x, y);
	// Draw Cells.
	var fraction = ShopDrawer._scrollBar.getScrollFraction();
	var pixOffset = fraction * ShopDrawer._scrollablePixels;
	var offset = pixOffset % ShopDrawer.CELL_POSITION_GAP;
	var itemIndex = Math.floor(pixOffset / ShopDrawer.CELL_POSITION_GAP) * 
			ShopDrawer.CELLS_PER_ROW;
	var cellHeight = ShopDrawer.CELL_IMG.height;
	var windowY = ShopDrawer.WINDOW_BODY_HEIGHT;
	var windowBodyTop = ShopDrawer.WINDOW_BODY_TOP;
	for (var yPos = -offset, 
			nextYPos = yPos + cellHeight + ShopDrawer.CELL_SPACING; 
			yPos < windowY; (yPos = nextYPos) && 
					(nextYPos += cellHeight + ShopDrawer.CELL_SPACING)) {
		for (var i = 0; i < ShopDrawer.CELLS_PER_ROW; i++) {
			if (yPos < 0) {
				var cellWidth = ShopDrawer.CELL_IMG.width;
				var cellPartialHeight = ShopDrawer.CELL_IMG.height + yPos;
				ctx.drawImage(ShopDrawer.CELL_IMG, 0, -yPos, cellWidth, 
						cellPartialHeight, x + ShopDrawer.CELL_EDGE_OFFSET + 
								i * (ShopDrawer.CELL_POSITION_GAP), 
						y + windowBodyTop, cellWidth, cellPartialHeight);
				var itemId = ShopDrawer._shopContents[itemIndex];
				if (itemId) {
					// Grayed-out image if cannot shop.
					if (!ShopDrawer._shop.canBuyItemAtIndex(itemIndex, 1)) {
						ctx.globalAlpha = ShopDrawer.CANNOT_BUY_OPACITY;
					}
					// Draw item
					var item = Item.getItem(itemId);
					var cellX = x + ShopDrawer.CELL_EDGE_OFFSET + 
							i * (ShopDrawer.CELL_POSITION_GAP);
					var drawY = y + windowBodyTop;
					ctx.drawImage(item.sprite, 0, -yPos, cellWidth, 
							cellPartialHeight, cellX, drawY, cellWidth, cellPartialHeight);
					// Draw price
					var cellY = drawY + yPos;
					var clipY = -yPos;
					var priceStr = (item.price).toString();
					GlyphDrawer.drawCutText(ctx, ShopDrawer.QUANTITY_FONT, priceStr, 
							cellX, drawY, 0, clipY, 
							ShopDrawer.CELL_IMG.width, cellPartialHeight);
					// Reset alpha
					ctx.globalAlpha = 1;
				}
			} else if (nextYPos >= windowY) {
				var cellWidth = ShopDrawer.CELL_IMG.width;
				var cellPartialHeight = Math.min(windowY - yPos, 
						ShopDrawer.CELL_IMG.height);
				ctx.drawImage(ShopDrawer.CELL_IMG, 0, 0, cellWidth, 
						cellPartialHeight, x + ShopDrawer.CELL_EDGE_OFFSET + 
								i * (ShopDrawer.CELL_POSITION_GAP), 
						y + windowBodyTop + yPos, cellWidth, cellPartialHeight);
				var itemId = ShopDrawer._shopContents[itemIndex];
				if (itemId) {
					// Grayed-out image if cannot shop.
					if (!ShopDrawer._shop.canBuyItemAtIndex(itemIndex, 1)) {
						ctx.globalAlpha = ShopDrawer.CANNOT_BUY_OPACITY;
					}
					// Draw item
					var item = Item.getItem(itemId);
					var cellX = x + ShopDrawer.CELL_EDGE_OFFSET + 
							i * (ShopDrawer.CELL_POSITION_GAP);
					var cellY = y + windowBodyTop + yPos;
					ctx.drawImage(item.sprite, 0, 0, cellWidth, 
							cellPartialHeight, cellX, cellY, cellWidth, cellPartialHeight);
					// Draw price
					var priceStr = (item.price).toString();
					GlyphDrawer.drawCutText(ctx, ShopDrawer.QUANTITY_FONT, priceStr, 
							cellX, cellY, 0, 0, ShopDrawer.CELL_IMG.width, cellPartialHeight);
					// Reset alpha
					ctx.globalAlpha = 1;
				}
			} else {
				ctx.drawImage(ShopDrawer.CELL_IMG, x + ShopDrawer.CELL_EDGE_OFFSET + 
						i * (ShopDrawer.CELL_POSITION_GAP), y + windowBodyTop + yPos);
				var itemId = ShopDrawer._shopContents[itemIndex];
				if (itemId) {
					// Grayed-out image if cannot shop.
					if (!ShopDrawer._shop.canBuyItemAtIndex(itemIndex, 1)) {
						ctx.globalAlpha = ShopDrawer.CANNOT_BUY_OPACITY;
					}
					// Draw item
					var item = Item.getItem(itemId);
					var cellX = x + ShopDrawer.CELL_EDGE_OFFSET + 
							i * (ShopDrawer.CELL_POSITION_GAP);
					var cellY = y + windowBodyTop + yPos;
					ctx.drawImage(item.sprite, cellX, cellY);
					// Draw price
					var priceStr = (item.price).toString();
					GlyphDrawer.drawText(ctx, ShopDrawer.QUANTITY_FONT, priceStr, cellX, 
							cellY, ShopDrawer.CELL_IMG.width, ShopDrawer.CELL_IMG.height);
					// Reset alpha
					ctx.globalAlpha = 1;
				}
			}
			itemIndex++;
		}	
	} 
	// Draw Scroll Bar.
	// TODO: disable scroll bar if scrollable pixels is 0.
	ShopDrawer._scrollBar.draw(ctx, x + ShopDrawer.SCROLLBAR_OFFSET_X, 
			y + ShopDrawer.SCROLLBAR_OFFSET_Y);
};


// Draws the confirmation after a called shop is selected.
ShopDrawer._drawConfirmationInterface = function(ctx) {
	// Draw Body.
	ctx.drawImage(ShopDrawer.CONFIRM_BODY_IMG, ShopDrawer.CONFIRM_BODY_X, 
			ShopDrawer.CONFIRM_BODY_Y);
	// Draw Arrows.
	ctx.drawImage(ShopDrawer.CONFIRM_ARROWS_IMG, ShopDrawer.CONFIRM_ARROWS_X, 
			ShopDrawer.CONFIRM_ARROWS_Y);
	// Draw Buttons.
	ShopDrawer._confirmYesButton.draw(ctx, ShopDrawer.CONFIRM_YES_BUTTON_X, 
			ShopDrawer.CONFIRM_YES_BUTTON_Y);
	ShopDrawer._confirmNoButton.draw(ctx, ShopDrawer.CONFIRM_NO_BUTTON_X, 
			ShopDrawer.CONFIRM_NO_BUTTON_Y);
	// Draw Cells and item sprites.
	// Results Cells (Shopr/Left side).
	// Draw cell.
	ctx.drawImage(ShopDrawer.CELL_IMG, ShopDrawer.CONFIRM_CELLS_LEFT_X, 
			ShopDrawer.CONFIRM_CELLS_LEFT_Y);
	// Draw item.
	ctx.drawImage(
			Item.getItem(ShopDrawer._selectedItem.results[0].itemId).sprite, 
			ShopDrawer.CONFIRM_CELLS_LEFT_X, ShopDrawer.CONFIRM_CELLS_LEFT_Y);
	var itemQuantity = ShopDrawer._selectedItem.results[0].quantity;
	if (itemQuantity > 1) {
		// Draw Quantity.
		var quantityStr = itemQuantity.toString();
		GlyphDrawer.drawText(ctx, ShopDrawer.QUANTITY_FONT, 
				quantityStr, cellX + ShopDrawer.QUANTITY_OFFSET_X + 
						(ShopDrawer.QUANTITY_MAX_GLYPHS - quantityStr.length) * 
						ShopDrawer.QUANTITY_DELTA_X, 
				cellY + ShopDrawer.QUANTITY_OFFSET_Y, 
				ShopDrawer.CELL_IMG.width - ShopDrawer.QUANTITY_OFFSET_X, 
				ShopDrawer.CELL_IMG.height - ShopDrawer.QUANTITY_OFFSET_Y);
	}
	// Ingredients Cells (Right/Player side).
	var cellX = ShopDrawer.CONFIRM_CELLS_RIGHT_X;
	var cellY = ShopDrawer.CONFIRM_CELLS_RIGHT_Y;
	for (var i = 0; i < ShopDrawer.CONFIRM_NUM_ROWS; i++) {
		for (var j = 0; j < ShopDrawer.CONFIRM_CELLS_PER_ROW; (j++) ) {
			var currentIndex = i * ShopDrawer.CONFIRM_CELLS_PER_ROW + j
			// Draw cell.
			ctx.drawImage(ShopDrawer.CELL_IMG, cellX, cellY);
			// Draw item.
			if (ShopDrawer._selectedItem.ingredients[currentIndex]) {
				ctx.drawImage(Item.getItem(ShopDrawer._selectedItem.ingredients[
						currentIndex].itemId).sprite, cellX, cellY);
				var itemQuantity = 
						ShopDrawer._selectedItem.ingredients[currentIndex].quantity;
				if (itemQuantity > 1) {
					// Draw quantity.
					var quantityStr = itemQuantity.toString();
					GlyphDrawer.drawText(ctx, ShopDrawer.QUANTITY_FONT, 
							quantityStr, cellX + ShopDrawer.QUANTITY_OFFSET_X + 
									(ShopDrawer.QUANTITY_MAX_GLYPHS - quantityStr.length) * 
									ShopDrawer.QUANTITY_DELTA_X, 
							cellY + ShopDrawer.QUANTITY_OFFSET_Y, 
							ShopDrawer.CELL_IMG.width - ShopDrawer.QUANTITY_OFFSET_X, 
							ShopDrawer.CELL_IMG.height - ShopDrawer.QUANTITY_OFFSET_Y);
				}
			}
			cellX += ShopDrawer.CELL_POSITION_GAP;
		}
		cellY += ShopDrawer.CELL_POSITION_GAP;  
		cellX = ShopDrawer.CONFIRM_CELLS_RIGHT_X;
	}
};


ShopDrawer._drawSpeechBubble = function(ctx) {
};


// Maybe draws the igredients list.
ShopDrawer._maybeDrawIngredients = function(ctx) {
// Has the shopr show ingredients with speech bubble.
};

// Maybe draws the description.
ShopDrawer._maybeDrawDescription = function(ctx) {
	var itemId;
	if (ShopDrawer._currentHoveredCellIndex != null && 
			(itemId = ShopDrawer._shopContents[ShopDrawer._currentHoveredCellIndex])) {
		ctx.drawImage(ShopDrawer.DESCRIPTION_BACK, ShopDrawer.DESCRIPTION_X, 
				ShopDrawer.DESCRIPTION_Y);
		var description = Item.getItem(itemId).description;
		GlyphDrawer.drawText(ctx, ShopDrawer.DESCRIPTION_FONT, description, 
				ShopDrawer.DESCRIPTION_X, ShopDrawer.DESCRIPTION_Y, 
				ShopDrawer.DESCRIPTION_BACK.width, 
				ShopDrawer.DESCRIPTION_BACK.height);
	}
};


// Helper to get the item slot index of a click location.
ShopDrawer._helperGetShopSlotFromClickCoords = function(
		normalizedX, normalizedY) {
	var cellDelta = ShopDrawer.CELL_POSITION_GAP;
	if (normalizedX < ShopDrawer.WINDOW_BODY_LEFT || 
			normalizedX >= ShopDrawer.WINDOW_BODY_RIGHT || 
			normalizedY < ShopDrawer.WINDOW_BODY_TOP || 
			normalizedY >= ShopDrawer.WINDOW_BODY_BOT) {
		return -1;
	}
	var pixOffset = ShopDrawer._scrollBar.getScrollFraction() * 
			ShopDrawer._scrollablePixels;
	var cellPositionGap = 
			ShopDrawer.CELL_IMG.height + ShopDrawer.CELL_SPACING;
	var offset = pixOffset % cellPositionGap;
	normalizedX -= ShopDrawer.WINDOW_BODY_LEFT;
	normalizedY += offset - ShopDrawer.WINDOW_BODY_TOP;
	return (normalizedX % cellDelta >= ShopDrawer.CELL_IMG.width || 
			normalizedY % cellDelta >= ShopDrawer.CELL_IMG.height) ? -1 : 
			Math.floor(normalizedX / cellDelta) + 
					Math.floor(normalizedY / cellDelta) * ShopDrawer.CELLS_PER_ROW;
};