var viewerLoc = {
	x: 0,
	y: 0
};

window.onload = function() {
	MapLoader.load('testMap', function(map) {
		var canvas = document.querySelector('#screen');
		canvas.width = 1280; canvas.height = 720;
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

	window.setInterval(function() {
		viewerLoc.x += xLeftOfCenter ? -0.02 : 0.02;
		viewerLoc.y += yAboveCenter ? -0.02 : 0.02;
	}, 1000 / 30);
};