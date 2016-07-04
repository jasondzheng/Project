var viewerLoc = {
	x: 0,
	y: 0
};

window.onload = function() {
	ScreenResizeManager.init();
	MapLoader.load('palletTown', function(map) {
		var canvas = document.querySelector(ScreenProps.SCREEN_QS);
		var ctx = canvas.getContext('2d');
		var drawLoop = function() {
			MapDrawer.drawMap(ctx, map, viewerLoc.x, viewerLoc.y);
			ctx.clearRect(0,0,1280,720);
			BeatDrawer.draw(ctx, ScreenProps.EXP_WIDTH_HALF, 
					ScreenProps.EXP_HEIGHT_HALF);
			MapDrawer.drawEntities(ctx, map, viewerLoc.x, viewerLoc.y);
			window.requestAnimationFrame(drawLoop);
		};
		window.requestAnimationFrame(drawLoop);
		bindMouse();
		setupTickCycle(map);
		SoundPlayer.setTrack(map.tracks.marioLuigiBattle);
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

var setupTickCycle = function(loadedMap) {
	var tickWindow = 1000 / 60;
	var lastOperated = Date.now();
	window.setInterval(function() {
		var currTime = Date.now();
		var delta = currTime - lastOperated;
		if (delta < tickWindow) {
			return;
		}
		while (delta >= tickWindow) {
			loadedMap.tickAll();
			BeatDrawer.tick();
			delta -= tickWindow;
		}
		lastOperated = currTime - delta;
	}, 0);
};