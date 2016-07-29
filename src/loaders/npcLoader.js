/**
 * Static loader for NPCs. Supports functions to instantiate NPC instances while
 * internally managing loaded NPC entities.
 */

var NPCLoader = {};

NPCLoader.loadedEntities = {};

NPCLoader.NPC_PATH = '../assets/npcs';

// Instantiates an NPC instance given an NPC id. Preloads the NPC entity
// beforehand if needed.
NPCLoader.loadInstance = function(entityId, id, x, y, startingDirection, 
		containingMap, callback) {
	NPCLoader._helperLoadEntity(entityId, function(entity) {
		var instance = 
				new NPCInstance(entity, id, x, y, startingDirection, containingMap);
		entity.referrers.push(instance);
		callback(instance);
	});	
};


// Unloads an NPC's dependencies.
NPCLoader.unloadInstance = function(npcInstance) {
	npcInstance.npcEntity.referrers.splice(
			npcInstance.npcEntity.referrers.indexOf(npcInstance), 1);
	if (npcInstance.npcEntity.referrers.length == 0) {
		NPCLoader._helperUnloadEntity(npcInstance.npcEntity.id);
	}
	npcInstance.npcEntity = null;
	npcInstance.visualInstance = null;
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
			var resourceManager = new ResourceManager(obj.resources);
			resourceManager.load(function() {
				var newNpcEntity = NPCLoader.loadedEntities[id] = 
						new NPCEntity(id, obj.name, obj.movement, obj.stateMachine, 
								obj.trades, obj.shops, entity, resourceManager);
				newNpcEntity.referrers = [];
				callback(newNpcEntity);
			});
		})
	});
};


// Helper to unload an NPC entity.
NPCLoader._helperUnloadEntity = function(id) {
	var entity = NPCLoader.loadedEntities[id]; 
	NPCLoader.loadedEntities[id] = null;
	DynamicMapEntityLoader.unload(npcInstance.npcEntity.visualEntity);
	entity.resourceManager.unload();
	entity.resourceManager = null;
};