var SoundLoader = {};

// Used for loading sound clips. Calls callback with a mapping of names to
// loaded buffers on completion.
SoundLoader.loadSounds = function(soundList, opt_callback) {
	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	var context = SoundLoader.context || 
			(SoundLoader.context = new AudioContext());
	var sounds = {};
	var numSoundsToLoad = Object.keys(soundList).length;
	var loadSound = function(name, url, context) {
		var req = new XMLHttpRequest();
		req.open('GET', url, true);
		req.responseType = 'arraybuffer';
		req.onload = function() {
			context.decodeAudioData(req.response, function(buffer) {
				sounds[name] = buffer;
				buffer.playSound = function(opt_time) {
					opt_time = opt_time || 0;
					var source = context.createBufferSource();
					source.buffer = buffer;
					source.connect(context.destination);
					source.start(opt_time); 
				};
				if (--numSoundsToLoad == 0 && opt_callback) {
					opt_callback(sounds);
				}
			});
		};
		req.send();
	};
	for (var soundName in soundList) {
		if (!soundList.hasOwnProperty(soundName)) {
			continue;
		}
		loadSound(soundName, soundList[soundName], context);
	}
};


// Loads an Audio element for playing tracks. Used to play music and get timing
// for playback
SoundLoader.loadTrack = function(url, opt_callback) {
	var track = new Audio();
	track.preload = 'auto';
	track.oncanplaythrough = function() {
		if (opt_callback) {
			opt_callback(track);
		}
	};
	track.src = url;
};


// Loads all tracks within a provided array of urls. Returns an array of the 
// loaded tracks
SoundLoader.loadTracks = function(urls, opt_callback) {
	var tracks = {};
	var tracksToLoad = Object.keys(urls).length;
	for (var urlKey in urls) {
		SoundLoader.loadTrack(urls[urlKey], (function(urlKey) {
			return function(track) {
				tracks[urlKey] = track;
				if (--tracksToLoad == 0 && opt_callback) {
					opt_callback(tracks);
				}
			}
		})(urlKey));
	}
};


SoundLoader.BEATMAP_PATH = '../assets/tracks/';


SoundLoader.loadBeatmap = function(name, opt_callback) {
	SoundLoader.loadTrack(SoundLoader.BEATMAP_PATH + name + '/track.mp3', 
			function(track) {
		JSONLoader.load(SoundLoader.BEATMAP_PATH + name + '/beatmap.json', 
				function(beatmap) {
			if (opt_callback) {
				opt_callback({
					audio: track,
					beatmap: beatmap
				});
			}
		});
	});
};


SoundLoader.loadBeatmaps = function(names, opt_callback) {
	var tracks = {};
	var tracksToLoad = Object.keys(names).length;
	for (var trackName in names) {
		SoundLoader.loadBeatmap(names[trackName], (function(trackName) {
			return function(beatmap) {
				tracks[trackName] = beatmap;
				if (--tracksToLoad == 0 && opt_callback) {
					opt_callback(tracks);
				}
			}
		})(trackName));
	}
};