/**
 * Responsible for playing sounds.
 */

var SoundPlayer = {};

SoundPlayer.currTrack;

SoundPlayer.setTrack = function(track) {
	if (SoundPlayer.currTrack != undefined) {
		SoundPlayer.currTrack.audio.onended = null;
		SoundPlayer.currTrack.audio.pause();
		SoundPlayer.currTrack.audio.currTime = 0;
	}
	var audio = track.audio;
	BeatDrawer.setQueue(track.beatmap.notes);
	audio.onended = function() {
		audio.currentTime = 0;
		BeatDrawer.setQueue(track.beatmap.notes);
	};
	SoundPlayer.currTrack = track;
	audio.play();
};