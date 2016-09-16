/**
 * Responsible for drawing the beat marker onto the screen. Intended to draw
 * between the ground of the map and any other entities that would otherwise
 * reside on top.
 */

var BeatDrawer = {};

// Strings to indicate the style of beat
BeatDrawer.BEAT_STYLE = 'beat';
BeatDrawer.HOLD_START_STYLE = 'holdStart';
BeatDrawer.HOLD_END_STYLE = 'holdEnd';

// Colors and thickness of each beat
BeatDrawer.COLOR_OUTER = '#000000';
BeatDrawer.STROKE_OUTER = 6;
BeatDrawer.COLOR_INNER = 'rgb(145, 155, 255)';
BeatDrawer.STROKE_INNER = 5;

// Beat indicator fill color
BeatDrawer.BOUND_COLOR_OUTER = 'rgba(0, 0, 0, 0.5)';
BeatDrawer.BOUND_COLOR_INNER = 'rgba(255, 255, 255, 0.5)';

BeatDrawer.FILL_INDICATOR_COLOR = '#000000';

// Maximimum physical size of a beat
BeatDrawer.OUTER_RAD_1 = 275;
BeatDrawer.OUTER_RAD_2 = 220;
// Mininum physical size of a beat
BeatDrawer.INNER_RAD_1 = 46;
BeatDrawer.INNER_RAD_2 = 36;

// Opcaity of a Hold note
BeatDrawer.HOLD_ALPHA = 0.275;

// Interval in which a player can consume each note
BeatDrawer.NOTE_HIT_GRACE = 0.2;

// Initialized dynamic fields to be used in the beat drawer
BeatDrawer._queue;
BeatDrawer._songPlayTime;
BeatDrawer._showInterval = 1.75;
BeatDrawer._time;
BeatDrawer._holdStart;
BeatDrawer._holdDuration;
BeatDrawer._windowStart;
BeatDrawer._windowEnd;

BeatDrawer._hitWindowStart;
BeatDrawer._hitWindowEnd;
BeatDrawer._hitHoldEnd;

BeatDrawer.setWindowInterval = function(seconds) {
	BeatDrawer._showInterval = seconds;
};


// Sets up the beat queue and intializes the window starts and window ends to 0.
BeatDrawer.setQueue = function(queue, songPlayTime) {
	BeatDrawer._queue = queue;
	BeatDrawer._songPlayTime = songPlayTime;
	BeatDrawer._time = 0;
	BeatDrawer._windowStart = BeatDrawer._windowEnd = 0;
	BeatDrawer._hitWindowStart = BeatDrawer._hitWindowEnd = 0;
};


BeatDrawer.tick = function() {
	if (SoundPlayer.currTrack) {
		// Advances time along with the Sound Player.
		BeatDrawer._advanceTime(
				SoundPlayer.currTrack.audio[SoundPlayer.currParity].currentTime);
	}
};


// Updates the window starts and ends to match their positions at the given 
// time.
BeatDrawer._advanceTime = function(newTime) {
	// Fix any beat indexes when the wraparound happens so that they are relative
	// to the current time as opposed to the old unrewinded time
	if (BeatDrawer._time > newTime) {
		BeatDrawer._windowStart -= BeatDrawer._queue.length;
		BeatDrawer._windowEnd -= BeatDrawer._queue.length;
		BeatDrawer._hitHoldEnd -= BeatDrawer._songPlayTime;
	}
	if (BeatDrawer._hitWindowStart >= BeatDrawer._queue.length &&
			BeatDrawer._hitWindowEnd >= BeatDrawer._queue.length) {
		BeatDrawer._hitWindowStart -= BeatDrawer._queue.length;
		BeatDrawer._hitWindowEnd -= BeatDrawer._queue.length;
	}
	// Update the time
	BeatDrawer._time = newTime;
	// Find the new window start
	for (; BeatDrawer._queue[
			BeatDrawer._windowStart % BeatDrawer._queue.length].time + 
			(BeatDrawer._windowStart < BeatDrawer._queue.length ? 0 : 
					BeatDrawer._songPlayTime) < newTime; 
			BeatDrawer._windowStart++) {
		// If the window start is a hold start, set hold start to window start time
		if (BeatDrawer._queue[BeatDrawer._windowStart % 
				BeatDrawer._queue.length].style == BeatDrawer.HOLD_START_STYLE) {
			BeatDrawer._holdStart = BeatDrawer._queue[
					BeatDrawer._windowStart % BeatDrawer._queue.length].time;
			// Find the corresponding hold end to the newly identified hold start
			for (var i = BeatDrawer._windowStart % BeatDrawer._queue.length; 
					i < BeatDrawer._queue.length; i++) {
				if (BeatDrawer._queue[i].style == BeatDrawer.HOLD_END_STYLE) {
					BeatDrawer._holdDuration = BeatDrawer._queue[i].time - 
							BeatDrawer._holdStart;
					break;
				}
			}
		// If the window start is the end of a hold the hold is over and fields are
		// cleared out
		} else if (BeatDrawer._queue[
				BeatDrawer._windowStart % BeatDrawer._queue.length].style == 
				BeatDrawer.HOLD_END_STYLE) {
			BeatDrawer._holdStart = BeatDrawer._holdDuration = undefined;
		}
	}
	// Find new window end
	for (BeatDrawer._windowEnd = 
			Math.max(BeatDrawer._windowStart, BeatDrawer._windowEnd); 
			BeatDrawer._queue[BeatDrawer._windowEnd % BeatDrawer._queue.length].time + 
					(BeatDrawer._windowEnd < BeatDrawer._queue.length ? 0 : 
							BeatDrawer._songPlayTime) <	newTime + BeatDrawer._showInterval; 
			BeatDrawer._windowEnd++);
	// Hit window advance time
	for (; BeatDrawer._queue[
			BeatDrawer._hitWindowStart % BeatDrawer._queue.length].time + 
			(BeatDrawer._hitWindowStart < BeatDrawer._queue.length ? 0 : 
					BeatDrawer._songPlayTime) < newTime - BeatDrawer.NOTE_HIT_GRACE; 
			BeatDrawer._hitWindowStart++);
	for (BeatDrawer._hitWindowEnd = 
			Math.max(BeatDrawer._hitWindowStart, BeatDrawer._hitWindowEnd); 
			BeatDrawer._queue[BeatDrawer._hitWindowEnd % 
					BeatDrawer._queue.length].time + 
					(BeatDrawer._hitWindowEnd < BeatDrawer._queue.length ? 0 : 
							BeatDrawer._songPlayTime) <	newTime + BeatDrawer.NOTE_HIT_GRACE; 
			BeatDrawer._hitWindowEnd++);
	if (BeatDrawer._hitHoldEnd != undefined && 
			BeatDrawer._time >= BeatDrawer._hitHoldEnd) {
		BeatDrawer._hitHoldEnd = undefined;
	}
};


// Returns true if currently in a hold
BeatDrawer.isInHold = function() {
	return BeatDrawer._hitHoldEnd != undefined && 
			BeatDrawer._time < BeatDrawer._hitHoldEnd;
};


// Tries to consume a note if any are available in the hit window
BeatDrawer.consumeHitNote = function(/* TODO: explain what type of press */) {
	if (BeatDrawer._hitWindowStart != BeatDrawer._hitWindowEnd) {
		console.log('Consumed 1 of ' + (BeatDrawer._hitWindowEnd - BeatDrawer._hitWindowStart) + ' notes');
		var startIndex = BeatDrawer._hitWindowStart % BeatDrawer._queue.length;
		if (BeatDrawer._queue[startIndex].style == BeatDrawer.HOLD_START_STYLE) {
			BeatDrawer._hitHoldEnd = BeatDrawer._queue[
					(BeatDrawer._hitWindowStart + 1) % BeatDrawer._queue.length].time + 
					((BeatDrawer._hitWindowStart + 1) < BeatDrawer._queue.length ? 0 : 
							BeatDrawer._songPlayTime);
		}
		BeatDrawer._hitWindowStart++;
		return true;
	}
	console.log('Missed notes');
	return false;
};


// Draws all beats between windowStart and windowEnd.
BeatDrawer.drawBeats = function(ctx, centerX, centerY) {
	for (var i = BeatDrawer._windowStart; i < BeatDrawer._windowEnd; i++) {
		var beat = BeatDrawer._queue[i % BeatDrawer._queue.length];
		var time = (i < BeatDrawer._queue.length ? 0 : BeatDrawer._songPlayTime) + 
				beat.time;
		var fraction = (time - BeatDrawer._time) / BeatDrawer._showInterval;
		if (beat.style == BeatDrawer.BEAT_STYLE) {
			BeatDrawer._helperDrawBeat(ctx, centerX, centerY, BeatDrawer.COLOR_INNER, 
					BeatDrawer.COLOR_OUTER, fraction);
		} else if (beat.style == BeatDrawer.HOLD_START_STYLE) {
			BeatDrawer._helperDrawHoldBeatStart(ctx, centerX, centerY, 
					BeatDrawer.COLOR_INNER, BeatDrawer.COLOR_OUTER, fraction, 
					i == BeatDrawer._windowEnd - 1);
		} else if (beat.style == BeatDrawer.HOLD_END_STYLE) {
			BeatDrawer._helperDrawHoldBeatEnd(ctx, centerX, centerY, 
					BeatDrawer.COLOR_INNER, BeatDrawer.COLOR_OUTER, fraction, 
					i == BeatDrawer._windowStart);
		}
	}
	if (BeatDrawer._holdStart != undefined && 
			BeatDrawer._windowStart == BeatDrawer._windowEnd) {
		BeatDrawer._helperDrawUnboundFill(ctx, centerX, 
				centerY, BeatDrawer.COLOR_INNER);
	}
	BeatDrawer._helperDrawMarkerBeat(ctx, centerX, centerY, 
			BeatDrawer.BOUND_COLOR_INNER, BeatDrawer.BOUND_COLOR_OUTER, 
			0 /* fraction */);
};


// Draws an individual beat given its center coordinates, color, and fraction
BeatDrawer._helperDrawBeat = function(ctx, centerX, centerY, innerColor, 
		outerColor, fraction) {
	var axisA = (BeatDrawer.OUTER_RAD_1 - BeatDrawer.INNER_RAD_1) * fraction + 
			BeatDrawer.INNER_RAD_1;
	var axisB = (BeatDrawer.OUTER_RAD_2 - BeatDrawer.INNER_RAD_2) * fraction + 
			BeatDrawer.INNER_RAD_2;
	var yVal = -14 * fraction;

	ctx.globalAlpha = .5 - (0.45 * fraction);

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

	ctx.globalAlpha = 1;
};

// Draws the beginning of a hold given its center coordinates, color, and 
// fraction. Will draw the beginnning at the minimum radius if it is cut off 
// from the beat window.
BeatDrawer._helperDrawHoldBeatStart = function(ctx, centerX, centerY, color,
		outerColor, fraction, isCutShort) {
	var axisA = (BeatDrawer.OUTER_RAD_1 - BeatDrawer.INNER_RAD_1) * fraction + 
			BeatDrawer.INNER_RAD_1;
	var axisB = (BeatDrawer.OUTER_RAD_2 - BeatDrawer.INNER_RAD_2) * fraction + 
			BeatDrawer.INNER_RAD_2;
	var yVal = -14 * fraction;

	// Draw Mark
	ctx.globalAlpha = .5 - (0.45 * fraction);
	ctx.lineWidth = 3;
	ctx.strokeStyle = outerColor;
	ctx.beginPath();
	ctx.ellipse(centerX, centerY - yVal, axisA, axisB, 0, 0, 2 * Math.PI);
	ctx.stroke();
	ctx.globalAlpha = 1;

	ctx.lineWidth = 1;
	ctx.fillStyle = ctx.strokeStyle = color;
	ctx.beginPath();
	ctx.ellipse(centerX, centerY - yVal, axisA, axisB, 0, 0, 2 * Math.PI);
	if (isCutShort) {
		ctx.ellipse(centerX, centerY + 14, BeatDrawer.OUTER_RAD_1, 
				BeatDrawer.OUTER_RAD_2, 0, 0, 2 * Math.PI, true);
		ctx.globalAlpha = BeatDrawer.HOLD_ALPHA;
		ctx.fill();
		ctx.globalAlpha = 1;
	}
};


// Draws the end of a hold given its center coordinates, color, and 
// fraction. Will draw the end at the maximum radius if it is cut off 
// from the beat window.
BeatDrawer._helperDrawHoldBeatEnd = function(ctx, centerX, centerY, color, 
		outerColor, fraction, isCutShort) {
	var axisA = (BeatDrawer.OUTER_RAD_1 - BeatDrawer.INNER_RAD_1) * fraction + 
			BeatDrawer.INNER_RAD_1;
	var axisB = (BeatDrawer.OUTER_RAD_2 - BeatDrawer.INNER_RAD_2) * fraction + 
			BeatDrawer.INNER_RAD_2;
	var yVal = -14 * fraction;

	if (isCutShort) {
		ctx.fillStyle = ctx.strokeStyle = color;
		ctx.beginPath();
		ctx.ellipse(centerX, centerY, BeatDrawer.INNER_RAD_1, 
				BeatDrawer.INNER_RAD_2, 0, 0, 2 * Math.PI);	
	}

	ctx.ellipse(centerX, centerY - yVal, axisA, axisB, 0, 0, 2 * Math.PI, true);
	ctx.globalAlpha = BeatDrawer.HOLD_ALPHA;
	ctx.fill();

	// Draw Mark
	ctx.globalAlpha = .5 - (0.45 * fraction);
	ctx.lineWidth = 3;
	ctx.strokeStyle = outerColor;
	ctx.beginPath();
	ctx.ellipse(centerX, centerY - yVal, axisA, axisB, 0, 0, 2 * Math.PI);
	ctx.stroke();
	ctx.globalAlpha = 1;
};

// Fills the entire beat area if within a hold and both the hold start and end 
// are not visible/.
BeatDrawer._helperDrawUnboundFill = function(ctx, centerX, centerY, color) {
	ctx.lineWidth = 1;
	ctx.fillStyle = color;
	ctx.beginPath();
	ctx.ellipse(centerX, centerY, BeatDrawer.INNER_RAD_1, 
				BeatDrawer.INNER_RAD_2, 0, 0, 2 * Math.PI);	
	ctx.ellipse(centerX, centerY + 14, BeatDrawer.OUTER_RAD_1, 
				BeatDrawer.OUTER_RAD_2, 0, 0, 2 * Math.PI, true);
	ctx.globalAlpha = BeatDrawer.HOLD_ALPHA;
	ctx.fill();
	ctx.globalAlpha = 1;
};


// Draws the (static) center marker ellipse that lies below the player at all 
// times. 
BeatDrawer._helperDrawMarkerBeat = function(ctx, centerX, centerY, innerColor, 
		outerColor, fraction) {
	var axisA = (BeatDrawer.OUTER_RAD_1 - BeatDrawer.INNER_RAD_1) * fraction + 
			BeatDrawer.INNER_RAD_1;
	var axisB = (BeatDrawer.OUTER_RAD_2 - BeatDrawer.INNER_RAD_2) * fraction + 
			BeatDrawer.INNER_RAD_2;
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