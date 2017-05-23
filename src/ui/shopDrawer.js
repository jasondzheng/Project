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

ShopDrawer.DIALOG_FONT = 'test';

ShopDrawer.DESCRIPTION_FONT = 'test';

ShopDrawer.QUANTITY_FONT = 'test';

ShopDrawer.PRICE_FONT = 'test';

ShopDrawer.CANNOT_BUY_OPACITY = 0.5;

ShopDrawer.CANNOT_SELL_OPACITY = 0.5;

// The position of the quantity text WRT the cell topleft corner.
ShopDrawer.QUANTITY_OFFSET_X = 26;
ShopDrawer.QUANTITY_DELTA_X = 12;
ShopDrawer.QUANTITY_OFFSET_Y = 42;
ShopDrawer.QUANTITY_MAX_GLYPHS = 3;

// Padding for the money glyphs WRT top left corner of money back.
ShopDrawer.MONEY_OFFSET_X = 10;
ShopDrawer.MONEY_OFFSET_Y = 10;
ShopDrawer.MONEY_DELTA_X = 12;

// Max number of money glyphs.
ShopDrawer.MONEY_MAX_GLYPHS = 24;

// The font to draw money in the inventory display.
ShopDrawer.MONEY_FONT = 'test';

// Constant assets needed to display a shop.
ShopDrawer.BODY_IMG;
ShopDrawer.CELL_IMG;
ShopDrawer.EXIT_BUTTON_IMG;
ShopDrawer.SELL_BUTTON_IMG;
ShopDrawer.BUY_BUTTON_IMG;
ShopDrawer.DESCRIPTION_BACK;
ShopDrawer.MONEY_BACK_IMG;
ShopDrawer.CONFIRM_BODY_IMG;
ShopDrawer.CONFIRM_YES_BUTTON_IMG;
ShopDrawer.CONFIRM_NO_BUTTON_IMG;

ShopDrawer.SCROLL_BAR_MAX_SCROLL = 1000;
ShopDrawer.CELL_EDGE_OFFSET = 12;
ShopDrawer.CELL_SPACING = 8;
ShopDrawer.CELLS_PER_ROW = 4;

ShopDrawer.MIN_ROWS = 6;

ShopDrawer.CONFIRM_NUM_ROWS = 3;
ShopDrawer.CONFIRM_CELLS_PER_ROW = 3;

ShopDrawer.DialogueModes = {
	WELCOME_BUY: 0,
	WELCOME_SELL: 1,
	CONFIRM_BUY: 2,
	CONFIRM_SELL: 3,
	THANKS_BUY: 4,
	THANKS_SELL: 5
};

ShopDrawer._currDialogueMode;

// Variable assets needed to display a shop.
ShopDrawer._shop;
ShopDrawer._shopContents;
ShopDrawer._sellEntries;
ShopDrawer._leftPortrait1;
ShopDrawer._leftPortrait2;
ShopDrawer._rightPortrait1;
ShopDrawer._rightPortrait2;
ShopDrawer._welcomeMessageBuy;
ShopDrawer._thanksMessageBuy;
ShopDrawer._welcomeMessageSell;
ShopDrawer._thanksMessageSell;

// Indicates whether the player has entered a shop.
ShopDrawer.isOpen = false;

// Indicates whether the user has selected a cell to shop.
ShopDrawer._isInConfirmationMode = false;

// Indicates the type of shop.
ShopDrawer._isEquipShop;

// Indicates the current buy/sell mode of shop.
ShopDrawer._isBuying = true;

// Selected resources.
ShopDrawer._selectedItem;
ShopDrawer._selectedItemIndex;

// Buttons used to toggle between sell/buy modes.
ShopDrawer._sellButton;
ShopDrawer._buyButton;

// Button used to exit the shop interface.
ShopDrawer._exitButton;

// Confimation interface buttons.
ShopDrawer._confirmYesButton;
ShopDrawer._confirmNoButton;

// Value picker for the confirmation interface.
ShopDrawer._valuePicker;

ShopDrawer._buyScrollBar;
ShopDrawer._sellScrollBar;

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
		sellButton: ShopDrawer.PATH + 'sellButton.png',
		buyButton: ShopDrawer.PATH + 'buyButton.png',
		descriptionBack: ShopDrawer.PATH + 'descriptionBack.png',
		moneyBack: ShopDrawer.PATH + 'moneyBack.png',
		confirmBody: ShopDrawer.PATH + 'confirmBody.png',
		confirmYesButton: ShopDrawer.PATH + 'confirmYesButton.png',
		confirmNoButton: ShopDrawer.PATH + 'confirmNoButton.png'
	}, function(imgs) {
		// Assign loaded image assets.
		ShopDrawer.BODY_IMG = imgs.body;
		ShopDrawer.CELL_IMG = imgs.cell;
		ShopDrawer.EXIT_BUTTON_IMG = imgs.exitButton;
		ShopDrawer.SELL_BUTTON_IMG = imgs.sellButton;
		ShopDrawer.BUY_BUTTON_IMG = imgs.buyButton;
		ShopDrawer.DESCRIPTION_BACK = imgs.descriptionBack;
		ShopDrawer.MONEY_BACK_IMG = imgs.moneyBack;
		ShopDrawer.CONFIRM_BODY_IMG = imgs.confirmBody;
		ShopDrawer.CONFIRM_YES_BUTTON_IMG = imgs.confirmYesButton;
		ShopDrawer.CONFIRM_NO_BUTTON_IMG = imgs.confirmNoButton;

		// Items/Select Shops interface preparations.
		// Centered coordinates for the body.
		ShopDrawer.BODY_X = 
				(ScreenProps.EXP_WIDTH - ShopDrawer.BODY_IMG.width) / 2;
		ShopDrawer.BODY_Y = 
				(ScreenProps.EXP_HEIGHT - ShopDrawer.BODY_IMG.height) / 2;

		ShopDrawer.MONEY_X = ShopDrawer.BODY_X;
		ShopDrawer.MONEY_Y = ShopDrawer.BODY_Y + ShopDrawer.BODY_IMG.height;

		ShopDrawer.SPEECH_BUBBLE_TEXT_OFFSET_X = 
				DialogDrawer.SPEECH_BUBBLE_CONSTRAINTS.offX;
		ShopDrawer.SPEECH_BUBBLE_TEXT_OFFSET_Y = 
				DialogDrawer.SPEECH_BUBBLE_CONSTRAINTS.offY;

		ShopDrawer.SPEECH_BUBBLE_X = ShopDrawer.BODY_X + 
				ShopDrawer.BODY_IMG.width + 30 /*Maybe make constant*/;
		ShopDrawer.SPEECH_BUBBLE_Y = DialogDrawer.RIGHT_BUBBLE_ANCHOR.y;

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

		ShopDrawer._buyScrollBar = 
				new ScrollBar(ShopDrawer.SCROLL_BAR_MAX_SCROLL, 
						ShopDrawer.BODY_IMG.height - 
								2 * ShopDrawer.CELL_EDGE_OFFSET, false);

		ShopDrawer._sellScrollBar = 
				new ScrollBar(ShopDrawer.SCROLL_BAR_MAX_SCROLL, 
						ShopDrawer.BODY_IMG.height - 
								2 * ShopDrawer.CELL_EDGE_OFFSET, false);

		ShopDrawer.CELL_POSITION_GAP =
				ShopDrawer.CELL_IMG.height + ShopDrawer.CELL_SPACING;

		ShopDrawer.SCROLLBAR_OFFSET_X = ShopDrawer.CELL_EDGE_OFFSET * 2 + 
				ShopDrawer.CELLS_PER_ROW * ShopDrawer.CELL_IMG.width + 
				(ShopDrawer.CELLS_PER_ROW - 1) * ShopDrawer.CELL_SPACING + 6;
		ShopDrawer.SCROLLBAR_OFFSET_Y = ShopDrawer.CELL_EDGE_OFFSET;

		ShopDrawer.NUM_ITEM_ROWS = Inventory.NUM_ITEM_SLOTS / 
				ShopDrawer.CELLS_PER_ROW;
		ShopDrawer.NUM_EQUIP_ROWS = Inventory.NUM_EQUIP_SLOTS / 
				ShopDrawer.CELLS_PER_ROW;

		// Scrollable pixels for the selling mode cells
		ShopDrawer.SELL_SCROLLABLE_PIXELS = ShopDrawer.NUM_ITEM_ROWS * 
				ShopDrawer.CELL_IMG.height + (ShopDrawer.NUM_ITEM_ROWS - 1) * 
				ShopDrawer.CELL_SPACING - ShopDrawer.WINDOW_BODY_HEIGHT;

		ShopDrawer._exitButton = 
				new Button(ShopDrawer.EXIT_BUTTON_IMG, true, function() {
					ShopDrawer.exitShop();
				});

		ShopDrawer.EXIT_BUTTON_X = 
				(ScreenProps.EXP_WIDTH - ShopDrawer.EXIT_BUTTON_IMG.width) / 2;
		ShopDrawer.EXIT_BUTTON_Y = ScreenProps.EXP_HEIGHT - 100;

		ShopDrawer.DESCRIPTION_X = ShopDrawer.BODY_X - imgs.descriptionBack.width;
		ShopDrawer.DESCRIPTION_Y = ShopDrawer.BODY_Y;

		ShopDrawer._sellButton = 
				new Button(ShopDrawer.SELL_BUTTON_IMG, true, function() {
					ShopDrawer._isBuying = false;
					ShopDrawer._sellButton.isEnabled = false;
					ShopDrawer._buyButton.isEnabled = true;
					ShopDrawer._currDialogueMode = 
							ShopDrawer.DialogueModes.WELCOME_SELL;
				});

		ShopDrawer.SELL_BUTTON_X = ScreenProps.EXP_WIDTH / 2 - 
				ShopDrawer.CELL_EDGE_OFFSET - ShopDrawer.SELL_BUTTON_IMG.width;

		ShopDrawer.SELL_BUTTON_Y = ShopDrawer.BODY_Y - 
				(ShopDrawer.CELL_EDGE_OFFSET + imgs.sellButton.height);

		ShopDrawer._buyButton = 
				new Button(ShopDrawer.BUY_BUTTON_IMG, true, function() {
					ShopDrawer._isBuying = true;
					ShopDrawer._buyButton.isEnabled = false;
					ShopDrawer._sellButton.isEnabled = true;
					ShopDrawer._currDialogueMode = 
							ShopDrawer.DialogueModes.WELCOME_BUY;
				});

		ShopDrawer.BUY_BUTTON_X = ScreenProps.EXP_WIDTH / 2 +
				ShopDrawer.CELL_EDGE_OFFSET;

		ShopDrawer.BUY_BUTTON_Y = ShopDrawer.BODY_Y - 
				(ShopDrawer.CELL_EDGE_OFFSET + imgs.buyButton.height);

		// Confirmation dialog-specific preparations.
		ShopDrawer.CONFIRM_BODY_X = 
				(ScreenProps.EXP_WIDTH - imgs.confirmBody.width) / 2;
		ShopDrawer.CONFIRM_BODY_Y = 
				(ScreenProps.EXP_HEIGHT - imgs.confirmBody.height) / 2;

		ShopDrawer._confirmYesButton = 
				new Button(ShopDrawer.CONFIRM_YES_BUTTON_IMG, true, function() {
					if (ShopDrawer._isBuying) {
						ShopDrawer._shop.buyItemAtIndex(ShopDrawer._selectedItemIndex, 
								ShopDrawer._valuePicker.currValue);
						ShopDrawer._currDialogueMode = 
							ShopDrawer.DialogueModes.THANKS_BUY;
					} else {
						Shop.sellItemAtIndex(ShopDrawer._selectedItemIndex, 
								ShopDrawer._valuePicker.currValue, ShopDrawer._isEquipShop);
						ShopDrawer._currDialogueMode = 
							ShopDrawer.DialogueModes.THANKS_SELL;
					}
					ShopDrawer._isInConfirmationMode = false;
				});

		ShopDrawer.CONFIRM_YES_BUTTON_X = ScreenProps.EXP_WIDTH / 2 - 
				ShopDrawer.CELL_EDGE_OFFSET - ShopDrawer.CONFIRM_YES_BUTTON_IMG.width;

		ShopDrawer.CONFIRM_YES_BUTTON_Y = ShopDrawer.CONFIRM_BODY_Y + 
				ShopDrawer.CONFIRM_BODY_IMG.height + ShopDrawer.CELL_EDGE_OFFSET;

		ShopDrawer._confirmNoButton = 
				new Button(ShopDrawer.CONFIRM_NO_BUTTON_IMG, true, function() {
					ShopDrawer._currDialogueMode = ShopDrawer._isBuying ?
							ShopDrawer.DialogueModes.WELCOME_BUY : 
							ShopDrawer.DialogueModes.WELCOME_SELL;
					ShopDrawer._isInConfirmationMode = false;
				});

		ShopDrawer.CONFIRM_NO_BUTTON_X = ScreenProps.EXP_WIDTH / 2 + 
				ShopDrawer.CELL_EDGE_OFFSET;

		ShopDrawer.CONFIRM_NO_BUTTON_Y = ShopDrawer.CONFIRM_BODY_Y + 
				ShopDrawer.CONFIRM_BODY_IMG.height + ShopDrawer.CELL_EDGE_OFFSET;

		ShopDrawer.CONFIRM_CELL_X = 
				(ScreenProps.EXP_WIDTH - ShopDrawer.CELL_IMG.width) / 2;
		ShopDrawer.CONFIRM_CELL_Y = ShopDrawer.CONFIRM_BODY_Y + 30;

		// Constant dimmensions for value picker.
		ShopDrawer.VALUE_PICKER_SCROLLBAR_LENGTH = 200;
		ShopDrawer.VALUE_PICKER_X =
				(ScreenProps.EXP_WIDTH - ShopDrawer.VALUE_PICKER_SCROLLBAR_LENGTH) / 2;
		ShopDrawer.VALUE_PICKER_Y = ShopDrawer.CONFIRM_BODY_Y + 50;

		ShopDrawer._valuePicker = 
				new ValuePicker(ShopDrawer.VALUE_PICKER_SCROLLBAR_LENGTH, 1, 999);
	});
	callback();
};


// Used to set up the shop to be shown. 
ShopDrawer.displayShop = function(shop, leftPortrait1, leftPortrait2, 
		rightPortrait1, rightPortrait2, welcomeMessageBuy, thanksMessageBuy, 
		welcomeMessageSell, thanksMessageSell, isEquipShop) {
	ShopDrawer._shop = shop;
	ShopDrawer._shopContents = shop.shopContents;
	ShopDrawer._leftPortrait1 = leftPortrait1;
	ShopDrawer._leftPortrait2 = leftPortrait2;
	ShopDrawer._rightPortrait1 = rightPortrait1;
	ShopDrawer._rightPortrait2 = rightPortrait2;
	ShopDrawer._welcomeMessageBuy = welcomeMessageBuy;
	ShopDrawer._thanksMessageBuy = thanksMessageBuy;
	ShopDrawer._welcomeMessageSell = welcomeMessageSell;
	ShopDrawer._thanksMessageSell = thanksMessageSell;

	ShopDrawer._isEquipShop = isEquipShop;
	ShopDrawer._isBuying = true;
	ShopDrawer._buyButton.onClick();
	
	ShopDrawer._sellEntries = isEquipShop ?
			GameState.player.inventory.equipEntries : 
			GameState.player.inventory.itemEntries;

	// Number of rows.
	ShopDrawer._numRows = Math.max(ShopDrawer.MIN_ROWS, 
			Math.ceil(ShopDrawer._shopContents.length / ShopDrawer.CELLS_PER_ROW));

	// Number of drawn item cells.
	ShopDrawer._numCells = ShopDrawer._numRows * ShopDrawer.CELLS_PER_ROW;
	
	ShopDrawer._scrollablePixels = ShopDrawer._numRows * 
			ShopDrawer.CELL_IMG.height + (ShopDrawer._numRows - 1) * 
			ShopDrawer.CELL_SPACING - ShopDrawer.WINDOW_BODY_HEIGHT;

	// Reset the scroll.
	ShopDrawer._buyScrollBar.setScrollFraction(0);
	ShopDrawer._sellScrollBar.setScrollFraction(0);

	// Disable/enable the scroll bar based on if its needed.
	if (ShopDrawer._numRows == ShopDrawer.MIN_ROWS) {
		ShopDrawer._buyScrollBar.disable();
	} else {
		ShopDrawer._buyScrollBar.enable();
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
	ShopDrawer._welcomeMessageBuy = null;
	ShopDrawer._thanksMessageBuy = null;
	ShopDrawer._welcomeMessageSell = null;
	ShopDrawer._thanksMessageSell = null;


	ShopDrawer._isEquipShop = null;
	ShopDrawer._isBuying = true;

	ShopDrawer._sellEntries = null;

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
	var scrollBar = ShopDrawer._isBuying ? ShopDrawer._buyScrollBar : 
			ShopDrawer._sellScrollBar;
	scrollBar.updateScroll(delta);
};


ShopDrawer.onStartClick = function(x, y) {
	ShopDrawer._lastStartClickX = x;
	ShopDrawer._lastStartClickY = y;
	if (!ShopDrawer._isInConfirmationMode) {
		var normalizedX = x - ShopDrawer.BODY_X;
		var normalizedY = y - ShopDrawer.BODY_Y;
		// If in scroll bubble, set scroll mode.
		var scrollBar = ShopDrawer._isBuying ? ShopDrawer._buyScrollBar : 
			ShopDrawer._sellScrollBar;
		if (scrollBar.isInBubble(
				normalizedX - ShopDrawer.SCROLLBAR_OFFSET_X,
				normalizedY - ShopDrawer.SCROLLBAR_OFFSET_Y)) {
			ShopDrawer._isDraggingScroll = true;
		}
	} else {
		if (ShopDrawer._valuePicker.scrollBar.isInBubble(
				x - ShopDrawer.VALUE_PICKER_X, 
				y - (ShopDrawer.VALUE_PICKER_Y + ValuePicker.SCROLL_BAR_Y_OFFSET))) {
			ShopDrawer._isDraggingScroll = true;
		}
	}
};


ShopDrawer.onDrag = function(x, y) {
	if (!ShopDrawer._isInConfirmationMode) {
		var normalizedX = x - ShopDrawer.BODY_X;
		var normalizedY = y - ShopDrawer.BODY_Y;
		// If in scroll mode, update scrollbar.
		var scrollBar = ShopDrawer._isBuying ? ShopDrawer._buyScrollBar : 
			ShopDrawer._sellScrollBar;
		if (ShopDrawer._isDraggingScroll) {
			scrollBar.updateScrollFromDrag(
					normalizedX - ShopDrawer.SCROLLBAR_OFFSET_X,
					normalizedY - ShopDrawer.SCROLLBAR_OFFSET_Y);
		}
	} else {
		if (ShopDrawer._isDraggingScroll) {
			ShopDrawer._valuePicker.scrollBar.updateScrollFromDrag(
					x - ShopDrawer.VALUE_PICKER_X, 
					y - (ShopDrawer.VALUE_PICKER_Y + ValuePicker.SCROLL_BAR_Y_OFFSET));
		}
	}
};


ShopDrawer.onEndClick = function(x, y, isDoubleClick) {
	var startAndEndSameLoc = 
			Math.abs(ShopDrawer._lastStartClickX - x) < 
					MouseTracker.SAME_LOC_TOLERANCE && 
			Math.abs(ShopDrawer._lastStartClickY - y) < 
					MouseTracker.SAME_LOC_TOLERANCE;
	if (ShopDrawer._isInConfirmationMode && startAndEndSameLoc) {
		if (ShopDrawer._confirmYesButton.isInButton(
				x - ShopDrawer.CONFIRM_YES_BUTTON_X, 
				y - ShopDrawer.CONFIRM_YES_BUTTON_Y)) {
			ShopDrawer._confirmYesButton.onClick();
		} else if (ShopDrawer._confirmNoButton.isInButton(
				x - ShopDrawer.CONFIRM_NO_BUTTON_X,
				y - ShopDrawer.CONFIRM_NO_BUTTON_Y)) {
			ShopDrawer._confirmNoButton.onClick();
		} else if (ShopDrawer._valuePicker.scrollBar.isInLine(
				x - ShopDrawer.VALUE_PICKER_X,
				y - (ShopDrawer.VALUE_PICKER_Y + ValuePicker.SCROLL_BAR_Y_OFFSET)) && 
						startAndEndSameLoc) {
			ShopDrawer._valuePicker.scrollBar.updateScrollFromDrag(
					x - ShopDrawer.VALUE_PICKER_X,
					y - (ShopDrawer.VALUE_PICKER_Y + ValuePicker.SCROLL_BAR_Y_OFFSET));
		} else if (ShopDrawer._valuePicker.incrButton.isInButton(
				x -  (ShopDrawer.VALUE_PICKER_X + ShopDrawer._valuePicker.incrButtonX),
				y -  (ShopDrawer.VALUE_PICKER_Y + ShopDrawer._valuePicker.incrButtonY))) 
		{
			ShopDrawer._valuePicker.incrButton.onClick();
		} else if (ShopDrawer._valuePicker.decrButton.isInButton(
				x -  (ShopDrawer.VALUE_PICKER_X + ShopDrawer._valuePicker.decrButtonX),
				y -  (ShopDrawer.VALUE_PICKER_Y + ShopDrawer._valuePicker.decrButtonY))) 
		{
			ShopDrawer._valuePicker.decrButton.onClick();
		}
	} else {
		var scrollBar = ShopDrawer._isBuying ? ShopDrawer._buyScrollBar : 
				ShopDrawer._sellScrollBar;
		var normalizedX = x - ShopDrawer.BODY_X;
		var normalizedY = y - ShopDrawer.BODY_Y;
		var possibleCellIndex;
		if ((possibleCellIndex =
				ShopDrawer._helperGetShopSlotFromClickCoords(
						normalizedX, normalizedY)) != -1 && startAndEndSameLoc) {
			if (ShopDrawer._isBuying && ShopDrawer._shopContents[possibleCellIndex] && 
					ShopDrawer._shop.canBuyItemAtIndex(possibleCellIndex, 1)) {
				var selectedItemId = ShopDrawer._shopContents[possibleCellIndex];
				ShopDrawer._selectedItem = Item.getItem(selectedItemId);
				ShopDrawer._selectedItemIndex = possibleCellIndex
				var numCanBuy = 
						Math.floor(GameState.player.money / ShopDrawer._selectedItem.price);
				ShopDrawer._valuePicker.reinit(1, numCanBuy);
				ShopDrawer._currDialogueMode = ShopDrawer.DialogueModes.CONFIRM_BUY;
				ShopDrawer._isInConfirmationMode = true;
			} else if (!ShopDrawer._isBuying && 
					ShopDrawer._sellEntries[possibleCellIndex] && 
					Shop.canSellItemAtIndex(possibleCellIndex, ShopDrawer._isEquipShop)) {
				ShopDrawer._selectedItem = 
						ShopDrawer._sellEntries[possibleCellIndex].item;
				ShopDrawer._selectedItemIndex = possibleCellIndex
				var numCanSell = ShopDrawer._sellEntries[possibleCellIndex].quantity;
				ShopDrawer._valuePicker.reinit(1, numCanSell);
				ShopDrawer._currDialogueMode = ShopDrawer.DialogueModes.CONFIRM_SELL;
				ShopDrawer._isInConfirmationMode = true;
			}
		} else if (scrollBar.isInLine(
				normalizedX - ShopDrawer.SCROLLBAR_OFFSET_X,
				normalizedY - ShopDrawer.SCROLLBAR_OFFSET_Y) && startAndEndSameLoc) {
			scrollBar.updateScrollFromDrag(
					normalizedX - ShopDrawer.SCROLLBAR_OFFSET_X,
					normalizedY - ShopDrawer.SCROLLBAR_OFFSET_Y);
		} else if (ShopDrawer._sellButton.isInButton(x - ShopDrawer.SELL_BUTTON_X, 
				y - ShopDrawer.SELL_BUTTON_Y)) {
			ShopDrawer._sellButton.onClick();
		} else if (ShopDrawer._buyButton.isInButton(x - ShopDrawer.BUY_BUTTON_X, 
				y - ShopDrawer.BUY_BUTTON_Y)) {
			ShopDrawer._buyButton.onClick();
		} else if (ShopDrawer._exitButton.isInButton(x - ShopDrawer.EXIT_BUTTON_X, 
				y - ShopDrawer.EXIT_BUTTON_Y) && startAndEndSameLoc) {
			ShopDrawer._exitButton.onClick();
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
			if (ShopDrawer._isBuying) {
				ShopDrawer._drawBuyItemsInterface(ctx, ShopDrawer.BODY_X, 
						ShopDrawer.BODY_Y);
			} else {
				ShopDrawer._drawSellItemsInterface(ctx, ShopDrawer.BODY_X, 
						ShopDrawer.BODY_Y);
			}
			ShopDrawer._maybeDrawDescription(ctx);
			ShopDrawer._sellButton.draw(ctx, ShopDrawer.SELL_BUTTON_X, 
					ShopDrawer.SELL_BUTTON_Y);
			ShopDrawer._buyButton.draw(ctx, ShopDrawer.BUY_BUTTON_X, 
					ShopDrawer.BUY_BUTTON_Y);
			ShopDrawer._exitButton.draw(ctx, ShopDrawer.EXIT_BUTTON_X, 
					ShopDrawer.EXIT_BUTTON_Y);
		}
		ShopDrawer._drawMoney(ctx);
		ShopDrawer._drawSpeechBubble(ctx);
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


// Draws speech bubbles for the shop to display current transaction state.
ShopDrawer._drawSpeechBubble = function(ctx) {
	// Draw Text.
	var textStr;
	switch (ShopDrawer._currDialogueMode) {
		case ShopDrawer.DialogueModes.WELCOME_SELL:
			textStr = ShopDrawer._welcomeMessageSell;
			break;
		case ShopDrawer.DialogueModes.WELCOME_BUY:
			textStr = ShopDrawer._welcomeMessageBuy;
			break;
		case ShopDrawer.DialogueModes.CONFIRM_SELL:
			textStr = ShopDrawer._valuePicker.currValue + '\nI will buy that for ' + 
					(Math.floor(ShopDrawer._selectedItem.price * Shop.SELL_FRACTION) * 
							ShopDrawer._valuePicker.currValue);
			break;
		case ShopDrawer.DialogueModes.CONFIRM_BUY:
			textStr = ShopDrawer._valuePicker.currValue + '\nThat will be ' + 
					(ShopDrawer._selectedItem.price * ShopDrawer._valuePicker.currValue);
			break;
		case ShopDrawer.DialogueModes.THANKS_SELL:
			textStr = ShopDrawer._thanksMessageSell;
			break;
		case ShopDrawer.DialogueModes.THANKS_BUY:
			textStr = ShopDrawer._thanksMessageBuy;
			break;
	}
	DialogDrawer.drawDialogBubble(ctx, DialogDrawer.BUBBLE_MEDIUM, false, textStr, 
			ShopDrawer.SPEECH_BUBBLE_X, ShopDrawer.SPEECH_BUBBLE_Y);
}


// Draws the Items View/Interface of the Shop UI overlay
// TODO: make the price labeling distinct from the existing quantity labels
ShopDrawer._drawBuyItemsInterface = function(ctx, x, y) {
	// Draw Body.
	ctx.drawImage(ShopDrawer.BODY_IMG, x, y);
	// Draw Cells.
	var fraction = ShopDrawer._buyScrollBar.getScrollFraction();
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
					GlyphDrawer.drawCutText(ctx, ShopDrawer.PRICE_FONT, priceStr, 
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
					GlyphDrawer.drawCutText(ctx, ShopDrawer.PRICE_FONT, priceStr, 
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
					GlyphDrawer.drawText(ctx, ShopDrawer.PRICE_FONT, priceStr, cellX, 
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
	ShopDrawer._buyScrollBar.draw(ctx, x + ShopDrawer.SCROLLBAR_OFFSET_X, 
			y + ShopDrawer.SCROLLBAR_OFFSET_Y);
};


// Draws the Items View/Interface of the Shop UI overlay
// TODO: make the price labeling distinct from the existing quantity labels
ShopDrawer._drawSellItemsInterface = function(ctx, x, y) {
	// Draw Body.
	ctx.drawImage(ShopDrawer.BODY_IMG, x, y);
	// Draw Cells.
	var fraction = ShopDrawer._sellScrollBar.getScrollFraction();
	var pixOffset = fraction * ShopDrawer.SELL_SCROLLABLE_PIXELS;
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
				var itemEntry = ShopDrawer._sellEntries[itemIndex];
				if (itemEntry) {
					// Grayed-out image if cannot shop.
					if (!Shop.canSellItemAtIndex(itemIndex, ShopDrawer._isEquipShop)) {
						ctx.globalAlpha = ShopDrawer.CANNOT_SELL_OPACITY;
					}					// Draw item
					var item = itemEntry.item
					var cellX = x + ShopDrawer.CELL_EDGE_OFFSET + 
							i * (ShopDrawer.CELL_POSITION_GAP);
					var drawY = y + windowBodyTop;
					ctx.drawImage(item.sprite, 0, -yPos, cellWidth, 
							cellPartialHeight, cellX, drawY, cellWidth, cellPartialHeight);
					// Draw quantity
					if (!ShopDrawer._isEquipShop && itemEntry.quantity > 1) {
						var cellY = drawY + yPos;
						var clipY = ShopDrawer.CELL_IMG.height - 
								ShopDrawer.QUANTITY_OFFSET_Y - cellPartialHeight;
						var quantityStr = itemEntry.quantity.toString();
						GlyphDrawer.drawCutText(ctx, ShopDrawer.QUANTITY_FONT, quantityStr, 
								cellX + ShopDrawer.QUANTITY_OFFSET_X + 
										(ShopDrawer.QUANTITY_MAX_GLYPHS - quantityStr.length) * 
										ShopDrawer.QUANTITY_DELTA_X, 
								Math.max(cellY + ShopDrawer.QUANTITY_OFFSET_Y, drawY), 0, clipY, 
										ShopDrawer.CELL_IMG.width - ShopDrawer.QUANTITY_OFFSET_X, 
										cellPartialHeight);
					}
					// Draw price
					clipY = -yPos;
					var priceStr = (item.price).toString();
					GlyphDrawer.drawCutText(ctx, ShopDrawer.PRICE_FONT, priceStr, 
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
				var itemEntry = ShopDrawer._sellEntries[itemIndex];
				if (itemEntry) {
					// Grayed-out image if cannot shop.
					if (!Shop.canSellItemAtIndex(itemIndex, ShopDrawer._isEquipShop)) {
						ctx.globalAlpha = ShopDrawer.CANNOT_SELL_OPACITY;
					}
					// Draw item
					var item = itemEntry.item
					var cellX = x + ShopDrawer.CELL_EDGE_OFFSET + 
							i * (ShopDrawer.CELL_POSITION_GAP);
					var cellY = y + windowBodyTop + yPos;
					ctx.drawImage(item.sprite, 0, 0, cellWidth, 
							cellPartialHeight, cellX, cellY, cellWidth, cellPartialHeight);
					// Draw quantity
					if (!ShopDrawer._isEquipShop && itemEntry.quantity > 1) {
						var quantityStr = itemEntry.quantity.toString();
						GlyphDrawer.drawCutText(ctx, ShopDrawer.QUANTITY_FONT, quantityStr, 
								cellX + ShopDrawer.QUANTITY_OFFSET_X + 
										(ShopDrawer.QUANTITY_MAX_GLYPHS - quantityStr.length) * 
										ShopDrawer.QUANTITY_DELTA_X, 
								cellY + ShopDrawer.QUANTITY_OFFSET_Y, 0, 0,
								ShopDrawer.CELL_IMG.width - ShopDrawer.QUANTITY_OFFSET_X, 
								cellPartialHeight - ShopDrawer.QUANTITY_OFFSET_Y);
					}
					// Draw price
					var priceStr = (item.price).toString();
					GlyphDrawer.drawCutText(ctx, ShopDrawer.PRICE_FONT, priceStr, 
							cellX, cellY, 0, 0, ShopDrawer.CELL_IMG.width, cellPartialHeight);
					// Reset alpha
					ctx.globalAlpha = 1;
				}
			} else {
				ctx.drawImage(ShopDrawer.CELL_IMG, x + ShopDrawer.CELL_EDGE_OFFSET + 
						i * (ShopDrawer.CELL_POSITION_GAP), y + windowBodyTop + yPos);
				var itemEntry = ShopDrawer._sellEntries[itemIndex];
				if (itemEntry) {
					// Grayed-out image if cannot shop.
					if (!Shop.canSellItemAtIndex(itemIndex, ShopDrawer._isEquipShop)) {
						ctx.globalAlpha = ShopDrawer.CANNOT_SELL_OPACITY;
					}
					// Draw item
					var item = itemEntry.item
					var cellX = x + ShopDrawer.CELL_EDGE_OFFSET + 
							i * (ShopDrawer.CELL_POSITION_GAP);
					var cellY = y + windowBodyTop + yPos;
					ctx.drawImage(item.sprite, cellX, cellY);
					// Draw quantity
					if (!ShopDrawer._isEquipShop && itemEntry.quantity > 1) {
						var quantityStr = itemEntry.quantity.toString();
						GlyphDrawer.drawText(ctx, ShopDrawer.QUANTITY_FONT, quantityStr, 
								cellX + ShopDrawer.QUANTITY_OFFSET_X + 
										(ShopDrawer.QUANTITY_MAX_GLYPHS - quantityStr.length) * 
										ShopDrawer.QUANTITY_DELTA_X, 
								cellY + ShopDrawer.QUANTITY_OFFSET_Y, 
								ShopDrawer.CELL_IMG.width - ShopDrawer.QUANTITY_OFFSET_X, 
								ShopDrawer.CELL_IMG.height - ShopDrawer.QUANTITY_OFFSET_Y);
					}
					// Draw price
					var priceStr = (item.price).toString();
					GlyphDrawer.drawText(ctx, ShopDrawer.PRICE_FONT, priceStr, cellX, 
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
	ShopDrawer._sellScrollBar.draw(ctx, x + ShopDrawer.SCROLLBAR_OFFSET_X, 
			y + ShopDrawer.SCROLLBAR_OFFSET_Y);
};


ShopDrawer._drawMoney = function(ctx) {
	ctx.drawImage(ShopDrawer.MONEY_BACK_IMG, ShopDrawer.MONEY_X, 
			ShopDrawer.MONEY_Y);
	var moneyStr = GameState.player.money.toString();
	GlyphDrawer.drawText(ctx, ShopDrawer.MONEY_FONT, moneyStr, 
			ShopDrawer.MONEY_X + ShopDrawer.MONEY_OFFSET_X + 
					(ShopDrawer.MONEY_MAX_GLYPHS - moneyStr.length) * 
					ShopDrawer.MONEY_DELTA_X, 
			ShopDrawer.MONEY_Y + ShopDrawer.MONEY_OFFSET_Y, 
			ShopDrawer.MONEY_BACK_IMG.width, 
			ShopDrawer.MONEY_BACK_IMG.height);
};


// Draws the confirmation after a called shop is selected.
ShopDrawer._drawConfirmationInterface = function(ctx) {
	// Draw Body.
	ctx.drawImage(ShopDrawer.CONFIRM_BODY_IMG, ShopDrawer.CONFIRM_BODY_X, 
			ShopDrawer.CONFIRM_BODY_Y);

	// Draw Buttons.
	ShopDrawer._confirmYesButton.draw(ctx, ShopDrawer.CONFIRM_YES_BUTTON_X, 
			ShopDrawer.CONFIRM_YES_BUTTON_Y);
	ShopDrawer._confirmNoButton.draw(ctx, ShopDrawer.CONFIRM_NO_BUTTON_X, 
			ShopDrawer.CONFIRM_NO_BUTTON_Y);

	var maxQuantity = ShopDrawer._valuePicker.max;
	if (maxQuantity > 1) {
		// Draw Value Picker. 
		ShopDrawer._valuePicker.draw(ctx, ShopDrawer.VALUE_PICKER_X, 
				ShopDrawer.VALUE_PICKER_Y);
		// Draw cell.
		ctx.drawImage(ShopDrawer.CELL_IMG, ShopDrawer.CONFIRM_CELL_X, 
				ShopDrawer.CONFIRM_CELL_Y);
		// Draw item.
		ctx.drawImage(
				ShopDrawer._selectedItem.sprite, 
				ShopDrawer.CONFIRM_CELL_X, ShopDrawer.CONFIRM_CELL_Y);
		// Draw Quantity.
		var quantityStr = ShopDrawer._valuePicker.currValue.toString();
		GlyphDrawer.drawText(ctx, ShopDrawer.PRICE_FONT, 
				quantityStr, ShopDrawer.CONFIRM_CELL_X + ShopDrawer.QUANTITY_OFFSET_X + 
						(ShopDrawer.QUANTITY_MAX_GLYPHS - quantityStr.length) * 
						ShopDrawer.QUANTITY_DELTA_X, 
				ShopDrawer.CONFIRM_CELL_Y + ShopDrawer.QUANTITY_OFFSET_Y, 
				ShopDrawer.CELL_IMG.width - ShopDrawer.QUANTITY_OFFSET_X, 
				ShopDrawer.CELL_IMG.height - ShopDrawer.QUANTITY_OFFSET_Y);
	} else {
		// Draw cell.
		ctx.drawImage(ShopDrawer.CELL_IMG, ShopDrawer.CONFIRM_CELL_X, 
				ShopDrawer.CONFIRM_CELL_Y);
		// Draw item.
		ctx.drawImage(
				ShopDrawer._selectedItem.sprite, 
				ShopDrawer.CONFIRM_CELL_X, ShopDrawer.CONFIRM_CELL_Y);
		
	}

};


// Maybe draws the description.
ShopDrawer._maybeDrawDescription = function(ctx) {
	var itemId;
	var itemEntry;
	if (ShopDrawer._currentHoveredCellIndex != null) {
		if (ShopDrawer._isBuying) {
			if ((itemId = 
					ShopDrawer._shopContents[ShopDrawer._currentHoveredCellIndex])) {
				ctx.drawImage(ShopDrawer.DESCRIPTION_BACK, ShopDrawer.DESCRIPTION_X, 
						ShopDrawer.DESCRIPTION_Y);
				var description = Item.getItem(itemId).description;
				GlyphDrawer.drawText(ctx, ShopDrawer.DESCRIPTION_FONT, description, 
						ShopDrawer.DESCRIPTION_X, ShopDrawer.DESCRIPTION_Y, 
						ShopDrawer.DESCRIPTION_BACK.width, 
						ShopDrawer.DESCRIPTION_BACK.height);
			}
		} else {
			if ((itemEntry = 
					ShopDrawer._sellEntries[ShopDrawer._currentHoveredCellIndex])) {
				ctx.drawImage(ShopDrawer.DESCRIPTION_BACK, ShopDrawer.DESCRIPTION_X, 
						ShopDrawer.DESCRIPTION_Y);
				var description = itemEntry.item.description;
				GlyphDrawer.drawText(ctx, ShopDrawer.DESCRIPTION_FONT, description, 
						ShopDrawer.DESCRIPTION_X, ShopDrawer.DESCRIPTION_Y, 
						ShopDrawer.DESCRIPTION_BACK.width, 
						ShopDrawer.DESCRIPTION_BACK.height);
			}
		}

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
	var scrollBar = ShopDrawer._isBuying ? ShopDrawer._buyScrollBar : 
			ShopDrawer._sellScrollBar
	var pixOffset = scrollBar.getScrollFraction() * 
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


ShopDrawer.tick = function() {
	ShopDrawer._valuePicker.tick();
}