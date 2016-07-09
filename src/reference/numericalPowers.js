/**
 * Handy reference of perfect powers of common numbers.
 */

var NumericalPowers = [];

NumericalPowers.MAX_CACHE = 10;
NumericalPowers.MAX_BASE = 4;

(function() {
	for (var i = 2; i <= NumericalPowers.MAX_BASE; i++) {
		NumericalPowers[i] = [];
		for (var j = 0; j <= NumericalPowers.MAX_CACHE; j++) {
			NumericalPowers[i][j] = (j == 0 ? 1 : NumericalPowers[i][j - 1] * i);
		}
	}
})();