/**
 * A tool used to unravel pyramids of death. Creates a call hierarchy which
 * unravels as available.
 */

var CallbackDeferrer = function() {
	this._callQueue = [];
	this._returnedArgList = [];
};


// Adds a function to the queue of functions to be called.
CallbackDeferrer.prototype.add = function(invokedFunction, argsCallback, 
		returnArgNames) {
	this._callQueue.push({
		invokedFunction: invokedFunction,
		argsCallback: argsCallback,
		returnArgNames: returnArgNames
	});
};


// Calls the functions and processes their return arguments in the queue.
CallbackDeferrer.prototype.after = function(opt_callback) {
	var that = this;
	var genericCallback = function() {
		// Mark that the past task was complete by removing it from the list
		var callStackEntry = that._callQueue.shift();
		// Record all resulting params from the recently completed callback 
		// into a cumulative list of all results
		var callbackArgs = {};
		var totalArgs = Math.min(callStackEntry.returnArgNames.length, 
				arguments.length);
		for (var i = 0; i < totalArgs; i++) {
			callbackArgs[callStackEntry.returnArgNames[i]] = arguments[i];
		}
		that._returnedArgList.push(callbackArgs);
		// Try to fire off the next task if any; if not, call ultimate callback
		// with all intermediate results now ready
		if (that._callQueue.length > 0) {
			var args = that._callQueue[0].argsCallback(that._returnedArgList);
			args.push(genericCallback);
			that._callQueue[0].invokedFunction.apply(that, args);
		} else if (opt_callback) {
			opt_callback(that._returnedArgList);
		}
	};
	var args = that._callQueue[0].argsCallback(that._returnedArgList);
	args.push(genericCallback);
	that._callQueue[0].invokedFunction.apply(that, args);
};