/**
 * Class to store information and methods of a simple clickable button.
 */

var Button = function(sprite, isRounded, onClick) {
	this.sprite = sprite;
	this.isRounded = isRounded;
	this.onClick = onClick;
	this.halfWidth = sprite.width / 2;
	this.halfHeight = sprite.height / 2;

	this.currScale = 1;
	
	this.isClicked = false;
	this.isHovered = false;
};


// The scale factor by which a button should grow when a mouse is hovering over 
// it.
Button.SCALE_FACTOR = 1.1;

Button.SCALE_INCREMENT = 0.05;
// The alpha of the button when it is being clicked.
Button.CLICKED_ALPHA = 0.75;


// Returns if the mouse in within the bounds of the button.
Button.prototype.isInButton = function(relX, relY) {
	if (this.isRounded) {
		return (relX - this.halfWidth) * (relX - this.halfWidth) +
				(relY - this.halfHeight) * (relY - this.halfHeight) < 
						(this.halfHeight) * (this.halfHeight);
	} else {
		return relX > 0 && relY > 0 && relX < this.sprite.width 
				&& relY < this.sprite.height;
	}
};


// Draws the Button at the specified coordinates.
Button.prototype.draw = function(ctx, x, y) {
	if (this.isClicked) {
		ctx.globalAlpha = Button.CLICKED_ALPHA;
	}
	ctx.drawImage(this.sprite, x - (this.currScale - 1) * this.sprite.width / 2, 
			y - (this.currScale - 1) * this.sprite.height / 2, 
			this.sprite.width * this.currScale, this.sprite.height * this.currScale);
	ctx.globalAlpha = 1;
};


Button.prototype.tick = function() {
	if (this.isHovered && this.currScale < Button.SCALE_FACTOR) {
		this.currScale += Button.SCALE_INCREMENT;
	} else if (!this.isHovered && this.currScale > 1) {
		this.currScale -= Button.SCALE_INCREMENT;
	}
};
