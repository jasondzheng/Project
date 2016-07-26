/**
 * A class for managing resources to be used for gamescript-based entities.
 */
var ResourceManager = function(resourceJson) {
	this._resourceJson = resourceJson;
	this._resources;
};


// Aggregate listing of all resources loadsed by managers.
ResourceManager._resourcePool = {};


// Loads the resource manager's resources.
ResourceManager.prototype.load = function(opt_callback) {
	this._resources = {};
	var resourcesToLoad = Object.keys(this._resourceJson).length;
	var that = this;
	var onLoaded = function(alias, resource) {
		that._resources[alias] = resource;
		resource.owners.push(that);
		if (--resourcesToLoad == 0) {
			this._resourceJson = undefined;
			if (opt_callback) {
				opt_callback();
			}
		}
	};
	for (var alias in this._resourceJson) {
		if (!this._resourceJson.hasOwnProperty(alias)) {
			continue;
		}
		var path = this._resourceJson[alias];
		if (path.endsWith('.json')) {
			// TODO: code in handler for json
		} else if (path.endsWith('.png')) {
			if (ResourceManager._resourcePool[path]) {
				onLoaded(alias, ResourceManager._resourcePool[path]);
			} else {
				(function(path, alias) {
					ImgUtils.loadImage(path, function(image) {
						ResourceManager._resourcePool[path] = {
							resource: image,
							path: path,
							owners: []
						};
						onLoaded(alias, ResourceManager._resourcePool[path]);
					});
				})(path, alias);
			}
		}
		// TODO: add other extensions here
	}
};


// Unloads all resources, removing any specific dependencies and deleting the
// actual resource if no other managers require the item.
ResourceManager.prototype.unload = function() {
	for (var alias in this._resources) {
		if (!this._resources.hasOwnProperty(alias)) {
			continue;
		}
		var resourceEntry = this._resources[alias];
		resourceEntry.owners.splice(resourceEntry.owners.indexOf(this), 1);
		if (resourceEntry.owners.length == 0) {
			resourceEntry.resource = undefined;
			delete ResourceManager._resourcePool[resourceEntry.path];
		}
	}
	this._resources = undefined;
};


// Grabs a resource. Assumes the alias has been defined and that the resource
// is available from load.
ResourceManager.prototype.get = function(alias) {
	return this._resources[alias].resource;
};