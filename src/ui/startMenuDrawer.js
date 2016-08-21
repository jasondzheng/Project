/**
 * Draws the start menu, including the page with saved state options 
 */
StartMenuDrawer = {};

StartMenuDrawer.START_BACKGROUND_IMG;
StartMenuDrawer.START_BUTTON_IMG;
StartMenuDrawer.SAVED_STATES_BACKGROUND_IMG;
StartMenuDrawer.SAVED_STATE_BUTTON_IMGS;

StartMenuDrawer.PATH = '../assets/img/ui/startMenu/';

StartMenuDrawer.START_BUTTON_POS_Y = 480;

// The last recorded start click position.
StartMenuDrawer._lastStartClickX;
StartMenuDrawer._lastStartClickY;

StartMenuDrawer.Pages = {
	START_PAGE: 0,
	SAVED_STATES_PAGE: 1
};

// TODO: find somewhere to set
StartMenuDrawer._currentPage = StartMenuDrawer.Pages.START_PAGE;


StartMenuDrawer.setPage = function(pageIndex) {
	StartMenuDrawer._currentPage = pageIndex;
};


StartMenuDrawer.load = function(callback) {
	ImgUtils.loadImages({
		startBackground: StartMenuDrawer.PATH + 'startBackground.png',
		startButton: StartMenuDrawer.PATH + 'startButton.png',
		savedStatesBackground: StartMenuDrawer.PATH + 'savedStatesBackground.png',
		savedState1Button: StartMenuDrawer.PATH + 'savedState1Button.png',
		savedState2Button: StartMenuDrawer.PATH + 'savedState2Button.png',
		savedState3Button: StartMenuDrawer.PATH + 'savedState3Button.png'
	}, function(imgs) {
		StartMenuDrawer.START_BACKGROUND_IMG = imgs.startBackground;
		StartMenuDrawer.START_BUTTON_IMG = imgs.startButton;
		StartMenuDrawer.SAVED_STATES_BACKGROUND_IMG = imgs.savedStatesBackground;
		StartMenuDrawer.SAVED_STATE_BUTTON_IMGS = [
			imgs.savedState1Button,
			imgs.savedState2Button,
			imgs.savedState3Button
		];
		StartMenuDrawer.START_BUTTON_POS_X = 
				(StartMenuDrawer.START_BACKGROUND_IMG.width - 
				StartMenuDrawer.START_BUTTON_IMG.width) / 2;
		callback();
	});
};


StartMenuDrawer.updateCurrentScroll = function(delta) {
	// Currently unsupported
};

StartMenuDrawer.onStartClick = function(x, y) {
	StartMenuDrawer._lastStartClickX = x;
	StartMenuDrawer._lastStartClickY = y;
};

StartMenuDrawer.onDrag = function(x, y) {
	// Currently unsupported
};

StartMenuDrawer.onEndClick = function(x, y, isDoubleClick) {
	var startAndEndSameLoc = 
			Math.abs(StartMenuDrawer._lastStartClickX - x) < 
					MouseTracker.SAME_LOC_TOLERANCE && 
			Math.abs(StartMenuDrawer._lastStartClickY - y) < 
					MouseTracker.SAME_LOC_TOLERANCE;
	var possibleSavedStateIndex;
	switch(StartMenuDrawer._currentPage) {
		case StartMenuDrawer.Pages.START_PAGE:
			if (StartMenuDrawer._helperIsInStartButton(x, y) && startAndEndSameLoc) {
				StartMenuDrawer._currentPage = StartMenuDrawer.Pages.SAVED_STATES_PAGE;
			}
			break;
		case StartMenuDrawer.Pages.SAVED_STATES_PAGE:
			if ((possibleSavedStateIndex = 
					StartMenuDrawer._helperGetSavedStateButtonFromCoords(x, y)) != -1) {
				StartMenuScene.disableInput();
				GameState.saveData.setProfileIndex(possibleSavedStateIndex);
				ScreenEffectDrawer.fadeOut(function() {
					StartMenuDrawer._currentPage = StartMenuDrawer.Pages.START_PAGE;
					ScreenEffectDrawer.stayBlack();
					OverworldScene.init(function() {
						CoreModule.switchScene(OverworldScene);
						OverworldScene.disableInput();
						ScreenEffectDrawer.fadeIn(function() {
							OverworldScene.reenableInput();
						});
					});
				});
			}
			break;
	}
};

StartMenuDrawer.onHover = function(x, y) {
	// Currently unsupported
};


StartMenuDrawer.draw = function(ctx) {
	switch (StartMenuDrawer._currentPage) {
		case StartMenuDrawer.Pages.START_PAGE:
			StartMenuDrawer._helperDrawStartPage(ctx);
			break;
		case StartMenuDrawer.Pages.SAVED_STATES_PAGE:
			StartMenuDrawer._helperDrawSavedStatesPage(ctx);
			break;
	}
};


StartMenuDrawer._helperDrawStartPage = function(ctx) {
	ctx.drawImage(StartMenuDrawer.START_BACKGROUND_IMG, 0, 0);
	ctx.drawImage(StartMenuDrawer.START_BUTTON_IMG, 
			StartMenuDrawer.START_BUTTON_POS_X, StartMenuDrawer.START_BUTTON_POS_Y);
};


StartMenuDrawer._helperDrawSavedStatesPage = function(ctx) {
	ctx.drawImage(StartMenuDrawer.SAVED_STATES_BACKGROUND_IMG, 0, 0);
	for (var i = 0; i < StartMenuDrawer.SAVED_STATE_BUTTON_IMGS.length; i++) {
		// TODO: when finalized, calculate positions as constants when images are 
		// loaded
		ctx.drawImage(StartMenuDrawer.SAVED_STATE_BUTTON_IMGS[i], 
				(2 * i + 1) * (StartMenuDrawer.START_BACKGROUND_IMG.width / 
						(StartMenuDrawer.SAVED_STATE_BUTTON_IMGS.length * 2)) - 
				(StartMenuDrawer.SAVED_STATE_BUTTON_IMGS[i].width / 2), 
				(StartMenuDrawer.SAVED_STATES_BACKGROUND_IMG.height - 
						StartMenuDrawer.SAVED_STATE_BUTTON_IMGS[i].height) / 2);
	}
};


// Helper to check if the mouse is in the start button.
StartMenuDrawer._helperIsInStartButton = function(x, y) {
	return StartMenuDrawer._helperIsInRect(x, y, 
			StartMenuDrawer.START_BUTTON_POS_X, StartMenuDrawer.START_BUTTON_POS_Y, 
			StartMenuDrawer.START_BUTTON_IMG.width, 
			StartMenuDrawer.START_BUTTON_IMG.height);
};


// Helper function to return the saved state button that the mouse is in. 
// Returns -1 if the mouse is not in a saved state button.
StartMenuDrawer._helperGetSavedStateButtonFromCoords = function(x, y) {
	for (var i = 0; i < StartMenuDrawer.SAVED_STATE_BUTTON_IMGS.length; i++) {
		// TODO: when finalized, calculate positions as constants when images are 
		// loaded
		if (StartMenuDrawer._helperIsInRect(x, y, (2 * i + 1) * 
						(StartMenuDrawer.START_BACKGROUND_IMG.width / 
								(StartMenuDrawer.SAVED_STATE_BUTTON_IMGS.length * 2)) - 
						(StartMenuDrawer.SAVED_STATE_BUTTON_IMGS[i].width / 2), 
				(StartMenuDrawer.SAVED_STATES_BACKGROUND_IMG.height - 
						StartMenuDrawer.SAVED_STATE_BUTTON_IMGS[i].height) / 2, 
				StartMenuDrawer.SAVED_STATE_BUTTON_IMGS[i].width, 
				StartMenuDrawer.SAVED_STATE_BUTTON_IMGS[i].height)) {
			return i;
		}
	}
	return -1;
};


// Helper to check if the mouse is within a rectangle; used for rectanglular 
// button checks.
StartMenuDrawer._helperIsInRect = function(x, y, rectX, rectY, width, height) {
	return x > rectX && y > rectY && x < rectX + width && y < rectY + height;
};