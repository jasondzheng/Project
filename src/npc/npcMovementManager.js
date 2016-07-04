/**
 * Class responsible for managing an NPC's movement. Will move randomly as
 * dictated by movement pattern when idle.
 */

var NPCMovementManager = function(npc) {
	this.npc = npc;
	this._waypath = [];
	this._movementType = MovePattern.getType(npc.npcEntity.movement);
	this._collisionIgnoreList = [npc];
	this.setIdle(npc.direction);
};


NPCMovementManager.WalkStates = {
	IDLE: 'idle',
	WALKING: 'walk'
};


NPCMovementManager.prototype.tick = function() {
	if (this._waypath.length > 0) {
		var currDest = this._waypath[0];
		var currLoc = this.npc.getPosition();
		var dist = this._helperCalculateDistance(currDest.x, currDest.y, currLoc.x, 
				currLoc.y);
		var xSpeed = currDest.speed * (currDest.x - currLoc.x) / dist;
		var ySpeed = currDest.speed * (currDest.y - currLoc.y) / dist;	
		var xTarget = currLoc.x + xSpeed;
		if (currLoc.x < currDest.x != xTarget < currDest.x) {
			xTarget = currDest.x;
		}
		var yTarget = currLoc.y + ySpeed;
		if (currLoc.y < currDest.y != yTarget < currDest.y) {
			yTarget = currDest.y;
		}
		var targetDirection = Direction.getDirectionFromCoords(ySpeed, xSpeed);
		// At this point we know where to move; check if allowed to move
		if (!this.npc.containingMap.isColliding(xTarget, yTarget, 
				this.npc.visualInstance.getCollisionWidth(), 
				this.npc.visualInstance.getCollisionWidth(), 
				this.npc.visualInstance.isRounded(), this._collisionIgnoreList)) {
			if (this._walkState != NPCMovementManager.WalkStates.WALKING || 
					this.npc.direction != targetDirection) {
				this.npc.visualInstance.setAnimation(this.npc.getAnimNameFromFamily(
						this._helperAssembleAnimationFamilyName(
								NPCMovementManager.WalkStates.WALKING, targetDirection)));
				this._walkState = NPCMovementManager.WalkStates.WALKING;
				this.npc.direction = targetDirection;
			}
			this.npc.setPosition(xTarget, yTarget);
			if (xTarget == currDest.x && yTarget == currDest.y) {
				this._waypath.shift();
				if (this._waypath.length == 0) {
					this.setIdle(targetDirection);
				}
			}
		} else {
			// Upon collision, switch to idle state and clear waypath
			this.setIdle(targetDirection);
		}
	} else {
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
		this.npc.visualInstance.setAnimation(this.npc.getAnimNameFromFamily(
				this._helperAssembleAnimationFamilyName(
						NPCMovementManager.WalkStates.IDLE, direction)));
		this._walkState = NPCMovementManager.WalkStates.IDLE;
		this.npc.direction = direction;
	}
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


NPCMovementManager.prototype._helperAssembleAnimationFamilyName = 
		function(base, direction) {
	return base + direction.substr(0, 1).toUpperCase() + direction.substr(1);
};