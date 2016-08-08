/**
 * A class describing the position of the overworld draw camera on the map.
 * The position is at which the camera's center is focused onto.
 */
var Camera = {};

// Map coordinate X and Y position the camera is centered on.
Camera.x = 0;
Camera.y = 0;

Camera.Modes = {
	// Tracks the player on the map by following the player's center
	TRACK_PLAYER: 0,
	// Locks the camera at a fixed location independent of the player
	LOCK: 1
};

Camera.DEFAULT_MODE = Camera.Modes.TRACK_PLAYER;

// The mode of the camera.
Camera._currentMode = Camera.DEFAULT_MODE;


// Sets the camera's operation mode.
Camera.setMode = function(cameraMode) {
	Camera._currentMode = cameraMode;
};


Camera.tick = function() {
	if (Camera._currentMode == Camera.Modes.TRACK_PLAYER && GameState.player) {
		// Track the player by centering on player's map coordinates.
		Camera.x = GameState.player.getPositionX();
		Camera.y = GameState.player.getPositionY();
	}
};
