/**
 * Static loader for NPCs. Supports functions to instantiate NPC instances while
 * internally managing loaded NPC entities.
 */

var NPCLoader = {};

NPCLoader.loadedEntities = {};

NPCLoader.NPC_PATH = '../assets/npcs';

// Instantiates an NPC instance given an NPC id. Preloads the NPC entity
// beforehand if needed.
NPCLoader.loadInstance = function(id, x, y, startingDirection, containingMap, 
		callback) {
	NPCLoader._helperLoadEntity(id, function(entity) {
		callback(new NPCInstance(entity, x, y, startingDirection, containingMap));
	});	
};


// Unloads an NPC's dependencies.
NPCLoader.unloadInstance = function(npcInstance) {
	NPCLoader.loadedEntities[npcInstance.npcEntity.id] = null;
	DynamicMapEntityLoader.unload(npcInstance.npcEntity.visualEntity);
	npcInstance.npcEntity = null;
};


// Helper to load NPC entities.
NPCLoader._helperLoadEntity = function(id, callback) {
	var path = NPCLoader.NPC_PATH + '/' + id + '.json';
	if (NPCLoader.loadedEntities[id]) {
		callback(NPCLoader.loadedEntities[id]);
		return;
	}
	JSONLoader.loadWithoutWhitespace(path, function(obj) {
		DynamicMapEntityLoader.load(id, obj.entity, 
				DynamicMapEntityLoader.Types.NPC, function(entity) {
			NPCLoader.loadedEntities[id] = new NPCEntity(id, obj.name, obj.movement, 
					obj.stateMachine, obj.trades, obj.shops, entity);
			callback(NPCLoader.loadedEntities[id]);
		})
	});
};