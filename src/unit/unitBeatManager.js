/**
 * Responsible for keeping track of the unit beatmap of the game map. Should be 
 * used to check whether or not units can attack in the given track.
 */

var UnitBeatManager = {};

UnitBeatManager.NOTE_HIT_GRACE = 0.2/*TODO: Make some constant*/;

UnitBeatManager._queue;
UnitBeatManager._songPlayTime;
UnitBeatManager._showInterval = 1.75;
UnitBeatManager._time;
UnitBeatManager._parity = true;

UnitBeatManager._nextBeat;

// Sets the queue with the beatmap data and sets the song duration.
UnitBeatManager.setQueue = function(queue, songPlayTime) {
	UnitBeatManager._queue = queue;
	UnitBeatManager._songPlayTime = songPlayTime;
	UnitBeatManager._time = 0;
	UnitBeatManager._nextBeat = 0;
};


UnitBeatManager.tick = function() {
	if (SoundPlayer.currTrack) {
		// Advances time along with the Sound Player.
		UnitBeatManager._advanceTime(
				SoundPlayer.currTrack.audio[SoundPlayer.currParity].currentTime);
	}
};


// Advances the time of the Unit Beat Manager and advances the next beat 
// accordingly.
UnitBeatManager._advanceTime = function(newTime) {
	if (UnitBeatManager._time > newTime) {
		UnitBeatManager._nextBeat -= UnitBeatManager._queue.length;
	}
	UnitBeatManager._time = newTime;
	if (UnitBeatManager._nextBeat < UnitBeatManager._queue.length && 
			UnitBeatManager._queue[UnitBeatManager._nextBeat].time < 
			UnitBeatManager._time - UnitBeatManager.NOTE_HIT_GRACE) {
		UnitBeatManager._nextBeat++;
		UnitBeatManager._parity = !UnitBeatManager._parity;
		// Check
		var units = GameState.map.unitInstances;
		for (var i = 0; i < units.length; i++) {
			units[i].actionManager._attackParity = UnitBeatManager._parity;
		}
	}
};


// Returns true if the time falls within the grace period of the next note.
UnitBeatManager.isInBeat = function() {
	return Math.abs(UnitBeatManager._queue[
					UnitBeatManager._nextBeat % UnitBeatManager._queue.length].time - 
			UnitBeatManager._time +
			(UnitBeatManager._nextBeat >= UnitBeatManager._queue.length ? 
					UnitBeatManager._songPlayTime : 0)) < 
			UnitBeatManager.NOTE_HIT_GRACE;
};


// Advances the index of the stored next beat.
// UnitBeatManager.consumeBeat = function() {
// 	UnitBeatManager._nextBeat++;
// };