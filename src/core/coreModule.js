/**
 * Module centralizing all necessary functions, including UI elements, event
 * hierarchy load, and basic IO.
 */

var CoreModule = {};

// The context variable obtained during loading.
CoreModule.ctx;

// The current scene being processed.
CoreModule.currentScene;


CoreModule.load = function(callback) {
	// First handle grabbing screen and inputs, disabling them
	ScreenResizeManager.init();
	var canvas = document.querySelector(ScreenProps.SCREEN_QS);
	CoreModule.ctx = canvas.getContext('2d');

	KeyTracker.attachToScreen(document.body);
	MouseTracker.attachToScreen(canvas);

	KeyInputRouter.setMode(KeyInputRouter.Modes.DISABLED);
	MouseInputRouter.setMode(MouseInputRouter.Modes.DISABLED);

	// Load save data
	GameState.saveData = SaveData.loadSave();

	var deferrer = new CallbackDeferrer();
	var parameterlessInitFns = [
		GameEventTemplate.init,
		GlyphDrawer.loadGlyphs,
		DialogDrawer.loadAssets,
		ScrollBar.load,
		InventoryTabDrawer.init,
		Item.loadItems,
		ItemDrop.init
	];
	for (var i = 0; i < parameterlessInitFns.length; i++) {
		deferrer.addUnparametered(parameterlessInitFns[i]);
	}
	deferrer.after(function(accumulatedArgs) {
		callback();
	});
};


// Ticking all necessary modules in core.
CoreModule.tick = function() {
	KeyTracker.tick();
	KeyInputRouter.tick();
	MouseTracker.tick();
	MouseInputRouter.tick();
	SoundPlayer.tick();
	ScreenEffectDrawer.tick();
};


// Draws all core module effects. Drawn after all other scenes are drawn.
CoreModule.draw = function(ctx) {
	// Draw screen effects right above all maps and unit UI
	ScreenEffectDrawer.drawEffect(ctx);
};


CoreModule.switchScene = function(scene) {
	if (CoreModule.currentScene) {
		CoreModule.currentScene.pause();
	}
 	CoreModule.currentScene = scene;
 	if (CoreModule.currentScene) {
 		CoreModule.currentScene.resume();
 	}
};
