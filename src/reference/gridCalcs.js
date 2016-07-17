/**
 * A collection of utility functions used to calculate coordinate based
 * values on a grid.
 */

var GridCalcs = {};


// Calculate the Cartesian distance between two points given x and y deltas.
GridCalcs.getDistance = function(xDiff, yDiff) {
	return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
};