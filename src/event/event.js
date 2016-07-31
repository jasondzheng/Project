/**
 * A representation of an event. Events consist of multiple potential states,
 * assuming the state whose condition is currently met. An event, when assuming
 * a state, will then execute its body.
 */

var Event = function(id, states, variableData) {
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


Event.prototype.tick = function() {
	for (var i = 0; i < this._states.length; i++) {
		var currState = this._states[i];
		if (this._helperEval(currState.condition)) {
			this._helperEval(currState.body);
			break;
		}
	}
};


// Helper to evaluate stringed code in the current context.
Event.prototype._helperEval = function(code) {
	return function(code) {
		return eval(code);
	}.call(this, code);
};


/**
 * Loader for events.
 */

var EventLoader = {};

EventLoader.load = function(json) {
	// Checks if templating is required, otherwise processes normally.
	if (json.eventTemplate) {
		var template = EventTemplate.getTemplate(json.eventTemplate);
		return new Event(json.id, template.states, template.variableData);
	} else {
		return new Event(json.id, json.states, json.variableData);
	}
};