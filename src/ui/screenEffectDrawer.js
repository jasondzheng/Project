/**
 * Drawer for screen effects above any map elements.
 */

var ScreenEffectDrawer = {};

// Current effect to draw
ScreenEffectDrawer._currEffect;

// Initiates effect
ScreenEffectDrawer._needsEffectStart;


ScreenEffectDrawer.tick = function() {
	if (!ScreenEffectDrawer._currEffect) {
		return;
	} else if (ScreenEffectDrawer._needsEffectStart) {
		if (ScreenEffectDrawer._currEffect.onStart) {
			ScreenEffectDrawer._currEffect.onStart();
		}
		ScreenEffectDrawer._needsEffectStart = false;
	}
	if (ScreenEffectDrawer._currEffect.isDone()) {
		var oldEffect = ScreenEffectDrawer._currEffect;
		ScreenEffectDrawer._currEffect = null;
		if (oldEffect.onEnd) {
			oldEffect.onEnd();
		}
	} else {
		ScreenEffectDrawer._currEffect.tick();
	}
};


// Draws the current screen effect
ScreenEffectDrawer.drawEffect = function(ctx) {
	if (ScreenEffectDrawer._currEffect) {
		ScreenEffectDrawer._currEffect.draw(ctx);
	}
};


// Helper to set the current effect to the provided effect
ScreenEffectDrawer._helperSetEffect = function(effect) {
	ScreenEffectDrawer._currEffect = effect;
	ScreenEffectDrawer._needsEffectStart = true;
};


// Sets current effect to a fade out effect
ScreenEffectDrawer.fadeOut = function(callback) {
	ScreenEffectDrawer._helperSetEffect(
			new ScreenEffectDrawer.FadeOutEffect(callback));
};

// Effect which starts at 0 opacity and ends in a black screen
ScreenEffectDrawer.FadeOutEffect = function(callback) {
	this._opacity = 0;
	this._callback = callback;
};

ScreenEffectDrawer.FadeOutEffect.DURATION = 60;
ScreenEffectDrawer.FadeOutEffect.OPACITY_DELTA = 
		1 / ScreenEffectDrawer.FadeOutEffect.DURATION;

ScreenEffectDrawer.FadeOutEffect.prototype.tick = function() {
	this._opacity += ScreenEffectDrawer.FadeOutEffect.OPACITY_DELTA;
};

ScreenEffectDrawer.FadeOutEffect.prototype.isDone = function() {
	return this._opacity >= 1 - 10e-6;
};

ScreenEffectDrawer.FadeOutEffect.prototype.onEnd = function() {
	this._callback();
}

ScreenEffectDrawer.FadeOutEffect.prototype.draw = function(ctx) {
	ctx.fillStyle = 'rgba(0, 0, 0, ' + this._opacity + ')';
	ctx.fillRect(0, 0, ScreenProps.EXP_WIDTH, ScreenProps.EXP_HEIGHT);
};


// Sets current effect to a fade in effect
ScreenEffectDrawer.fadeIn = function(callback) {
	ScreenEffectDrawer._helperSetEffect(
			new ScreenEffectDrawer.FadeInEffect(callback));
};

// Effect which starts at black screen and ends in 0 opacity
ScreenEffectDrawer.FadeInEffect = function(callback) {
	this._opacity = 1;
	this._callback = callback;
};

ScreenEffectDrawer.FadeInEffect.DURATION = 60;
ScreenEffectDrawer.FadeInEffect.OPACITY_DELTA = 
		1 / ScreenEffectDrawer.FadeInEffect.DURATION;

ScreenEffectDrawer.FadeInEffect.prototype.tick = function() {
	this._opacity -= ScreenEffectDrawer.FadeInEffect.OPACITY_DELTA;
};

ScreenEffectDrawer.FadeInEffect.prototype.isDone = function() {
	return this._opacity <= 10e-6;
};

ScreenEffectDrawer.FadeInEffect.prototype.onEnd = function() {
	this._callback();
}

ScreenEffectDrawer.FadeInEffect.prototype.draw = function(ctx) {
	ctx.fillStyle = 'rgba(0, 0, 0, ' + this._opacity + ')';
	ctx.fillRect(0, 0, ScreenProps.EXP_WIDTH, ScreenProps.EXP_HEIGHT);
};


// Sets current effect to a stay black effect
ScreenEffectDrawer.stayBlack = function() {
	ScreenEffectDrawer._helperSetEffect(new ScreenEffectDrawer.StayBlackEffect());
};

// Effect that keeps sceen black until another effect is set
ScreenEffectDrawer.StayBlackEffect = function() {};

ScreenEffectDrawer.StayBlackEffect.prototype.isDone = function() {
	return false;
};

ScreenEffectDrawer.StayBlackEffect.prototype.tick = function() { };

ScreenEffectDrawer.StayBlackEffect.prototype.draw = function(ctx) {
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, ScreenProps.EXP_WIDTH, ScreenProps.EXP_HEIGHT);
};