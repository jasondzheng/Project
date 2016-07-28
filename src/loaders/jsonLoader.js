/**
 * Loads JSON and callsback when done loading.
 */


var JSONLoader = {};


// Static function to load JSON
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


// Static function to load JSON without whitespace
JSONLoader.loadWithoutWhitespace = function(url, opt_callback, 
		opt_failCallback) {
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (xhr.readyState != 4 || xhr.status != 200) {
			if (opt_failCallback) {
				opt_failCallback();
			}
		} else if (opt_callback) {
			var responseText = xhr.responseText;
			var commentIndex;
			while ((commentIndex = responseText.indexOf('//')) != -1) {
				var commentEnd = responseText.indexOf('\n', commentIndex);
				if (commentEnd == -1) {
					commentEnd = responseText.length;
				}
				responseText = responseText.substring(0, commentIndex) + 
						responseText.substring(commentEnd);
			}
			responseText = responseText.replace(
					/\s+(?=((\\[\\']|[^\\'])*'(\\[\\']|[^\\'])*')*(\\[\\']|[^\\'])*$)/g, 
					'');
			opt_callback(JSON.parse(responseText));
		}
	};
	xhr.open('GET', url, true);
	xhr.send();
};