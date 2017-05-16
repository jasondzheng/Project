// Class of a value picker interface; is composed up of dynamic text and a 
// slider to change the value.

var ValuePicker = function(length, min, max) {
	this.min = min;
	this.max = max || 999;
	this.range = max - min;
	this.length = length;
	this.halfLength = length / 2;
	this.currValue = min;
	this.scrollBar = new ScrollBar(this.range, length, 
			true);
	this.scrollBarUnit = ValuePicker.SCROLL_BAR_MAX_SCROLL / this.range;
	var that = this;
	this.incrementButton = new Button(ValuePicker.INCR_BTN_IMG, false, 
			function() {
				that.scrollBar.updateScroll(1);
			}
	);
	this.decrementButton = new Button(ValuePicker.DECR_BTN_IMG, false, 
			function() {
				that.scrollBar.updateScroll(-1);
			}
	);
};


ValuePicker.FONT = 'test';

ValuePicker.SCROLL_BAR_MAX_SCROLL = 1000;

ValuePicker.TEXT_X_OFFSET = 10;

ValuePicker.SCROLL_BAR_Y_OFFSET = 50;

// Increment/Decrement button assets
ValuePicker.INCR_BTN_IMG;
ValuePicker.DECR_BTN_IMG;

ValuePicker.PATH = '../assets/img/ui/valuePicker/'

ValuePicker.load = function(callback) {
	ImgUtils.loadImages({
		incrBtnImg: ValuePicker.PATH + 'incrBtn.png',
		decrBtnImg: ValuePicker.PATH + 'decrBtn.png'
	}, function(images) {
		ValuePicker.INCR_BTN_IMG = images.incrBtnImg;
		ValuePicker.DECR_BTN_IMG = images.decrBtnImg;
		callback();
	})
};


// Resets the value and position of the scrollbar. Used when exitting the 
// overlayed interface.
ValuePicker.prototype.reset = function() {
	this.currValue = this.min;
	this.scrollBar.setScrollFraction(0);
};


ValuePicker.prototype.draw = function(ctx, x, y) {
	//TODO: remove this
	this.currValue = Math.floor(
		this.min + this.scrollBar.getScroll());
	// Draw Text
	GlyphDrawer.drawText(ctx, ValuePicker.FONT, this.currValue.toString(), 
			x + this.halfLength - ValuePicker.TEXT_X_OFFSET, y, 200, 200);
	// Draw ScrollBar
	this.scrollBar.draw(ctx, x, y + ValuePicker.SCROLL_BAR_Y_OFFSET);
};

// TODO: Use this
// ValuePicker.prototype.tick = function(ctx, x, y) {
// 	this.currValue = Math.floor(
// 		this.min + this.scrollBar.getScroll());
// };