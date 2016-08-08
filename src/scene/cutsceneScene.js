/**
 * A scene responsible for playing cutscenes. Cutscenes are mp4 files that are
 * specified by URL, and will be drawn onto the canvas.
 */
var CutsceneScene = {};

// A shared video element.
CutsceneScene._videoElem;

// A callback to be called on finishing playback of the video.
CutsceneScene._donePlayingCallback;

// Stored input modes when the cutscene started playing. Restored at end.
CutsceneScene._lastKeyInputMode;
CutsceneScene._lastMouseInputMode;


// Sets the URL for the cutscene player. Will throw an exception if a current
// video has been supplied already and is playing. Also takes in a callback for
// when the video has finished playing.
CutsceneScene.setUrl = function(url, callback) {
	if (CutsceneScene._videoElem.src != '') {
		throw 'Another video is in progress';
	}
	CutsceneScene._videoElem.src = url;
	CutsceneScene._videoElem.pause();
	CutsceneScene._donePlayingCallback = callback;
	CutsceneScene._videoElem.oncanplaythrough = function() {
		CutsceneScene._videoElem.play();
	};
};


CutsceneScene.init = function() {
	CutsceneScene._videoElem = document.createElement('video');
	var sourceElem = document.createElement('src');
	sourceElem.src = '';
	sourceElem.type = 'video/mp4';
	CutsceneScene._videoElem.appendChild(sourceElem);
	CutsceneScene._videoElem.pause();
};


CutsceneScene.pause = function() {
	CutsceneScene._videoElem.pause();
	CutsceneScene._videoElem.src = '';
	// Restore input modes
	KeyInputRouter.setMode(CutsceneScene._lastKeyInputMode);
	MouseInputRouter.setMode(CutsceneScene._lastMouseInputMode);
};


CutsceneScene.resume = function() {
	// Disable and remember all input modes
	CutsceneScene._lastKeyInputMode = KeyInputRouter.getMode();
	CutsceneScene._lastMouseInputMode = MouseInputRouter.getMode();
	KeyInputRouter.setMode(KeyInputRouter.Modes.DISABLED);
	MouseInputRouter.setMode(MouseInputRouter.Modes.DISABLED);
};


CutsceneScene.reset = function() {
	throw 'Unimplemented';
};


CutsceneScene.draw = function(ctx) {
	if (!CutsceneScene._videoElem.paused) {
		ctx.drawImage(CutsceneScene._videoElem, 0, 0);
	} else {
		ctx.fillStyle = 'black';
		ctx.fillRect(0, 0, ScreenProps.EXP_WIDTH, ScreenProps.EXP_HEIGHT);
	}
};


CutsceneScene.tick = function() {
	if (CutsceneScene._videoElem.ended) {
		CutsceneScene._videoElem.src = '';
		CutsceneScene._videoElem.pause();
		CutsceneScene._donePlayingCallback();
	}
};