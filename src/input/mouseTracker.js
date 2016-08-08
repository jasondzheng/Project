/**
 * A tracker used to listen to mouse events and record state of the mouse,
 * to be polled by other components.
 */

var MouseTracker = {};

// Tolerance for same click locations.
MouseTracker.SAME_LOC_TOLERANCE = 8;

// Time tolerance of a double click in ms.
MouseTracker.DOUBLE_CLICK_TIME_DELTA = 500;

// Variables used to track the current state of the mouse.
MouseTracker._mousePosX = 0;
MouseTracker._mousePosY = 0;
MouseTracker._mouseDown = false;
MouseTracker._previousMouseDown = false;
MouseTracker._sampleMouseDown = false;
MouseTracker._mouseWheel = 0;

// Variables used for tracking double clicks.
MouseTracker._currClickEndTime;
MouseTracker._currClickEndX;
MouseTracker._currClickEndY;
MouseTracker._isDoubleClick = false;


// Attaches the mouse tracker to the canvas element. Intercepts all events and
// updates the state of the mouse internally.
MouseTracker.attachToScreen = function(screen) {
	screen.onmousedown = function(e) {
		MouseTracker._sampleMouseDown = true;
	};

	screen.onmouseup = function(e) {
		MouseTracker._sampleMouseDown = false;
	};

	screen.onmousemove = function(e) {
		MouseTracker._mousePosX = (e.pageX - screen.offsetLeft) / 
				ScreenResizeManager.scale;
		MouseTracker._mousePosY = (e.pageY - screen.offsetTop) / 
				ScreenResizeManager.scale;
	};

	screen.onmousewheel = function(e) {
		MouseTracker._mouseWheel += e.deltaY;
	};
};


MouseTracker.getMouseX = function() {
	return MouseTracker._mousePosX;
};


MouseTracker.getMouseY = function() {
	return MouseTracker._mousePosY;
};


MouseTracker.isMouseDown = function() {
	return MouseTracker._mouseDown;
};


// Consumes the current mouse wheel setting and returns it. Zeroes reading out
// after.
MouseTracker.consumeMouseWheel = function() {
	var oldMouseWheel = MouseTracker._mouseWheel;
	MouseTracker._mouseWheel = 0;
	return oldMouseWheel;
};


MouseTracker.isStartClick = function() {
	return MouseTracker._mouseDown && !MouseTracker._previousMouseDown;
};


MouseTracker.isEndClick = function() {
	return !MouseTracker._mouseDown && MouseTracker._previousMouseDown;
};


MouseTracker.isHover = function() {
	return !MouseTracker._mouseDown && !MouseTracker._previousMouseDown;
};


MouseTracker.isDrag = function() {
	return MouseTracker._mouseDown && MouseTracker._previousMouseDown;
};


MouseTracker.isDoubleClick = function() {
	return MouseTracker._isDoubleClick;
};


MouseTracker.tick = function() {
	MouseTracker._previousMouseDown = MouseTracker._mouseDown;
	MouseTracker._mouseDown = MouseTracker._sampleMouseDown;
	var currTime = Date.now();
	if (MouseTracker.isEndClick()) {
		MouseTracker._isDoubleClick = (currTime - MouseTracker._currClickEndTime < 
					MouseTracker.DOUBLE_CLICK_TIME_DELTA && 
			Math.abs(MouseTracker._mousePosX - MouseTracker._currClickEndX) < 
					MouseTracker.SAME_LOC_TOLERANCE &&
			Math.abs(MouseTracker._mousePosY - MouseTracker._currClickEndY) < 
					MouseTracker.SAME_LOC_TOLERANCE);
		MouseTracker._currClickEndTime = currTime;
		MouseTracker._currClickEndX = MouseTracker._mousePosX;
		MouseTracker._currClickEndY = MouseTracker._mousePosY;
	} else {
		MouseTracker._isDoubleClick = false;
	}
};