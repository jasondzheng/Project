/**
 * Contains actions for the player
 */

var PlayerActionManager = function(player) {
	this.player = player;
	this._actionQueue = [];
	this._animationState;
	this._collisionIgnoreList = [player];
	this._oldQueueLength = 0;
};

// Possible unit animation states
PlayerActionManager.AnimationStates = {
	IDLE: 'idle',
	WALKING: 'walk',
	SPAWNING: 'spawn',
	DAMAGE_TAKEN: 'damageTaken',
	DESPAWNING: 'despawn',
	BASIC_ATTACKING: 'basicAttack'
};


// Consumes the queue, requesting new actions if the queue is empty
PlayerActionManager.prototype.tick = function() {
	var startQueueLength = this._actionQueue.length;
	// Clear out finished actions at the head of the queue.
	while (this._actionQueue.length > 0 && this._actionQueue[0].isDone()) {
		if (this._actionQueue[0].onEnd) {
			this._actionQueue[0].onEnd();
		}
		this._actionQueue.shift();
	}	
	if (this._actionQueue.length > 0) {
		if ((startQueueLength != this._actionQueue.length || 
				(startQueueLength != this._oldQueueLength && 
						this._oldQueueLength == 0)) && this._actionQueue[0].onStart) {
			this._actionQueue[0].onStart();
		}
		this._actionQueue[0].tick();
	} else {
		this._actionQueue[0] = this._behavior.getNextAction(this);
		if (this._actionQueue[0].onStart) {
			this._actionQueue[0].onStart();
		}
		this._actionQueue[0].tick();
	}
	this._oldQueueLength = this._actionQueue.length;
};


// Force enqueues an action, killing all other actions previously in the queue.
PlayerActionManager.prototype.forceEnqueue = function(action) {
	this._actionQueue.length = 1;
	this._actionQueue[0] = action;
};
