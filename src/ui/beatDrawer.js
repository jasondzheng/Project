/**
 * Responsible for drawing the beat marker onto the screen. Intended to draw
 * between the ground of the map and any other entities that would otherwise
 * reside on top.
 */

var BeatDrawer = {};

BeatDrawer.BEAT_STYLE = 'beat';
BeatDrawer.HOLD_START_STYLE = 'holdStart';
BeatDrawer.HOLD_END_STYLE = 'holdEnd';

BeatDrawer.COLOR_OUTER = '#000000';
BeatDrawer.STROKE_OUTER = 7;
BeatDrawer.COLOR_INNER = 'rgb(145, 155, 255)';
BeatDrawer.STROKE_INNER = 5;

BeatDrawer.BOUND_COLOR_OUTER = 'rgba(0, 0, 0, 0.5)';
BeatDrawer.BOUND_COLOR_INNER = 'rgba(255, 255, 255, 0.5)';

BeatDrawer.FILL_INDICATOR_COLOR = '#000000';

BeatDrawer._queue;
BeatDrawer._showInterval = 2;
BeatDrawer._time;
BeatDrawer._holdStart;
BeatDrawer._holdDuration;
BeatDrawer._windowStart;
BeatDrawer._windowEnd;


BeatDrawer.setWindowInterval = function(seconds) {
	BeatDrawer._showInterval = seconds;
};


BeatDrawer.setQueue = function(queue) {
	BeatDrawer._queue = queue;
	BeatDrawer._time = 0;
	BeatDrawer._windowStart = BeatDrawer._windowEnd = 0;
};


BeatDrawer.advanceTime = function(newTime) {
	BeatDrawer._time = newTime;
	for (; BeatDrawer._windowStart < BeatDrawer._queue.length && 
					BeatDrawer._queue[BeatDrawer._windowStart].time < newTime; 
			BeatDrawer._windowStart++) {
		if (BeatDrawer._queue[BeatDrawer._windowStart].style == 
				BeatDrawer.HOLD_START_STYLE) {
			BeatDrawer._holdStart = BeatDrawer._queue[BeatDrawer._windowStart].time;
			for (var i = BeatDrawer._windowStart; i < BeatDrawer._queue.length; i++) {
				if (BeatDrawer._queue[i].style == BeatDrawer.HOLD_END_STYLE) {
					BeatDrawer._holdDuration = BeatDrawer._queue[i].time - 
							BeatDrawer._holdStart;
					break;
				}
			}
		} else if (BeatDrawer._queue[BeatDrawer._windowStart].style == 
				BeatDrawer.HOLD_END_STYLE) {
			BeatDrawer._holdStart = BeatDrawer._holdDuration = undefined;
		}
	}
	for (BeatDrawer._windowEnd = 
			Math.max(BeatDrawer._windowStart, BeatDrawer._windowEnd); 
			BeatDrawer._windowEnd < BeatDrawer._queue.length && 
					BeatDrawer._queue[BeatDrawer._windowEnd].time <	newTime + 
							BeatDrawer._showInterval; 
			BeatDrawer._windowEnd++);
};


BeatDrawer.draw = function(ctx, centerX, centerY) {
	for (var i = BeatDrawer._windowStart; i < BeatDrawer._windowEnd; i++) {
		var fraction = (BeatDrawer._queue[i].time - BeatDrawer._time) / 
				BeatDrawer._showInterval;
		if (BeatDrawer._queue[i].style == BeatDrawer.BEAT_STYLE) {
			BeatDrawer._helperDrawBeat(ctx, centerX, centerY, BeatDrawer.COLOR_INNER, 
					BeatDrawer.COLOR_OUTER, fraction);
		} else if (BeatDrawer._queue[i].style == BeatDrawer.HOLD_START_STYLE) {
			BeatDrawer._helperDrawHoldBeatStart(ctx, centerX, centerY, 
					BeatDrawer.COLOR_OUTER, fraction);
		} else {
			BeatDrawer._helperDrawBeat(ctx, centerX, centerY, BeatDrawer.COLOR_OUTER, 
					BeatDrawer.COLOR_OUTER, fraction);
		}
	}
	if (BeatDrawer._holdStart != undefined) {
		BeatDrawer._helperDrawFilledCenter(ctx, centerX, centerY, 
				BeatDrawer.FILL_INDICATOR_COLOR, 
				(BeatDrawer._time - BeatDrawer._holdStart) / BeatDrawer._holdDuration);
	}
	BeatDrawer._helperDrawMarkerBeat(ctx, centerX, centerY, 
			BeatDrawer.BOUND_COLOR_INNER, BeatDrawer.BOUND_COLOR_OUTER, 
			0 /* fraction */);
};


BeatDrawer._helperDrawBeat = function(ctx, centerX, centerY, innerColor, 
		outerColor, fraction) {
	var axisA = (275 - 46) * fraction + 46;
	var axisB = (220 - 36) * fraction + 36;
	var yVal = -14 * fraction;
	ctx.lineWidth = BeatDrawer.STROKE_OUTER;
	ctx.strokeStyle = outerColor;
	ctx.beginPath();
	ctx.ellipse(centerX, centerY - yVal, axisA, axisB, 0, 0, 2 * Math.PI);
	ctx.stroke();

	ctx.lineWidth = BeatDrawer.STROKE_INNER;
	ctx.strokeStyle = innerColor;
	ctx.beginPath();
	ctx.ellipse(centerX, centerY - yVal, axisA, axisB, 0, 0, 2 * Math.PI);
	ctx.stroke();
};

BeatDrawer._helperDrawHoldBeatStart = function(ctx, centerX, centerY, color, 
		fraction) {
	var axisA = (275 - 46) * fraction + 46;
	var axisB = (220 - 36) * fraction + 36;
	var yVal = -14 * fraction;
	ctx.lineWidth = 2;
	ctx.strokeStyle = color;
	ctx.beginPath();
	ctx.ellipse(centerX, centerY - yVal, axisA + 6, axisB + 6, 0, 0, 2 * Math.PI);
	ctx.stroke();

	ctx.lineWidth = 2;
	ctx.strokeStyle = color;
	ctx.beginPath();
	ctx.ellipse(centerX, centerY - yVal, axisA, axisB, 0, 0, 2 * Math.PI);
	ctx.stroke();
};


BeatDrawer._helperDrawMarkerBeat = function(ctx, centerX, centerY, innerColor, 
		outerColor, fraction) {
	var axisA = (275 - 46) * fraction + 46;
	var axisB = (220 - 36) * fraction + 36;
	var yVal = -14 * fraction;
	ctx.lineWidth = BeatDrawer.STROKE_OUTER;
	ctx.strokeStyle = outerColor;
	ctx.beginPath();
	ctx.ellipse(centerX, centerY - yVal, axisA, axisB, 0, 0, 2 * Math.PI);
	ctx.stroke();

	ctx.lineWidth = BeatDrawer.STROKE_INNER;
	ctx.fillStyle = innerColor;
	ctx.beginPath();
	ctx.ellipse(centerX, centerY - yVal, axisA, axisB, 0, 0, 2 * Math.PI);
	ctx.fill();
};

BeatDrawer._helperDrawFilledCenter = function(ctx, centerX, centerY, color, 
		fraction) {
	var axisA = fraction * 46;
	var axisB = fraction * 36;
	
	ctx.fillStyle = color;
	ctx.beginPath();
	ctx.ellipse(centerX, centerY, axisA, axisB, 0, 0, 2 * Math.PI);
	ctx.fill();
};