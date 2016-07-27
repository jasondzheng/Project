/**
 * Class responsible for managing an NPC's movement. Will move randomly as
 * dictated by movement pattern when idle.
 */

var NPCMovementManager = function(npc) {
	this.npc = npc;
	this._waypath = [];
	this._movementType = MovePattern.getType(npc.npcEntity.movement);
	this._collisionIgnoreList = [npc];
	this._talkMode = false;
	this.setIdle(npc.direction);
};

// TODO: comment this class

NPCMovementManager.WalkStates = {
	IDLE: 'idle',
	WALKING: 'walk'
};


NPCMovementManager.prototype.tick = function() {
	if (this._waypath.length > 0) {
		var currDest = this._waypath[0];
		var currLocX = this.npc.getPositionX();
		var currLocY = this.npc.getPositionY();
		var dist = this._helperCalculateDistance(currDest.x, currDest.y, currLocX, 
				currLocY);
		var xSpeed = currDest.speed * (currDest.x - currLocX) / dist;
		var ySpeed = currDest.speed * (currDest.y - currLocY) / dist;	
		var targetX = currLocX + xSpeed;
		if (currLocX < currDest.x != targetX < currDest.x) {
			targetX = currDest.x;
		}
		var targetY = currLocY + ySpeed;
		if (currLocY < currDest.y != targetY < currDest.y) {
			targetY = currDest.y;
		}
		var targetDirection = Direction.getDirectionFromCoords(ySpeed, xSpeed);
		// At this point we know where to move; check if allowed to move
		if (!this.npc.containingMap.isOutOfBounds(targetX, targetY, 
						this.npc.visualInstance.getCollisionWidth(), 
						this.npc.visualInstance.getCollisionHeight()) && 
				!this.npc.containingMap.isColliding(targetX, targetY, 
						this.npc.visualInstance.getCollisionWidth(), 
						this.npc.visualInstance.getCollisionHeight(), 
						this.npc.visualInstance.isRounded(), this._collisionIgnoreList)) {
			if (this._walkState != NPCMovementManager.WalkStates.WALKING || 
					this.npc.direction != targetDirection) {
				this.npc.visualInstance.setAnimation(
						this.npc.visualInstance.getAnimNameFromFamily(
								DynamicMapEntity.getActionDirectionFamilyName(
										NPCMovementManager.WalkStates.WALKING, targetDirection)));
				this._walkState = NPCMovementManager.WalkStates.WALKING;
				this.npc.direction = targetDirection;
			}
			this.npc.setPositionX(targetX);
			this.npc.setPositionY(targetY);
			if (targetX == currDest.x && targetY == currDest.y) {
				this._waypath.shift();
				if (this._waypath.length == 0) {
					this.setIdle(targetDirection);
				}
			}
		} else {
			// Upon collision, switch to idle state and clear waypath
			this.setIdle(targetDirection);
		}
	} else if (!this._talkMode){
		var moveInstruction = this._movementType.genWaypoint(this.npc);
		if (moveInstruction) {
			if (moveInstruction.direction != undefined) {
				this.setIdle(moveInstruction.direction);
			} else {
				this.queueWaypoint(moveInstruction.x, moveInstruction.y, 
						moveInstruction.speed);
			}
		}
	}
};


NPCMovementManager.prototype.setIdle = function(direction) {
	if (this._walkState != NPCMovementManager.WalkStates.IDLE || 
			this.npc.direction != direction) {
		this.npc.visualInstance.setAnimation(
				this.npc.visualInstance.getAnimNameFromFamily(
						DynamicMapEntity.getActionDirectionFamilyName(
								NPCMovementManager.WalkStates.IDLE, direction)));
		this._walkState = NPCMovementManager.WalkStates.IDLE;
		this.npc.direction = direction;
	}
	this._waypath.length = 0;
};


NPCMovementManager.prototype.setTalkMode = function(talkMode) {
	this._talkMode = talkMode;
	this._waypath.length = 0;
};


NPCMovementManager.prototype.queueWaypoint = function(x, y, speed) {
	this._waypath.push({
		x: x,
		y: y,
		speed: speed
	});
};


NPCMovementManager.prototype._helperCalculateDistance = function(x1, y1, x2, 
		y2) {
	x2 -= x1;
	y2 -= y1;
	return Math.sqrt(x2 * x2 + y2 * y2);
};