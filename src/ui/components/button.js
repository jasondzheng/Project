/**
 * Class to store information and methods of a simple clickable button.
 */

var Button = function(sprite, isRounded, onClick) {
	this.sprite = sprite;
	this.isRounded = isRounded;
	this.onClick = onClick;
	this.halfWidth = this.sprite.width / 2;
	this.halfHeight = this.sprite.height / 2;
};


// Returns if the mouse in within the bounds of the button.
Button.prototype.isInButton = function(relX, relY) {
	if (this.isRounded) {
		return (relX - this.halfWidth) * (relX - this.halfWidth) < 
						(this.halfWidth) * (this.halfWidth) && 
				(relY - this.halfHeight) * (relY - this.halfHeight) < 
						(this.halfHeight) * (this.halfHeight);
	} else {
		return relX > 0 && relY > 0 && relX < this.sprite.width 
				&& relY < this.sprite.height;
	}
};


// Draws the Button at the specified coordinates.
Button.prototype.draw = function(ctx, x, y) {
	ctx.drawImage(this.sprite, x, y);
};
