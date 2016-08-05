/**
 * Component class representing an on-screen scrollbar.
 */

var ScrollBar = function(maxScroll, height, opt_startPos) {
	this.maxScroll = maxScroll;
	// Height in blocks of BAR_MIDDLEs
	this.height = Math.floor(
			(height - ScrollBar.BAR_TOP.height - ScrollBar.BAR_BOTTOM.height) / 
					ScrollBar.BAR_MIDDLE.height);
	this.heightInPixels = this.height * ScrollBar.BAR_MIDDLE.height;
	this.currScroll = opt_startPos || 0;
};


// Resources for the scroll bar draw
ScrollBar.BAR_TOP;
ScrollBar.BAR_BOTTOM;
ScrollBar.BAR_MIDDLE;
ScrollBar.BUBBLE;

ScrollBar.PATH = '../assets/img/ui/scrollbar/'

// Loads resources needed for scrollbars.
ScrollBar.load = function(callback) {
	ImgUtils.loadImages({
		barTop: ScrollBar.PATH + 'scrollbarTop.png',
		barBottom: ScrollBar.PATH + 'scrollbarBottom.png',
		barMiddle: ScrollBar.PATH + 'scrollbarMid.png',
		barBubble: ScrollBar.PATH + 'scrollBubble.png'
	}, function(images) {
		ScrollBar.BAR_TOP = images.barTop;
		ScrollBar.BAR_BOTTOM = images.barBottom;
		ScrollBar.BAR_MIDDLE = images.barMiddle;
		ScrollBar.BUBBLE = images.barBubble;
		callback();
	});
};


// Updates the scrollbar based on a provided delta.
ScrollBar.prototype.updateScroll = function(delta) {
	this.currScroll = Math.min(Math.max(this.currScroll + delta, 0), 
			this.maxScroll);
};


// Gets the current scroll fraction.
ScrollBar.prototype.getScrollFraction = function() {
	return this.currScroll / this.maxScroll;
};


// Draws the scroll bar to the given place with current scroll configuration.
ScrollBar.prototype.draw = function(ctx, x, y) {
	var drawHeight = y;
	ctx.drawImage(ScrollBar.BAR_TOP, x, drawHeight);
	drawHeight += ScrollBar.BAR_TOP.height;
	for (var i = 0; i < this.height; i++) {
		ctx.drawImage(ScrollBar.BAR_MIDDLE, x, drawHeight);
		drawHeight += ScrollBar.BAR_MIDDLE.height;
	}
	ctx.drawImage(ScrollBar.BAR_BOTTOM, x, drawHeight);
	var bubbleOffset = 
			(ScrollBar.BAR_MIDDLE.width - ScrollBar.BUBBLE.width) / 2;
	ctx.drawImage(ScrollBar.BUBBLE, x + bubbleOffset, 
			y + ScrollBar.BAR_TOP.height + 
					(this.height * ScrollBar.BAR_MIDDLE.height) * 
					this.getScrollFraction() - ScrollBar.BUBBLE.height / 2);
};


// Checks if the relative coordinate is in the bubble part of the scrollbar.
ScrollBar.prototype.isInBubble = function(relX, relY) {
	var bubbleX = 
			(ScrollBar.BAR_MIDDLE.width - ScrollBar.BUBBLE.width) / 2;
	var bubbleY = ScrollBar.BAR_TOP.height + 
			(this.height * ScrollBar.BAR_MIDDLE.height) * 
					this.getScrollFraction() - ScrollBar.BUBBLE.height / 2;
	return relX >= bubbleX && relX < bubbleX + ScrollBar.BUBBLE.width && 
			relY >= bubbleY && relY < bubbleY + ScrollBar.BUBBLE.height;
};


// Checks if the relative coordinate is in the bubble part of the scrollbar.
ScrollBar.prototype.isInLine = function(relX, relY) {
	return relX >= 0 && relX < ScrollBar.BAR_MIDDLE.width && 
			relY >= 0 && relY < this.heightInPixels;
};


// Updates the scroll position during drag (or click even).
ScrollBar.prototype.updateScrollFromDrag = function(relX, relY) {
	this.currScroll = this.maxScroll * Math.min(1, Math.max(0, 
			(relY - ScrollBar.BUBBLE.height / 2) / this.heightInPixels));
};
