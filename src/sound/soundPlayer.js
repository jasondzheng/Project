/**
 * Responsible for playing sounds.
 */

var SoundPlayer = {};

SoundPlayer.currTrack;
SoundPlayer.currParity = 0;


// Sets the track that needs to be played. Plays using a double track to ensure 
// perfect loop
SoundPlayer.setTrack = function(track) {
	if (SoundPlayer.currTrack != undefined) {
		SoundPlayer.currTrack.audio[SoundPlayer.currParity].onended = null;
		SoundPlayer.currTrack.audio[SoundPlayer.currParity].pause();
		SoundPlayer.currTrack.audio[SoundPlayer.currParity].currTime = 0;
	}
	var audio = track.audio[SoundPlayer.currParity];
	BeatDrawer.setQueue(track.beatmap.notes, audio.duration);
	SoundPlayer.currTrack = track;
	audio.play();
	track.audio[1 - SoundPlayer.currParity].currentTime = 0;
	track.audio[1 - SoundPlayer.currParity].pause();
};


SoundPlayer.pauseCurrentTrack = function() {
	SoundPlayer.currTrack.audio[SoundPlayer.currParity].pause();
};


SoundPlayer.resumeCurrentTrack = function() {
	SoundPlayer.currTrack.audio[SoundPlayer.currParity].play();
};


// An update function to check if the current track is finished; if so, plays 
// the other track
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