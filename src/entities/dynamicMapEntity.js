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

	// Create a default animation
	this.defaultAnimation;
	for (var animationName in this.animations) {
		if (!this.animations.hasOwnProperty(animationName)) {
			continue;
		}
		this.defaultAnimation = animationName;
		break;
	}
};

DynamicMapEntity.prototype.unload = function() {
	var urls = [];
	for (var frameName in this.frames) {
		if (!this.frames.hasOwnProperty(frameName)) {
			continue;
		}
		urls.push(this.frames.sprite);
	}
	ImgUtils.unloadImages(urls);
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

DynamicMapInstance.prototype.setAnimation = function(animation) {
	if (this._entity.animations[animation]) {
		this._animation = animation;
		this._frameIndex = 0;
		this._frameCounter = 0;
	} else {
		throw 'Unsupported animation ' + animation;
	}
};

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