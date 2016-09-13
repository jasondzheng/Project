var DISABLE_CORRECTIVE_TICKING = false;


window.onload = function() {
	var deferrer = new CallbackDeferrer();
	deferrer.addUnparametered(CoreModule.load);
	deferrer.addUnparametered(StartMenuScene.init);
	deferrer.after(function() {
		initDrawLoop();
		setupTickCycle();
		CoreModule.switchScene(StartMenuScene);
	});
};


var initDrawLoop = function() {
	var startTimes = [];
	var drawLoop = function() {
		var ctx = CoreModule.ctx;
		if (CoreModule.currentScene) {
			CoreModule.currentScene.draw(ctx);
		}
		CoreModule.draw(ctx);
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
};


// Ticks all elements on the map every tickWindow milliseconds.
var setupTickCycle = function() {
	var tickWindow = 1000 / 60;
	var lastOperated = Date.now();
	window.setInterval(function() {
		var currTime = Date.now();
		var delta = currTime - lastOperated;
		if (delta < tickWindow) {
			return;
		}
		while (delta >= tickWindow) {
			CoreModule.tick();
			if (CoreModule.currentScene) {
				CoreModule.currentScene.tick();
			}
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