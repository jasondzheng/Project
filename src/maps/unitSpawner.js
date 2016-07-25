/**
 * Manages the spawning of enemy units on a given map with the provided spawn 
 * behavior. Provides functions for spawning outside of the behavior (forceSpawn 
 * and fillUnitQuotas).
 */

var UnitSpawner = function(containingMap, spawnBehavior) {
	this.containingMap = containingMap;
	this._spawnBehavior = spawnBehavior;
	this._instanceCounts = {};

	for (var id in this._spawnBehavior.monsterData) {
		if (!this._spawnBehavior.monsterData.hasOwnProperty(id)) {
			continue;
		}
		// Fill in zero instance counts for all spawnable monsters
		this._instanceCounts[id] = 0;
		// Create a time-till-spawn variable for each monster
		this._spawnBehavior.monsterData[id].timeTillSpawn = 
				this._spawnBehavior.monsterData[id].spawnInterval;
	}
};


// The maximal number of tries a spawn unit is placed before giving up due to
// repeated spawn collisions.
UnitSpawner.MAX_SPAWN_TRIES = 10;


// Forcefully spawns an instance of a monster given its id, regardless of spawn 
// capacity. May not successfully spawn if collisions checks fail.
UnitSpawner.prototype.forceSpawn = function(id, opt_x, opt_y, 
		opt_direction) {
	// Obtain the collision window from entity
	var entity = UnitLoader.getPreloadedEntity(id);
	var spawnProfile = this._spawnBehavior.monsterData[id];
	if (opt_x == undefined || opt_y == undefined) {
		// Attempt to place the collision window N times
		for (var i = 0; i < UnitSpawner.MAX_SPAWN_TRIES; i++) {
			var spawnPoint = this._spawnBehavior.spawnPoints[
					spawnProfile.spawnPoints[
							Math.floor(Math.random() * spawnProfile.spawnPoints.length)]];
			opt_x = spawnPoint.x + spawnPoint.width * Math.random();
			opt_y = spawnPoint.y + spawnPoint.height * Math.random();
			if (!this.containingMap.isColliding(opt_x, opt_y, 
							entity.visualEntity.collisionWidth, 
							entity.visualEntity.collisionHeight,
							entity.visualEntity.isRounded) && 
					!this.containingMap.isOutOfBounds(opt_x, opt_y, 
							entity.visualEntity.collisionWidth, 
							entity.visualEntity.collisionHeight)) {
				break;
			}
		}
	} else if (this.containingMap.isColliding(opt_x, opt_y, 
					entity.visualEntity.collisionWidth, 
					entity.visualEntity.collisionHeight,
					entity.visualEntity.isRounded) || 
			this.containingMap.isOutOfBounds(opt_x, opt_y, 
					entity.visualEntity.collisionWidth, 
					entity.visualEntity.collisionHeight)) {
		return null;
	}
	if (opt_x == null || opt_y == null) {
		return null;
	} else {
		// On success, spawn unit fitting in the window
		var newUnit = new UnitInstance(entity, opt_x, opt_y, 
				opt_direction || Direction.getRandom(), this.containingMap);
		this.containingMap.registerUnitInstance(newUnit);
		newUnit.actionManager.forceEnqueue(
				new UnitActionManager.SpawnAction(newUnit.actionManager));
		this._instanceCounts[id]++;
		return newUnit;
	}
};


// Attempts to fill unit quotas on the map, using spawn percentages to decide
// whether to spawn units or not. More specifically, attempts to spawn 1 unit
// for each of its capacities.
UnitSpawner.prototype.fillUnitQuotas = function() {
	for (var id in this._spawnBehavior.monsterData) {
		if (!this._spawnBehavior.monsterData.hasOwnProperty(id)) {
			continue;
		}
		var spawnInfo = this._spawnBehavior.monsterData[id];
		for (var i = 0; i < spawnInfo.capacity; i++) {
			if (Math.random() < spawnInfo.spawnRate) {				
				this.forceSpawn(id);
			}
		}
	}
};


UnitSpawner.prototype.tick = function() {
	// Iterates through the monster entities of the map and updates the 
	// timeTillSpawn. Spawns monsters at the given spawn probability.
	for (var id in this._spawnBehavior.monsterData) {
		if (!this._spawnBehavior.monsterData.hasOwnProperty(id)) {
			continue;
		}
		var spawnInfo = this._spawnBehavior.monsterData[id];
		if (--spawnInfo.timeTillSpawn == 0) {
			if (this._instanceCounts[id] < spawnInfo.capacity && 
					Math.random() < spawnInfo.spawnRate) {
				this.forceSpawn(id);
			}
			spawnInfo.timeTillSpawn = spawnInfo.spawnInterval;
		}
	}
};


// Makes changes to the unit spawner upon a unit death
UnitSpawner.prototype.notifyOnUnitDeath = function(unit) {
	this._instanceCounts[unit.unitEntity.id]--;
};