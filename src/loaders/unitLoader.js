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


// Unloads provided unit instance
UnitLoader.unloadInstance = function(unitInstance) {
	UnitLoader.loadedEntities[unitInstance.unitEntity.id] = null;
	DynamicMapEntityLoader.unload(unitInstance.unitEntity.visualEntity);
	unitInstance.unitEntity = null;
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
					unitData.attackPattern, unitData.stateMachine, unitEntity));
		});
	});
};            