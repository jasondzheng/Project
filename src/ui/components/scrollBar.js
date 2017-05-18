/**
 * Component class representing an on-screen scrollbar.
 */

var ScrollBar = function(maxScroll, length, isHorizontal, opt_startPos) {
	this._maxScroll = maxScroll;
	// Height in blocks of BAR_MIDDLEs
	this._length = Math.floor(
			(length - ScrollBar.BAR_TOP.height - ScrollBar.BAR_BOTTOM.height) / 
					ScrollBar.BAR_MIDDLE.height);
	this._lengthInPixels = this._length * ScrollBar.BAR_MIDDLE.height;
	this._isHorizontal = isHorizontal;
	this._currScroll = opt_startPos || 0;
	this._isEnabled = true;
};

ScrollBar.DISABLED_OPACITY = 0.5;

// Resources for the scroll bar draw
ScrollBar.BAR_TOP;
ScrollBar.BAR_BOTTOM;
ScrollBar.BAR_MIDDLE;
ScrollBar.BUBBLE;

// Resources for the sideways scroll bar draw
ScrollBar.BAR_LEFT;
ScrollBar.BAR_RIGHT;
ScrollBar.BAR_MIDDLE_SIDE;

ScrollBar.PATH = '../assets/img/ui/scrollbar/'

// Loads resources needed for scrollbars.
ScrollBar.load = function(callback) {
	ImgUtils.loadImages({
		barTop: ScrollBar.PATH + 'scrollbarTop.png',
		barBottom: ScrollBar.PATH + 'scrollbarBottom.png',
		barMiddle: ScrollBar.PATH + 'scrollbarMid.png',
		barBubble: ScrollBar.PATH + 'scrollBubble.png'
	}, function(images) {
		// Set the vertical scrollbar images
		ScrollBar.BAR_TOP = images.barTop;
		ScrollBar.BAR_BOTTOM = images.barBottom;
		ScrollBar.BAR_MIDDLE = images.barMiddle;
		ScrollBar.BUBBLE = images.barBubble;
		// Construct the sideways images
		ScrollBar.BAR_LEFT = 
				ScrollBar._helperConstructSidewaysAssets(images.barTop);
		ScrollBar.BAR_RIGHT = 
				ScrollBar._helperConstructSidewaysAssets(images.barBottom);
		ScrollBar.BAR_MIDDLE_SIDE =
				ScrollBar._helperConstructSidewaysAssets(images.barMiddle);
		callback();
	});
};


// Helper function to construct rotated assets for sideways scroll bars.
ScrollBar._helperConstructSidewaysAssets = function(img) {
	var canvas = document.createElement('canvas');
	canvas.width = img.height;
	canvas.height = img.width;
	ctx = canvas.getContext('2d');
	ctx.save();
	ctx.translate(0, canvas.height);
	ctx.rotate(3 * Math.PI / 2);
	ctx.drawImage(img, 0, 0);
	ctx.restore();
	return canvas;
};


// Enables the scrollbar functionality and appearance
ScrollBar.prototype.enable = function() {
	this._isEnabled = true;
}

// Disables the scrollbar functionality and fades the appearance
ScrollBar.prototype.disable = function() {
	this._isEnabled = false;
}


// Updates the scrollbar based on a provided delta.
ScrollBar.prototype.updateScroll = function(delta) {
	this._currScroll = Math.min(Math.max(this._currScroll + delta, 0), 
			this._maxScroll);
};


// Gets the current scroll fraction.
ScrollBar.prototype.getScrollFraction = function() {
	return this._currScroll / this._maxScroll;
};


// Gets the current scroll value.
ScrollBar.prototype.getScroll = function() {
	return this._currScroll;
};


// Sets the scroll fraction to the provided fraction.
ScrollBar.prototype.setScrollFraction = function(fraction) {
	this._currScroll = this._maxScroll * Math.min(Math.max(fraction, 0), 1);
};


// Draws the scroll bar to the given place with current scroll configuration.
ScrollBar.prototype.draw = function(ctx, x, y) {
	if (!this._isEnabled) {
		ctx.globalAlpha = ScrollBar.DISABLED_OPACITY;
	}
	if (this._isHorizontal) {
		var drawX = x;
		ctx.drawImage(ScrollBar.BAR_LEFT, drawX, y);
		drawX += ScrollBar.BAR_LEFT.width;
		for (var i = 0; i < this._length; i++) {
			ctx.drawImage(ScrollBar.BAR_MIDDLE_SIDE, drawX, y);
			drawX += ScrollBar.BAR_MIDDLE_SIDE.width;
		}
		ctx.drawImage(ScrollBar.BAR_RIGHT, drawX, y);
		var bubbleOffset = 
				(ScrollBar.BAR_MIDDLE_SIDE.height - ScrollBar.BUBBLE.height) / 2;
		ctx.drawImage(ScrollBar.BUBBLE, x + ScrollBar.BAR_LEFT.width + 
						(this._length * ScrollBar.BAR_MIDDLE_SIDE.width) * 
						this.getScrollFraction() - ScrollBar.BUBBLE.width / 2, 
				y + bubbleOffset);
	} else {
		var drawHeight = y;
		ctx.drawImage(ScrollBar.BAR_TOP, x, drawHeight);
		drawHeight += ScrollBar.BAR_TOP.height;
		for (var i = 0; i < this._length; i++) {
			ctx.drawImage(ScrollBar.BAR_MIDDLE, x, drawHeight);
			drawHeight += ScrollBar.BAR_MIDDLE.height;
		}
		ctx.drawImage(ScrollBar.BAR_BOTTOM, x, drawHeight);
		var bubbleOffset = 
				(ScrollBar.BAR_MIDDLE.width - ScrollBar.BUBBLE.width) / 2;
		ctx.drawImage(ScrollBar.BUBBLE, x + bubbleOffset, 
				y + ScrollBar.BAR_TOP.height + 
						(this._length * ScrollBar.BAR_MIDDLE.height) * 
						this.getScrollFraction() - ScrollBar.BUBBLE.height / 2);
	}
	ctx.globalAlpha = 1;
};


// Checks if the relative coordinate is in the bubble part of the scrollbar.
ScrollBar.prototype.isInBubble = function(relX, relY) {
	if (!this._isEnabled) {
		return false;
	}
	var bubbleX = this._isHorizontal ? 
			ScrollBar.BAR_LEFT.width + 
					(this._length * ScrollBar.BAR_MIDDLE_SIDE.width) * 
					this.getScrollFraction() - ScrollBar.BUBBLE.width / 2 :
			(ScrollBar.BAR_MIDDLE.width - ScrollBar.BUBBLE.width) / 2;
	var bubbleY = this._isHorizontal ? 
			(ScrollBar.BAR_MIDDLE_SIDE.height - ScrollBar.BUBBLE.height) / 2 :
			ScrollBar.BAR_TOP.height + (this._length * ScrollBar.BAR_MIDDLE.height) * 
					this.getScrollFraction() - ScrollBar.BUBBLE.height / 2;
	return relX >= bubbleX && relX < bubbleX + ScrollBar.BUBBLE.width && 
			relY >= bubbleY && relY < bubbleY + ScrollBar.BUBBLE.height;
};


// Checks if the relative coordinate is in the bar part of the scrollbar.
ScrollBar.prototype.isInLine = function(relX, relY) {
	if (!this._isEnabled) {
		return false;
	}
	return relX >= 0 && relX < (this._isHorizontal ? 
					this._lengthInPixels : ScrollBar.BAR_MIDDLE.width) && relY >= 0 && 
			relY < (this._isHorizontal ? ScrollBar.BAR_MIDDLE_SIDE.height : 
					this._lengthInPixels);
};


// Updates the scroll position during drag (or click even).
ScrollBar.prototype.updateScrollFromDrag = function(relX, relY) {
	this._currScroll = this._isHorizontal ? this._maxScroll * 
			Math.min(1, Math.max(0, (relX - ScrollBar.BUBBLE.width / 2) / 
				this._lengthInPixels)) : 
			this._maxScroll * Math.min(1, Math.max(0, (relY - ScrollBar.BUBBLE.height / 
					2) / this._lengthInPixels));
};
