/**
 * Represents a map entity with variable sprite and center configurations. Used
 * to support flexible animation sequences which can change the current
 * appearance of the entity based on which frame is being played.
 */

var DynamicMapEntity = function(name, frames, animations, collisionWidth, 
		collisionHeight, isRounded) {
	this.name = name;
	this.frames = frames;
	this.animations = animations;
	this.collisionWidth = collisionWidth;
	this.collisionHeight = collisionHeight;
	this.isRounded = isRounded;

	// Create a default animation
	this.defaultAnimation;
	for (var animationName in this.animations) {
		if (!this.animations.hasOwnProperty(animationName)) {
			continue;
		}
		this.defaultAnimation = animationName;
		break;
	}

	// Initialize animation families
	this._animationFamilies = {};
	for (var animationName in animations) {
		if (!animations.hasOwnProperty(animationName)) {
			continue;
		}
		if (DynamicMapEntity.ANIM_NAME_REGEX.test(animationName)) {
			var animFamilyName = animationName.match(
					DynamicMapEntity.ANIM_NAME_REGEX)[1];
			if (!this._animationFamilies[animFamilyName]) {
				this._animationFamilies[animFamilyName] = [];
			}
			this._animationFamilies[animFamilyName].push(animationName);
		}
	}
};


// Regex for testing animation family naming
DynamicMapEntity.ANIM_NAME_REGEX = /^(\w+?)\d+$/;


// Helper to randomly pick an animation from a set of animations in a family.
DynamicMapEntity.prototype.getAnimNameFromFamily = function(animName) {
	if (this._animationFamilies[animName]) {
		return this._animationFamilies[animName][Math.floor(Math.random() * 
				this._animationFamilies[animName].length)];
	} else {
		return animName;
	}
};


// Utility function to create names that are derived from an animation action
// concatenated to a direction.
DynamicMapEntity.getActionDirectionFamilyName = function(base, direction) {
	return base + direction.substr(0, 1).toUpperCase() + direction.substr(1);
};


/**
 * Wrapper instance class for DynamicMapEntities that allow for variable
 * positionings, changes in animation, and changes in frame.
 */

var DynamicMapInstance = function(entity, x, y, opt_animation) {
	this._entity = entity;
	this.x = x;
	this.y = y;
	this._animation;
	this._frameIndex = 0;
	this._frameCounter = 0;

	this.setAnimation(opt_animation || entity.defaultAnimation);
};


// Gives access to getting animation names by family in the entity
DynamicMapInstance.prototype.getAnimNameFromFamily = function(animName) {
	return this._entity.getAnimNameFromFamily(animName);
};


// Sets the animation such that frame advances show that animation's frames
DynamicMapInstance.prototype.setAnimation = function(animation) {
	if (this._entity.animations[animation]) {
		this._animation = animation;
		this._frameIndex = 0;
		this._frameCounter = -1;
	} else {
		throw 'Unsupported animation ' + animation;
	}
};


// Advances current animation's frames, once per tick
DynamicMapInstance.prototype.advanceFrame = function() {
	var currAnimation = this._helperGetCurrAnimation();
	var currFrameRef = this._helperGetCurrFrameRef();
	this._frameCounter++;
	if (this._frameCounter == currFrameRef.duration) {
		if (currAnimation.isLooped) {
			this._frameIndex = (this._frameIndex + 1) % 
					currAnimation.frameRefs.length;
			this._frameCounter = 0;
		} else {
			this._frameIndex++;
			if (this._frameIndex == currAnimation.frameRefs.length) {
				this._frameIndex--;
				this._frameCounter--;
			}
		}
	}
};


// Returns true at the end of an animation (last frame if looped)
DynamicMapInstance.prototype.isAtLastFrameOfAnimation = function() {
	return this._frameIndex == this._helperGetCurrAnimation().length - 1 && 
			this._frameCounter == this._helperGetCurrFrameRef().duration - 1;
};


DynamicMapInstance.prototype.getName = function() {
	return this._entity.name;
};

DynamicMapInstance.prototype.getSprite = function() {
	return this._entity.frames[this._helperGetCurrFrameRef().frame].sprite;
};

DynamicMapInstance.prototype.getCenter = function() {
	return this._entity.frames[this._helperGetCurrFrameRef().frame].center;
};

DynamicMapInstance.prototype.getCollisionWidth = function() {
	return this._entity.collisionWidth;
};

DynamicMapInstance.prototype.getCollisionHeight = function() {
	return this._entity.collisionHeight;
};

DynamicMapInstance.prototype.isRounded = function() {
	return this._entity.isRounded;
};


// Helper to get current frame reference
DynamicMapInstance.prototype._helperGetCurrFrameRef = function() {
	return this._entity.animations[this._animation].frameRefs[this._frameIndex];
};


// Helper to get current animation
DynamicMapInstance.prototype._helperGetCurrAnimation = function() {
	return this._entity.animations[this._animation];
};


/**
 * Loader class for dynamic map entities. Takes in JSON data object for a single 
 * entity and outputs the actual entity as a DynamicMapEntity.
 */

var DynamicMapEntityLoader = {};

DynamicMapEntityLoader.DYNAMIC_MAP_ENTITY_DIR = '../assets/img/';

// A list of possible DynamicMapEntity types possible. The value is a string
// representation of the type.
DynamicMapEntityLoader.Types = {
	NPC: 'npcs',
	UNIT: 'units'
};


// Loads dynamic map entities from JSON
DynamicMapEntityLoader.load = function(name, json, type, callback) {
	var urls = {};
	for (var frameName in json.frames) {
		if (!json.frames.hasOwnProperty(frameName)) {
			continue;
		}
		urls[json.frames[frameName].sprite] = 
				DynamicMapEntityLoader.DYNAMIC_MAP_ENTITY_DIR + type + '/' + name + 
				'/' + json.frames[frameName].sprite + '.png';
	}
	ImgUtils.loadImages(urls, function(images) {
		for (var frameName in json.frames) {
			if (!json.frames.hasOwnProperty(frameName)) {
				continue;
			}
			json.frames[frameName].sprite = images[json.frames[frameName].sprite];
		}
		var entity = new DynamicMapEntity(name, json.frames, json.animations, 
				json.collisionWidth, json.collisionHeight, json.isRounded);
		callback(entity);
	});
};


// Unloads entity, freeing up all images required
DynamicMapEntityLoader.unload = function(entity) {
	for (var frameName in entity) {
		if (!entity.hasOwnProperty(frameName)) {
			continue;
		}
		ImgUtils.unload(entity.frames[frameName].sprite.src);
		entity.frames[frameName].sprite = null;
	}
};