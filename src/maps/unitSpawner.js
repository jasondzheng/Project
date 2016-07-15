/**
 */

var UnitSpawner = function(containingMap) {
	this.containingMap = containingMap;
	/*
	
	{
		monsterData: {
			<id:String>: {
				capacity: <Number>,
				spawnInterval: <ticks:Number>,
				spawnRate: <rate:Number>,
				spawnPoints: [<spawnPointIndex:Number>, ...]
			}, ...
		},
		spawnPoints: [
			{
				x: <Number>,
				y: <Number>,
				width: <Number>,
				height: <Number>,
			}, ...
		]
	}

	*/
	this._spawnBehavior = containingMap.spawnBehavior;
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


// Forcefully spawns an instance of a monster given its id, regardless of spawn 
// capacity. May not successfully spawn if collisions checks fail.
UnitSpawner.prototype.forceSpawn = function(id, opt_x, opt_y, opt_direction) {
	// Obtain the collision window from entity
	// Attempt to place the collision window N times
	// On success, spawn unit fitting in the window
	// Of course, follow up with preparations and spawning animation stuff
	// On fail, don't even make the instance
	// return unit;
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
		if (--spawnInfo.timeTillSpawn == 0 && 
				this._instanceCounts[id] < spawnInfo.capacity) {
			if (Math.random() < spawnInfo.spawnRate) {
				this.forceSpawn(id);
			}
			spawnInfo.timeTillSpawn = spawnInfo.spawnInterval;
		}
	}
};


// 
UnitSpawner.prototype.notifyOnUnitDeath = function(unit) {
	this._instanceCounts[unit.unitEntity.id]--;
};