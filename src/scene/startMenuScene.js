/**
 * Scene for the initial start menu that provides the interface for entering the 
 * game.
 */

var StartMenuScene = {};

StartMenuScene._lastKeyMode;
StartMenuScene._lastMouseMode;

StartMenuScene.init = function(callback) {
	StartMenuDrawer.load(function() {
		// TODO fill in.
		KeyInputRouter.setMode(KeyInputRouter.Modes.DISABLED);
		MouseInputRouter.setMode(MouseInputRouter.Modes.START_MENU_INPUT);
		callback();
	});
};

StartMenuScene.pause = function() {

};

StartMenuScene.resume = function() {
	KeyInputRouter.setMode(KeyInputRouter.Modes.DISABLED);
	MouseInputRouter.setMode(MouseInputRouter.Modes.START_MENU_INPUT)
};

StartMenuScene.reset = function() {

};

StartMenuScene.draw = function(ctx) {
	StartMenuDrawer.draw(ctx);
	ConfirmDialog.draw(ctx);
};

StartMenuScene.tick = function() {

};


// Helper to temporarily disable and shelf input handling.
StartMenuScene.disableInput = function() {
	StartMenuScene._lastKeyMode = KeyInputRouter.getMode();
	StartMenuScene._lastMouseMode = MouseInputRouter.getMode();
	KeyInputRouter.setMode(KeyInputRouter.Modes.DISABLED);
	MouseInputRouter.setMode(MouseInputRouter.Modes.DISABLED);
};


// Helper to re-enable input after a temporary disable.
StartMenuScene.reenableInput = function() {
	KeyInputRouter.setMode(StartMenuScene._lastKeyMode);
	MouseInputRouter.setMode(StartMenuScene._lastMouseMode);
};