// Class of a value picker interface; is composed up of dynamic text and a 
// slider to change the value.

var ValuePicker = function(length, min, max) {
	this.min = min;
	this.max = max;
	this.range = max - min;
	this.length = length;
	this.halfLength = length / 2;
	this.currValue = min;
	this.scrollBar = new ScrollBar(this.range, length, 
			true);
	var that = this;
	this.incrButton = new Button(ValuePicker.INCR_BTN_IMG, false, 
			function() {
				that.scrollBar.updateScroll(1);
			}
	);
	this.incrButtonX = this.halfLength + ValuePicker.INCR_BTN_OFFSET_X;
	this.incrButtonY = ValuePicker.INCR_BTN_OFFSET_Y;
	
	this.decrButton = new Button(ValuePicker.DECR_BTN_IMG, false, 
			function() {
				that.scrollBar.updateScroll(-1);
			}
	);
	this.decrButtonX = this.halfLength + ValuePicker.DECR_BTN_OFFSET_X;
	this.decrButtonY = ValuePicker.DECR_BTN_OFFSET_Y;
};


ValuePicker.FONT = 'test';

ValuePicker.SCROLL_BAR_MAX_SCROLL = 1000;

ValuePicker.TEXT_X_OFFSET = 10;

ValuePicker.SCROLL_BAR_Y_OFFSET = 50;

// Increment/Decrement button assets
ValuePicker.INCR_BTN_IMG;
ValuePicker.DECR_BTN_IMG;

// Button offsets relative to center
ValuePicker.INCR_BTN_OFFSET_X;
ValuePicker.INCR_BTN_OFFSET_Y;

ValuePicker.DECR_BTN_OFFSET_X;
ValuePicker.DECR_BTN_OFFSET_Y;

ValuePicker.PATH = '../assets/img/ui/valuePicker/'

ValuePicker.load = function(callback) {
	ImgUtils.loadImages({
		incrBtnImg: ValuePicker.PATH + 'incrBtn.png',
		decrBtnImg: ValuePicker.PATH + 'decrBtn.png'
	}, function(images) {
		ValuePicker.INCR_BTN_IMG = images.incrBtnImg;
		ValuePicker.DECR_BTN_IMG = images.decrBtnImg;

		ValuePicker.DECR_BTN_OFFSET_X = -(images.decrBtnImg.width * 2);
		ValuePicker.DECR_BTN_OFFSET_Y = 0;

		ValuePicker.INCR_BTN_OFFSET_X = images.incrBtnImg.width;
		ValuePicker.INCR_BTN_OFFSET_Y = 0;

		callback();
	})
};


// Resets the value and position of the scrollbar. 
ValuePicker.prototype.reset = function() {
	this.currValue = this.min;
	this.scrollBar.setScrollFraction(0);
};


// Used to use to reinitizlize the same value picker for use with different min 
// and max values.
ValuePicker.prototype.reinit = function(min, max) {
	this.min = min;
	this.max = max;
	this.range = max - min;
	this.currValue = min;
	this.scrollBar = new ScrollBar(this.range, this.length, 
			true);
}


ValuePicker.prototype.draw = function(ctx, x, y) {
	// Draw Text
	GlyphDrawer.drawText(ctx, ValuePicker.FONT, this.currValue.toString(), 
			x + this.halfLength - ValuePicker.TEXT_X_OFFSET, y, 200, 200);
	// Draw ScrollBar
	this.scrollBar.draw(ctx, x, y + ValuePicker.SCROLL_BAR_Y_OFFSET);
	// Draw increment/decrememnt buttons
	this.incrButton.draw(ctx, x + this.incrButtonX, 
			y + this.incrButtonY);
	this.decrButton.draw(ctx, x + this.decrButtonX,
			y + this.decrButtonY);
};


ValuePicker.prototype.tick = function(ctx, x, y) {
	this.currValue = Math.round(this.min + this.scrollBar.getScroll());
};