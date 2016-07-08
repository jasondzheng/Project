var viewerLoc = {
	x: 0,
	y: 0
};

window.onload = function() {
	ScreenResizeManager.init();
	MapLoader.load('palletTown', function(map) {
		var canvas = document.querySelector(ScreenProps.SCREEN_QS);
		var ctx = canvas.getContext('2d');
		// Your code below
		// TODO: init any variables you need here. Try not to do it with an array.
		// You can do this with 2 variables.
		var startTime = Date.now();
		var framesElapsed = 0;

		// Your code above
		var drawLoop = function() {
			MapDrawer.drawMap(ctx, map, viewerLoc.x, viewerLoc.y);
			BeatDrawer.draw(ctx, ScreenProps.EXP_WIDTH_HALF, 
					ScreenProps.EXP_HEIGHT_HALF);
			MapDrawer.drawEntities(ctx, map, viewerLoc.x, viewerLoc.y);
			var timestamp = Date.now();
			var framesPerSecond = (++framesElapsed) * 1000 / (timestamp - startTime);
			ctx.font = '50px Arial';
			ctx.fillStyle = 'black';
			ctx.fillText(Math.round(framesPerSecond) + ' FPS', 30, 50);
			window.requestAnimationFrame(drawLoop);
			// Your code below
			// TODO: draw the FPS on the canvas in the topright corner

			// Your code above
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
			SoundPlayer.tick();
			delta -= tickWindow;
		}
		lastOperated = currTime - delta;
	}, 0);
};