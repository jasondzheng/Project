var DISABLE_CORRECTIVE_TICKING = true;

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
	deferrer.add(GlyphDrawer.loadGlyphs, function(accumulatedArgs) {
		return [];
	}, []);
	deferrer.add(DialogDrawer.loadAssets, function(accumulatedArgs) {
		return [];
	}, []);
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

		// Initialize player position and register to the map
		player.setPositionX(4);
		player.setPositionY(4);
		map.registerPlayer(player);

		map.unitSpawner.fillUnitQuotas();

		var drawLoop = function() {
			if (GameState.map) {
				MapDrawer.drawMap(ctx, GameState.map, viewerLoc.x, viewerLoc.y);
				BeatDrawer.drawBeats(ctx, ScreenProps.EXP_WIDTH_HALF, 
						ScreenProps.EXP_HEIGHT_HALF);
				MapDrawer.drawEntities(ctx, GameState.map, viewerLoc.x, viewerLoc.y);
				UnitHpDrawer.drawHpBars(ctx);
				PlayerHpDrawer.drawHp(ctx);
			}
			// Draw screen effects right above all maps and unit UI
			ScreenEffectDrawer.drawEffect(ctx);
			// Draw dialog over all map content
			DialogDrawer.drawDialogOverlay(ctx);
			// Draws FPS
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


// Currently Unused. Moves the map in direction of the quadrant of the screen 
// that the mouse is in.
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


// Ticks all elements on the map every tickWindow milliseconds.
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
			if (GameState.map) {
				GameState.map.tickAll();
			}
			BeatDrawer.tick();
			SoundPlayer.tick();
			trackCameraOnPlayerDebugDebug();
			UnitHpDrawer.tick();
			PlayerHpDrawer.tick();
			DialogDrawer.tick();
			ScreenEffectDrawer.tick();
			delta -= tickWindow;
			if (DISABLE_CORRECTIVE_TICKING) {
				delta = 0;
				break;
			}
		}
		lastOperated = currTime - delta;
	}, 0);
};


// Ties camera movement to the player movement, ensuring that the player is the 
// middle of the screen at all times.
var trackCameraOnPlayerDebugDebug = function() {
	if (GameState.player) {
		viewerLoc.x = GameState.player.getPositionX();
		viewerLoc.y = GameState.player.getPositionY();
	}
};