/**
 * Object representation of an NPC. Loaded from JSON and initialized based on
 * values. Note that NPCs have a variable state machine that is initialized
 * from the JSON; this implies that external code will run and alter the
 * NPC's state. For indivudual NPC behaviors, please alter the JSON instead of
 * this file, intended to be a basic wrapper for NPCs.
 */

var NPCEntity = function(id, name, movement, stateMachine, trades, shops, 
		visualEntity, resourceManager) {
	this.id = id;
	this.name = name;
	this.movement = movement;
	this.stateMachine = stateMachine;
	this.trades = [];
	for (var i = 0; i < trades.length; i++) {
		var trade = trades[i];
		this.trades.push(new Trade(trade.id, trade.ingredients, trade.results, 
				trade.gameVarEnableFlag));
	}
	this.shops = {};
	for (var shopId in shops) {
		if (!shops.hasOwnProperty(shopId)) {
			continue;
		}
		this.shops[shopId] = new Shop(shops[shopId].shopContents);
	}
	this.visualEntity = visualEntity;
	this.resourceManager = resourceManager;
};


// Gets the currently visible trades this NPC supports. 
// TODO: remove this comment; don't call this on tick or draw; call only once
// if possible (when you are guaranteed that visible trades won't change).
NPCEntity.prototype.getVisibleTrades = function() {
	var visibleTrades = [];
	for (var i = 0; i < this.trades.length; i++) {
		var trade = this.trades[i];
		if (trade.gameVarEnableFlag == undefined || 
				GameState.getVar(trade.gameVarEnableFlag)) {
			visibleTrades.push(trade);
		}
	}
	return visibleTrades;
};


/**
 * Instance representation of an NPC. Takes an NPC entity and instatiates
 * it along with its own visualInstance.
 */
var NPCInstance = function(npcEntity, id, x, y, startingDirection, 
		containingMap) {
	// The entity this instance is based off of
	this.npcEntity = npcEntity;

	// The ID of this NPC. Keep in mind this is completely different from the
	// ID of the entity, which is an ID to distinguish type of NPC. This ID
	// is used to distinguish 2 separate instances (which may or may not have
	// the same type (entity) ID).
	this.id = id;

	// The containing map the NPC is on
	this.containingMap = containingMap;

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

	/* A set of gamescript editable functions and values determining the behavior
	 * of the NPC.
	 */

	// The inner function responsible for handling talking to the NPC. If not
	// provided, the NPC will ignore attempts to talk to it.
	this._onTalk = null;


	// Curried talk cleanup function made here
	this._helperCreateCleanupTalkFn();

	// Handle all state machine inits here. This includes init'ing the object
	// at the beginning of the state machine, as well as the onEnter for
	// the current state.
	this._helperEval(this.npcEntity.stateMachine.init);
	this._helperEval(this._state.onEnter);
};


NPCInstance.prototype.setPositionX = function(x) {
	this.visualInstance.x = x;
};


NPCInstance.prototype.setPositionY = function(y) {
	this.visualInstance.y = y;
};


NPCInstance.prototype.getPositionX = function() {
	return this.visualInstance.x;
};


NPCInstance.prototype.getPositionY = function() {
	return this.visualInstance.y;
};


// Gets visible trades from the NPC entity. 
NPCInstance.prototype.getVisibleTrades = function() {
	return this.npcEntity.getVisibleTrades();
};


// Gets shop from the NPC entity. 
NPCInstance.prototype.getShop = function(shopId) {
	return this.npcEntity.shops[shopId];
};


// Getter for resources, used by gamescripts.
NPCInstance.prototype._rsrc = function(alias) {
	return this.npcEntity.resourceManager.get(alias);
};


// Initiates talk mode. NPC will stop moving and face the direction of the 
// player.
NPCInstance.prototype.initiateTalk = function(directionToNpc) {
	if (this._onTalk) {
		this.movementManager.setTalkMode(true);
		this.movementManager.setIdle(Direction.reverse(directionToNpc));
		this._onTalk(this._cleanupTalk);
	}
};


// Helper to curry the cleanupTalk function. 
NPCInstance.prototype._helperCreateCleanupTalkFn = function() {
	var that = this;
	// Cleanup talk function cleans up any state initailized for the NPC
	// dialogue.
	NPCInstance.prototype._cleanupTalk = function() {
		that.movementManager.setTalkMode(false);
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