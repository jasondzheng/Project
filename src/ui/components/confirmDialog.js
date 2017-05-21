/**
 * A class for a modular confirmation dialog window; the window is customized 
 * through a message and yes and no options.
 */

var ConfirmDialog = {};

ConfirmDialog.BODY_IMG;
ConfirmDialog.YES_BUTTON_IMG;
ConfirmDialog.NO_BUTTON_IMG;

ConfirmDialog.BUTTON_PADDING = 32;
ConfirmDialog.TEXT_PADDING = 32

ConfirmDialog.MESSAGE_FONT = 'test';

ConfirmDialog.PATH = '../assets/img/ui/components/confirmDialog/'

ConfirmDialog.ReturnValues = {
	NO: 0,
	YES: 1
};

// Whether or not the player has entered a confirmation dialog.
ConfirmDialog._isOpen = false;

ConfirmDialog._message;
ConfirmDialog._yesButton;
ConfirmDialog._noButton;

ConfirmDialog._oldKeyInputMode;
ConfirmDialog._oldMouseInputMode;

ConfirmDialog._lastStartClickX;
ConfirmDialog._lastStartClickY;

ConfirmDialog.load = function(callback) {
	ImgUtils.loadImages({
		body: ConfirmDialog.PATH + 'body.png',
		yesButton: ConfirmDialog.PATH + 'yesButton.png',
		noButton: ConfirmDialog.PATH + 'noButton.png'
	}, function(imgs) {
		ConfirmDialog.BODY_IMG = imgs.body;
		ConfirmDialog.YES_BUTTON_IMG = imgs.yesButton;
		ConfirmDialog.NO_BUTTON_IMG = imgs.noButton;

		// Default coordinates for the body to be drawn if no draw coordinates are 
		// given.
		ConfirmDialog.BODY_IMG_X = 
				(ScreenProps.EXP_WIDTH - imgs.body.width) / 2;
		ConfirmDialog.BODY_IMG_Y = 
				(ScreenProps.EXP_HEIGHT - imgs.body.height) / 2;

		ConfirmDialog.MESSAGE_X = ConfirmDialog.BODY_IMG_X + 
				ConfirmDialog.TEXT_PADDING;
		ConfirmDialog.MESSAGE_Y = ConfirmDialog.BODY_IMG_Y +
				ConfirmDialog.TEXT_PADDING;
		ConfirmDialog.MESSAGE_WIDTH = imgs.body.width - 
				2 * ConfirmDialog.TEXT_PADDING;
		ConfirmDialog.MESSAGE_HEIGHT = imgs.body.height - 
				2 * ConfirmDialog.TEXT_PADDING;

		ConfirmDialog.YES_BUTTON_REL_X = imgs.body.width / 2 - 
				imgs.yesButton.width - ConfirmDialog.BUTTON_PADDING;
		ConfirmDialog.YES_BUTTON_REL_Y = imgs.body.height + 
				ConfirmDialog.BUTTON_PADDING;

		ConfirmDialog.NO_BUTTON_REL_X = imgs.body.width / 2 + 
				ConfirmDialog.BUTTON_PADDING;
		ConfirmDialog.NO_BUTTON_REL_Y = imgs.body.height + 
				ConfirmDialog.BUTTON_PADDING;

		ConfirmDialog.YES_BUTTON_X = ConfirmDialog.BODY_IMG_X + 
				ConfirmDialog.YES_BUTTON_REL_X;
		ConfirmDialog.YES_BUTTON_Y = ConfirmDialog.BODY_IMG_Y + 
				ConfirmDialog.YES_BUTTON_REL_Y;

		ConfirmDialog.NO_BUTTON_X = ConfirmDialog.BODY_IMG_X + 
				ConfirmDialog.NO_BUTTON_REL_X;
		ConfirmDialog.NO_BUTTON_Y = ConfirmDialog.BODY_IMG_Y + 
				ConfirmDialog.NO_BUTTON_REL_Y;
		callback();
	});
};


// Displays a confirm dialog with the given message. The green button will 
// trigger onYes and onNo is an optional parameter that can be set to do work 
// upon exit.
ConfirmDialog.display = function(message, onYes, opt_onNo) {
	ConfirmDialog._message = message;
	ConfirmDialog._yesButton = 
			new Button(ConfirmDialog.YES_BUTTON_IMG, true, onYes);
	var onNo = (opt_onNo ? opt_onNo : function(){});
	ConfirmDialog._noButton =
			new Button(ConfirmDialog.NO_BUTTON_IMG, true, onNo);
	ConfirmDialog._isOpen = true;
	ConfirmDialog._oldKeyInputMode = KeyInputRouter.getMode();
	ConfirmDialog._oldMouseInputMode = MouseInputRouter.getMode();
	// TODO: make confirmation dialog input modes
	KeyInputRouter.setMode(KeyInputRouter.Modes.DISABLED);
	MouseInputRouter.setMode(MouseInputRouter.Modes.CONFIRM_DIALOG_INPUT);
};


// Closes the confirmation dialog and resumes previous input. 
ConfirmDialog.exit = function() {
	ConfirmDialog._message = null;
	delete ConfirmDialog._yesButton;
	delete ConfirmDialog._noButton;

	ConfirmDialog._isOpen = false;
	KeyInputRouter.setMode(ConfirmDialog._oldKeyInputMode);
	MouseInputRouter.setMode(ConfirmDialog._oldMouseInputMode);
};


ConfirmDialog.onStartClick = function(x, y) {
	ConfirmDialog._lastStartClickX = x;
	ConfirmDialog._lastStartClickY = y;
};


ConfirmDialog.onEndClick = function(x, y, isDoubleClick) {
	var startAndEndSameLoc = 
			Math.abs(ConfirmDialog._lastStartClickX - x) < 
					MouseTracker.SAME_LOC_TOLERANCE && 
			Math.abs(ConfirmDialog._lastStartClickY - y) < 
					MouseTracker.SAME_LOC_TOLERANCE;
	var possibleButton = ConfirmDialog.isInButton(x, y);
	if (possibleButton == ConfirmDialog.ReturnValues.YES && 
			startAndEndSameLoc) {
		ConfirmDialog._yesButton.onClick();
		ConfirmDialog.exit();
	} else if (possibleButton == ConfirmDialog.ReturnValues.NO && 
			startAndEndSameLoc) {
		ConfirmDialog._noButton.onClick();
		ConfirmDialog.exit();
	}
};


// Draws the Confirm dialog.
ConfirmDialog.draw = function(ctx) {
	if (ConfirmDialog._isOpen) {
		// Draw Body.
		ctx.drawImage(ConfirmDialog.BODY_IMG, ConfirmDialog.BODY_IMG_X, 
				ConfirmDialog.BODY_IMG_Y);
		// Draw Message.
		GlyphDrawer.drawText(ctx, ConfirmDialog.MESSAGE_FONT, 
				ConfirmDialog._message, ConfirmDialog.MESSAGE_X, 
				ConfirmDialog.MESSAGE_Y, ConfirmDialog.MESSAGE_WIDTH, 
				ConfirmDialog.MESSAGE_HEIGHT);
		// Draw Buttons.
		ConfirmDialog._yesButton.draw(ctx, ConfirmDialog.YES_BUTTON_X, 
				ConfirmDialog.YES_BUTTON_Y);
		ConfirmDialog._noButton.draw(ctx, ConfirmDialog.NO_BUTTON_X, 
				ConfirmDialog.NO_BUTTON_Y);
	}
};


// Returns the index of ReturnValues of the selected button, otherwise returns 
// -1.
ConfirmDialog.isInButton = function(x, y) {
	if (ConfirmDialog._yesButton.isInButton(
			x - ConfirmDialog.YES_BUTTON_X, 
			y - ConfirmDialog.YES_BUTTON_Y)) {
		return ConfirmDialog.ReturnValues.YES;
	} else if (ConfirmDialog._noButton.isInButton(
			x - ConfirmDialog.NO_BUTTON_X, 
			y - ConfirmDialog.NO_BUTTON_Y)) {
		return ConfirmDialog.ReturnValues.NO;
	} else {
		return -1;
	}
};

