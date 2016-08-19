/**
 * Object to store settings info
 */

//CHECK
var Settings = function() {
	// Fractional values
	// TODO : Consider making an array so that the fields are accessible by 
	// matching index.
	this.bgmVolume = Settings.DEFAULT_BGM_VOLUME;
	this.sfxVolume = Settings.DEFAULT_SFX_VOLUME;
};

Settings.DEFAULT_BGM_VOLUME = 1;
Settings.DEFAULT_SFX_VOLUME = 1;
//CHECK