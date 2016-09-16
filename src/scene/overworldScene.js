/**
 * Scene responsible for drawing overworld interactions.
 */

var OverworldScene = {};


// Last key and mouse modes before a pause
OverworldScene._lastKeyMode;
OverworldScene._lastMouseMode;


OverworldScene.init = function(callback) {
	var deferrer = new CallbackDeferrer();
	// TODO: read in actual map and player data
	deferrer.add(GameMapLoader.load, function(accumulatedArgs) {
		return ['palletTown'];
	}, ['map']);
	deferrer.add(PlayerLoader.load, function(accumulatedArgs) {
		return ['domino'];
	}, ['player']);
	deferrer.after(function(accumulatedArgs) {
		var map = GameState.map = accumulatedArgs[0].map;
		var player = GameState.player = accumulatedArgs[1].player;

		GameState.saveData.updatePlayer(player);

		// TODO: make this legit
		player.setPositionX(4);
		player.setPositionY(4);
		map.registerPlayer(player);

		map.unitSpawner.fillUnitQuotas();

		InventoryTabDrawer.setInventory(player.inventory);
		//CHECK;
		InventoryTabDrawer.setSettings(GameState.saveData.settingsInfo);

		// TODO: make this legit
		SoundPlayer.setTrack(map.tracks.marioLuigiBattle);
		SoundPlayer.pauseCurrentTrack();

		KeyInputRouter.setMode(OverworldScene._lastKeyMode = 
				KeyInputRouter.Modes.PLAYER_MAP_MOVEMENT);
		MouseInputRouter.setMode(OverworldScene._lastMouseMode = 
				MouseInputRouter.Modes.PLAYER_MAP_MOVEMENT);
		callback();
	});
};


// Resumes scene as the primary scene, taking care of all housekeeping required
// to resume from the last paused state.
OverworldScene.resume = function() {
	KeyInputRouter.setMode(OverworldScene._lastKeyMode);
	MouseInputRouter.setMode(OverworldScene._lastMouseMode);
	SoundPlayer.resumeCurrentTrack();
};


// Notifies the scene that it will be swapped out, allowing it to cease all
// function.
OverworldScene.pause = function() {
	SoundPlayer.pauseCurrentTrack();
	OverworldScene._lastKeyMode = KeyInputRouter.getMode();
	OverworldScene._lastMouseMode = MouseInputRouter.getMode();
	KeyInputRouter.setMode(KeyInputRouter.Modes.DISABLED);
	MouseInputRouter.setMode(MouseInputRouter.Modes.DISABLED);
};


// Resets the scene to a state that it would be at loadtime. Call sparingly.
OverworldScene.reset = function() {
	PlayerHpDrawer.reset();
	UnitHpDrawer.clearHpBars();
	GameMapLoader.unload(GameState.map);
	PlayerLoader.unload(GameState.player);
	if (InventoryTabDrawer.isOpen) {
		InventoryTabDrawer.isOpen = false;
	}
};


// Draws all the visual elements in the overworld scene.
OverworldScene.draw = function(ctx) {
	if (GameState.map) {
		MapDrawer.drawMap(ctx, GameState.map, Camera.x, Camera.y);
		BeatDrawer.drawBeats(ctx, ScreenProps.EXP_WIDTH_HALF, 
				ScreenProps.EXP_HEIGHT_HALF);
		MapDrawer.drawEntities(ctx, GameState.map, Camera.x, Camera.y);
		UnitHpDrawer.drawHpBars(ctx);
		PlayerHpDrawer.drawHp(ctx);
	}
	// Inventory over all map UI
	InventoryTabDrawer.draw(ctx);
	// Draw dialog over all map content
	DialogDrawer.drawDialogOverlay(ctx);
	// Draw trade interface over all map content
	TradeDrawer.drawTradeOverlay(ctx);
	// Draw possible confirm dialog
	ConfirmDialog.draw(ctx);
};


OverworldScene.tick = function() {
	if (GameState.map) {
		GameState.map.tickAll();
	}
	BeatDrawer.tick();
	UnitBeatManager.tick();
	Camera.tick();
	UnitHpDrawer.tick();
	PlayerHpDrawer.tick();
	DialogDrawer.tick();
};


// Helper to temporarily disable and shelf input handling.
OverworldScene.disableInput = function() {
	OverworldScene._lastKeyMode = KeyInputRouter.getMode();
	OverworldScene._lastMouseMode = MouseInputRouter.getMode();
	KeyInputRouter.setMode(KeyInputRouter.Modes.DISABLED);
	MouseInputRouter.setMode(MouseInputRouter.Modes.DISABLED);
};


// Helper to re-enable input after a temporary disable.
OverworldScene.reenableInput = function() {
	KeyInputRouter.setMode(OverworldScene._lastKeyMode);
	MouseInputRouter.setMode(OverworldScene._lastMouseMode);
};