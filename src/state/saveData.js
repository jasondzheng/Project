/**
 * Structure responsible for managing all data that should persist between
 * gameplays.
 */

var SaveData = function() {
	this.saveProfiles = [];
	this._currProfileIndex = 0;
	this.settingsInfo;
};

// Path to the listing of game vars and default values.
SaveData.GAME_VARS_PATH = '../assets/state/gameVars_compiled.json';


// Sets the current slot to be used in game.
SaveData.prototype.setProfileIndex = function(index) {
	this._currProfileIndex = index;
};


// Erases all save data and initializes new save info.
SaveData.prototype.cleanSlateInit = function(callback) {
	this.saveProfiles = [];
	this.settingsInfo = {
		// TODO: set these later
	};
	this.newGameInit(0 /* profileSlot */, callback);
};


SaveData.prototype.newGameInit = function(profileSlot, callback) {
	// TODO: initialize proper new game states and variables.
	var saveProfile = this.saveProfiles[profileSlot] = {
		variables: null,
		playerInfo: {}
	};
	JSONLoader.load(SaveData.GAME_VARS_PATH, function(data) {
		saveProfile.variables = data;
		callback();
	});
};


SaveData.prototype.deleteProfile = function(profileSlot) {
	this.saveProfiles[profileSlot] = null;
};


// Updates the player so that it mirrors the current save profile.
SaveData.prototype.updatePlayer = function(player) {
	player.applySaveData(this.saveProfiles[this._currProfileIndex].playerInfo);
};


// Assimilates a save JSON's data.
SaveData.prototype._assimilate = function(saveJson) {
	if (!saveJson) {
		this.cleanSlateInit(function() { });
		return;
	}
	this.saveProfiles = saveJson.saveProfiles;
	this.settingsInfo = saveJson.settingsInfo;
};


// Commits save data into locally stored memory.
SaveData.prototype.save = function() {
	if (GameState.player) {
		this.saveProfiles[this._currProfileIndex].playerInfo = 
				GameState.player.createSaveData();
	}
	// TODO: get settings info

	localStorage.setItem('saveData', JSON.stringify(this));
};


// Loads save data.
SaveData.loadSave = function() {
	var newSaveData = new SaveData();
	newSaveData._assimilate(JSON.parse(localStorage.getItem('saveData')));
	return newSaveData;
};


SaveData.prototype.setVar = function(name, value) {
	if (this.saveProfiles[this._currProfileIndex].variables[name] === undefined) {
		throw 'Accessing undefined game state variable';
	}
	this.saveProfiles[this._currProfileIndex].variables[name] = value;
};


SaveData.prototype.getVar = function(name) {
	var value = this.saveProfiles[this._currProfileIndex].variables[name];
	if (value === undefined) {
		throw 'Accessing undefined game state variable';
	}
	return value;
};