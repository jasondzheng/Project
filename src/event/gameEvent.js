/**
 * A representation of an event. Events consist of multiple potential states,
 * assuming the state whose condition is currently met. An event, when assuming
 * a state, will then execute its body.
 */

var GameEvent = function(id, states, variableData) {
 	this.id = id;
 	this._states = states;
 	this._initVarData = variableData;
 	this.containingMap;

 	// Initialize event-specific variables
 	for (var key in variableData) {
 		if (!variableData.hasOwnProperty(key)) {
 			continue;
 		}
 		this[key] = variableData[key];
 	}
};


GameEvent.prototype.tick = function() {
	for (var i = 0; i < this._states.length; i++) {
		var currState = this._states[i];
		if (this._helperEval(currState.condition)) {
			this._helperEval(currState.body);
			break;
		}
	}
};


// Helper to evaluate stringed code in the current context.
GameEvent.prototype._helperEval = function(code) {
	return function(code) {
		return eval(code);
	}.call(this, code);
};


/**
 * Loader for events.
 */

var GameEventLoader = {};

GameEventLoader.load = function(json) {
	// Checks if templating is required, otherwise processes normally.
	if (json.eventTemplate) {
		var template = GameEventTemplate.getTemplate(json.eventTemplate);
		return new GameEvent(json.id, template.states, template.variableData);
	} else {
		return new GameEvent(json.id, json.states, json.variableData);
	}
};