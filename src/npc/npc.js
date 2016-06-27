/**
 * Object representation of an NPC. Loaded from JSON and initialized based on
 * values. Note that NPCs have a variable state machine that is initialized
 * from the JSON; this implies that external code will run and alter the
 * NPC's state. For indivudual NPC behaviors, please alter the JSON instead of
 * this file, intended to be a basic wrapper for NPCs.
 */

var NPCEntity = function(name, movement, stateMachine, trades, shops, 
		visualEntity) {
	this.name = name;
	this.movement = movement;
	this.stateMachine = stateMachine;
	this.trades = trades;
	this.shops = shops;
	this.visualEntity = visualEntity;
	// TODO: for any universalized structures that need transforming, please
	// do here. Note that the state machine CANNOT be curried here because
	// the instance has yet to be made.
};


/**
 * Instance representation of an NPC. Takes an NPC entity and instatiates
 * it along with its own visualInstance.
 */
var NPCInstance = function(npcEntity, x, y, startingDirection) {
	this._npcEntity = npcEntity;
	// TODO: initialize the animation families
	this._animationFamilies = {	};
	this._state = npcEntity.stateMachine.states[
			npcEntity.stateMachine.defaultState];
	this.position = {
		x: x,
		y: y
	};
	this._direction = startingDirection;

	this.visualInstance = new DynamicMapInstance(npcEntity.visualEntity, x, y, 
			undefined /* TODO: specify how to get starting direction animation */);

	// Handle all state machine inits here. This includes init'ing the object
	// at the beginning of the state machine, as well as the onEnter for
	// the current state.
	this._helperEval(this._npcEntity.stateMachine.init);
	this._helperEval(this._state.onEnter);
};


// Advances the state machine as well as animation sequence for the visual
// entity
NPCInstance.prototype.tick = function() {
	this._helperEval(this._state.tick);
	for (var i = 0; i < this._state.transitions.length; i++) {
		if (this._helperEval(this._state.transitions[i].condition)) {
			this._helperEval(this._state.onExit);
			this._state = this._npcEntity.stateMachine.states[
					this._state.transitions[i].state];
			this._helperEval(this._state.onEnter);
			break;
		}
	}


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
NPCInstance.prototype._helperGetAnimNameFromFamily = function(animName) {
	if (this._animationFamilies[animName]) {
		return animName + (1 + Math.floor(Math.random() * 
				this._animationFamilies[animName].length));
	}
	throw 'Unfound animation family named ' + animName;
};