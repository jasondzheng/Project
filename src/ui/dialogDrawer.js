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
	x: 285,
	y: 216
};
DialogDrawer.RIGHT_BUBBLE_TAIL_POS = {
	x: 956,
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


// A queue of actions to process.
DialogDrawer._actionQueue = [];
// Whether or not a dialog is in progress
DialogDrawer._dialogMode = false;
// The length of the action queue when last processed.
DialogDrawer._oldQueueLength = 0;
// A listing of assets required to draw the dialog interface
DialogDrawer._assets;


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
		DialogDrawer._actionQueue[0].tick();
	}
	DialogDrawer._oldQueueLength = DialogDrawer._actionQueue.length;
};


// Draws the currently depicted dialog scene.
DialogDrawer.drawDialogOverlay = function(ctx) {
	if (DialogDrawer._actionQueue.length > 0) {
		var action = DialogDrawer._actionQueue[0];
		if (action instanceof DialogDrawer.ShowMessageAction) {
			// Draw a backshade before drawing any other dialog components
			ctx.fillStyle = DialogDrawer.BACKSHADE_COLOR;
			ctx.fillRect(0, 0, ScreenProps.EXP_WIDTH, ScreenProps.EXP_HEIGHT);
			// Draw portraits
			if (action.leftPortrait1) {
				ctx.drawImage(action.leftPortrait1, DialogDrawer.PORTRAIT_1_LEFT, 
						DialogDrawer.PORTRAIT_BOTTOM - action.leftPortrait1.height);
			}
			if (action.leftPortrait2) {
				ctx.drawImage(action.leftPortrait2, DialogDrawer.PORTRAIT_2_LEFT, 
						DialogDrawer.PORTRAIT_BOTTOM - action.leftPortrait2.height);
			}
			if (action.rightPortrait1) {
				ctx.drawImage(action.rightPortrait1, 
						DialogDrawer.PORTRAIT_3_RIGHT - action.rightPortrait1.width, 
						DialogDrawer.PORTRAIT_BOTTOM - action.rightPortrait1.height);
			}
			if (action.rightPortrait2) {
				ctx.drawImage(action.rightPortrait2, 
						DialogDrawer.PORTRAIT_4_RIGHT - action.rightPortrait2.width,
						DialogDrawer.PORTRAIT_BOTTOM - action.rightPortrait2.height);
			}
			// Draw dialog bubbles, ignoring animation
			// TODO: add animation constants later
			var bubbleX, bubbleY;
			var msgWidth = 
					DialogDrawer.SPEECH_BUBBLE_CONSTRAINTS.widths[action.bubbleSize];
			var msgHeight = 
					DialogDrawer.SPEECH_BUBBLE_CONSTRAINTS.heights[action.bubbleSize];
			if (action.bubbleIsFromLeft) {
				ctx.drawImage(DialogDrawer._assets.tailLeft, 
						DialogDrawer.LEFT_BUBBLE_TAIL_POS.x, 
						DialogDrawer.LEFT_BUBBLE_TAIL_POS.y);
				bubbleX = DialogDrawer.LEFT_BUBBLE_ANCHOR.x;
				bubbleY = DialogDrawer.LEFT_BUBBLE_ANCHOR.y;
			} else {
				ctx.drawImage(DialogDrawer._assets.tailRight, 
						DialogDrawer.RIGHT_BUBBLE_TAIL_POS.x, 
						DialogDrawer.RIGHT_BUBBLE_TAIL_POS.y);
				bubbleX = DialogDrawer.RIGHT_BUBBLE_ANCHOR.x - DialogDrawer._assets[
								DialogDrawer.BUBBLE_INDEX_TO_ASSET[action.bubbleSize]].width;
				bubbleY = DialogDrawer.LEFT_BUBBLE_ANCHOR.y;
			}
			ctx.drawImage(DialogDrawer._assets[
							DialogDrawer.BUBBLE_INDEX_TO_ASSET[action.bubbleSize]], bubbleX,
					bubbleY);
			GlyphDrawer.drawText(ctx, DialogDrawer.SPEECH_BUBBLE_CONSTRAINTS.glyphset, 
					action.message, bubbleX + DialogDrawer.SPEECH_BUBBLE_CONSTRAINTS.offX,
					bubbleY + DialogDrawer.SPEECH_BUBBLE_CONSTRAINTS.offY, msgWidth, 
					msgHeight);
		}
	}
};


DialogDrawer.showMessage = function(leftPortrait1, leftPortrait2, 
		rightPortrait1, rightPortrait2, bubbleSize, bubbleIsFromLeft, message) {
};


DialogDrawer.ShowMessageAction = function(leftPortrait1, leftPortrait2, 
		rightPortrait1, rightPortrait2, bubbleSize, bubbleIsFromLeft, message) {
	this.leftPortrait1 = leftPortrait1;
	this.leftPortrait2 = leftPortrait2;
	this.rightPortrait1 = rightPortrait1;
	this.rightPortrait2 = rightPortrait2;
	this.bubbleSize = bubbleSize;
	this.bubbleIsFromLeft = bubbleIsFromLeft;
	this.message = message;
};


DialogDrawer.ShowMessageAction.prototype.onStart = function() {
};


DialogDrawer.ShowMessageAction.prototype.tick = function() {
};


DialogDrawer.ShowMessageAction.prototype.onEnd = function() {
};


DialogDrawer.ShowMessageAction.prototype.isDone = function() {
};


DialogDrawer.endDialog = function(callback) {
};


DialogDrawer.EndDialogAction = function(callback) {
};


DialogDrawer.EndDialogAction.prototype.onEnd = function() {
};


DialogDrawer.EndDialogAction.prototype.isDone = function() {
};