/**
 * Object representation of a unit. Entity includes unit-specific name, max hp, 
 * attack, behavior pattern, attack pattern, state machine and the visual 
 * entity.
 */


var UnitEntity = function(id, name, maxHp, atk, attackDistance, speed, 
		behaviorPattern, attackPattern, stateMachine, visualEntity, hpBarWidth) {
	this.id = id;
	this.name = name;
	this.maxHp = maxHp;
	this.atk = atk;
	this.attackDistance = attackDistance;
	this.speed = speed;
	this.behaviorPattern = behaviorPattern;
	this.attackPattern = attackPattern;
	this.stateMachine = stateMachine;
	this.visualEntity = visualEntity;
	this.hpBarWidth = hpBarWidth || UnitHpDrawer.DEFAULT_BAR_WIDTH;
};


/**
* Unit Instance includes instance-specifc fields such as unit hp, position, 
* starting direction and the containing map. Initializes the state machine and 
* behavior manager as well
*/

var UnitInstance = function(unitEntity, x, y, startingDirection, 
		containingMap) {
	// Globally increasing ID to reference this unit.
	this.uid = UnitInstance._uidCounter++;

	this.hp = unitEntity.maxHp;

	this.unitEntity = unitEntity;

	this.containingMap = containingMap;

	this.visualInstance = new DynamicMapInstance(unitEntity.visualEntity, x, y);

	this.direction = startingDirection;
	this.actionManager = new UnitActionManager(this);
	this._state = unitEntity.stateMachine.states[
			unitEntity.stateMachine.defaultState];

	this._helperEval(this.unitEntity.stateMachine.init);
	this._helperEval(this._state.onEnter);
};

// Counter to ensure no UnitInstance uid's are the same
UnitInstance._uidCounter = 0;


UnitInstance.prototype.setPositionX = function(x) {
	this.visualInstance.x = x;
};


UnitInstance.prototype.setPositionY = function(y) {
	this.visualInstance.y = y;
};


UnitInstance.prototype.getPositionX = function() {
	return this.visualInstance.x;
};


UnitInstance.prototype.getPositionY = function() {
	return this.visualInstance.y;
};


// Advances the state machine as well as animation sequence for the visual
// entity
UnitInstance.prototype.tick = function() {
	this._helperEval(this._state.tick);
	for (var i = 0; i < this._state.transitions.length; i++) {
		if (this._helperEval(this._state.transitions[i].condition)) {
			this._helperEval(this._state.onExit);
			this._state = this.unitEntity.stateMachine.states[
					this._state.transitions[i].state];
			this._helperEval(this._state.onEnter);
			break;
		}
	}

	// Movement manager as needed
	this.actionManager.tick();

	// Update the dynamic map instance
	this.visualInstance.advanceFrame();
};


// Helper to evaluate stringed code in the current context.
UnitInstance.prototype._helperEval = function(code) {
	return function(code) {
		return eval(code);
	}.call(this, code);
};