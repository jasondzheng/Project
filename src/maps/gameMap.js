/**
 * Contains the data associated with a given map. This includes tile data for
 * now as well as the appropriate tileset for the given map. May include other
 * information like events, connectors, npcs, mob data, etc in the future.
 */

var GameMap = function(name, data, width, tileset, dummyTile, staticMapEntities, 
		staticMapInstances, npcInstances, events, tracks, spawnBehavior) {
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
	this.npcInstanceArray = [];

	// Unit instances
	this.unitInstances = [];

	// Drops on the map
	this.itemDrops = [];

	// The player on this map, if any
	this.player;

	// All events on the map
	this.events = events;

	// Tracks
	this.tracks = tracks;

	// Unit Spawner
	this.unitSpawner = new UnitSpawner(this, spawnBehavior);

	// When the map is finalized, link all instances to this map.
	for (var id in npcInstances) {
		if (!npcInstances.hasOwnProperty(id)) {
			continue;
		}
		npcInstances[id].containingMap = this;
		this.npcInstanceArray.push(npcInstances[id]);
	}

	for (var i = 0; i < events.length; i++) {
		events[i].containingMap = this;
	}
};


// Registers a newly created NPC instance to this map.
GameMap.prototype.registerNpcInstance = function(npcInstance) {
	this.npcInstances[npcInstance.id] = npcInstance;
	this.npcInstanceArray.push(npcInstance);
	npcInstance.containingMap = this;
};


// Registers a newly created unit instance to the map
GameMap.prototype.registerUnitInstance = function(unitInstance) {
	this.unitInstances.push(unitInstance);
	unitInstance.containingMap = this;
};


// Registers a newly created item drop instance to the map
GameMap.prototype.registerItemDrop = function(dropInstance) {
	this.itemDrops.push(dropInstance);
	dropInstance.containingMap = this;
};


// Deregisters an existing UnitInstance from the map
GameMap.prototype.deregisterUnitInstance = function(unitInstance) {
	this.unitInstances.splice(this.unitInstances.indexOf(unitInstance), 1);
	unitInstance.containingMap = null;
};


// Deregisters an NPC from this map.
GameMap.prototype.deregisterNpcInstance = function(npcInstance) {
	this.npcInstanceArray.splice(this.npcInstanceArray.indexOf(npcInstance), 1);
	npcInstance.containingMap = null;
	delete this.npcInstances[npcInstance.id];
};


// Deregisters an existing ItemDrop from the map
GameMap.prototype.deregisterItemDrop = function(dropInstance) {
	this.itemDrops.splice(this.itemDrops.indexOf(dropInstance), 1);
	dropInstance.containingMap = null;
};


// Registers player objects when they enter the map
GameMap.prototype.registerPlayer = function(player) {
	this.player = player;
	player.containingMap = this;
};


// Tick all tickables contained in the map
GameMap.prototype.tickAll = function() {
	this.unitSpawner.tick();
	for (var i = 0; i < this.events.length; i++) {
		this.events[i].tick();
	}
	for (var i = 0; i < this.npcInstanceArray.length; i++) {
		this.npcInstanceArray[i].tick();
	}
	for (var i = 0; i < this.unitInstances.length; i++) {
		this.unitInstances[i].tick();
	}
	for (var i = 0; i < this.itemDrops.length; i++) {
		this.itemDrops[i].tick();
	}
	if (this.player) {
		this.player.tick();
	}
};


// Utility function to find all collisions of all entity instances on the map
// with the specified bounds.
GameMap.prototype.findCollisions = function(centerX, centerY, width, height, 
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
	for (var i = 0; i < this.npcInstanceArray.length; i++) {
		var currentInstance = this.npcInstanceArray[i];
		if (CollisionDetector.areShapesColliding(centerX, centerY, width, 
				height, isRounded, currentInstance.visualInstance.x, 
				currentInstance.visualInstance.y, 
				currentInstance.visualInstance.getCollisionWidth(), 
				currentInstance.visualInstance.getCollisionHeight(), 
				currentInstance.visualInstance.isRounded())) {
			collisions.push(currentInstance);
		}
	}
	// Then compare units
	for (var i = 0; i < this.unitInstances.length; i++) {
		var currentInstance = this.unitInstances[i];
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


// Finds all colliding units with the specified shape.
GameMap.prototype.findUnitCollisions = function(centerX, centerY, width, height, 
		isRounded, opt_ignoreList) {
	var collisions = [];
	for (var i = 0; i < this.unitInstances.length; i++) {
		var currentInstance = this.unitInstances[i];
		if (CollisionDetector.areShapesColliding(centerX, centerY, width, 
						height, isRounded, currentInstance.visualInstance.x, 
						currentInstance.visualInstance.y, 
						currentInstance.visualInstance.getCollisionWidth(), 
						currentInstance.visualInstance.getCollisionHeight(), 
						currentInstance.visualInstance.isRounded()) &&
				(!opt_ignoreList || opt_ignoreList.indexOf(currentInstance) == -1)) {
			collisions.push(currentInstance);
		}
	}
	return collisions;
};


// Finds all colliding NPCs within the specified shape.
GameMap.prototype.findNpcCollisions = function(centerX, centerY, width, height, 
		isRounded, opt_ignoreList) {
	var collisions = [];
	for (var i = 0; i < this.npcInstanceArray.length; i++) {
		var currentInstance = this.npcInstanceArray[i];
		if (CollisionDetector.areShapesColliding(centerX, centerY, width, 
						height, isRounded, currentInstance.visualInstance.x, 
						currentInstance.visualInstance.y, 
						currentInstance.visualInstance.getCollisionWidth(), 
						currentInstance.visualInstance.getCollisionHeight(), 
						currentInstance.visualInstance.isRounded()) &&
				(!opt_ignoreList || opt_ignoreList.indexOf(currentInstance) == -1)) {
			collisions.push(currentInstance);
		}
	}
	return collisions;
};


// Helper function to detect whether a collision has happened or not. Keep in
// sync with findCollisions.
GameMap.prototype.isColliding = function(centerX, centerY, width, height, 
		isRounded, opt_ignoreList) {
	// First compare to static map entities
	for (var i = 0; i < this.staticMapInstances.length; i++) {
		var currentInstance = this.staticMapInstances[i];
		if (CollisionDetector.areShapesColliding(centerX, centerY, width, 
						height, isRounded, currentInstance.x, currentInstance.y, 
						currentInstance.getCollisionWidth(), 
						currentInstance.getCollisionHeight(), 
						currentInstance.isRounded()) && 
				(!opt_ignoreList || opt_ignoreList.indexOf(currentInstance) == -1)) {
			return true;
		}
	}
	// Then compare NPCS
	for (var i = 0; i < this.npcInstanceArray.length; i++) {
		var currentInstance = this.npcInstanceArray[i];
		if (CollisionDetector.areShapesColliding(centerX, centerY, width, 
						height, isRounded, currentInstance.visualInstance.x, 
						currentInstance.visualInstance.y, 
						currentInstance.visualInstance.getCollisionWidth(), 
						currentInstance.visualInstance.getCollisionHeight(), 
						currentInstance.visualInstance.isRounded()) && 
				(!opt_ignoreList || opt_ignoreList.indexOf(currentInstance) == -1)) {
			return true;
		}
	}
	// Then compare units
	for (var i = 0; i < this.unitInstances.length; i++) {
		var currentInstance = this.unitInstances[i];
		if (CollisionDetector.areShapesColliding(centerX, centerY, width, 
						height, isRounded, currentInstance.visualInstance.x, 
						currentInstance.visualInstance.y, 
						currentInstance.visualInstance.getCollisionWidth(), 
						currentInstance.visualInstance.getCollisionHeight(), 
						currentInstance.visualInstance.isRounded()) && 
				(!opt_ignoreList || opt_ignoreList.indexOf(currentInstance) == -1)) {
			return true;
		}
	}
	// Finally compare to the player, if any
	if (this.player && (!opt_ignoreList || 
					opt_ignoreList.indexOf(this.player) == -1) && 
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
GameMap.prototype.isOutOfBounds = function(centerX, centerY, width, height) {
	width /= 2;
	height /= 2;
	return centerX - width < 0 || centerX + width > this.width || 
			centerY - height < 0 || centerY + height > this.height;
};