var viewerLoc = {
	x: 0,
	y: 0
};

window.onload = function() {
	ScreenResizeManager.init();
	MapLoader.load('palletTown', function(map) {
		var canvas = document.querySelector(ScreenProps.SCREEN_QS);
		var drawLoop = function() {
			MapDrawer.drawMap(canvas.getContext('2d'), map, viewerLoc.x, viewerLoc.y);
			window.requestAnimationFrame(drawLoop);
		};
		window.requestAnimationFrame(drawLoop);
		bindMouse();
	});
};

var bindMouse = function() {
	var canvas = document.querySelector('#screen');

	var xLeftOfCenter, yAboveCenter;

	canvas.onmousemove = function(e) {
		xLeftOfCenter = e.x < window.innerWidth / 2;
		yAboveCenter = e.y < window.innerHeight / 2;
	};

	document.body.onkeyup = function(e) {
		if (e.keyCode == 32) {
			paused = !paused;
		}
	}

	var paused = false;

	var lastOperated = Date.now();

	window.setInterval(function() {
		var currTime = Date.now();
		if (!paused) {
			var scalingFactor = (currTime - lastOperated) / 33;
			viewerLoc.x += (xLeftOfCenter ? -0.02 : 0.02) * scalingFactor;
			viewerLoc.y += (yAboveCenter ? -0.02 : 0.02) * scalingFactor;
		}
		lastOperated = currTime;
	}, 33);
};