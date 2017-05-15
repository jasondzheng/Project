// Class of a value picker interface; is composed up of dynamic text and a 
// slider to change the value.

var ValuePicker = function(length, min, max) {
	this.min = min;
	this.max = max || 999;
	this.range = max - min;
	this.length = length;
	this.halfLength = length / 2;
	this.currValue = min;
	this.scrollBar = new ScrollBar(ValuePicker.SCROLL_BAR_MAX_SCROLL, length, 
			true);
};


ValuePicker.FONT = 'test';

ValuePicker.SCROLL_BAR_MAX_SCROLL = 1000;

ValuePicker.TEXT_X_OFFSET = 10;

ValuePicker.SCROLL_BAR_Y_OFFSET = 50;


// Resets the value and position of the scrollbar. Used when exitting the 
// overlayed interface.
ValuePicker.prototype.reset = function() {
	this.currValue = this.min;
	this.scrollBar.setScrollFraction(0);
};


ValuePicker.prototype.draw = function(ctx, x, y) {
	// Draw Text
	this.currValue = Math.floor(
			this.min + this.scrollBar.getScrollFraction() * this.range);
	GlyphDrawer.drawText(ctx, ValuePicker.FONT, this.currValue.toString(), 
			x + this.halfLength - ValuePicker.TEXT_X_OFFSET, y, 200, 200);
	// Draw ScrollBar
	this.scrollBar.draw(ctx, x, y + ValuePicker.SCROLL_BAR_Y_OFFSET);
};