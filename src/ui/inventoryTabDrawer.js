/**
 * Responsible for drawing and handling the input to the inventory and settings
 * tabbed interface.
 */
var InventoryTabDrawer = {};

InventoryTabDrawer.PATH = '../assets/img/ui/tabView/';

// Assets used for drawing the tab window.
InventoryTabDrawer.BODY_IMG;
InventoryTabDrawer.CELL_IMG;
InventoryTabDrawer.DESCRIPTION_BACK;
InventoryTabDrawer.MONEY_BACK_IMG;
InventoryTabDrawer.TAB_ICON_IMGS;
InventoryTabDrawer.TAB_BACK_IMGS;
InventoryTabDrawer.SAVE_BUTTON_IMG;
InventoryTabDrawer.EXIT_BUTTON_IMG;

// Possible tab indices.
InventoryTabDrawer.ITEMS_TAB = 0;
InventoryTabDrawer.EQUIPMENT_TAB = 1;
InventoryTabDrawer.SETTINGS_TAB = 2;

// Max scroll for every scroll bar in the tab window.
InventoryTabDrawer.SCROLL_BAR_MAX_SCROLL = 1000;

// Offsets to draw the icons wrt the tab back.
InventoryTabDrawer.TAB_ICON_OFFSET_X;
InventoryTabDrawer.TAB_ICON_OFFSET_Y;

// Padding for the money glyphs WRT top left corner of money back.
InventoryTabDrawer.MONEY_OFFSET_X = 10;
InventoryTabDrawer.MONEY_OFFSET_Y = 10;
InventoryTabDrawer.MONEY_DELTA_X = 12;

// Max number of money glyphs.
InventoryTabDrawer.MONEY_MAX_GLYPHS = 24;

// The font to draw money in the inventory display.
InventoryTabDrawer.MONEY_FONT = 'test';

// Offsets used to draw inventory cells
InventoryTabDrawer.CELL_EDGE_OFFSET = 12;
InventoryTabDrawer.CELL_SPACING = 8;

InventoryTabDrawer.CELLS_PER_ROW = 4;
InventoryTabDrawer.NUM_ITEM_ROWS;
InventoryTabDrawer.NUM_EQUIP_ROWS;

InventoryTabDrawer.CELL_IMG_WIDTH_HALF;

// Offset at which to draw each scrollbar
InventoryTabDrawer.SCROLLBAR_OFFSET_X;
InventoryTabDrawer.SCROLLBAR_OFFSET_Y;

// Spacing between settings headings.
InventoryTabDrawer.SETTINGS_HEADINGS_SPACING = 60;

// Offset of settings contents from headings.
InventoryTabDrawer.SETTINGS_CONTENTS_OFFSET = 30;

// Default position of the tabs
InventoryTabDrawer.DEFAULT_X = 850;
InventoryTabDrawer.DEFAULT_Y = 100;

// The font to draw quantities in the inventory display.
InventoryTabDrawer.QUANTITY_FONT = 'test';

// The font the draw the item descripttion.
InventoryTabDrawer.DESCRIPTION_FONT = 'test';

// The position of the quantity text WRT the cell topleft corner.
InventoryTabDrawer.QUANTITY_OFFSET_X = 26;
InventoryTabDrawer.QUANTITY_DELTA_X = 12;
InventoryTabDrawer.QUANTITY_OFFSET_Y = 42;
InventoryTabDrawer.QUANTITY_MAX_GLYPHS = 3;


// The currently vidible tab index.
InventoryTabDrawer.currentTab = InventoryTabDrawer.ITEMS_TAB; 

// The inventory to be drawn in the tab window.
InventoryTabDrawer._inventory;

// The equipment to be drawn in the tab window.
InventoryTabDrawer._equippedItems;

// The current settings to be shown in the tab window.
InventoryTabDrawer._settings;
// TODO: create actual settings object to be put here.

// Array of scrollbars with indices matching tab indices.
InventoryTabDrawer._scrollBars;

// Array of sideways scrollbars.
InventoryTabDrawer._settingsScrollBars;

// Buttons in the settings tab.
InventoryTabDrawer._saveButton;
InventoryTabDrawer._exitButton;

// Position of inventory tab interface (top left corner of tabs)
InventoryTabDrawer._x = InventoryTabDrawer.DEFAULT_X;
InventoryTabDrawer._y = InventoryTabDrawer.DEFAULT_Y;

// Whether or not the inventory tab is open
InventoryTabDrawer.isOpen = false;

// The offset from the topleft corner of the window when dragging a tab starts.
InventoryTabDrawer._dragTabDeltaX;
InventoryTabDrawer._dragTabDeltaY;

// The last recorded start click position.
InventoryTabDrawer._lastStartClickX;
InventoryTabDrawer._lastStartClickY;

// The current drag mode (what is being dragged).
InventoryTabDrawer._dragMode = null;

InventoryTabDrawer.DragModes = {
	TAB: 0,
	SCROLL: 1,
	ITEM: 2
};

InventoryTabDrawer._currentSettingsScrollMode = null;

InventoryTabDrawer.SettingsScrollBarIndexes = {
	BGM: 0,
	SFX: 1
};

// TODO: comment
InventoryTabDrawer._currentHoveredCellIndex;
InventoryTabDrawer._draggedItemIndex;

InventoryTabDrawer._draggedItemX;
InventoryTabDrawer._draggedItemY;
InventoryTabDrawer._draggedItemFixedPos;

// Loads all images required for the tab window.
InventoryTabDrawer.init = function(callback) {
	ImgUtils.loadImages({
		body: InventoryTabDrawer.PATH + 'body.png',
		cell: InventoryTabDrawer.PATH + 'cell.png',
		descriptionBack: InventoryTabDrawer.PATH + 'descriptionBack.png',
		moneyBack: InventoryTabDrawer.PATH + 'moneyBack.png',
		itemsIcon: InventoryTabDrawer.PATH + 'itemsIcon.png',
		equipmentIcon: InventoryTabDrawer.PATH + 'equipmentIcon.png',
		settingsIcon: InventoryTabDrawer.PATH + 'settingsIcon.png',
		tabDark: InventoryTabDrawer.PATH + 'tabDark.png',
		tabGrey: InventoryTabDrawer.PATH + 'tabGrey.png',
		tabWhite: InventoryTabDrawer.PATH + 'tabWhite.png',
		saveButton: InventoryTabDrawer.PATH + 'saveButton.png',
		exitButton: InventoryTabDrawer.PATH + 'exitButton.png'
	}, function(imgs) {
		InventoryTabDrawer.BODY_IMG = imgs.body;
		InventoryTabDrawer.CELL_IMG = imgs.cell;
		InventoryTabDrawer.DESCRIPTION_BACK = imgs.descriptionBack;
		InventoryTabDrawer.MONEY_BACK_IMG = imgs.moneyBack;
		InventoryTabDrawer.TAB_ICON_IMGS = [
			imgs.itemsIcon,
			imgs.equipmentIcon,
			imgs.settingsIcon
		];
		InventoryTabDrawer.TAB_BACK_IMGS = [
			imgs.tabWhite,
			imgs.tabGrey,
			imgs.tabDark
		];
		InventoryTabDrawer.SAVE_BUTTON_IMG = imgs.saveButton;
		InventoryTabDrawer.EXIT_BUTTON_IMG = imgs.exitButton;
		
		// Initialize settings buttons.
		InventoryTabDrawer._saveButton = 
				new Button(InventoryTabDrawer.SAVE_BUTTON_IMG, false, function() {
					GameState.saveData.save(true);
				});
		InventoryTabDrawer._exitButton = 
				new Button(InventoryTabDrawer.EXIT_BUTTON_IMG, true, function() {
					ConfirmDialog.display(
							'Exit? All progress after last save will be lost.', 
							OverworldScene.exit);
				});
		// Settings buttons positions.
		InventoryTabDrawer.SAVE_BUTTON_Y = 2 /* REPLACE WITH MEANIGFUL CONSTANT*/ * 
				InventoryTabDrawer.SETTINGS_HEADINGS_SPACING + 
				InventoryTabDrawer.SETTINGS_CONTENTS_OFFSET;
		InventoryTabDrawer.EXIT_BUTTON_Y = InventoryTabDrawer.SAVE_BUTTON_Y + 
				InventoryTabDrawer.SAVE_BUTTON_IMG.height + 
				InventoryTabDrawer.SETTINGS_CONTENTS_OFFSET;

		InventoryTabDrawer.TAB_ICON_OFFSET_X = 
				(InventoryTabDrawer.TAB_BACK_IMGS[0].width - 
						InventoryTabDrawer.TAB_ICON_IMGS[0].width) / 2;
		InventoryTabDrawer.TAB_ICON_OFFSET_Y =
				(InventoryTabDrawer.TAB_BACK_IMGS[0].height - 
						InventoryTabDrawer.TAB_ICON_IMGS[0].height) / 2;
		InventoryTabDrawer._scrollBars = [
			new ScrollBar(InventoryTabDrawer.SCROLL_BAR_MAX_SCROLL, 
					InventoryTabDrawer.BODY_IMG.height - 
							2 * InventoryTabDrawer.CELL_EDGE_OFFSET, false),
			new ScrollBar(InventoryTabDrawer.SCROLL_BAR_MAX_SCROLL, 
					InventoryTabDrawer.BODY_IMG.height - 
							2 * InventoryTabDrawer.CELL_EDGE_OFFSET, false),
			new ScrollBar(InventoryTabDrawer.SCROLL_BAR_MAX_SCROLL, 
					InventoryTabDrawer.BODY_IMG.height - 
							2 * InventoryTabDrawer.CELL_EDGE_OFFSET, false)
		];
		InventoryTabDrawer.SCROLLBAR_OFFSET_X = 
				InventoryTabDrawer.CELL_EDGE_OFFSET * 2 + 
				InventoryTabDrawer.CELLS_PER_ROW * InventoryTabDrawer.CELL_IMG.width + 
				(InventoryTabDrawer.CELLS_PER_ROW - 1) * 
						InventoryTabDrawer.CELL_SPACING + 6;
		InventoryTabDrawer.SCROLLBAR_OFFSET_Y = 
				InventoryTabDrawer.TAB_BACK_IMGS[0].height + 
				InventoryTabDrawer.CELL_EDGE_OFFSET;
		
		InventoryTabDrawer.NUM_ITEM_ROWS = Inventory.NUM_ITEM_SLOTS / 
				InventoryTabDrawer.CELLS_PER_ROW;
		InventoryTabDrawer.NUM_EQUIP_ROWS = Inventory.NUM_EQUIP_SLOTS / 
				InventoryTabDrawer.CELLS_PER_ROW;

		InventoryTabDrawer.CELL_IMG_WIDTH_HALF = 
				InventoryTabDrawer.CELL_IMG.width / 2;
		InventoryTabDrawer.CELL_POSITION_GAP =
				InventoryTabDrawer.CELL_IMG.height + InventoryTabDrawer.CELL_SPACING;

		InventoryTabDrawer._settingsScrollBars = [
			new ScrollBar(InventoryTabDrawer.SCROLL_BAR_MAX_SCROLL, 
					(InventoryTabDrawer.CELLS_PER_ROW - 1) * 
					(InventoryTabDrawer.CELL_IMG.width + 
								InventoryTabDrawer.CELL_SPACING) + 
					InventoryTabDrawer.CELL_IMG.width - 
					InventoryTabDrawer.CELL_EDGE_OFFSET, true), 
			new ScrollBar(InventoryTabDrawer.SCROLL_BAR_MAX_SCROLL, 
					(InventoryTabDrawer.CELLS_PER_ROW - 1) * 
					(InventoryTabDrawer.CELL_IMG.width + 
								InventoryTabDrawer.CELL_SPACING) + 
					InventoryTabDrawer.CELL_IMG.width - 
					InventoryTabDrawer.CELL_EDGE_OFFSET, true)
		];

		InventoryTabDrawer.WINDOW_BODY_TOP =
				InventoryTabDrawer.TAB_BACK_IMGS[0].height + 
				InventoryTabDrawer.CELL_EDGE_OFFSET;
		InventoryTabDrawer.WINDOW_BODY_BOT =
				InventoryTabDrawer.TAB_BACK_IMGS[0].height + 
				InventoryTabDrawer.BODY_IMG.height -
				InventoryTabDrawer.CELL_EDGE_OFFSET;
		InventoryTabDrawer.WINDOW_BODY_LEFT = InventoryTabDrawer.CELL_EDGE_OFFSET;
		InventoryTabDrawer.WINDOW_BODY_RIGHT = 
				(InventoryTabDrawer.CELLS_PER_ROW - 1) * 
				(InventoryTabDrawer.CELL_IMG.width + InventoryTabDrawer.CELL_SPACING) + 
				InventoryTabDrawer.CELL_IMG.width + 
				InventoryTabDrawer.CELL_EDGE_OFFSET;
		InventoryTabDrawer.WINDOW_BODY_WIDTH =
				InventoryTabDrawer.WINDOW_BODY_RIGHT - 
				InventoryTabDrawer.WINDOW_BODY_LEFT;
		InventoryTabDrawer.WINDOW_BODY_HEIGHT =
				InventoryTabDrawer.WINDOW_BODY_BOT - 
				InventoryTabDrawer.WINDOW_BODY_TOP;

		InventoryTabDrawer.SCROLLABLE_PIXELS = 
					/* TODO: Generalize to both items and equips*/InventoryTabDrawer.NUM_ITEM_ROWS * 
					InventoryTabDrawer.CELL_IMG.height + 
					(InventoryTabDrawer.NUM_ITEM_ROWS - 1) * 
							InventoryTabDrawer.CELL_SPACING -
					InventoryTabDrawer.WINDOW_BODY_HEIGHT;

		InventoryTabDrawer.SETTINGS_SCROLL_X = InventoryTabDrawer.WINDOW_BODY_LEFT +
				ScrollBar.BUBBLE.width / 2;

		InventoryTabDrawer.EQUIPPED_ITEMS_X = InventoryTabDrawer.BODY_IMG.width + 
				InventoryTabDrawer.CELL_POSITION_GAP;
		InventoryTabDrawer.EQUIPPED_ITEMS_Y_POSITIONS = [];
		for (var i = 0; i < EquippedItems.NUM_SLOTS; i++) {
			InventoryTabDrawer.EQUIPPED_ITEMS_Y_POSITIONS.push(
					InventoryTabDrawer.WINDOW_BODY_TOP + 
					i * InventoryTabDrawer.CELL_POSITION_GAP);
		}

		callback();
	});
};


InventoryTabDrawer.setInventory = function(inventory) {
	InventoryTabDrawer._inventory = inventory;
};

InventoryTabDrawer.setEquippedItems = function(equippedItems) {
	InventoryTabDrawer._equippedItems = equippedItems;
};


// Changes wha tht eplayer can do based on the map they are in.
InventoryTabDrawer.setMapDependencies = function(map) {
	InventoryTabDrawer._saveButton.isEnabled = map.type == GameMap.Types.SHOP;
}

// Initializes the volume scrollbars to match the current settings in the save 
// data.
InventoryTabDrawer.setSettings = function(settings) {
	InventoryTabDrawer._settingsScrollBars[
			InventoryTabDrawer.SettingsScrollBarIndexes.BGM].setScrollFraction(
					settings.bgmVolume);
	InventoryTabDrawer._settingsScrollBars[
			InventoryTabDrawer.SettingsScrollBarIndexes.SFX].setScrollFraction(
					settings.sfxVolume);
};


// Updates the scroll bar of the currently open tab.
InventoryTabDrawer.updateCurrentScroll = function(delta) {
	if (InventoryTabDrawer._dragMode == null) {
		InventoryTabDrawer._scrollBars[
				InventoryTabDrawer.currentTab].updateScroll(delta);
	}
};


// Handlers which handle events from the mouse input router.
InventoryTabDrawer.onStartClick = function(x, y) {
	InventoryTabDrawer._lastStartClickX = x;
	InventoryTabDrawer._lastStartClickY = y;
	var normalizedX = x - InventoryTabDrawer._x;
	var normalizedY = y - InventoryTabDrawer._y;
	var currentTab = InventoryTabDrawer.currentTab;
	// First check for scroll drag
	var currentScrollBar = 
			InventoryTabDrawer._scrollBars[InventoryTabDrawer.currentTab];
	var possibleTabIndex;
	var possibleCellIndex;
	var possibleSettingsScroll;
	if (currentScrollBar.isInBubble(
			normalizedX - InventoryTabDrawer.SCROLLBAR_OFFSET_X, 
			normalizedY - InventoryTabDrawer.SCROLLBAR_OFFSET_Y)) {
		InventoryTabDrawer._dragMode = InventoryTabDrawer.DragModes.SCROLL;
	} else if ((possibleTabIndex = 
			InventoryTabDrawer._helperGetTabFromClickCoords(
					normalizedX, normalizedY)) == InventoryTabDrawer.currentTab) {
		InventoryTabDrawer._dragTabDeltaX = normalizedX;
		InventoryTabDrawer._dragTabDeltaY = normalizedY;
		InventoryTabDrawer._dragMode = InventoryTabDrawer.DragModes.TAB;
	} else if (currentTab != InventoryTabDrawer.SETTINGS_TAB && 
			(possibleCellIndex = 
					InventoryTabDrawer._helperGetInventorySlotFromClickCoords(
					normalizedX, normalizedY)) != -1) {
		InventoryTabDrawer._dragMode = InventoryTabDrawer.DragModes.ITEM;
		InventoryTabDrawer._draggedItemIndex = possibleCellIndex;
		var itemCoords = InventoryTabDrawer._helperGetCellCoords(possibleCellIndex);
		InventoryTabDrawer._draggedItemX = itemCoords.x + InventoryTabDrawer._x;
		InventoryTabDrawer._draggedItemY = itemCoords.y + InventoryTabDrawer._y;
		InventoryTabDrawer._draggedItemFixedPos = true;
	} else if (currentTab == InventoryTabDrawer.SETTINGS_TAB && 
				(possibleSettingsScroll = 
						InventoryTabDrawer._helperGetSettingsScrollBubbleIndex(
								normalizedX, normalizedY)) != -1) {
		InventoryTabDrawer._currentSettingsScrollMode = possibleSettingsScroll;
	} else {
		// Nulling ought to be last thing done, if no drags are found
		InventoryTabDrawer._dragMode = null;
		InventoryTabDrawer._dragTabDeltaX = null;
		InventoryTabDrawer._dragTabDeltaY = null;
		InventoryTabDrawer._draggedItemIndex = null;
		InventoryTabDrawer._draggedItemX = null;
		InventoryTabDrawer._draggedItemY = null;
		InventoryTabDrawer._currentSettingsScrollMode = null;
	}
};


InventoryTabDrawer.onDrag = function(x, y) {
	var normalizedX = x - InventoryTabDrawer._x;
	var normalizedY = y - InventoryTabDrawer._y;
	if (InventoryTabDrawer._dragMode == InventoryTabDrawer.DragModes.SCROLL) {
		var currentScrollBar = 
				InventoryTabDrawer._scrollBars[InventoryTabDrawer.currentTab];
		currentScrollBar.updateScrollFromDrag(
				normalizedX - InventoryTabDrawer.SCROLLBAR_OFFSET_X, 
				normalizedY - InventoryTabDrawer.SCROLLBAR_OFFSET_Y);
	} else if (InventoryTabDrawer._dragMode == InventoryTabDrawer.DragModes.TAB) {
		InventoryTabDrawer._x = x - InventoryTabDrawer._dragTabDeltaX;
		InventoryTabDrawer._y = y - InventoryTabDrawer._dragTabDeltaY;
	} else if (
			InventoryTabDrawer._dragMode == InventoryTabDrawer.DragModes.ITEM) {
		var startAndEndSameLoc = 
				Math.abs(InventoryTabDrawer._lastStartClickX - x) < 
						MouseTracker.SAME_LOC_TOLERANCE && 
				Math.abs(InventoryTabDrawer._lastStartClickY - y) < 
						MouseTracker.SAME_LOC_TOLERANCE;
		if (InventoryTabDrawer._draggedItemFixedPos && !startAndEndSameLoc) {
			InventoryTabDrawer._draggedItemFixedPos = false;
		}
		if (!InventoryTabDrawer._draggedItemFixedPos) {
			InventoryTabDrawer._draggedItemX = 
					x - InventoryTabDrawer.CELL_IMG_WIDTH_HALF;
			InventoryTabDrawer._draggedItemY = 
					y - InventoryTabDrawer.CELL_IMG_WIDTH_HALF;
		}
	} else if (InventoryTabDrawer._currentSettingsScrollMode != null) {
		var pixOffset = InventoryTabDrawer._scrollBars[
				InventoryTabDrawer.SETTINGS_TAB].getScrollFraction() * 
				InventoryTabDrawer.SCROLLABLE_PIXELS;
		InventoryTabDrawer._settingsScrollBars[
				InventoryTabDrawer._currentSettingsScrollMode].updateScrollFromDrag(
						normalizedX - InventoryTabDrawer.SETTINGS_SCROLL_X, 
						normalizedY - (InventoryTabDrawer._currentSettingsScrollMode * 
								InventoryTabDrawer.SETTINGS_HEADINGS_SPACING + 
								InventoryTabDrawer.SETTINGS_CONTENTS_OFFSET + 
								InventoryTabDrawer.WINDOW_BODY_TOP) - 
								pixOffset
				);
		var currentSettingsKey = InventoryTabDrawer._currentSettingsScrollMode == 
						InventoryTabDrawer.SettingsScrollBarIndexes.BGM ? 
				'bgmVolume' : 'sfxVolume';
		GameState.saveData.settingsInfo[currentSettingsKey] = 
				InventoryTabDrawer._settingsScrollBars[
						InventoryTabDrawer._currentSettingsScrollMode].getScrollFraction();
		GameState.saveData.applySettings();
	}
};


InventoryTabDrawer.onEndClick = function(x, y, isDoubleClick) {
	var startAndEndSameLoc = 
			Math.abs(InventoryTabDrawer._lastStartClickX - x) < 
					MouseTracker.SAME_LOC_TOLERANCE && 
			Math.abs(InventoryTabDrawer._lastStartClickY - y) < 
					MouseTracker.SAME_LOC_TOLERANCE;
	// Check for click position for scroll bar
	var normalizedX = x - InventoryTabDrawer._x;
	var normalizedY = y - InventoryTabDrawer._y;
	var currentScrollBar = 
			InventoryTabDrawer._scrollBars[InventoryTabDrawer.currentTab];
	var possibleTabIndex;
	var possibleItemIndex;
	var possibleSettingsScroll;
	if (InventoryTabDrawer._dragMode == null && startAndEndSameLoc && 
			currentScrollBar.isInLine(
					normalizedX - InventoryTabDrawer.SCROLLBAR_OFFSET_X, 
					normalizedY - InventoryTabDrawer.SCROLLBAR_OFFSET_Y)) {
		// Check for click scroll bar position instantaneous change.
		currentScrollBar.updateScrollFromDrag(
				normalizedX - InventoryTabDrawer.SCROLLBAR_OFFSET_X, 
				normalizedY - InventoryTabDrawer.SCROLLBAR_OFFSET_Y);
	} else if (InventoryTabDrawer._dragMode == null && startAndEndSameLoc &&
			(possibleTabIndex = InventoryTabDrawer._helperGetTabFromClickCoords(
					normalizedX, normalizedY)) != -1) {
		// Check for tab change
		InventoryTabDrawer.currentTab = possibleTabIndex;
	} else if (isDoubleClick && startAndEndSameLoc) {
		// Check for click on item
		// Only handle use items for now
		if (InventoryTabDrawer.currentTab == InventoryTabDrawer.ITEMS_TAB) {
			if ((possibleItemIndex = 
					InventoryTabDrawer._helperGetInventorySlotFromClickCoords(
							normalizedX, normalizedY)) != -1) {
				var itemEntry = 
						InventoryTabDrawer._inventory.itemEntries[possibleItemIndex];
				if (itemEntry && ItemHelper.canUseItem(itemEntry.item)) {
					ItemHelper.useItem(itemEntry.item);
					// TODO: reconsider cleanup
					InventoryTabDrawer._inventory.remove(possibleItemIndex, 1, 
							false /* isFromEquip */);
				}
			}
		} else if (InventoryTabDrawer.currentTab == 
				InventoryTabDrawer.EQUIPMENT_TAB) {
			if ((possibleItemIndex = 
					InventoryTabDrawer._helperGetInventorySlotFromClickCoords(
							normalizedX, normalizedY)) != -1) {
				var equipEntry = 
						InventoryTabDrawer._inventory.equipEntries[possibleItemIndex];
				if (equipEntry && 
						InventoryTabDrawer._equippedItems.canEquip(equipEntry.item)) {
					InventoryTabDrawer._inventory.remove(possibleItemIndex, 1, 
							true /* isFromEquip */);
					InventoryTabDrawer._equippedItems.equip(equipEntry.item);
				// TODO: reconsider cleanup; existing equip is added in other method.
				}
			} else if ((possibleItemIndex = 
					InventoryTabDrawer._helperGetEquippedItemSlotFromClickCoords(
							normalizedX, normalizedY)) != -1) {
				var equippedItem = 
						InventoryTabDrawer._equippedItems.items[possibleItemIndex];
				if (equippedItem && 
						InventoryTabDrawer._equippedItems.canDequip(
								EquippedItems.SlotIndices[equippedItem.equipData.type])) {
					InventoryTabDrawer._equippedItems.dequip(
							EquippedItems.SlotIndices[equippedItem.equipData.type]);
				}
			}
		}
	} else if (InventoryTabDrawer._dragMode == 
			InventoryTabDrawer.DragModes.ITEM) {
		var entries =
				InventoryTabDrawer.currentTab == InventoryTabDrawer.ITEMS_TAB ?
						InventoryTabDrawer._inventory.itemEntries :
						InventoryTabDrawer._inventory.equipEntries;
		if (normalizedX < 0 || 
				normalizedX >= InventoryTabDrawer.BODY_IMG.width || 
				normalizedY < 0 || 
				normalizedY >= InventoryTabDrawer.BODY_IMG.height + 
						InventoryTabDrawer.TAB_BACK_IMGS[0].height) {
			GameState.map.registerItemDrop(new ItemDrop(
					entries[InventoryTabDrawer._draggedItemIndex].item.id, 
					entries[InventoryTabDrawer._draggedItemIndex].quantity,
					GameState.player.visualInstance.x, GameState.player.visualInstance.y
					// TODO, make drops appear in front of character
				));
			entries[InventoryTabDrawer._draggedItemIndex] = null;		
		} else if ((possibleItemIndex = 
				InventoryTabDrawer._helperGetInventorySlotFromClickCoords(
						normalizedX, normalizedY)) != -1) {
			var tempEntry = entries[InventoryTabDrawer._draggedItemIndex];
			entries[InventoryTabDrawer._draggedItemIndex] = 
					entries[possibleItemIndex];
			entries[possibleItemIndex] = tempEntry;
		}
	} else if (InventoryTabDrawer.currentTab == InventoryTabDrawer.SETTINGS_TAB && 
				startAndEndSameLoc && InventoryTabDrawer._dragMode == null) {
		// Handle Settings Contents
		if ((possibleSettingsScroll = 
						InventoryTabDrawer._helperGetSettingsScrollBarIndex(
								normalizedX, normalizedY)) != -1) {
			// Handle sideways scrollbars.
			var pixOffset = InventoryTabDrawer._scrollBars[
					InventoryTabDrawer.SETTINGS_TAB].getScrollFraction() * 
					InventoryTabDrawer.SCROLLABLE_PIXELS;
			InventoryTabDrawer._settingsScrollBars[
					possibleSettingsScroll].updateScrollFromDrag(
							normalizedX - InventoryTabDrawer.SETTINGS_SCROLL_X, 
							normalizedY - (InventoryTabDrawer.possibleSettingsScroll * 
									InventoryTabDrawer.SETTINGS_HEADINGS_SPACING + 
									InventoryTabDrawer.SETTINGS_CONTENTS_OFFSET + 
									InventoryTabDrawer.WINDOW_BODY_TOP) - 
									pixOffset
					);
			var currentSettingsKey = possibleSettingsScroll == 
							InventoryTabDrawer.SettingsScrollBarIndexes.BGM ? 
					'bgmVolume' : 'sfxVolume';
			GameState.saveData.settingsInfo[currentSettingsKey] = 
					InventoryTabDrawer._settingsScrollBars[
							possibleSettingsScroll].getScrollFraction();
			GameState.saveData.applySettings();
		} else if (InventoryTabDrawer._saveButton.isInButton(
					normalizedX - InventoryTabDrawer.WINDOW_BODY_LEFT,
					normalizedY - (InventoryTabDrawer.SAVE_BUTTON_Y + 
									InventoryTabDrawer.WINDOW_BODY_TOP - 
							InventoryTabDrawer._scrollBars[
									InventoryTabDrawer.SETTINGS_TAB].getScrollFraction() * 
									InventoryTabDrawer.SCROLLABLE_PIXELS)
			)) {
			// Handle save button.
			InventoryTabDrawer._saveButton.onClick();
		} else if (InventoryTabDrawer._exitButton.isInButton(
					normalizedX - InventoryTabDrawer.WINDOW_BODY_LEFT,
					normalizedY - (InventoryTabDrawer.EXIT_BUTTON_Y + 
									InventoryTabDrawer.WINDOW_BODY_TOP - 
							InventoryTabDrawer._scrollBars[
									InventoryTabDrawer.SETTINGS_TAB].getScrollFraction() * 
									InventoryTabDrawer.SCROLLABLE_PIXELS)
			)) {
			// Handle exit button.
			InventoryTabDrawer._exitButton.onClick();
		}
	}
	// Nullify drag at the end of endclick since drag must now be over
	InventoryTabDrawer._dragMode = null;
	InventoryTabDrawer._dragTabDeltaX = null;
	InventoryTabDrawer._dragTabDeltaY = null;
	InventoryTabDrawer._draggedItemIndex = null;
	InventoryTabDrawer._draggedItemX = null;
	InventoryTabDrawer._draggedItemY = null;
	InventoryTabDrawer._currentSettingsScrollMode = null;
};


InventoryTabDrawer.onHover = function(x, y) {
	var normalizedX = x - InventoryTabDrawer._x;
	var normalizedY = y - InventoryTabDrawer._y;
	if (InventoryTabDrawer._dragMode == null) {
		if (InventoryTabDrawer.currentTab == InventoryTabDrawer.ITEMS_TAB) {
			InventoryTabDrawer._currentHoveredCellIndex = 
					InventoryTabDrawer._helperGetInventorySlotFromClickCoords(normalizedX, 
							normalizedY);
		} else if (InventoryTabDrawer.currentTab == 
				InventoryTabDrawer.EQUIPMENT_TAB) {
			var possibleItemIndex;
			if ((possibleItemIndex = 
					InventoryTabDrawer._helperGetInventorySlotFromClickCoords(normalizedX, 
							normalizedY) != -1)) {
				InventoryTabDrawer._currentHoveredCellIndex = 
						InventoryTabDrawer._helperGetEquippedItemSlotFromClickCoords(
							normalizedX, normalizedY);
			}
			/*TODO handle selection for equipped items*/
		}
	} else {
		InventoryTabDrawer._currentHoveredCellIndex = null;
	}
};


// Draws the inventory tab drawer, if open.
InventoryTabDrawer.draw = function(ctx) {
	if (!InventoryTabDrawer.isOpen) {
		return;
	}
	for (var i = 0; i < InventoryTabDrawer.TAB_ICON_IMGS.length; i++) {
		var tabX =InventoryTabDrawer._x + 
				(i * InventoryTabDrawer.TAB_BACK_IMGS[0].width);
		ctx.drawImage(InventoryTabDrawer.TAB_BACK_IMGS[
				Math.abs(InventoryTabDrawer.currentTab - i)], 
				tabX, InventoryTabDrawer._y);
		ctx.drawImage(InventoryTabDrawer.TAB_ICON_IMGS[i], 
				tabX + InventoryTabDrawer.TAB_ICON_OFFSET_X,
				InventoryTabDrawer._y + 
						InventoryTabDrawer.TAB_ICON_OFFSET_Y);
	}
	var bodyY = 
			InventoryTabDrawer._y + InventoryTabDrawer.TAB_BACK_IMGS[0].height;
	ctx.drawImage(InventoryTabDrawer.BODY_IMG, InventoryTabDrawer._x, 
			bodyY);
	switch (InventoryTabDrawer.currentTab) {
		case InventoryTabDrawer.ITEMS_TAB:
			InventoryTabDrawer._drawItems(ctx, InventoryTabDrawer._x, 
					InventoryTabDrawer._y);
			InventoryTabDrawer._drawMoney(ctx, InventoryTabDrawer._x, 
					bodyY + InventoryTabDrawer.BODY_IMG.height);
			break;
		case InventoryTabDrawer.EQUIPMENT_TAB:
			InventoryTabDrawer._drawEquipment(ctx, InventoryTabDrawer._x, 
					InventoryTabDrawer._y);
			InventoryTabDrawer._drawMoney(ctx, InventoryTabDrawer._x, 
					bodyY + InventoryTabDrawer.BODY_IMG.height);
			break;
		case InventoryTabDrawer.SETTINGS_TAB:
			InventoryTabDrawer._drawSettings(ctx, InventoryTabDrawer._x, 
					InventoryTabDrawer._y);
			break;
	}
};


InventoryTabDrawer._drawItems = function(ctx, x, y) {
	var fraction = InventoryTabDrawer._scrollBars[
			InventoryTabDrawer.ITEMS_TAB].getScrollFraction();
	var pixOffset = fraction * InventoryTabDrawer.SCROLLABLE_PIXELS;
	var offset = pixOffset % InventoryTabDrawer.CELL_POSITION_GAP;
	var index = Math.floor(pixOffset / InventoryTabDrawer.CELL_POSITION_GAP) * 
			InventoryTabDrawer.CELLS_PER_ROW;
	InventoryTabDrawer._drawInventoryCells(ctx, x, y, index, offset, 
			false /* isEquips */);
	InventoryTabDrawer._scrollBars[InventoryTabDrawer.ITEMS_TAB].draw(ctx, 
			x + InventoryTabDrawer.SCROLLBAR_OFFSET_X, 
			y + InventoryTabDrawer.SCROLLBAR_OFFSET_Y);
	InventoryTabDrawer._helperMaybeDrawDescription(ctx, x, y);
	InventoryTabDrawer._helperMaybeDrawDraggedItem(ctx, x, y, 
			false /* isEquips */);
};


InventoryTabDrawer._drawEquipment = function(ctx, x, y) {
	var fraction = InventoryTabDrawer._scrollBars[
			InventoryTabDrawer.EQUIPMENT_TAB].getScrollFraction();
	var pixOffset = fraction * InventoryTabDrawer.SCROLLABLE_PIXELS;
	var offset = pixOffset % InventoryTabDrawer.CELL_POSITION_GAP;
	var index = Math.floor(pixOffset / InventoryTabDrawer.CELL_POSITION_GAP) * 
			InventoryTabDrawer.CELLS_PER_ROW;
	InventoryTabDrawer._drawInventoryCells(ctx, x, y, index, offset, 
			true /* isEquips */);
	InventoryTabDrawer._helperDrawEquippedItems(ctx, x, y);
	InventoryTabDrawer._scrollBars[InventoryTabDrawer.EQUIPMENT_TAB].draw(ctx, 
			x + InventoryTabDrawer.SCROLLBAR_OFFSET_X, 
			y + InventoryTabDrawer.SCROLLBAR_OFFSET_Y);
	InventoryTabDrawer._helperMaybeDrawDescription(ctx, x, y);
	InventoryTabDrawer._helperMaybeDrawDraggedItem(ctx, x, y, 
			true /* isEquips */);
};


InventoryTabDrawer._drawMoney = function(ctx, x, y) {
	ctx.drawImage(InventoryTabDrawer.MONEY_BACK_IMG, x, y);
	var moneyStr = GameState.player.money.toString();
	GlyphDrawer.drawText(ctx, InventoryTabDrawer.MONEY_FONT, moneyStr, 
			x + InventoryTabDrawer.MONEY_OFFSET_X + 
					(InventoryTabDrawer.MONEY_MAX_GLYPHS - moneyStr.length) * 
					InventoryTabDrawer.MONEY_DELTA_X, 
			y + InventoryTabDrawer.MONEY_OFFSET_Y, 
			InventoryTabDrawer.MONEY_BACK_IMG.width, 
			InventoryTabDrawer.MONEY_BACK_IMG.height);
};


InventoryTabDrawer._drawSettings = function(ctx, x, y) {
// TODO: implement later
	var fraction = InventoryTabDrawer._scrollBars[
			InventoryTabDrawer.SETTINGS_TAB].getScrollFraction();
	var pixOffset = fraction * InventoryTabDrawer.SCROLLABLE_PIXELS;
	InventoryTabDrawer._drawSettingsContents(ctx, x, y, pixOffset);
	InventoryTabDrawer._scrollBars[InventoryTabDrawer.SETTINGS_TAB].draw(ctx, 
			x + InventoryTabDrawer.SCROLLBAR_OFFSET_X, 
			y + InventoryTabDrawer.SCROLLBAR_OFFSET_Y);
};


// Draws the body of the settings tab
InventoryTabDrawer._drawSettingsContents = function(ctx, x, y, pixelOffset) {
	var clipX = x + InventoryTabDrawer.WINDOW_BODY_LEFT;
	var clipY = y + InventoryTabDrawer.WINDOW_BODY_TOP;
	var drawX = clipX;
	var drawY = clipY - pixelOffset;
	var scrollBarX = x + InventoryTabDrawer.SETTINGS_SCROLL_X;
	// Draw contents.
	ctx.save();
	// Specify clipping path.
	ctx.beginPath();
	ctx.rect(clipX, clipY, InventoryTabDrawer.WINDOW_BODY_WIDTH, 
			InventoryTabDrawer.WINDOW_BODY_HEIGHT);
	ctx.clip();
	// Draw clipped contents.
  ctx.beginPath();
	// Draw BGM contents.
	GlyphDrawer.drawText(ctx, 'test', 'BGM', drawX, drawY, 
			InventoryTabDrawer.WINDOW_BODY_WIDTH, 
			InventoryTabDrawer.SETTINGS_HEADINGS_SPACING);
	InventoryTabDrawer._settingsScrollBars[
			InventoryTabDrawer.SettingsScrollBarIndexes.BGM].draw(
			ctx, scrollBarX, drawY + InventoryTabDrawer.SETTINGS_CONTENTS_OFFSET);
	// Draw SFX contents.
	GlyphDrawer.drawText(ctx, 'test', 'SFX', drawX, 
			drawY + InventoryTabDrawer.SETTINGS_HEADINGS_SPACING, 
			InventoryTabDrawer.WINDOW_BODY_WIDTH, 
			InventoryTabDrawer.SETTINGS_HEADINGS_SPACING);
	InventoryTabDrawer._settingsScrollBars[
			InventoryTabDrawer.SettingsScrollBarIndexes.SFX].draw(
			ctx, scrollBarX, drawY + InventoryTabDrawer.SETTINGS_HEADINGS_SPACING + 
					InventoryTabDrawer.SETTINGS_CONTENTS_OFFSET);
	// Draw Save Button contents.
	InventoryTabDrawer._saveButton.draw(ctx, drawX, 
			drawY + InventoryTabDrawer.SAVE_BUTTON_Y);
	// Draw Exit Button contents.
	InventoryTabDrawer._exitButton.draw(ctx, drawX, 
			drawY + InventoryTabDrawer.EXIT_BUTTON_Y);

	// Restore context to previous state. 
	ctx.restore();
};


// Draws inventory items given scroll offset.
InventoryTabDrawer._drawInventoryCells = function(ctx, x, y, itemIndex, offset, 
		isEquips) {
	var cellHeight = InventoryTabDrawer.CELL_IMG.height;
	var itemsArray = isEquips ? InventoryTabDrawer._inventory.equipEntries : 
			InventoryTabDrawer._inventory.itemEntries;
	var windowY = InventoryTabDrawer.WINDOW_BODY_HEIGHT;
	var windowBodyTop = InventoryTabDrawer.WINDOW_BODY_TOP;
	for (var yPos = -offset, 
			nextYPos = yPos + cellHeight + InventoryTabDrawer.CELL_SPACING; 
			yPos < windowY; (yPos = nextYPos) && 
					(nextYPos += cellHeight + InventoryTabDrawer.CELL_SPACING)) {
		for (var i = 0; i < InventoryTabDrawer.CELLS_PER_ROW; i++) {
			if (yPos < 0) {
				var cellWidth = InventoryTabDrawer.CELL_IMG.width;
				var cellPartialHeight = InventoryTabDrawer.CELL_IMG.height + yPos;
				ctx.drawImage(InventoryTabDrawer.CELL_IMG, 0, -yPos, cellWidth, 
							cellPartialHeight, x + InventoryTabDrawer.CELL_EDGE_OFFSET + 
									i * (InventoryTabDrawer.CELL_POSITION_GAP), 
							y + windowBodyTop, cellWidth, cellPartialHeight);
				if (itemIndex == InventoryTabDrawer._draggedItemIndex && 
						!InventoryTabDrawer._draggedItemFixedPos) {
					itemIndex++;
					continue;
				}
				var itemEntry = itemsArray[itemIndex++];
				if (itemEntry) {
					var cellX = x + InventoryTabDrawer.CELL_EDGE_OFFSET + 
							i * (InventoryTabDrawer.CELL_POSITION_GAP);
					var drawY = y + windowBodyTop;
					ctx.drawImage(itemEntry.item.sprite, 0, -yPos, cellWidth, 
							cellPartialHeight, cellX, drawY, cellWidth, cellPartialHeight);
					if (!isEquips && itemEntry.quantity > 1) {
						var cellY = drawY + yPos;
						var clipY = InventoryTabDrawer.CELL_IMG.height - 
								InventoryTabDrawer.QUANTITY_OFFSET_Y - cellPartialHeight;
						var quantityStr = itemEntry.quantity.toString();
						GlyphDrawer.drawCutText(ctx, InventoryTabDrawer.QUANTITY_FONT, 
								quantityStr, cellX + InventoryTabDrawer.QUANTITY_OFFSET_X + 
										(InventoryTabDrawer.QUANTITY_MAX_GLYPHS - 
												quantityStr.length) * 
														InventoryTabDrawer.QUANTITY_DELTA_X, 
								Math.max(cellY + InventoryTabDrawer.QUANTITY_OFFSET_Y, drawY), 
								0, clipY, InventoryTabDrawer.CELL_IMG.width - 
										InventoryTabDrawer.QUANTITY_OFFSET_X, cellPartialHeight);
					}
				}
			} else if (nextYPos >= windowY) {
				var cellWidth = InventoryTabDrawer.CELL_IMG.width;
				var cellPartialHeight = Math.min(windowY - yPos, 
						InventoryTabDrawer.CELL_IMG.height);
				ctx.drawImage(InventoryTabDrawer.CELL_IMG, 0, 0, cellWidth, 
						cellPartialHeight, x + InventoryTabDrawer.CELL_EDGE_OFFSET + 
								i * (InventoryTabDrawer.CELL_POSITION_GAP), 
						y + windowBodyTop + yPos, cellWidth, cellPartialHeight);
				if (itemIndex == InventoryTabDrawer._draggedItemIndex && 
						!InventoryTabDrawer._draggedItemFixedPos) {
					itemIndex++;
					continue;
				}
				var itemEntry = itemsArray[itemIndex++];
				if (itemEntry) {
					var cellX = x + InventoryTabDrawer.CELL_EDGE_OFFSET + 
							i * (InventoryTabDrawer.CELL_POSITION_GAP);
					var cellY = y + windowBodyTop + yPos;
					ctx.drawImage(itemEntry.item.sprite, 0, 0, cellWidth, 
							cellPartialHeight, cellX, cellY, cellWidth, cellPartialHeight);
					if (!isEquips && itemEntry.quantity > 1 && cellPartialHeight > 
							InventoryTabDrawer.QUANTITY_OFFSET_Y) {
						var quantityStr = itemEntry.quantity.toString();
						GlyphDrawer.drawCutText(ctx, InventoryTabDrawer.QUANTITY_FONT, 
								quantityStr, cellX + InventoryTabDrawer.QUANTITY_OFFSET_X + 
										(InventoryTabDrawer.QUANTITY_MAX_GLYPHS - 
												quantityStr.length) * 
														InventoryTabDrawer.QUANTITY_DELTA_X, 
								cellY + InventoryTabDrawer.QUANTITY_OFFSET_Y, 0, 0,
								InventoryTabDrawer.CELL_IMG.width - 
										InventoryTabDrawer.QUANTITY_OFFSET_X, 
								cellPartialHeight - InventoryTabDrawer.QUANTITY_OFFSET_Y);
					}
				}
			} else {
				ctx.drawImage(InventoryTabDrawer.CELL_IMG, 
						x + InventoryTabDrawer.CELL_EDGE_OFFSET + 
								i * (InventoryTabDrawer.CELL_POSITION_GAP), 
						y + windowBodyTop + yPos);
				if (itemIndex == InventoryTabDrawer._draggedItemIndex && 
						!InventoryTabDrawer._draggedItemFixedPos) {
					itemIndex++;
					continue;
				}
				var itemEntry = itemsArray[itemIndex++];
				if (itemEntry) {
					var cellX = x + InventoryTabDrawer.CELL_EDGE_OFFSET + 
							i * (InventoryTabDrawer.CELL_POSITION_GAP);
					var cellY = y + windowBodyTop + yPos;
					ctx.drawImage(itemEntry.item.sprite, cellX, cellY);
					if (!isEquips && itemEntry.quantity > 1) {
						var quantityStr = itemEntry.quantity.toString();
						GlyphDrawer.drawText(ctx, InventoryTabDrawer.QUANTITY_FONT, 
								quantityStr, cellX + InventoryTabDrawer.QUANTITY_OFFSET_X + 
										(InventoryTabDrawer.QUANTITY_MAX_GLYPHS - 
												quantityStr.length) * 
														InventoryTabDrawer.QUANTITY_DELTA_X, 
								cellY + InventoryTabDrawer.QUANTITY_OFFSET_Y, 
								InventoryTabDrawer.CELL_IMG.width - 
										InventoryTabDrawer.QUANTITY_OFFSET_X, 
								InventoryTabDrawer.CELL_IMG.height - 
										InventoryTabDrawer.QUANTITY_OFFSET_Y);
					}
				}
			}
		}	
	} 
};


// Draws four equipment slots to the left of the window.
InventoryTabDrawer._helperDrawEquippedItems = function(ctx, x, y) {
	for (var i = 0; i < EquippedItems.NUM_SLOTS; i++) {
		var cellX = x + InventoryTabDrawer.EQUIPPED_ITEMS_X;
		var cellY = y + InventoryTabDrawer.EQUIPPED_ITEMS_Y_POSITIONS[i];
		ctx.drawImage(InventoryTabDrawer.CELL_IMG, cellX, cellY);
		var possibleItem;
		if (possibleItem = InventoryTabDrawer._equippedItems.items[i]) {
			ctx.drawImage(possibleItem.sprite, cellX, cellY);
		}
	}
};


// Draw the current dragged item (if exists) with its center at the current mouse
// position.
InventoryTabDrawer._helperMaybeDrawDraggedItem = function(ctx, x, y, isEquips) {
	if (InventoryTabDrawer._draggedItemIndex == null || 
			InventoryTabDrawer._draggedItemFixedPos) {
		return;
	}
	// Normal inventory cell
	var itemsArray = isEquips ? InventoryTabDrawer._inventory.equipEntries : 
			InventoryTabDrawer._inventory.itemEntries;
	var itemEntry = itemsArray[InventoryTabDrawer._draggedItemIndex];
	if (itemEntry) {
		var cellX = InventoryTabDrawer._draggedItemX;
		var cellY = InventoryTabDrawer._draggedItemY;
		ctx.drawImage(itemEntry.item.sprite, cellX, cellY);
		if (!isEquips && itemEntry.quantity > 1) {
			var quantityStr = itemEntry.quantity.toString();
			GlyphDrawer.drawText(ctx, InventoryTabDrawer.QUANTITY_FONT, 
					quantityStr, cellX + InventoryTabDrawer.QUANTITY_OFFSET_X + 
							(InventoryTabDrawer.QUANTITY_MAX_GLYPHS - 
									quantityStr.length) * 
											InventoryTabDrawer.QUANTITY_DELTA_X, 
					cellY + InventoryTabDrawer.QUANTITY_OFFSET_Y, 
					InventoryTabDrawer.CELL_IMG.width - 
							InventoryTabDrawer.QUANTITY_OFFSET_X, 
					InventoryTabDrawer.CELL_IMG.height - 
							InventoryTabDrawer.QUANTITY_OFFSET_Y);
		}
	}
};


// Draws the description if the mouse if hovering over a non-null inventory 
// slot.
InventoryTabDrawer._helperMaybeDrawDescription = function(ctx, x, y) {
	var itemIndex = InventoryTabDrawer._currentHoveredCellIndex;
	var entries = (InventoryTabDrawer.currentTab == 
					InventoryTabDrawer.ITEMS_TAB) ? 
			InventoryTabDrawer._inventory.itemEntries : 
			InventoryTabDrawer._inventory.equipEntries;
	if (entries[itemIndex] != null) {
		// TODO: make constants.
		var descriptionX = x + InventoryTabDrawer.BODY_IMG.width;
		var descriptionY = y + InventoryTabDrawer.TAB_BACK_IMGS[0].height;
		ctx.drawImage(InventoryTabDrawer.DESCRIPTION_BACK, descriptionX, 
				descriptionY);
		GlyphDrawer.drawText(ctx, InventoryTabDrawer.DESCRIPTION_FONT, 
				entries[itemIndex].item.description /*use actual description*/, 
						descriptionX, descriptionY, 
						InventoryTabDrawer.DESCRIPTION_BACK.width, 
						InventoryTabDrawer.DESCRIPTION_BACK.height);
	}
};


// Helper to get the item slot index of a click location.
InventoryTabDrawer._helperGetInventorySlotFromClickCoords = function(
		normalizedX, normalizedY) {
	var cellPositionGap = InventoryTabDrawer.CELL_POSITION_GAP;
	var cellXDelta = cellPositionGap;
	if (normalizedX < InventoryTabDrawer.WINDOW_BODY_LEFT || 
			normalizedX >= InventoryTabDrawer.WINDOW_BODY_RIGHT || 
			normalizedY < InventoryTabDrawer.WINDOW_BODY_TOP || 
			normalizedY >= InventoryTabDrawer.WINDOW_BODY_BOT) {
		return -1;
	}
	var pixOffset = InventoryTabDrawer._scrollBars[
			InventoryTabDrawer.currentTab].getScrollFraction() * 
			InventoryTabDrawer.SCROLLABLE_PIXELS;
	var offset = pixOffset % cellPositionGap;
	var numCellsOffset = Math.floor(pixOffset / cellPositionGap);
	normalizedX -= InventoryTabDrawer.WINDOW_BODY_LEFT;
	normalizedY += offset - InventoryTabDrawer.WINDOW_BODY_TOP;
	return (normalizedX % cellXDelta >= InventoryTabDrawer.CELL_IMG.width || 
			normalizedY % cellXDelta >= InventoryTabDrawer.CELL_IMG.height) ? -1 : 
			Math.floor(normalizedX / cellXDelta) + 
					(Math.floor(normalizedY / cellXDelta) + numCellsOffset) * 
					InventoryTabDrawer.CELLS_PER_ROW;
};


// Helper to return coordinates of a cell's topleft corner  wrt current scroll;
// these coordinates are normalized.
InventoryTabDrawer._helperGetCellCoords = function(index) {
	var pixOffset = InventoryTabDrawer._scrollBars[
			InventoryTabDrawer.ITEMS_TAB].getScrollFraction() * 
			InventoryTabDrawer.SCROLLABLE_PIXELS;
	return {
		x: (index % 4) * InventoryTabDrawer.CELL_POSITION_GAP + 
				InventoryTabDrawer.CELL_EDGE_OFFSET,
		y: Math.floor(index / 4) * InventoryTabDrawer.CELL_POSITION_GAP - 
				pixOffset + InventoryTabDrawer.WINDOW_BODY_TOP
	};
};


// Anticipates the mouse posiiton to be inside the rectangular window bounds
InventoryTabDrawer._helperGetCellRelativeCoords = function(normalizedX, 
		normalizedY) {
	var pixOffset = InventoryTabDrawer._scrollBars[
			InventoryTabDrawer.ITEMS_TAB].getScrollFraction() * 
			InventoryTabDrawer.SCROLLABLE_PIXELS;
	var offset = pixOffset % InventoryTabDrawer.CELL_POSITION_GAP;
	var index = Math.floor(pixOffset / InventoryTabDrawer.CELL_POSITION_GAP) * 
			InventoryTabDrawer.CELLS_PER_ROW;
	var offsetNormalizedX = normalizedX - InventoryTabDrawer.WINDOW_BODY_LEFT;
	var offsetNormalizedY = normalizedY + offset - 
			InventoryTabDrawer.WINDOW_BODY_TOP;
	return {
		x: offsetNormalizedX % InventoryTabDrawer.CELL_POSITION_GAP, 
		y: offsetNormalizedY % InventoryTabDrawer.CELL_POSITION_GAP
	};
};


// Returns an equipped item index; returns -1 if coordinates are not within an
// euqipped item cell.
InventoryTabDrawer._helperGetEquippedItemSlotFromClickCoords = function(
		normalizedX, normalizedY) {
	if (normalizedX < InventoryTabDrawer.EQUIPPED_ITEMS_X || 
			normalizedY < InventoryTabDrawer.EQUIPPED_ITEMS_Y_POSITIONS[0] || 
			normalizedX > InventoryTabDrawer.EQUIPPED_ITEMS_X + 
					InventoryTabDrawer.CELL_IMG.width ||
			normalizedY > 
					InventoryTabDrawer.EQUIPPED_ITEMS_Y_POSITIONS[
							EquippedItems.NUM_SLOTS - 1] 
					+ InventoryTabDrawer.CELL_IMG.height) {
		return -1;
	}
	for (var i = 0; i < EquippedItems.NUM_SLOTS; i++) {
		if (normalizedY > InventoryTabDrawer.EQUIPPED_ITEMS_Y_POSITIONS[i] && 
			normalizedY < InventoryTabDrawer.EQUIPPED_ITEMS_Y_POSITIONS[i] + 
					InventoryTabDrawer.CELL_IMG.height) {
			return i;
		}
	}
};


// NOT USED
InventoryTabDrawer._helperGetEquippedItemSlotCoords = function(
		index) {
	return {
		x: InventoryTabDrawer.EQUIPPED_ITEMS_X,
		y: InventoryTabDrawer.EQUIPPED_ITEMS_Y_POSITIONS[index]
	};
};


// Returns the index of the currently selected settings scroll bar bubble.
InventoryTabDrawer._helperGetSettingsScrollBubbleIndex = function(normalizedX, 
		normalizedY) {
	var pixOffset = InventoryTabDrawer._scrollBars[
			InventoryTabDrawer.SETTINGS_TAB].getScrollFraction() * 
			InventoryTabDrawer.SCROLLABLE_PIXELS;
	if (normalizedX < InventoryTabDrawer.WINDOW_BODY_LEFT || 
			normalizedX >= InventoryTabDrawer.WINDOW_BODY_RIGHT || 
			normalizedY < InventoryTabDrawer.WINDOW_BODY_TOP || 
			normalizedY >= InventoryTabDrawer.WINDOW_BODY_BOT) {
		return -1;
	}
	for (var i = 0; i < InventoryTabDrawer._settingsScrollBars.length; i++) {
		if (InventoryTabDrawer._settingsScrollBars[i].isInBubble(
				normalizedX - InventoryTabDrawer.SETTINGS_SCROLL_X, 
				normalizedY - ((i * InventoryTabDrawer.SETTINGS_HEADINGS_SPACING + 
						InventoryTabDrawer.SETTINGS_CONTENTS_OFFSET + 
						InventoryTabDrawer.WINDOW_BODY_TOP) - pixOffset))) {
			return i;
		}
	}
	return -1;
};


// Returns the index of the currently selected settings scroll bar.
InventoryTabDrawer._helperGetSettingsScrollBarIndex = function(normalizedX, 
		normalizedY) {
	var pixOffset = InventoryTabDrawer._scrollBars[
			InventoryTabDrawer.SETTINGS_TAB].getScrollFraction() * 
			InventoryTabDrawer.SCROLLABLE_PIXELS;
	if (normalizedX < InventoryTabDrawer.WINDOW_BODY_LEFT || 
			normalizedX >= InventoryTabDrawer.WINDOW_BODY_RIGHT || 
			normalizedY < InventoryTabDrawer.WINDOW_BODY_TOP || 
			normalizedY >= InventoryTabDrawer.WINDOW_BODY_BOT) {
		return -1;
	}
	for (var i = 0; i < InventoryTabDrawer._settingsScrollBars.length; i++) {
		if (InventoryTabDrawer._settingsScrollBars[i].isInLine(
				normalizedX - InventoryTabDrawer.SETTINGS_SCROLL_X, 
				normalizedY - ((i * InventoryTabDrawer.SETTINGS_HEADINGS_SPACING + 
						InventoryTabDrawer.SETTINGS_CONTENTS_OFFSET + 
						InventoryTabDrawer.WINDOW_BODY_TOP) - pixOffset))) {
			return i;
		}
	}
	return -1;
};


// Gets the index of a tab given normalized coordinates. Returns -1 if out of
// bounds.
InventoryTabDrawer._helperGetTabFromClickCoords = function(normalizedX, 
		normalizedY) {
	var tabIndex = 
			Math.floor(normalizedX / InventoryTabDrawer.TAB_BACK_IMGS[0].width);
	return (normalizedY > InventoryTabDrawer.TAB_BACK_IMGS[0].height || 
			normalizedY < 0 || tabIndex < 0 || 
			tabIndex >= InventoryTabDrawer.TAB_BACK_IMGS.length) ? -1 : tabIndex;
};


InventoryTabDrawer.tick = function() {

};