/**
 * Loads JSON and callsback when done loading.
 */


var JSONLoader = {};

JSONLoader.load = function(url, opt_callback, opt_failCallback) {
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (xhr.readyState != 4 || xhr.status != 200) {
			if (opt_failCallback) {
				opt_failCallback();
			}
		} else if (opt_callback) {
			opt_callback(JSON.parse(xhr.responseText));
		}
	};
	xhr.open('GET', url, true);
	xhr.send();
};