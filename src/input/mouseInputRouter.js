var MouseInputRouter = {};

MouseInputRouter.Modes = {
	START_MENU_INPUT: {
		tick: function() {
			MouseInputRouter._helperHandleStartMenuInput();
		}
	},
	PLAYER_MAP_MOVEMENT: {
		tick: function() {
			MouseInputRouter._helperHandlePlayerMovement();
		}
	},
	INVENTORY_TAB_INPUT: {
		tick: function() {
			MouseInputRouter._helperHandleInventoryTabInput();
		}
	},
	DIALOG_INPUT: {
		tick: function() {
			MouseInputRouter._helperHandleDialogInput();
		}
	},
	DISABLED: {
		tick: function() {}
	}
};


MouseInputRouter._currentMode = MouseInputRouter.Modes.DISABLED;


MouseInputRouter.tick = function() {
	MouseInputRouter._currentMode.tick();
};


// Sets the mode to one of the above input modes.
MouseInputRouter.setMode = function(mode) {
	MouseInputRouter._currentMode = mode;
};


// Gets the current input mode.
MouseInputRouter.getMode = function() {
	return MouseInputRouter._currentMode;
};


MouseInputRouter._helperHandleStartMenuInput = function() {
	if (MouseTracker.isHover()) {
		StartMenuDrawer.onHover(MouseTracker.getMouseX(), 
				MouseTracker.getMouseY());
	} else if (MouseTracker.isStartClick()) {
		StartMenuDrawer.onStartClick(MouseTracker.getMouseX(), 
				MouseTracker.getMouseY());
	} else if (MouseTracker.isEndClick()) {
		StartMenuDrawer.onEndClick(MouseTracker.getMouseX(), 
				MouseTracker.getMouseY(), MouseTracker.isDoubleClick());
	} else if (MouseTracker.isDrag()) {
		StartMenuDrawer.onDrag(MouseTracker.getMouseX(), 
				MouseTracker.getMouseY());
	}
	StartMenuDrawer.updateCurrentScroll(MouseTracker.consumeMouseWheel());
}


MouseInputRouter._helperHandleDialogInput = 
MouseInputRouter._helperHandlePlayerMovement = function() {
	// TODO: implement later
};


MouseInputRouter._helperHandleInventoryTabInput = function() {
	if (MouseTracker.isHover()) {
		InventoryTabDrawer.onHover(MouseTracker.getMouseX(), 
				MouseTracker.getMouseY());
	} else if (MouseTracker.isStartClick()) {
		InventoryTabDrawer.onStartClick(MouseTracker.getMouseX(), 
				MouseTracker.getMouseY());
	} else if (MouseTracker.isEndClick()) {
		InventoryTabDrawer.onEndClick(MouseTracker.getMouseX(), 
				MouseTracker.getMouseY(), MouseTracker.isDoubleClick());
	} else if (MouseTracker.isDrag()) {
		InventoryTabDrawer.onDrag(MouseTracker.getMouseX(), 
				MouseTracker.getMouseY());
	}
	InventoryTabDrawer.updateCurrentScroll(MouseTracker.consumeMouseWheel());
};