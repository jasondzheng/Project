/**
 * Object representation of an NPC. Loaded from JSON and initialized based on
 * values. Note that NPCs have a variable state machine that is initialized
 * from the JSON; this implies that external code will run and alter the
 * NPC's state. For indivudual NPC behaviors, please alter the JSON instead of
 * this file, intended to be a basic wrapper for NPCs.
 */

var NPCEntity = function(id, name, movement, stateMachine, trades, shops, 
		visualEntity) {
	this.id = id;
	this.name = name;
	this.movement = movement;
	this.stateMachine = stateMachine;
	this.trades = trades;
	this.shops = shops;
	this.visualEntity = visualEntity;
};


/**
 * Instance representation of an NPC. Takes an NPC entity and instatiates
 * it along with its own visualInstance.
 */
var NPCInstance = function(npcEntity, x, y, startingDirection, containingMap) {
	// The entity this instance is based off of
	this.npcEntity = npcEntity;

	// The containing map the NPC is on
	this.containingMap = containingMap;

	// TODO: initialize the animation families
	this._animationFamilies = {};
	// Initialize animation families
	for (var animationName in npcEntity.visualEntity.animations) {
		if (!npcEntity.visualEntity.animations.hasOwnProperty(animationName)) {
			continue;
		}
		if (NPCInstance.ANIM_NAME_REGEX.test(animationName)) {
			var animFamilyName = animationName.match(NPCInstance.ANIM_NAME_REGEX)[1];
			if (!this._animationFamilies[animFamilyName]) {
				this._animationFamilies[animFamilyName] = [];
			}
			this._animationFamilies[animFamilyName].push(animationName);
		}
	}
	this._state = npcEntity.stateMachine.states[
			npcEntity.stateMachine.defaultState];
	this.direction = startingDirection;

	this.visualInstance = new DynamicMapInstance(npcEntity.visualEntity, x, y);
	this.startingLocation = {
		x: x,
		y: y
	};

	// Create the movement manager
	this.movementManager = new NPCMovementManager(this); 

	// Handle all state machine inits here. This includes init'ing the object
	// at the beginning of the state machine, as well as the onEnter for
	// the current state.
	this._helperEval(this.npcEntity.stateMachine.init);
	this._helperEval(this._state.onEnter);
};


// Regex for testing animation family naming
NPCInstance.ANIM_NAME_REGEX = /^(\w+?)\d+$/;


NPCInstance.prototype.setPosition = function(x, y) {
	this.visualInstance.x = x;
	this.visualInstance.y = y;
};


NPCInstance.prototype.getPosition = function() {
	return {
		x: this.visualInstance.x,
		y: this.visualInstance.y
	};
};


// Advances the state machine as well as animation sequence for the visual
// entity
NPCInstance.prototype.tick = function() {
	this._helperEval(this._state.tick);
	for (var i = 0; i < this._state.transitions.length; i++) {
		if (this._helperEval(this._state.transitions[i].condition)) {
			this._helperEval(this._state.onExit);
			this._state = this.npcEntity.stateMachine.states[
					this._state.transitions[i].state];
			this._helperEval(this._state.onEnter);
			break;
		}
	}

	// Movement manager as needed
	this.movementManager.tick();

	// Update the dynamic map instance
	this.visualInstance.advanceFrame();
};


// Helper to evaluate stringed code in the current context.
NPCInstance.prototype._helperEval = function(code) {
	return function(code) {
		return eval(code);
	}.call(this, code);
};


// Helper to randomly pick an animation from a set of animations in a family.
NPCInstance.prototype.getAnimNameFromFamily = function(animName) {
	if (this._animationFamilies[animName]) {
		return this._animationFamilies[animName][Math.floor(Math.random() * 
				this._animationFamilies[animName].length)];
	} else {
		return animName;
	}
};