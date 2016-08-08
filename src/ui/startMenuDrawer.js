/**
 * Draws the start menu, including the page with saved state options 
 */
StartMenuDrawer = {};

StartMenuDrawer.START_BACKGROUND_IMG;
StartMenuDrawer.START_BUTTON_IMG;
StartMenuDrawer.SAVED_STATES_BACKGROUND_IMG;
StartMenuDrawer.SAVED_STATE_BUTTON_IMGS;

StartMenuDrawer.PATH = '../assets/img/ui/startMenu/';

StartMenuDrawer.START_BUTTON_IMG_Y_OFFSET = 480;

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
		callback();
	});
};


StartMenuDrawer.draw = function(ctx) {
	switch (StartMenuDrawer.currentPage) {
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
	// TODO: when finalized, calculate positions as constants when images are 
		// loaded
	ctx.drawImage(StartMenuDrawer.START_BUTTON_IMG, 
			(StartMenuDrawer.START_BACKGROUND_IMG.width - 
					StartMenuDrawer.START_BUTTON_IMG.width) / 2, 
			StartMenuDrawer.START_BUTTON_IMG_Y_OFFSET);
};


StartMenuDrawer._helperDrawSavedStatesPage = function(ctx) {
	ctx.drawImage(StartMenuDrawer.SAVED_STATES_BACKGROUND_IMG, 0, 0);
	for (var i = 0; i < StartMenuDrawer.SAVED_STATE_BUTTON_IMGS.length; i++) {
		// TODO: when finalized, calculate positions as constants when images are 
		// loaded
		ctx.drawImage(StartMenuDrawer.SAVED_STATE_BUTTON_IMGS[i], 
				(i + 1) * ((StartMenuDrawer.START_BACKGROUND_IMG.width / 3) - 
						(StartMenuDrawer.SAVED_STATE_BUTTON_IMGS[i].height) / 2), 
				(StartMenuDrawer.SAVED_STATES_BACKGROUND_IMG.height - 
						StartMenuDrawer.SAVED_STATE_BUTTON_IMGS[i].height) / 2);
	}
};