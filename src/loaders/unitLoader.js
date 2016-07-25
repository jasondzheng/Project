/**
 * Provides functions for preloading unit entities and loading specific unit 
 * instances from the preloaded entities
 */

var UnitLoader = {};

UnitLoader.PATH = '../assets/units';

UnitLoader.loadedEntities = {};

// Loads unit instance 
UnitLoader.loadInstance = function(id, x, y, startingDirection, 
		containingMap, callback) {
	UnitLoader._helperLoadEntity(id, function(unitEntity) {
		callback(new UnitInstance(unitEntity, x, y, startingDirection, 
				containingMap));
	});
};


// Retrieve a pre-loaded unit entity
UnitLoader.getPreloadedEntity = function (id) {
	return UnitLoader.loadedEntities[id];
};


// Preload a batch of entities. Note that the entities will not be used at the
// time, so the callback is not provided with the loaded entities.
UnitLoader.preloadEntities = function (ids, callback) {
	var counter = ids.length;
	for (var i = 0; i < ids.length; i++) {
		UnitLoader._helperLoadEntity(ids[i], function() {
			if (--counter == 0) {
				callback();
			}
		});
	}
};


// Unloads a batch of unit entities
UnitLoader.unloadEntities = function(ids) {
	for (var i = 0; i < ids.length; i++) {
		DynamicMapEntityLoader.unload(
				UnitLoader.loadedEntities[unitInstance.unitEntity.id].visualEntity);
		UnitLoader.loadedEntities[unitInstance.unitEntity.id] = null;
	}
};


// Helper function to load entity if needed
UnitLoader._helperLoadEntity = function(id, callback) {
	if (UnitLoader.loadedEntities[id]) {
		callback(UnitLoader.loadedEntities[id]);
		return;
	}
	JSONLoader.loadWithoutWhitespace(UnitLoader.PATH + '/' + id + '.json', 
			function(unitData) {
		DynamicMapEntityLoader.load(id, unitData.entity, 
				DynamicMapEntityLoader.Types.UNIT, function(unitEntity) {
			callback(UnitLoader.loadedEntities[id] = new UnitEntity(id, unitData.name,
					unitData.maxHp, unitData.atk, unitData.behaviorPattern, 
					unitData.attackPattern, unitData.stateMachine, unitEntity, 
					unitData.hpBarWidth));
		});
	});
};     