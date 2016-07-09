/**
 * Contains the data associated with a given map. This includes tile data for
 * now as well as the appropriate tileset for the given map. May include other
 * information like events, connectors, npcs, mob data, etc in the future.
 */

var Map = function(name, data, width, tileset, dummyTile, staticMapEntities, 
		staticMapInstances, npcInstances, tracks) {
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

	// The player on this map, if any
	this.player;

	// Tracks
	this.tracks = tracks;

	// When the map is finalized, link all instances to this map.
	for (var i = 0; i < npcInstances.length; i++) {
		npcInstances[i].containingMap = this;
	}
};


// Registers a newly created NPC instance to this map.
Map.prototype.registerNPCInstance = function(npcInstance) {
	this.npcInstances.push(npcInstance);
	npcInstance.containingMap = this;
};


// Registers player objects when they enter the map
Map.prototype.registerPlayer = function(player) {
	this.player = player;
	player.containingMap = this;
};


// Tick all tickables contained in the map
Map.prototype.tickAll = function() {
	for (var i = 0; i < this.npcInstances.length; i++) {
		this.npcInstances[i].tick();
	}
	if (this.player) {
		this.player.tick();
	}
};


// Utility function to find all collisions of all entity instances on the map
// with the specified bounds.
Map.prototype.findCollisions = function(centerX, centerY, width, height, 
		isRounded) {
	var collisions = [];
	// First compare to static map entities
	for (var i = 0; i < this.staticMapInstances.length; i++) {
		var currentInstance = this.staticMapInstances[i];
		if (CollisionDetector.areShapesColliding(centerX, centerY, width, 
				height, isRounded, currentInstance.x, currentInstance.y, 
				currentInstance.getCollisionWidth(), 
				currentInstance.getCollisionHeight(), currentInstance.isRounded())) {
			collisions.push(currentInstance);
		}
	}
	// Then compare NPCS
	for (var i = 0; i < this.npcInstances.length; i++) {
		var currentInstance = this.npcInstances[i];
		if (CollisionDetector.areShapesColliding(centerX, centerY, width, 
				height, isRounded, currentInstance.visualInstance.x, 
				currentInstance.visualInstance.y, 
				currentInstance.visualInstance.getCollisionWidth(), 
				currentInstance.visualInstance.getCollisionHeight(), 
				currentInstance.visualInstance.isRounded())) {
			collisions.push(currentInstance);
		}
	}
	// Finally compare to the player, if any
	if (this.player && CollisionDetector.areShapesColliding(centerX, centerY, 
			width, height, isRounded, this.player.visualInstance.x, 
			this.player.visualInstance.y, 
			this.player.visualInstance.getCollisionWidth(), 
			this.player.visualInstance.getCollisionHeight(), 
			this.player.visualInstance.isRounded())) {
		collisions.push(this.player);
	}
	return collisions;
};


// Helper function to detect whether a collision has happened or not. Keep in
// sync with findCollisions.
Map.prototype.isColliding = function(centerX, centerY, width, height, 
		isRounded, ignoreList) {
	// First compare to static map entities
	for (var i = 0; i < this.staticMapInstances.length; i++) {
		var currentInstance = this.staticMapInstances[i];
		if (CollisionDetector.areShapesColliding(centerX, centerY, width, 
						height, isRounded, currentInstance.x, currentInstance.y, 
						currentInstance.getCollisionWidth(), 
						currentInstance.getCollisionHeight(), 
						currentInstance.isRounded()) && 
				(!ignoreList || ignoreList.indexOf(currentInstance) == -1)) {
			return true;
		}
	}
	// Then compare NPCS
	for (var i = 0; i < this.npcInstances.length; i++) {
		var currentInstance = this.npcInstances[i];
		if (CollisionDetector.areShapesColliding(centerX, centerY, width, 
						height, isRounded, currentInstance.visualInstance.x, 
						currentInstance.visualInstance.y, 
						currentInstance.visualInstance.getCollisionWidth(), 
						currentInstance.visualInstance.getCollisionHeight(), 
						currentInstance.visualInstance.isRounded()) && 
				(!ignoreList || ignoreList.indexOf(currentInstance) == -1)) {
			return true;
		}
	}
	// Finally compare to the player, if any
	if (this.player && (!ignoreList || ignoreList.indexOf(this.player) == -1) && 
			CollisionDetector.areShapesColliding(centerX, centerY, 
					width, height, isRounded, this.player.visualInstance.x, 
					this.player.visualInstance.y, 
					this.player.visualInstance.getCollisionWidth(), 
					this.player.visualInstance.getCollisionHeight(), 
					this.player.visualInstance.isRounded())) {
		return true;
	}
	return false;
};


// Checks if an element, including width and height, are out of map bounds.
Map.prototype.isOutOfBounds = function(centerX, centerY, width, height) {
	width /= 2;
	height /= 2;
	return centerX - width < 0 || centerX + width > this.width || 
			centerY - height < 0 || centerY + height > this.height;
};