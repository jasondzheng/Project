/** 
 * Draws the player's current combo on the screen. Visualization should hide 
 * or appear differently when in a non-combat map.
 */

var ComboDrawer = {};

ComboDrawer.shownCombo;

ComboDrawer.drawCombo = function(ctx) {
	ctx.font = '50px Arial';
	ctx.fillStyle = 'black';
	ctx.fillText(ComboDrawer.shownCombo + ' Combo', 30, 200);
};

ComboDrawer.tick = function() {
	if (ComboDrawer.shownCombo == undefined) {
		ComboDrawer.shownCombo = GameState.player.attackCombo;
	} else if (ComboDrawer.shownCombo != GameState.player.attackCombo) {
		ComboDrawer.shownCombo += 
				(GameState.player.attackCombo - ComboDrawer.shownCombo) > 0 ? 1 : -1;
	}
};
