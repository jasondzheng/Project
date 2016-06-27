/**
 * Contains the data associated with a given map. This includes tile data for
 * now as well as the appropriate tileset for the given map. May include other
 * information like events, connectors, npcs, mob data, etc in the future.
 */

var Map = function(name, data, width, tileset, dummyTile, staticMapEntities, 
		staticMapInstances, npcEntities, npcInstances) {
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

	// NPC entities and instances
	this.npcEntities = npcEntities;
	this.npcInstances = npcInstances;
};


// Registers a newly created NPC instance to this map.
Map.prototype.registerNPCInstance = function(npcInstance) {
	this.npcInstances.push(npcInstance);
};


// Tick all tickables contained in the map
Map.prototype.tickAll = function() {
	for (var i = 0; i < this.npcInstances.length; i++) {
		this.npcInstances[i].tick();
	}
};