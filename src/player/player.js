/**
 * Defines the on screen playable character and visual entity. Contains methods
 * for manipulating the character.
 */

var Player = function(id, visualInstance, x, y) {
	this.id = id;
	this.visualInstance = visualInstance;
	this.containingMap;
	this._animationState;
	this._direction = Direction.DOWN;
	this._collisionIgnoreList = [this];
};

// The animation states the player can be in. This should be supported for all
// animated actions the player can take, like being idle, attacking, etc
Player.AnimationStates = {
	IDLE: 'idle',
	WALKING: 'walk'
};

// The player's walk speed, in MIN_MOVE_SPEED units.
Player.WALK_SPEED = 5;

// The minimum amount allowed to move for the player (to avoid teleporting)
Player.MIN_MOVE_SPEED = 1 / 60;


Player.prototype.setPositionX = function(x) {
	this.visualInstance.x = x;
};


Player.prototype.setPositionY = function(y) {
	this.visualInstance.y = y;
};


Player.prototype.getPositionX = function() {
	return this.visualInstance.x;
};


Player.prototype.getPositionY = function() {
	return this.visualInstance.y;
};


// Attempts to move the player by a given delta x and y value. Returns true
// if the target was exactly reached and false if the target could not be
// reached due to a collision.
Player.prototype.tryMove = function(deltaX, deltaY) {
	var targetX = this.visualInstance.x + deltaX;
	var targetY = this.visualInstance.y + deltaY;
	var targetDirection = (deltaX == deltaY && deltaX == 0) ? this._direction : 
			Direction.getDirectionFromCoords(deltaX, deltaY);
	var targetAnimationState;
	// Check if a move is possible
	if (!(deltaX == deltaY && deltaX == 0) && 
			!this.containingMap.isColliding(targetX, targetY, 
					this.visualInstance.getCollisionWidth(), 
					this.visualInstance.getCollisionHeight(), 
					this.visualInstance.isRounded(), 
					this._collisionIgnoreList) && 
			!this.containingMap.isOutOfBounds(targetX, targetY, 
					this.visualInstance.getCollisionWidth(), 
					this.visualInstance.getCollisionHeight())) {
		targetAnimationState = Player.AnimationStates.WALKING;
		this.visualInstance.x = targetX;
		this.visualInstance.y = targetY;
	} else {
		targetAnimationState = Player.AnimationStates.IDLE;
	}
	if (targetAnimationState != this._animationState || 
			targetDirection != this._direction) {
		this.visualInstance.setAnimation(this.visualInstance.getAnimNameFromFamily(
				DynamicMapEntity.getActionDirectionFamilyName(
						targetAnimationState, targetDirection)));
		this._direction = targetDirection;
		this._animationState = targetAnimationState;
	}
	return targetX == this.visualInstance.x && targetY == this.visualInstance.y;
};


// Update the player object. The only current action is to advance the animation
// object.
Player.prototype.tick = function() {
	this.visualInstance.advanceFrame();
};