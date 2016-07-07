/**
 * Collision detection for 2D cartesion objects. Uses only rectangles and
 * ellipses as possible collision entities; rectangles and ellipses are both
 * defined as center coordinates with width and heights.
 */

var CollisionDetector = {};


// Checks if two shapes are colliding. Takes in center coordinates, widths,
// heights and whether the shapes are rounded or not.
CollisionDetector.areShapesColliding = function(centerX1, centerY1, width1, 
		height1, isRounded1, centerX2, centerY2, width2, height2, isRounded2) {
	var left1 = centerX1 - width1 / 2;
	var right1 = left1 + width1;
	var top1 = centerY1 - height1 / 2;
	var bottom1 = top1 + height1;
	var left2 = centerX2 - width2 / 2;
	var right2 = left2 + width2;
	var top2 = centerY2 - height2 / 2;
	var bottom2 = top2 + height2;
	if (left2 > right1 || right2 < left1 || top2 > bottom1 || 
			bottom2 < top1) {
		return false;
	} else if (!isRounded1 && !isRounded2) {
		return true;
	} else if (isRounded1 && isRounded2) {
		return ECCollisionChecker._areEllipsesColliding(centerX1, centerY1, width1, 
				height1, centerX2, centerY2, width2, height2);
	} else {
		if (isRounded1) {
			return CollisionDetector._helperIsRectInEllipse(centerX1, centerY1, 
					width1, height1, centerX2, centerY2, width2, height2, top2, bottom2, 
					left2, right2);
		} else {
			return CollisionDetector._helperIsRectInEllipse(centerX2, centerY2, 
					width2, height2, centerX1, centerY1, width1, height1, top1, bottom1, 
					left1, right1);
		}
	}
};


// Checks if a given point is within an ellipse.
CollisionDetector._helperEllipseBound = function(centerX, centerY, pointX, 
		pointY, horizontalSemiAxis, verticalSemiAxis) {
	var xTerm = (pointX - centerX) / horizontalSemiAxis;
	xTerm *= xTerm;
	var yTerm = (pointY - centerY) / verticalSemiAxis;
	yTerm *= yTerm;
	return (xTerm + yTerm <= 1);
};


// Checks to see if a rectangle and ellipse collide.
CollisionDetector._helperIsRectInEllipse = function(eX, eY, eWidth, eHeight, rX, 
		rY, rWidth, rHeight, rTop, rBottom, rLeft, rRight) {
	var centerDistX = Math.abs(eX - rX);
	var centerDistY = Math.abs(eY - rY);
	// Solves this problem by tracing a rectangle about the ellipse edge. The
	// places in which the rectangle's edge touches a perfect normal on the
	// ellipse yield a flat zone shaped as a cross, and all other regions form
	// rounded rectangle corners (ellipsed matching the source ellipse) for
	// the cross. Piecewise check: if the rectangle's center is within the cross,
	// a guaranteed collision exists. Otherwise, check the corner belonging
	// to the point closest to the ellipse origin for inclusion to detect
	// collision.
	return (centerDistY <= rHeight / 2 && centerDistX <= (rWidth + eWidth) / 2) || 
			(centerDistX <= rWidth / 2 && centerDistY <= (rHeight + eHeight) / 2) || 
			CollisionDetector._helperEllipseBound(eX, eY, 
					rX < eX ? rRight : rLeft, rY < eY ? rBottom : rTop, eWidth / 2, 
					eHeight / 2);
};

// Helper class used specifically for calculating ellipse-ellipse approximate
// collisions

var ECCollisionChecker = {};

ECCollisionChecker.NUM_SIDES_LOG = 2;

ECCollisionChecker.INNER_POLY_POINTS = [];
ECCollisionChecker.OUTER_POLYS = [];

// Initialize constant values of a unit circle and special polygons that either
// inscribe or circumscribe the shape.
(function() {
	ECCollisionChecker.NUM_SIDES = 4 * 
			NumericalPowers[2][ECCollisionChecker.NUM_SIDES_LOG];
	// Initialize points for the inscribed polygon
	for (var i = 0; i < ECCollisionChecker.NUM_SIDES; i++) {
		var rad = i * 2 * Math.PI / ECCollisionChecker.NUM_SIDES;
		ECCollisionChecker.INNER_POLY_POINTS.push({
			x: Math.cos(rad),
			y: Math.sin(rad)
		});
	}
	// Initialize the outer polygon points. Note that additional points are added
	// to make line segments of equal lengths. So, an n shaped side will have 2n
	// points for simplicity of calcs
	for (var i = 0; i <= ECCollisionChecker.NUM_SIDES_LOG; i++) {
		var sides = 4 * Math.pow(2, i);
		var points = [];
		ECCollisionChecker.OUTER_POLYS.push(points); 
		var diagLength = 1 / Math.cos(Math.PI / sides);
		for (var j = 0; j < sides * 2; j++) {
			var rad = j * Math.PI / sides;
			points.push({
				x: (j % 2 ? diagLength : 1) * Math.cos(rad),
				y: (j % 2 ? diagLength : 1) * Math.sin(rad)
			});
		}
	}
})();


// Short circuits evaluation first by checking if each ellipse's center is
// contained by the other, deferring scaled ellipse-polygon approximation
// until needed.
ECCollisionChecker._areEllipsesColliding = function(centerX1, centerY1, width1, 
		height1, centerX2, centerY2, width2, height2) {
	var a1 = width1 / 1, b1 = height1 / 1;
	var a2 = width2 / 1, b2 = height2 / 1;
	if (ECCollisionChecker._helperEllipseBound(centerX1, centerY1, centerX2, 
					centerY2, a1, b1) || 
			ECCollisionChecker._helperEllipseBound(centerX2, centerY2, centerX1, 
					centerY1, a2, b2)) { 
		return true;
	}
	// Transform shape 1 into ellipse, transform shape 2 into unit circle
	centerX2 -= centerX1;
	centerY2 -= centerY1;

	width1 /= a2;
	centerX2 /= a2;
	height1 /= b2;
	centerY2 /= b2;

	var quadrant = (centerY2 < 0 ? 2 : 0) + 
			((centerX2 >= 0) == (centerY2 >= 0) ? 0 : 1);

	return ECCollisionChecker._helperCheckEllipsePoly(width1 / 2, height1 / 2, 
			centerX2, centerY2, 0, quadrant, quadrant + 1);
};


// A recursive function that approximates one ellipse as a polygon, checks for 
// collisions, and recurses with more-limited bounds if an outer polygon 
// collision is detected. 
ECCollisionChecker._helperCheckEllipsePoly = function(semiX, semiY, centerX2, 
		centerY2, iterationNo, startIndex, endIndex) {
	// First check the inner polygon properties for short circuit true
	var iterationDiff = 
			NumericalPowers[2][ECCollisionChecker.NUM_SIDES_LOG - iterationNo];
	var iterSides = 4 * NumericalPowers[2][iterationNo];
	if (startIndex >= iterSides) {
		startIndex %= iterSides;
		endIndex %= iterSides;
	}
	// Dot check
	for (var i = startIndex; i <= endIndex; i++) {
		var refPoint = 
				ECCollisionChecker.INNER_POLY_POINTS[iterationDiff * (i % iterSides)];
		if (ECCollisionChecker._helperUnitCircleBound(centerX2, centerY2, 
				refPoint.x * semiX, refPoint.y * semiY)) {
			return true;
		}
	}
	// Line check
	var lastPoint = ECCollisionChecker.INNER_POLY_POINTS[
			iterationDiff * startIndex];
	for (var i = startIndex; i < endIndex; i++) {
		// Fill in line check later and then the rest of the algorithm
		var nextPoint = ECCollisionChecker.INNER_POLY_POINTS[
				iterationDiff * ((i + 1) % iterSides)];
		if (ECCollisionChecker._helperLineCircleCollisionChecker(centerX2, 
				centerY2, semiX * lastPoint.x, semiY * lastPoint.y, semiX * nextPoint.x, 
				semiY * nextPoint.y)) {
			return true;
		}
		lastPoint = nextPoint;
	}
	if (iterationNo == ECCollisionChecker.NUM_SIDES_LOG) {
		return false;
	}
	// Do dot check for outer poly
	var newStart, newEnd;
	for (var i = startIndex * 2; i < endIndex * 2; i++) {
		if (i % 2 == 0) {
			continue;
		}
		var refPoint = 
				ECCollisionChecker.OUTER_POLYS[iterationNo][i % (2 * iterSides)];
		if (ECCollisionChecker._helperUnitCircleBound(centerX2, centerY2, 
				refPoint.x * semiX, refPoint.y * semiY)) {
			newStart = i - 1;
			newEnd = newStart + 2;
			break;
		}
	}
	// Do line check for outer poly
	if (newStart == undefined) {
		var lastPoint = ECCollisionChecker.OUTER_POLYS[iterationNo][startIndex * 2];
		for (var i = startIndex * 2; i < endIndex * 2; i++) {
			// Fill in line check later and then the rest of the algorithm
			var nextPoint = ECCollisionChecker.OUTER_POLYS[iterationNo][
					(i + 1) % (2 * iterSides)];
			if (ECCollisionChecker._helperLineCircleCollisionChecker(centerX2, 
					centerY2, semiX * lastPoint.x, semiY * lastPoint.y, 
					semiX * nextPoint.x, semiY * nextPoint.y)) {
				newStart = i % 2 ? i - 1 : i;
				newEnd = newStart + 2;
				break;
			}
			lastPoint = nextPoint;
		}
	}
	if (newStart != undefined) {
		if (iterationNo == 0) {
			newStart = startIndex * 2;
			newEnd = endIndex * 2;
		}
		return ECCollisionChecker._helperCheckEllipsePoly(semiX, semiY, centerX2, 
				centerY2, iterationNo + 1, newStart, newEnd);
	}
	return false;
};


// Checks if the given point is bound by the given ellipse
ECCollisionChecker._helperEllipseBound = function(centerX, centerY, pointX, 
		pointY, horizontalSemiAxis, verticalSemiAxis) {
	pointX = (pointX - centerX) / horizontalSemiAxis;
	pointX *= pointX;
	pointY = (pointY - centerY) / verticalSemiAxis;
	pointY *= pointY;
	return (pointX + pointY <= 1);
};


// Checks if the given point is bound by a unit circle at the given center
ECCollisionChecker._helperUnitCircleBound = function(centerX, centerY, pointX, 
		pointY) {
	pointX -= centerX;
	pointX *= pointX;
	pointY -= centerY;
	pointY *= pointY;
	return (pointX + pointY <= 1);
};


// Checks if a circle intersects a line segment defined by the two points given
ECCollisionChecker._helperLineCircleCollisionChecker = function(centerX, 
		centerY, x1, y1, x2, y2) {
	var a = x2 - x1, b = y2 - y1, c = centerX - x1, d = centerY - y1;
	var e = d * a - c * b, f = c * a + d * b;
	return (e * e <= a * a + b * b) && (c * c + d * d <= 1 || 
			(a - c) * (a - c) + (b - d) * (b - d) <= 1 || 
			(f >= 0 && f <= a * a + b * b));
};