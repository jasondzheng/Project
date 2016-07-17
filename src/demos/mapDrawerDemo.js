var viewerLoc = {
	x: 0,
	y: 0
};

window.onload = function() {
	ScreenResizeManager.init();
	var deferrer = new CallbackDeferrer();
	deferrer.add(MapLoader.load, function(accumulatedArgs) {
		return ['palletTown'];
	}, ['map']);
	deferrer.add(PlayerLoader.load, function(accumulatedArgs) {
		return ['domino'];
	}, ['player']);
	deferrer.after(function(accumulatedArgs) {
		var map = accumulatedArgs[0].map;
		var player = accumulatedArgs[1].player;

		// Register map and player in the GameState
		GameState.map = map;
		GameState.player = player;

		var canvas = document.querySelector(ScreenProps.SCREEN_QS);
		var ctx = canvas.getContext('2d');

		KeyTracker.attachToScreen(document.body);

		var startTimes = [];

		player.setPositionX(4);
		player.setPositionY(4);
		map.registerPlayer(player);

		map.unitSpawner.fillUnitQuotas();

		var drawLoop = function() {
			MapDrawer.drawMap(ctx, map, viewerLoc.x, viewerLoc.y);
			BeatDrawer.draw(ctx, ScreenProps.EXP_WIDTH_HALF, 
					ScreenProps.EXP_HEIGHT_HALF);
			MapDrawer.drawEntities(ctx, map, viewerLoc.x, viewerLoc.y);
			if (startTimes.length == 30) {
				var timestamp = Date.now();
				var framesPerSecond = 30000 / (timestamp - startTimes[0]);
				ctx.font = '50px Arial';
				ctx.fillStyle = 'black';
				ctx.fillText(Math.round(framesPerSecond) + ' FPS', 30, 50);
				startTimes.push(timestamp);
				startTimes.shift();
			} else {
				startTimes.push(Date.now());	
			}
			window.requestAnimationFrame(drawLoop);
		};
		window.requestAnimationFrame(drawLoop);
		// bindMouse();
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
			KeyTracker.tick();
			InputRouter.tick();
			loadedMap.tickAll();
			BeatDrawer.tick();
			SoundPlayer.tick();
			trackCameraOnPlayerDebugDebug();
			delta -= tickWindow;
		}
		lastOperated = currTime - delta;
	}, 0);
};

var trackCameraOnPlayerDebugDebug = function() {
	if (GameState.player) {
		viewerLoc.x = GameState.player.getPositionX();
		viewerLoc.y = GameState.player.getPositionY();
	}
};