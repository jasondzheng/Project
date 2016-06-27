/**
 * Represents a map entity as well as all static properties associated with
 * drawing that sprite.
 */

var StaticMapEntity = function(name, sprite, centerX, centerY, collisionWidth, 
		collisionHeight, isRounded) {
	this.name = name;
	this.sprite = sprite;
	this.center = {
		x: centerX,
		y: centerY
	};
	this.collisionWidth = collisionWidth;
	this.collisionHeight = collisionHeight;
	this.isRounded = isRounded;
};

/**
 * Wrapper instance class for StaticMapEntities that allow for variable
 * positionings.
 */
var StaticMapInstance = function(entity, x, y) {
	this._entity = entity;
	this.x = x;
	this.y = y;
};

StaticMapInstance.prototype.getName = function() {
	return this._entity.name;
};

StaticMapInstance.prototype.getSprite = function() {
	return this._entity.sprite;
};

StaticMapInstance.prototype.getCenter = function() {
	return this._entity.center;
};

StaticMapInstance.prototype.getCollisionWidth = function() {
	return this._entity.collisionWidth;
};

StaticMapInstance.prototype.getCollisionHeight = function() {
	return this._entity.collisionHeight;
};

StaticMapInstance.prototype.isRounded = function() {
	return this._entity.isRounded;
};

/**
 * Loader class for static map entities. Takes in JSON data object for the 
 * entities and outputs the actual entities as StaticMapEntities.
 */
var StaticMapEntityLoader = {};

// Expected static entity directory
StaticMapEntityLoader.STATIC_MAP_ENTITY_DIR = '../assets/img/staticEntities/';

StaticMapEntityLoader.loadAll = function(json, mapName, callback) {
	// new StaticMapEntity(name, sprite, centerX, centerY, collisionWidth, collisionHeight, isRounded)
	var imageUrls = {};
	for (var entityName in json) {
		if (!json.hasOwnProperty(entityName)) {
			continue;
		}
		imageUrls[json[entityName].sprite] = 
				StaticMapEntityLoader.STATIC_MAP_ENTITY_DIR + mapName + '/' +
				json[entityName].sprite + '.png';
	}
	ImgUtils.loadImages(imageUrls, function(images) {
		var staticEntities = {};
		for (var entityName in json) {
			staticEntities[entityName] = new StaticMapEntity(entityName, 
					images[json[entityName].sprite], json[entityName].center.x, 
					json[entityName].center.y, json[entityName].collisionWidth, 
					json[entityName].collisionHeight, json[entityName].isRounded);
		}
		callback(staticEntities);
	});
};

StaticMapEntityLoader.unload = function(entity) {
	ImgUtils.unloadImage(entity.sprite.src);
	entity.sprite = null;
};