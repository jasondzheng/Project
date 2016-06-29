var CollisionDetector = {};

CollisionDetector._ellipseData = {
	width: 0,
	height: 0,
	center: {
		x: 0,
		y: 0,
	}
};

CollisionDetector._rectData = {
	width: 0,
	height: 0,
	center: {
		x: 0,
		y: 0,
	}
};

CollisionDetector.areShapesColliding = function(width1, height1, centerX1, 
		centerY1, isRounded1, width2, height2, centerX2, centerY2, isRounded2) {
	if (!isRounded1 && !isRounded2) {
		var left1 = centerX1 - width1 / 2;
		var right1 = left1 + width1;
		var top1 = centerY1 - height1 / 2;
		var bottom1 = top1 + height1;
		var left2 = centerX2 - width2 / 2;
		var right2 = left2 + width2;
		var top2 = centerY2 - height2 / 2;
		var bottom2 = top2 + height2;
		return !(left2 > right1 || right2 < left1 || top2 > bottom1 || 
				bottom2 < top1);
	} else if (isRounded1 && isRounded2) {
		// TODO: put ellipse comparison code
	} else {
		if (isRounded1) {
			CollisionDetector._ellipseData.width = width1;
			CollisionDetector._ellipseData.height = height1;
			CollisionDetector._ellipseData.center.x = centerX1;
			CollisionDetector._ellipseData.center.y = centerY1;
			CollisionDetector._rectData.width = width2;
			CollisionDetector._rectData.height = height2;
			CollisionDetector._rectData.center.x = centerX2;
			CollisionDetector._rectData.center.y = centerY2;
		} else {
			CollisionDetector._ellipseData.width = width2;
			CollisionDetector._ellipseData.height = height2;
			CollisionDetector._ellipseData.center.x = centerX2;
			CollisionDetector._ellipseData.center.y = centerY2;
			CollisionDetector._rectData.width = width1;
			CollisionDetector._rectData.height = height1;
			CollisionDetector._rectData.center.x = centerX1;
			CollisionDetector._rectData.center.y = centerY1;
		}
		// TODO: do the rectangle vs ellipse collision
	}
};