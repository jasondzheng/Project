/**
 * Draws HP bars above every unit that is provided. Anticipates MapDrawer to
 * call updateUnitDrawPosition to signal all units which need HP bars to be
 * drawn.
 */

var UnitHpDrawer = {};

UnitHpDrawer.DEFAULT_BAR_WIDTH = 2;
UnitHpDrawer.MIN_BAR_WIDTH = 48;
UnitHpDrawer.OPACITY_DECR_RATE = 0.1;
UnitHpDrawer.HP_BAR_HEIGHT = 12;
UnitHpDrawer.HP_BAR_HEIGHT_HALF = UnitHpDrawer.HP_BAR_HEIGHT / 2;
UnitHpDrawer.HP_BAR_OUTLINE_SIZE = 2;

UnitHpDrawer.HP_COLOR_INFO = {
	topRed: 4,
	topGreen: 255,
	topBlue: 59,
	midRed: 255,
	midGreen: 253,
	midBlue: 43,
	botRed: 255,
	botGreen: 70,
	botBlue: 41
};
// The differences in color values between the top and mid colors
UnitHpDrawer.HP_COLOR_INFO.midRedDelta = UnitHpDrawer.HP_COLOR_INFO.topRed - 
		UnitHpDrawer.HP_COLOR_INFO.midRed;
UnitHpDrawer.HP_COLOR_INFO.midGreenDelta = UnitHpDrawer.HP_COLOR_INFO.topGreen - 
		UnitHpDrawer.HP_COLOR_INFO.midGreen;
UnitHpDrawer.HP_COLOR_INFO.midBlueDelta = UnitHpDrawer.HP_COLOR_INFO.topBlue - 
		UnitHpDrawer.HP_COLOR_INFO.midBlue;
// The differences in color values between the mid and bottom colors
UnitHpDrawer.HP_COLOR_INFO.botRedDelta = UnitHpDrawer.HP_COLOR_INFO.midRed - 
		UnitHpDrawer.HP_COLOR_INFO.botRed;
UnitHpDrawer.HP_COLOR_INFO.botGreenDelta = UnitHpDrawer.HP_COLOR_INFO.midGreen - 
		UnitHpDrawer.HP_COLOR_INFO.botGreen;
UnitHpDrawer.HP_COLOR_INFO.botBlueDelta = UnitHpDrawer.HP_COLOR_INFO.midBlue - 
		UnitHpDrawer.HP_COLOR_INFO.botBlue;

// Listing of all HP bars to be drawn, by unit id
UnitHpDrawer.hpBars = {};
UnitHpDrawer.hpBarsArray = [];
// Common parity among all HP bars that should be drawn. Used to identify which
// entries are stale due to units dying.
UnitHpDrawer.parity = false;


// Updates the position of a unit; used for tracking the unit with its HP bar.
UnitHpDrawer.updateUnitDrawPosition = function(unit, centerX, bottomY) {
	var hpBar = UnitHpDrawer.hpBars[unit.uid];
	if (hpBar) {
		hpBar.centerX = centerX;
		hpBar.bottomY = bottomY;
		hpBar.parity = UnitHpDrawer.parity; 
	} else {
		UnitHpDrawer.hpBars[unit.uid] = {
			unit: unit,
			centerX: centerX,
			bottomY: bottomY,
			parity: UnitHpDrawer.parity,
			shownHp: unit.hp,
			opacity: 1.0
		};
		UnitHpDrawer.hpBarsArray.push(UnitHpDrawer.hpBars[unit.uid]);
	}
};


UnitHpDrawer.tick = function() {
	// Processes HP bars. Changes visual HP by 1 HP per tick to match actual HP.
	// Slowly fades HP bars when HP = 0; when opacity is low enough, remove the hp
	// bar.	
	for (var i = 0; i < UnitHpDrawer.hpBarsArray.length; i++) {
		var hpBar =  UnitHpDrawer.hpBarsArray[i];
		if (UnitHpDrawer.parity != hpBar.parity && hpBar.opacity <= 10e-6) {
			UnitHpDrawer.hpBarsArray.splice(i--, 1);
			delete UnitHpDrawer.hpBars[hpBar.unit.uid];
			continue;
		}
		if (hpBar.shownHp != hpBar.unit.hp) {
			hpBar.shownHp += (hpBar.unit.hp - hpBar.shownHp) > 0 ? 1 : -1;
		} else if (hpBar.unit.hp == 0) {
			hpBar.opacity -= UnitHpDrawer.OPACITY_DECR_RATE;
		}
	}
	UnitHpDrawer.parity = !UnitHpDrawer.parity;
};


// Draws all HP bars within UnitDrawer.hpBars
UnitHpDrawer.drawHpBars = function(ctx) {
	for (var i = 0; i < UnitHpDrawer.hpBarsArray.length; i++) {
		var hpBar =  UnitHpDrawer.hpBarsArray[i];
		ctx.globalAlpha = hpBar.opacity;
		UnitHpDrawer._helperDrawHpBar(ctx, hpBar.centerX, hpBar.bottomY, 
				hpBar.shownHp, hpBar.unit.unitEntity.maxHp, 
				hpBar.unit.unitEntity.hpBarWidth);
	}
	ctx.globalAlpha = 1;
};


// Draws an HP bar given its center x, bottom y, HP, max HP, and width.
UnitHpDrawer._helperDrawHpBar = function(ctx, centerX, bottomY, hp, maxHp, 
		width) {
	width *= UnitHpDrawer.MIN_BAR_WIDTH;
	// Check in bounds and short circuit if not on screen
	if (!ScreenProps.isRectOnScreen(centerX - width / 2, bottomY - 
					UnitHpDrawer.HP_BAR_HEIGHT, width, UnitHpDrawer.HP_BAR_HEIGHT)) {
		return;
	}
	// White background
	ctx.fillStyle = 'grey';
	var midHeight = bottomY - UnitHpDrawer.HP_BAR_HEIGHT_HALF;
	var rectStart = centerX - width / 2 + UnitHpDrawer.HP_BAR_HEIGHT_HALF;
	ctx.beginPath();
	ctx.ellipse(rectStart, midHeight, UnitHpDrawer.HP_BAR_HEIGHT_HALF, 
			UnitHpDrawer.HP_BAR_HEIGHT_HALF, 0 /* rotation */, Math.PI / 2, 
			3 * Math.PI / 2);
	ctx.fill();
	ctx.fillRect(rectStart, bottomY - UnitHpDrawer.HP_BAR_HEIGHT, 
			width - UnitHpDrawer.HP_BAR_HEIGHT, UnitHpDrawer.HP_BAR_HEIGHT);
	ctx.beginPath();
	ctx.ellipse(centerX + width / 2 - UnitHpDrawer.HP_BAR_HEIGHT_HALF, midHeight, 
			UnitHpDrawer.HP_BAR_HEIGHT_HALF, UnitHpDrawer.HP_BAR_HEIGHT_HALF, 
			0 /* rotation */, 3 * Math.PI / 2, Math.PI / 2);
	ctx.fill();
	if (hp <= 0) {
		return;
	}
	// Draw the HP
	var hpFraction = (hp - 1) / (maxHp - 1);
	ctx.fillStyle = UnitHpDrawer.getHpColor(hpFraction);
	var hpWidth = Math.floor(hpFraction * (width - UnitHpDrawer.HP_BAR_HEIGHT));
	ctx.beginPath();
	ctx.ellipse(rectStart, midHeight, UnitHpDrawer.HP_BAR_HEIGHT_HALF - 
					UnitHpDrawer.HP_BAR_OUTLINE_SIZE, UnitHpDrawer.HP_BAR_HEIGHT_HALF - 
					UnitHpDrawer.HP_BAR_OUTLINE_SIZE, 0 /* rotation */, Math.PI / 2, 
			3 * Math.PI / 2);
	ctx.fill();
	ctx.fillRect(rectStart, bottomY - UnitHpDrawer.HP_BAR_HEIGHT + 
					UnitHpDrawer.HP_BAR_OUTLINE_SIZE, hpWidth, 
			UnitHpDrawer.HP_BAR_HEIGHT - UnitHpDrawer.HP_BAR_OUTLINE_SIZE * 2);
	ctx.beginPath();
	ctx.ellipse(rectStart + hpWidth, midHeight, 
			UnitHpDrawer.HP_BAR_HEIGHT_HALF - UnitHpDrawer.HP_BAR_OUTLINE_SIZE, 
			UnitHpDrawer.HP_BAR_HEIGHT_HALF - UnitHpDrawer.HP_BAR_OUTLINE_SIZE, 
			0 /* rotation */, 3 * Math.PI / 2, Math.PI / 2);
	ctx.fill();
};


// Provides the desired HP bar color for a given HP fraction, following a 
// gradient that transitions from green to yellow to red. Also used within 
// PlayerHpDrawer.
UnitHpDrawer.getHpColor = function(hpFraction) {
	if (hpFraction > .5) {
		hpFraction = (hpFraction - .5) / .5;
		return 'rgb(' + Math.floor(UnitHpDrawer.HP_COLOR_INFO.midRed + 
						UnitHpDrawer.HP_COLOR_INFO.midRedDelta * hpFraction) + ', ' + 
				Math.floor(UnitHpDrawer.HP_COLOR_INFO.midGreen + 
						UnitHpDrawer.HP_COLOR_INFO.midGreenDelta * hpFraction) + ', ' +
				Math.floor(UnitHpDrawer.HP_COLOR_INFO.midBlue + 
						UnitHpDrawer.HP_COLOR_INFO.midBlueDelta * hpFraction)  + ')';
	} else {
		hpFraction /= .5;
		return 'rgb(' + Math.floor(UnitHpDrawer.HP_COLOR_INFO.botRed + 
						UnitHpDrawer.HP_COLOR_INFO.botRedDelta * hpFraction) + ', ' + 
				Math.floor(UnitHpDrawer.HP_COLOR_INFO.botGreen + 
						UnitHpDrawer.HP_COLOR_INFO.botGreenDelta * hpFraction) + ', ' +
				Math.floor(UnitHpDrawer.HP_COLOR_INFO.botBlue + 
						UnitHpDrawer.HP_COLOR_INFO.botBlueDelta * hpFraction)  + ')';
	}
};


// Clears all Hp Bar entries.
UnitHpDrawer.clearHpBars = function() {
	UnitHpDrawer.hpBars = {};
	UnitHpDrawer.hpBarsArray = [];
};