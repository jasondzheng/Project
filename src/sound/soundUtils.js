var SoundUtils = {};

SoundUtils.loadedSounds = {};


SoundUtils.loadSound = function(url, opt_callback) {
	if (SoundUtils.loadedSounds[url] && opt_callback) {
		opt_callback(SoundUtils.loadedSounds[url]);
		return;
	}
	var sound = new Audio();
	sound.oncanplaythrough = function() {
		SoundUtils.loadedSounds[url] = sound;
		if (opt_callback) {
			opt_callback(sound);
		}
	};
	sound.src = url;
};


SoundUtils.loadSounds = function(urlMappings, opt_callback) {
	var sounds = {};
	var numSoundsToLoad = Object.keys(urlMappings).length;

	if (numSoundsToLoad == 0) {
		if (opt_callback) {
			opt_callback(sounds);
		}
		return;
	}

	for (var soundName in urlMappings) {
		if (!urlMappings.hasOwnProperty(soundName)) {
			continue;
		}

		SoundUtils.loadSound(urlMappings[soundName], (function(soundName) {
			return function(sound) {
				sounds[soundName] = sound;

				if (--numSoundsToLoad == 0 && opt_callback) {
					opt_callback(sounds);
				}
			};
		})(soundName));
	}
};

