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

StartMenuDrawer._currentSelectedSavedStateIndex = null;

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
		// Remove unnecesary references.
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

		StartMenuDrawer._startButton = new Button(imgs.startButton, false, 
				function() {
					StartMenuDrawer._currentPage = 
							StartMenuDrawer.Pages.SAVED_STATES_PAGE;
				});

		StartMenuDrawer._savedStateButtons = []
		for (var i = 0; i < StartMenuDrawer.SAVED_STATE_BUTTON_IMGS.length; i++) {
			StartMenuDrawer._savedStateButtons.push(new Button(
					StartMenuDrawer.SAVED_STATE_BUTTON_IMGS[i], false, 
					StartMenuDrawer.onSavedStateButtonPress(0)));
		}

		StartMenuDrawer._savedStateButtonPositions = [];
		for (var i = 0; i < StartMenuDrawer._savedStateButtons.length; i++) {
			StartMenuDrawer._savedStateButtonPositions.push({
				x: (2 * i + 1) * (StartMenuDrawer.START_BACKGROUND_IMG.width / 
						(StartMenuDrawer.SAVED_STATE_BUTTON_IMGS.length * 2)) - 
						(StartMenuDrawer.SAVED_STATE_BUTTON_IMGS[i].width / 2),
				y: (StartMenuDrawer.SAVED_STATES_BACKGROUND_IMG.height - 
						StartMenuDrawer.SAVED_STATE_BUTTON_IMGS[i].height) / 2
			})
		}

		callback();
	});
};


// Produces a function for each saved state button given the desired save 
// profile index.
StartMenuDrawer.onSavedStateButtonPress = function(index) {
	return function() {
		StartMenuScene.disableInput();
		GameState.saveData.setProfileIndex(index);
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
};


StartMenuDrawer.updateCurrentScroll = function(delta) {
	// Currently unsupported
};

StartMenuDrawer.onStartClick = function(x, y) {
	StartMenuDrawer._lastStartClickX = x;
	StartMenuDrawer._lastStartClickY = y;
	switch (StartMenuDrawer._currentPage) {
		case StartMenuDrawer.Pages.START_PAGE:
			StartMenuDrawer._startButton.isClicked = 
			StartMenuDrawer._startButton.isHovered =
					StartMenuDrawer._startButton.isInButton(
							x - StartMenuDrawer.START_BUTTON_POS_X, 
							y - StartMenuDrawer.START_BUTTON_POS_Y);
			break;
		case StartMenuDrawer.Pages.SAVED_STATES_PAGE:
			var possibleSavedStateIndex;
			if ((possibleSavedStateIndex = 
					StartMenuDrawer._helperGetSavedStateButtonFromCoords(x, y)) != -1) {
				StartMenuDrawer._savedStateButtons[possibleSavedStateIndex].isClicked = 
						true;
				StartMenuDrawer._currentSelectedSavedStateIndex = 
						possibleSavedStateIndex;
				StartMenuDrawer._savedStateButtons[
						possibleSavedStateIndex].isClicked = true;
				StartMenuDrawer._savedStateButtons[
						possibleSavedStateIndex].isHovered = true;
			}
			break;
	}
};

StartMenuDrawer.onDrag = function(x, y) {
	switch (StartMenuDrawer._currentPage) {
		case StartMenuDrawer.Pages.START_PAGE:
			StartMenuDrawer._startButton.isClicked = 
					StartMenuDrawer._startButton.isInButton(
							x - StartMenuDrawer.START_BUTTON_POS_X, 
							y - StartMenuDrawer.START_BUTTON_POS_Y);
			break;
		case StartMenuDrawer.Pages.SAVED_STATES_PAGE:
			break;
	}
};

StartMenuDrawer.onEndClick = function(x, y, isDoubleClick) {
	var startAndEndSameLoc = 
			Math.abs(StartMenuDrawer._lastStartClickX - x) < 
					MouseTracker.SAME_LOC_TOLERANCE && 
			Math.abs(StartMenuDrawer._lastStartClickY - y) < 
					MouseTracker.SAME_LOC_TOLERANCE;
	switch(StartMenuDrawer._currentPage) {
		case StartMenuDrawer.Pages.START_PAGE:
			if (StartMenuDrawer._startButton.isInButton(
					x - StartMenuDrawer.START_BUTTON_POS_X, 
					y - StartMenuDrawer.START_BUTTON_POS_Y) && startAndEndSameLoc) {
				StartMenuDrawer._startButton.onClick();
				StartMenuDrawer._startButton.isClicked = false;
				StartMenuDrawer._startButton.isHovered = false;
			}
			break;
		case StartMenuDrawer.Pages.SAVED_STATES_PAGE:
			var possibleSavedStateIndex;
			if ((possibleSavedStateIndex = 
					StartMenuDrawer._helperGetSavedStateButtonFromCoords(x, y)) != -1 && 
					startAndEndSameLoc) {
				StartMenuDrawer._savedStateButtons[possibleSavedStateIndex].onClick();
			} 
			if (StartMenuDrawer._currentSelectedSavedStateIndex != null){
				StartMenuDrawer._savedStateButtons[
						StartMenuDrawer._currentSelectedSavedStateIndex].isClicked = false;
				StartMenuDrawer._savedStateButtons[
						StartMenuDrawer._currentSelectedSavedStateIndex].isHovered = false;
			}
			break;
	}
};

StartMenuDrawer.onHover = function(x, y) {
	switch (StartMenuDrawer._currentPage) {
		case StartMenuDrawer.Pages.START_PAGE:
				StartMenuDrawer._startButton.isHovered = 
						StartMenuDrawer._startButton.isInButton(
								x - StartMenuDrawer.START_BUTTON_POS_X, 
								y - StartMenuDrawer.START_BUTTON_POS_Y);
			break;
		case StartMenuDrawer.Pages.SAVED_STATES_PAGE:
			var possibleSavedStateIndex;
			if ((possibleSavedStateIndex = 
					StartMenuDrawer._helperGetSavedStateButtonFromCoords(x, y)) != -1) {
				StartMenuDrawer._currentSelectedSavedStateIndex = 
						possibleSavedStateIndex;
				StartMenuDrawer._savedStateButtons[
							StartMenuDrawer._currentSelectedSavedStateIndex].isHovered = true;
			} else {
				if (StartMenuDrawer._currentSelectedSavedStateIndex != null) {
					StartMenuDrawer._savedStateButtons[
							StartMenuDrawer._currentSelectedSavedStateIndex].isHovered = 
									false;
				}
				StartMenuDrawer._currentSelectedSavedStateIndex = null;
			}
			break;
	}
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


StartMenuDrawer.tick = function() {
	StartMenuDrawer._startButton.tick();
	for (var i = 0; i < StartMenuDrawer._savedStateButtons.length; i++) {
		StartMenuDrawer._savedStateButtons[i].tick();
	}
};


StartMenuDrawer._helperDrawStartPage = function(ctx) {
	ctx.drawImage(StartMenuDrawer.START_BACKGROUND_IMG, 0, 0);
	StartMenuDrawer._startButton.draw(ctx,
			StartMenuDrawer.START_BUTTON_POS_X, StartMenuDrawer.START_BUTTON_POS_Y);
};


StartMenuDrawer._helperDrawSavedStatesPage = function(ctx) {
	ctx.drawImage(StartMenuDrawer.SAVED_STATES_BACKGROUND_IMG, 0, 0);
	for (var i = 0; i < StartMenuDrawer.SAVED_STATE_BUTTON_IMGS.length; i++) {
		// TODO: when finalized, calculate positions as constants when images are 
		// loaded
		// ctx.drawImage(StartMenuDrawer.SAVED_STATE_BUTTON_IMGS[i], 
		// 		(2 * i + 1) * (StartMenuDrawer.START_BACKGROUND_IMG.width / 
		// 				(StartMenuDrawer.SAVED_STATE_BUTTON_IMGS.length * 2)) - 
		// 		(StartMenuDrawer.SAVED_STATE_BUTTON_IMGS[i].width / 2), 
		// 		(StartMenuDrawer.SAVED_STATES_BACKGROUND_IMG.height - 
		// 				StartMenuDrawer.SAVED_STATE_BUTTON_IMGS[i].height) / 2);
		StartMenuDrawer._savedStateButtons[i].draw(ctx, 
				StartMenuDrawer._savedStateButtonPositions[i].x,
				StartMenuDrawer._savedStateButtonPositions[i].y);
	}
};


// Helper function to return the saved state button that the mouse is in. 
// Returns -1 if the mouse is not in a saved state button.
StartMenuDrawer._helperGetSavedStateButtonFromCoords = function(x, y) {
	for (var i = 0; i < StartMenuDrawer.SAVED_STATE_BUTTON_IMGS.length; i++) {
		// TODO: when finalized, calculate positions as constants when images are 
		// loaded
		if (StartMenuDrawer._savedStateButtons[i].isInButton(
				x - StartMenuDrawer._savedStateButtonPositions[i].x, 
				y - StartMenuDrawer._savedStateButtonPositions[i].y)) {
			return i;
		}
	}
	return -1;
};