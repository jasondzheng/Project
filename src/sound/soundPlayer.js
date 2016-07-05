/**
 * Responsible for playing sounds.
 */

var SoundPlayer = {};

SoundPlayer.currTrack;
SoundPlayer.currParity = 0;

SoundPlayer.setTrack = function(track) {
	if (SoundPlayer.currTrack != undefined) {
		SoundPlayer.currTrack[currParity].audio.onended = null;
		SoundPlayer.currTrack[currParity].audio.pause();
		SoundPlayer.currTrack[currParity].audio.currTime = 0;
	}
	var audio = track.audio[SoundPlayer.currParity];
	BeatDrawer.setQueue(track.beatmap.notes, audio.duration);
	SoundPlayer.currTrack = track;
	audio.play();
	track.audio[1 - SoundPlayer.currParity].currentTime = 0;
	track.audio[1 - SoundPlayer.currParity].pause();
};

SoundPlayer.tick = function() {
	if (SoundPlayer.currTrack && 
			SoundPlayer.currTrack.audio[SoundPlayer.currParity].currentTime == 
					SoundPlayer.currTrack.audio[SoundPlayer.currParity].duration) {
		SoundPlayer.currTrack.audio[SoundPlayer.currParity].pause();
		SoundPlayer.currTrack.audio[SoundPlayer.currParity].currentTime = 0;
		SoundPlayer.currTrack.audio[
				SoundPlayer.currParity = 1 - SoundPlayer.currParity].play();
	}
};