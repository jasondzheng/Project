/**
 * Draws the player HP bar at the specified center/bottom location on the 
 * screen. HP changes colors as it decreases (follows the same gradient as 
 * UnitHpDrawer)
 */
var PlayerHpDrawer = {};

// Pixel dimmentions of the whole bar
PlayerHpDrawer.BAR_WIDTH = 800;
PlayerHpDrawer.BAR_HEIGHT = 30;
PlayerHpDrawer.BAR_INNER_SPACING = 4;
PlayerHpDrawer.BAR_TOP_Y = 650;
PlayerHpDrawer.BAR_FLAT_START_X = 255;

// Commonly used derivad constants 
PlayerHpDrawer.BAR_FLAT_WIDTH = PlayerHpDrawer.BAR_WIDTH - 
		PlayerHpDrawer.BAR_HEIGHT;
PlayerHpDrawer.BAR_FLAT_END_X = PlayerHpDrawer.BAR_FLAT_START_X + 
		PlayerHpDrawer.BAR_FLAT_WIDTH;
PlayerHpDrawer.BAR_INNER_HEIGHT = PlayerHpDrawer.BAR_HEIGHT - 
		PlayerHpDrawer.BAR_INNER_SPACING * 2;
PlayerHpDrawer.BAR_HEIGHT_HALF = PlayerHpDrawer.BAR_HEIGHT / 2;
PlayerHpDrawer.BAR_INNER_HEIGHT_HALF = PlayerHpDrawer.BAR_INNER_HEIGHT / 2;

// The hp being visually shown
PlayerHpDrawer.shownHp;

// Draws the shown player hp bar based on constants within the class
PlayerHpDrawer.drawHp = function(ctx) {
	// Draw white background for HP bar
	ctx.fillStyle = 'white';
	ctx.beginPath();
	ctx.ellipse(PlayerHpDrawer.BAR_FLAT_START_X, 
			PlayerHpDrawer.BAR_TOP_Y + PlayerHpDrawer.BAR_HEIGHT_HALF, 
			PlayerHpDrawer.BAR_HEIGHT_HALF, PlayerHpDrawer.BAR_HEIGHT_HALF, 0, 
			Math.PI / 2, 3 * Math.PI / 2);
	ctx.fill();
	ctx.beginPath();
	ctx.ellipse(PlayerHpDrawer.BAR_FLAT_END_X, 
			PlayerHpDrawer.BAR_TOP_Y + PlayerHpDrawer.BAR_HEIGHT_HALF, 
			PlayerHpDrawer.BAR_HEIGHT_HALF, PlayerHpDrawer.BAR_HEIGHT_HALF, 0, 
			3 * Math.PI / 2, Math.PI / 2);
	ctx.fill();
	ctx.fillRect(PlayerHpDrawer.BAR_FLAT_START_X, PlayerHpDrawer.BAR_TOP_Y, 
			PlayerHpDrawer.BAR_FLAT_WIDTH, PlayerHpDrawer.BAR_HEIGHT);
	
	if (PlayerHpDrawer.shownHp == 0) {	
		return;
	}

	// Draw filled HP bar
	var hpFraction = (PlayerHpDrawer.shownHp - 1) / (GameState.player.maxHp - 1);
	ctx.fillStyle = UnitHpDrawer.getHpColor(hpFraction);
	var hpWidth = Math.floor(hpFraction * PlayerHpDrawer.BAR_FLAT_WIDTH);
	ctx.beginPath();
	ctx.ellipse(PlayerHpDrawer.BAR_FLAT_START_X, 
			PlayerHpDrawer.BAR_TOP_Y + PlayerHpDrawer.BAR_HEIGHT_HALF, 
			PlayerHpDrawer.BAR_INNER_HEIGHT_HALF, 
			PlayerHpDrawer.BAR_INNER_HEIGHT_HALF, 0, Math.PI / 2, 3 * Math.PI / 2);
	ctx.fill();
	ctx.beginPath();
	ctx.ellipse(hpWidth + PlayerHpDrawer.BAR_FLAT_START_X, 
			PlayerHpDrawer.BAR_TOP_Y + PlayerHpDrawer.BAR_HEIGHT_HALF, 
			PlayerHpDrawer.BAR_INNER_HEIGHT_HALF, 
			PlayerHpDrawer.BAR_INNER_HEIGHT_HALF, 0, 3 * Math.PI / 2, Math.PI / 2);
	ctx.fill();
	ctx.fillRect(PlayerHpDrawer.BAR_FLAT_START_X, 
			PlayerHpDrawer.BAR_TOP_Y + PlayerHpDrawer.BAR_INNER_SPACING, hpWidth, 
			PlayerHpDrawer.BAR_INNER_HEIGHT);
};

// Changes the shown hp by a maximum value of 1 at every tick to smoothly 
// transtition from shown hp to actual player hp.
PlayerHpDrawer.tick = function() {
	if (PlayerHpDrawer.shownHp == undefined) {
		PlayerHpDrawer.shownHp = GameState.player.hp;
	} else if (PlayerHpDrawer.shownHp != GameState.player.hp) {
		PlayerHpDrawer.shownHp += 
				(GameState.player.hp - PlayerHpDrawer.shownHp) > 0 ? 1 : -1;
	}
};





