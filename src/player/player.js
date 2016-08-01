/**
 * Defines the on screen playable character and visual entity. Contains methods
 * for manipulating the character.
 */

var Player = function(id, visualInstance, x, y, saveData) {
	this.id = id;
	this.visualInstance = visualInstance;
	this.containingMap;
	this._animationState = Player.AnimationStates.IDLE;
	this._direction = Direction.DOWN;
	this._collisionIgnoreList = [this];
	this.attackCombo = 0;
	// TODO: remove the debug object and this default value for save data
	this.applySaveData(saveData || Player.DEFAULT_SAVE_DATA_DEBUG_DEBUG);
};


// Applies player statistics from save data. Creates new fields for all relevant
// values within the player object.
Player.prototype.applySaveData = function(saveData) {
	this.hp = saveData.hp;
	this.maxHp = saveData.maxHp;
	// Player's inventory
	this.inventory = Inventory.load(saveData.inventory);
};


// A debug default save data to use because saving isn't implemented yet.
Player.DEFAULT_SAVE_DATA_DEBUG_DEBUG = {
	hp: 99,
	maxHp: 100,
	inventory: null
};


// The animation states the player can be in. This should be supported for all
// animated actions the player can take, like being idle, attacking, etc
Player.AnimationStates = {
	IDLE: 'idle',
	WALKING: 'walk',
	BASIC_ATTACKING: 'basicAttack',
	DAMAGE_RECEIVING: 'damageReceived'
};

// The player's walk speed, in MIN_MOVE_SPEED units.
Player.WALK_SPEED = 5;

// The minimum amount allowed to move for the player (to avoid teleporting)
Player.MIN_MOVE_SPEED = 1 / 60;

// The dimension delta in which the player is able to talk to NPCs.
Player.TALK_DIM_DELTA = 0.1;


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


Player.prototype.getDirection = function() {
	return this._direction;
};


// Decrements hp by the damage provided and sets animation and animation state 
// to DAMAGE_RECEIVING
Player.prototype.receiveDamage = function(damage) {
	this.hp = Math.max(this.hp - damage, 0);
	this.visualInstance.setAnimation(this.visualInstance.getAnimNameFromFamily(
				DynamicMapEntity.getActionDirectionFamilyName(
						Player.AnimationStates.DAMAGE_RECEIVING, this._direction)));
	this.visualInstance._animationState = Player.AnimationStates.DAMAGE_RECEIVING;
};


// Checks if player is able to issue a move command
Player.prototype.canMove = function() {
	return this._animationState == Player.AnimationStates.IDLE || 
			this._animationState == Player.AnimationStates.WALKING || (
					this._animationState == Player.AnimationStates.BASIC_ATTACKING &&
					this.visualInstance.isAtLastFrameOfAnimation());
};


// Attempts to move the player by a given delta x and y value. Returns true
// if the target was exactly reached and false if the target could not be
// reached due to a collision.
Player.prototype.tryMove = function(deltaX, deltaY) {
	var targetX = this.visualInstance.x + deltaX;
	var targetY = this.visualInstance.y + deltaY;
	var targetDirection = (deltaX == 0 && deltaY == 0) ? this._direction : 
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


// Convenience function to idle the player.
Player.prototype.setIdle = function(opt_direction) {
	opt_direction = opt_direction || this._direction;
	if (Player.AnimationStates.IDLE != this._animationState || 
			opt_direction != this._direction) {
		this.visualInstance.setAnimation(this.visualInstance.getAnimNameFromFamily(
				DynamicMapEntity.getActionDirectionFamilyName(
						Player.AnimationStates.IDLE, opt_direction)));
		this._direction = opt_direction;
		this._animationState = Player.AnimationStates.IDLE;
	}
};


// Checks if the player can issue a basic attack command
Player.prototype.canBasicAttack = function() {
	return this._animationState != Player.AnimationStates.DAMAGE_RECEIVING && 
			(this._animationState != Player.AnimationStates.BASIC_ATTACKING || 
					this.visualInstance.isAtLastFrameOfAnimation());
};


// Sets the animation and animation state of the player to BASIC_ATTACKING
Player.prototype.basicAttack = function() {
	this.visualInstance.setAnimation(this.visualInstance.getAnimNameFromFamily(
			DynamicMapEntity.getActionDirectionFamilyName(
					Player.AnimationStates.BASIC_ATTACKING, this._direction)));
	this._animationState = Player.AnimationStates.BASIC_ATTACKING;
};


// Checks if player is able to issue a talk command
Player.prototype.canTalk = function() {
	return this._animationState == Player.AnimationStates.IDLE || 
			this._animationState == Player.AnimationStates.WALKING || (
					this._animationState == Player.AnimationStates.BASIC_ATTACKING &&
					this.visualInstance.isAtLastFrameOfAnimation());
};


// Attemps to talk to any nearby NPCs in the direction of player 
Player.prototype.tryTalk = function() {
	var collidingNpcs = this.containingMap.findNpcCollisions(
			this.visualInstance.x, this.visualInstance.y, 
			this.visualInstance.getCollisionWidth() + Player.TALK_DIM_DELTA,
			this.visualInstance.getCollisionHeight() + Player.TALK_DIM_DELTA,
			this.visualInstance.isRounded(), this._collisionIgnoreList);
	for (var i = 0; i < collidingNpcs.length; i++) {
		var collidingNpc = collidingNpcs[i];
		if (Direction.getDirectionFromCoords(
						collidingNpc.visualInstance.x - this.visualInstance.x, 
						collidingNpc.visualInstance.y - this.visualInstance.y) == 
				this._direction) {
			if (this._animationState != Player.AnimationStates.IDLE) {
				this.visualInstance.setAnimation(
						this.visualInstance.getAnimNameFromFamily(
								DynamicMapEntity.getActionDirectionFamilyName(
										Player.AnimationStates.IDLE, this._direction)));
				this._animationState = Player.AnimationStates.IDLE;
			}
			collidingNpc.initiateTalk(this._direction);
			return;
		}
	}
};


// Update the player object. The only current action is to advance the animation
// object.
Player.prototype.tick = function() {
	this.visualInstance.advanceFrame();
};