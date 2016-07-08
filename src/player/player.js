/**
 * Defines the on screen playable character and visual entity. Contains methods
 * for manipulating the character.
 */

var Player = function(id, visualEntity) {
	this.id = id;
	this.visualEntity = visualEntity;
	this.containingMap;
	this._animationState;
	this._direction;
	this._collisionIgnoreList = [this];
};


Player.AnimationStates = {
	IDLE: 'idle',
	WALKING: 'walk'
};


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


Player.prototype.tryMove = function(deltaX, deltaY) {
	var targetX = this.visualEntity.x + deltaX;
	var targetY = this.visualEntity.y + deltaY;
	var targetDirection = Direction.getDirectionFromCoords(deltaX, deltaY);
	var targetAnimationState;
	// Check if a move is possible
	if (!this.containingMap.isColliding(targetX, targetY, 
					this.visualEntity.getCollisionWidth(), 
					this.visualEntity.getCollisionHeight(), this.visualEntity.isRounded(), 
					this._collisionIgnoreList) && 
			!this.containingMap.isOutOfBounds(targetX, targetY, 
					this.visualEntity.getCollisionWidth(), 
					this.visualEntity.getCollisionHeight())) {
		targetAnimationState = Player.AnimationStates.WALKING;
	} else {
		targetAnimationState = Player.AnimationStates.IDLE;
	}
	if (targetAnimationState != this._animationState || 
			targetDirection != this._direction) {
		// TODO: finish and set animations
	}
};