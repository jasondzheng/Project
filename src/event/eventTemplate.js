/**
 * Allows for generic events to be parameterized. Does so by generating the
 * objects with gamescript strings that would otherwise come from containing
 * event JSON, but allows for string-replacement parameterization.
 */

var EventTemplate = {};


// Loads all the event templates from the event templates json file. Must be 
// called before templates are referred to.
EventTemplate.init = function(callback) {
	JSONLoader.loadWithoutWhitespace('../assets/events/EventTemplates.json', 
			function(json) {
		EventTemplate._templates = json;
		callback(); 
	});
};


// Fills in templates and creates clones with the given parameters.
EventTemplate.getTemplate = function(params) {
	var currTemplate = EventTemplate._templates[params._template];
	for (var paramName in currTemplate.transformFns) {
		if (!currTemplate.transformFns.hasOwnProperty(paramName)) {
			continue;
		}
		params[paramName] = (function(code){
			return eval(code);
		}).call(params, currTemplate.transformFns[paramName]);
	}
	var result = {};
	result.variableData = JSON.parse(JSON.stringify(currTemplate.variableData));
	result.states = JSON.stringify(currTemplate.states);
	for (var paramName in params) {
		if (!params.hasOwnProperty(paramName) || paramName == '_template') {
			continue;
		}
		result.states = 
				result.states.replace(new RegExp('#' + paramName + '#', 'g'), 
						params[paramName]);
	}
	result.states = JSON.parse(result.states);
	return result;
};