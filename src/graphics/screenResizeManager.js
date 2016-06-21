// A utility class used to resize the canvas to fit the appropriate screen
// size. 

var ScreenResizeManager = {};

// An option to disable screen resize
ScreenResizeManager.RESIZE_ENABLED = true;

// Initializes the screen resize manager and binds handles so that the canvas
// resizes appropriately when the screen size changes
ScreenResizeManager.init = function() {
	var canvas = ScreenResizeManager.canvas = 
			document.querySelector(ScreenProps.SCREEN_QS);
	canvas.width = ScreenProps.EXP_WIDTH;
	canvas.height = ScreenProps.EXP_HEIGHT;
	canvas.position = 'absolute';
	// Force a context grab to lock those values
	canvas.getContext('2d');
	
	// Resize operation
	var resizeToFit = function() {
		var scale = Math.min(window.innerWidth / ScreenProps.EXP_WIDTH, 
			window.innerHeight / ScreenProps.EXP_HEIGHT);
		var scaledWidth = ScreenProps.EXP_WIDTH * scale;
		var scaledHeight = ScreenProps.EXP_HEIGHT * scale;
		canvas.style.width = scaledWidth + 'px';
		canvas.style.height = scaledHeight + 'px';
		canvas.style.top = (window.innerHeight - scaledHeight) / 2 + 'px';
		canvas.style.left = (window.innerWidth - scaledWidth) / 2 + 'px';
	};
	if (ScreenResizeManager.RESIZE_ENABLED) {
		resizeToFit();
		window.onresize = resizeToFit;
	}
};