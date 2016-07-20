/**
 * Holds constant screen properties that are referenced when drawing onto
 * the screen.
 */

var ScreenProps = {};

// The expected width and height of the screen.
ScreenProps.EXP_WIDTH = 1280; ScreenProps.EXP_HEIGHT = 720;

// The half width and half heights for convenience;
ScreenProps.EXP_WIDTH_HALF = ScreenProps.EXP_WIDTH / 2; 
ScreenProps.EXP_HEIGHT_HALF = ScreenProps.EXP_HEIGHT / 2;

// The expectd query selector of canvas screen element.
ScreenProps.SCREEN_QS = '#screen';


// Function to see if rectangles overlap with the screen rectangle. 
ScreenProps.isRectOnScreen = function(x, y, width, height) {
	return !(0 > x + width || ScreenProps.EXP_WIDTH < x || 
			0 > y + height || ScreenProps.EXP_HEIGHT < y);
};