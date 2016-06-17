// A collection of handy image-related utility functions.
// Author: [your tag here]

var ImgUtils = {};


// Draws a trapezium out of a rectangular sprite. Draws to a canvas using
// the given top edge, bottom edge, y, and height dimensions.
ImgUtils.drawTrapezium = function(ctx, img, x1, x2, y, startWidth, endWidth, 
		height) {
	var actualImgHeight = img.height, actualImgWidth = img.width;
	for (var i = 0; i < height; i++) {
		ctx.drawImage(img, 0, (i / height * actualImgHeight), 
				actualImgWidth, 1, ((x2 - x1) * i / height + x1), y + i, 
				((endWidth - startWidth) * i / height + startWidth), 1);
	}
};


// Loads an image into an offscreen Image element. Used for loading images
// to be drawn onto canvases; callback called on completion.
ImgUtils.loadImage = function(url, opt_callback) {
	var img = new Image();
	img.onload = function() {
		if (opt_callback) {
			opt_callback(img);
		}
	};
	img.src = url;
};


// Loads a set of images before calling a callback. Takes in a mapping of
// intended image names to urls and provides back a mapping of names to images.
ImgUtils.loadImages = function(urlMappings, opt_callback) {
	var images = {};
	var numImagesToLoad = Object.keys(urlMappings).length;

	for (var imgName in urlMappings) {
		if (!urlMappings.hasOwnProperty(imgName)) {
			continue;
		}

		ImgUtils.loadImage(urlMappings[imgName], (function(imgName) {
			return function(img) {
				images[imgName] = img;

				if (--numImagesToLoad == 0 && opt_callback) {
					opt_callback(images);
				}
			};
		})(imgName));
	}
};