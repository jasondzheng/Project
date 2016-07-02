/**
 * Contains the data associated with a given map. This includes tile data for
 * now as well as the appropriate tileset for the given map. May include other
 * information like events, connectors, npcs, mob data, etc in the future.
 */

var Map = function(name, data, width, tileset, dummyTile, staticMapEntities, 
		staticMapInstances, npcInstances) {
	// The name of the map
	this.name = name;

	// The tile data for the map.
	this.data = data;

	// The dimensions of the map.
	this.width = width;
	this.height = data.length / width;

	// The tileset for the map
	this.tileset = tileset;

	// The dummy tile for this map
	this.dummyTile = dummyTile;

	// The static map entities of the map
	this.staticMapEntities = staticMapEntities;
	this.staticMapInstances = staticMapInstances;

	// NPC instances
	this.npcInstances = npcInstances;

	// When the map is finalized, link all instances to this map.
	for (var i = 0; i < npcInstances.length; i++) {
		npcInstances[i].map = this;
	}
};


// Registers a newly created NPC instance to this map.
Map.prototype.registerNPCInstance = function(npcInstance) {
	this.npcInstances.push(npcInstance);
	npcInstance.map = this;
};


// Tick all tickables contained in the map
Map.prototype.tickAll = function() {
	for (var i = 0; i < this.npcInstances.length; i++) {
		this.npcInstances[i].tick();
	}
};


// Utility function to find all collisions of all entity instances on the map
// with the specified bounds.
Map.prototype.findCollisions = function(width, height, centerX, centerY, 
		isRounded) {
	var collisions = [];
	// First compare to static map entities
	for (var i = 0; i < this.staticMapInstances; i++) {
		var currentInstance = this.staticMapInstances[i];

	}
};

