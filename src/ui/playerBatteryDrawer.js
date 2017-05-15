/**
 * Draws the player battery leve bar at the specified center/bottom location on 
 * the screen. Battery changes colors as it decreases (follows the same gradient 
 * as UnitHpDrawer). Currently just used for testing; should be replaced with a 
 * more-suitable representation.
 */
var PlayerBatteryDrawer = {};

// Pixel dimmentions of the whole bar
PlayerBatteryDrawer.BAR_WIDTH = 800;
PlayerBatteryDrawer.BAR_HEIGHT = 30;
PlayerBatteryDrawer.BAR_INNER_SPACING = 4;
PlayerBatteryDrawer.BAR_TOP_Y = 600;
PlayerBatteryDrawer.BAR_FLAT_START_X = 255;

// Commonly used derivad constants 
PlayerBatteryDrawer.BAR_FLAT_WIDTH = PlayerBatteryDrawer.BAR_WIDTH - 
		PlayerBatteryDrawer.BAR_HEIGHT;
PlayerBatteryDrawer.BAR_FLAT_END_X = PlayerBatteryDrawer.BAR_FLAT_START_X + 
		PlayerBatteryDrawer.BAR_FLAT_WIDTH;
PlayerBatteryDrawer.BAR_INNER_HEIGHT = PlayerBatteryDrawer.BAR_HEIGHT - 
		PlayerBatteryDrawer.BAR_INNER_SPACING * 2;
PlayerBatteryDrawer.BAR_HEIGHT_HALF = PlayerBatteryDrawer.BAR_HEIGHT / 2;
PlayerBatteryDrawer.BAR_INNER_HEIGHT_HALF = PlayerBatteryDrawer.BAR_INNER_HEIGHT
		/ 2;

// The battery being visually shown
PlayerBatteryDrawer.batteryLevel;

// Draws the shown player battery level based on constants within the class
PlayerBatteryDrawer.drawBattery = function(ctx) {
	// Draw white background for battery
	ctx.fillStyle = 'white';
	ctx.beginPath();
	ctx.ellipse(PlayerBatteryDrawer.BAR_FLAT_START_X, 
			PlayerBatteryDrawer.BAR_TOP_Y + PlayerBatteryDrawer.BAR_HEIGHT_HALF, 
			PlayerBatteryDrawer.BAR_HEIGHT_HALF, PlayerBatteryDrawer.BAR_HEIGHT_HALF, 
			0, Math.PI / 2, 3 * Math.PI / 2);
	ctx.fill();
	ctx.beginPath();
	ctx.ellipse(PlayerBatteryDrawer.BAR_FLAT_END_X, 
			PlayerBatteryDrawer.BAR_TOP_Y + PlayerBatteryDrawer.BAR_HEIGHT_HALF, 
			PlayerBatteryDrawer.BAR_HEIGHT_HALF, PlayerBatteryDrawer.BAR_HEIGHT_HALF, 
			0, 3 * Math.PI / 2, Math.PI / 2);
	ctx.fill();
	ctx.fillRect(PlayerBatteryDrawer.BAR_FLAT_START_X, 
			PlayerBatteryDrawer.BAR_TOP_Y, PlayerBatteryDrawer.BAR_FLAT_WIDTH, 
			PlayerBatteryDrawer.BAR_HEIGHT);
	
	if (PlayerBatteryDrawer.batteryLevel == 0) {	
		return;
	}

	// Draw filled HP bar
	var batteryFraction = (PlayerBatteryDrawer.batteryLevel - 1) / 
			(GameState.player.batteryCapacity - 1);
	ctx.fillStyle = UnitHpDrawer.getHpColor(batteryFraction);
	var batteryWidth = 
			Math.floor(batteryFraction * PlayerBatteryDrawer.BAR_FLAT_WIDTH);
	ctx.beginPath();
	ctx.ellipse(PlayerBatteryDrawer.BAR_FLAT_START_X, 
			PlayerBatteryDrawer.BAR_TOP_Y + PlayerBatteryDrawer.BAR_HEIGHT_HALF, 
			PlayerBatteryDrawer.BAR_INNER_HEIGHT_HALF, 
			PlayerBatteryDrawer.BAR_INNER_HEIGHT_HALF, 0, Math.PI / 2, 
			3 * Math.PI / 2);
	ctx.fill();
	ctx.beginPath();
	ctx.ellipse(batteryWidth + PlayerBatteryDrawer.BAR_FLAT_START_X, 
			PlayerBatteryDrawer.BAR_TOP_Y + PlayerBatteryDrawer.BAR_HEIGHT_HALF, 
			PlayerBatteryDrawer.BAR_INNER_HEIGHT_HALF, 
			PlayerBatteryDrawer.BAR_INNER_HEIGHT_HALF, 0, 3 * Math.PI / 2, 
			Math.PI / 2);
	ctx.fill();
	ctx.fillRect(PlayerBatteryDrawer.BAR_FLAT_START_X, 
			PlayerBatteryDrawer.BAR_TOP_Y + PlayerBatteryDrawer.BAR_INNER_SPACING, 
			batteryWidth, PlayerBatteryDrawer.BAR_INNER_HEIGHT);
};

// Changes the shown battery by a maximum value of 1 at every tick to smoothly 
// transtition from shown battery to actual player battery.
PlayerBatteryDrawer.tick = function() {
	if (PlayerBatteryDrawer.batteryLevel == undefined) {
		PlayerBatteryDrawer.batteryLevel = GameState.player.batteryLevel;
	} else if (PlayerBatteryDrawer.batteryLevel < GameState.player.batteryLevel) {
		PlayerBatteryDrawer.batteryLevel = 
				Math.min(PlayerBatteryDrawer.batteryLevel + 1, 
								GameState.player.batteryLevel);
	} else {
		PlayerBatteryDrawer.batteryLevel = GameState.player.batteryLevel;
	}
};


// Rests the player battery. Used when resetting the overworld scene.
PlayerBatteryDrawer.reset = function() {
	PlayerBatteryDrawer.batteryLevel = undefined;
};





