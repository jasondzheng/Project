/**
 * A class responsible for drawing player dialog. Consists of at most 2 
 * portraits, left or right, talking via speech bubbles. Uses a queue to
 * enqueue dialog.
 */

var DialogDrawer = {};

// Different speech bubble sizes supported by the dialog drawer. Note that these
// indexes are not arbitrary and refer to array indices for widths and heights
// below.
DialogDrawer.BUBBLE_SMALL = 0;
DialogDrawer.BUBBLE_MEDIUM = 1;
DialogDrawer.BUBBLE_LARGE = 2;

// Positions of portraits
DialogDrawer.PORTRAIT_1_LEFT = 44;
DialogDrawer.PORTRAIT_2_LEFT = 300;
DialogDrawer.PORTRAIT_3_RIGHT = 1236;
DialogDrawer.PORTRAIT_4_RIGHT = 980;
DialogDrawer.PORTRAIT_BOTTOM = 720;

// Position of anchor corners for all dialog bubbles
DialogDrawer.LEFT_BUBBLE_ANCHOR = {
	x: 324,
	y: 142
};
DialogDrawer.RIGHT_BUBBLE_ANCHOR = {
	x: 956,
	y: 142
};

// Position of bubble tails
DialogDrawer.LEFT_BUBBLE_TAIL_POS = {
	x: 288,
	y: 216
};
DialogDrawer.RIGHT_BUBBLE_TAIL_POS = {
	x: 954,
	y: 216
};

// Constraints of speech bubble
DialogDrawer.SPEECH_BUBBLE_CONSTRAINTS = {
	offX: 30,
	offY: 30,
	widths: [238, 238, 238],
	heights: [116, 176, 219],
	glyphset: 'test' /* TODO: replace with real glyphset */
};

// Backshade color
DialogDrawer.BACKSHADE_COLOR = 'rgba(0, 0, 0, 0.25)';

DialogDrawer.BUBBLE_INDEX_TO_ASSET = [
	'bubbleSmall', 
	'bubbleMed', 
	'bubbleLarge'
];

// Duration of the bubble animation entry.
DialogDrawer.BUBBLE_ENTRY_ANIM_DURATION = 30;


// A queue of actions to process.
DialogDrawer._actionQueue = [];
// Whether or not a dialog is in progress
DialogDrawer._dialogMode = false;
// The prior input mode before entering the dialog.
DialogDrawer._oldInputMode;
// The length of the action queue when last processed.
DialogDrawer._oldQueueLength = 0;
// A listing of assets required to draw the dialog interface
DialogDrawer._assets;
// Whether or not the dialog is ready to advance
DialogDrawer._readyToAdvance = false;


// Loads all assets needed to draw dialogs. Does not load glyphsets, as those 
// are loaded automatically at runtime.
DialogDrawer.loadAssets = function(callback) {
	var baseUrl = '../assets/img/ui/dialog/';
	ImgUtils.loadImages({
		bubbleSmall: baseUrl + 'speechBubbleSmall.png',
		bubbleMed: baseUrl + 'speechBubbleMed.png',
		bubbleLarge: baseUrl + 'speechBubbleLarge.png',
		tailLeft: baseUrl + 'speechBubbleTailLeft.png',
		tailRight: baseUrl + 'speechBubbleTailRight.png'
	}, function(images) {
		DialogDrawer._assets = images;
		callback();
	});
};


DialogDrawer.tick = function() {// Consumes actions on the dialog queue.
	var startQueueLength = DialogDrawer._actionQueue.length;
	while (DialogDrawer._actionQueue.length > 0 && 
			DialogDrawer._actionQueue[0].isDone()) {
		if (DialogDrawer._actionQueue[0].onEnd) {
			DialogDrawer._actionQueue[0].onEnd();
		}
		DialogDrawer._actionQueue.shift();
	}	
	if (DialogDrawer._actionQueue.length > 0) {
		if ((startQueueLength != DialogDrawer._actionQueue.length || 
				(startQueueLength != DialogDrawer._oldQueueLength && 
						DialogDrawer._oldQueueLength == 0)) && 
				DialogDrawer._actionQueue[0].onStart) {
			DialogDrawer._actionQueue[0].onStart();
		}
		if (DialogDrawer._actionQueue[0].tick) {
			DialogDrawer._actionQueue[0].tick();
		}
	}
	DialogDrawer._oldQueueLength = DialogDrawer._actionQueue.length;
};


// Draws the currently depicted dialog scene.
DialogDrawer.drawDialogOverlay = function(ctx) {
	if (DialogDrawer._actionQueue.length > 0) {
		var action = DialogDrawer._actionQueue[0];
		if (action.draw) {
			action.draw(ctx);
		}
	}
};


// Signals for the dialog drawer to advance the dialog.
DialogDrawer.signalAdvance = function() {
	DialogDrawer._readyToAdvance = true;
};


// Queues up a message to be displayed. Requests a set of portraits, bubble
// size, bubble tail direction (true for left), and the message to be
// displayed. Uses rules for glyph drawer to determine if message is (partially)
// shown or not.
DialogDrawer.showMessage = function(leftPortrait1, leftPortrait2, 
		rightPortrait1, rightPortrait2, bubbleSize, bubbleIsFromLeft, message) {
	DialogDrawer._actionQueue.push(new DialogDrawer._ShowMessageAction(
			leftPortrait1, leftPortrait2, rightPortrait1, rightPortrait2, bubbleSize,
			bubbleIsFromLeft, message));
};


// Class recording an action to show a message. See DialogDrawer.showMessage.
DialogDrawer._ShowMessageAction = function(leftPortrait1, leftPortrait2, 
		rightPortrait1, rightPortrait2, bubbleSize, bubbleIsFromLeft, message) {
	this._leftPortrait1 = leftPortrait1;
	this._leftPortrait2 = leftPortrait2;
	this._rightPortrait1 = rightPortrait1;
	this._rightPortrait2 = rightPortrait2;
	this._bubbleSize = bubbleSize;
	this._bubbleIsFromLeft = bubbleIsFromLeft;
	this._message = message;
	this._bubbleEntryCounter = DialogDrawer.BUBBLE_ENTRY_ANIM_DURATION;
};


DialogDrawer._ShowMessageAction.prototype.onStart = function() {
	// Diverts input mode to dialog system
	if (!DialogDrawer._dialogMode) {
		DialogDrawer._dialogMode = true;
		DialogDrawer._oldInputMode = InputRouter.getMode();
		InputRouter.setMode(InputRouter.Modes.DIALOG_INPUT);
	}
};


DialogDrawer._ShowMessageAction.prototype.tick = function() {
	// Used for message entry animation
	if (this._bubbleEntryCounter > 0) {
		this._bubbleEntryCounter--;
	}
};


DialogDrawer._ShowMessageAction.prototype.draw = function(ctx) {
	// Draw a backshade before drawing any other dialog components
	ctx.fillStyle = DialogDrawer.BACKSHADE_COLOR;
	ctx.fillRect(0, 0, ScreenProps.EXP_WIDTH, ScreenProps.EXP_HEIGHT);
	// Draw portraits
	if (this._leftPortrait1) {
		ctx.drawImage(this._leftPortrait1, DialogDrawer.PORTRAIT_1_LEFT, 
				DialogDrawer.PORTRAIT_BOTTOM - this._leftPortrait1.height);
	}
	if (this._leftPortrait2) {
		ctx.drawImage(this._leftPortrait2, DialogDrawer.PORTRAIT_2_LEFT, 
				DialogDrawer.PORTRAIT_BOTTOM - this._leftPortrait2.height);
	}
	if (this._rightPortrait1) {
		ctx.drawImage(this._rightPortrait1, 
				DialogDrawer.PORTRAIT_3_RIGHT - this._rightPortrait1.width, 
				DialogDrawer.PORTRAIT_BOTTOM - this._rightPortrait1.height);
	}
	if (this._rightPortrait2) {
		ctx.drawImage(this._rightPortrait2, 
				DialogDrawer.PORTRAIT_4_RIGHT - this._rightPortrait2.width,
				DialogDrawer.PORTRAIT_BOTTOM - this._rightPortrait2.height);
	}
	// Draw dialog bubbles, ignoring animation
	var bubbleX, bubbleY;
	var msgWidth = 
			DialogDrawer.SPEECH_BUBBLE_CONSTRAINTS.widths[this._bubbleSize];
	var msgHeight = 
			DialogDrawer.SPEECH_BUBBLE_CONSTRAINTS.heights[this._bubbleSize];
	var bubbleImg = DialogDrawer._assets[
			DialogDrawer.BUBBLE_INDEX_TO_ASSET[this._bubbleSize]];
	if (this._bubbleIsFromLeft) {
		bubbleX = DialogDrawer.LEFT_BUBBLE_ANCHOR.x;
		bubbleY = DialogDrawer.LEFT_BUBBLE_ANCHOR.y;
		// Handle bubble positioning for entry animation
		var entryAnimPos = -(bubbleX + bubbleImg.width) * 
				(this._bubbleEntryCounter / 
						DialogDrawer.BUBBLE_ENTRY_ANIM_DURATION);
		ctx.drawImage(DialogDrawer._assets.tailLeft, 
				DialogDrawer.LEFT_BUBBLE_TAIL_POS.x + entryAnimPos, 
				DialogDrawer.LEFT_BUBBLE_TAIL_POS.y);
		bubbleX += entryAnimPos;
	} else {
		bubbleX = DialogDrawer.RIGHT_BUBBLE_ANCHOR.x - bubbleImg.width;
		bubbleY = DialogDrawer.LEFT_BUBBLE_ANCHOR.y;
		// Handle bubble positioning for entry animation
		var entryAnimPos = (ScreenProps.EXP_WIDTH - bubbleX) * 
				(this._bubbleEntryCounter / 
						DialogDrawer.BUBBLE_ENTRY_ANIM_DURATION);
		ctx.drawImage(DialogDrawer._assets.tailRight, 
				DialogDrawer.RIGHT_BUBBLE_TAIL_POS.x + entryAnimPos, 
				DialogDrawer.RIGHT_BUBBLE_TAIL_POS.y);
		bubbleX += entryAnimPos;
	}
	ctx.drawImage(bubbleImg, bubbleX, bubbleY);
	GlyphDrawer.drawText(ctx, DialogDrawer.SPEECH_BUBBLE_CONSTRAINTS.glyphset, 
			this._message, bubbleX + DialogDrawer.SPEECH_BUBBLE_CONSTRAINTS.offX,
			bubbleY + DialogDrawer.SPEECH_BUBBLE_CONSTRAINTS.offY, msgWidth, 
			msgHeight);
};


DialogDrawer._ShowMessageAction.prototype.onEnd = function() {
	DialogDrawer._readyToAdvance = false;
};


DialogDrawer._ShowMessageAction.prototype.isDone = function() {
	return DialogDrawer._readyToAdvance;
};


// Notifies the dialog drawer that a dialog has finished. Must be called after
// 1 or more invocations to showMessage. An optional callback is used to
// resume code flow after the dialog has finished. Returns input to the
// previous input owner.
DialogDrawer.endDialog = function(opt_callback) {
	DialogDrawer._actionQueue.push(
			new DialogDrawer._EndDialogAction(opt_callback));
};


// Class recording an action to end a dialog. See DialogDrawer.endDialog.
DialogDrawer._EndDialogAction = function(opt_callback) {
	this._callback = opt_callback;
};


DialogDrawer._EndDialogAction.prototype.onEnd = function() {
	// Restores input mode
	DialogDrawer._dialogMode = false;
	InputRouter.setMode(DialogDrawer._oldInputMode);
	if (this._callback) {
		this._callback();
	}
};


DialogDrawer._EndDialogAction.prototype.isDone = function() {
	return true;
};