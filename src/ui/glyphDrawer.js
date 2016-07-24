/**
 * Draws glyphs onto the screen. Allows support for word wrap given rectangular
 * constraints, trying its best to fit letters in the space and running over
 * only if unable to fit all text (text will be cut out!).
 */

var GlyphDrawer = {};

GlyphDrawer.GLYPH_PATH = '../assets/glyphs/';
GlyphDrawer.GLYPH_NAMES = ['test'];

GlyphDrawer.LINE_SPACING = 2;
GlyphDrawer.CHAR_SPACING = 1;

GlyphDrawer.GLYPH_DERIVATIONS = [{
	glyphset: 'test',
	size: '2'
}];

GlyphDrawer.glyphs = {};


// Loads all of the game glyphsets. Also creates derived glyphsets.
GlyphDrawer.loadGlyphs = function(callback) {
	var glyphsToLoad = GlyphDrawer.GLYPH_NAMES.length;
	for (var i = 0; i < GlyphDrawer.GLYPH_NAMES.length; i++) {
		(function(i) {
			ImgUtils.loadImage(GlyphDrawer.GLYPH_PATH + GlyphDrawer.GLYPH_NAMES[i] + 
					'/glyphs.png', function(img) {
				JSONLoader.load(GlyphDrawer.GLYPH_PATH + GlyphDrawer.GLYPH_NAMES[i] + 
						'/data.json', function(json) {
					json.glyphs = img;
					GlyphDrawer.glyphs[GlyphDrawer.GLYPH_NAMES[i]] = json;
					if (--glyphsToLoad == 0) {
						// Prepare font derivations after all glyphs are loaded
						for (var j = 0; j < GlyphDrawer.GLYPH_DERIVATIONS.length; j++) {
							var baseGlyphset = 
									GlyphDrawer.glyphs[GlyphDrawer.GLYPH_DERIVATIONS[j].glyphset];
							if (!baseGlyphset) {
								throw 'Glyphset [' + GlyphDrawer.GLYPH_DERIVATIONS[j].glyphset + 
										'] in font derivation not defined';
							}
							// Scale up base glyphset properties for derived glyphset
							var derivedGlyphset = {};
							derivedGlyphset.glyphData = {};
							derivedGlyphset.linePos = baseGlyphset.linePos * 
									GlyphDrawer.GLYPH_DERIVATIONS[j].size;
							derivedGlyphset.lineSpacing = baseGlyphset.lineSpacing * 
									GlyphDrawer.GLYPH_DERIVATIONS[j].size;
							for (var glyphChar in baseGlyphset.glyphData) {
								if (!baseGlyphset.glyphData.hasOwnProperty(glyphChar)) {
									continue;
								}
								derivedGlyphset.glyphData[glyphChar] = {
									x: baseGlyphset.glyphData[glyphChar].x * 
											GlyphDrawer.GLYPH_DERIVATIONS[j].size,
									y: baseGlyphset.glyphData[glyphChar].y * 
											GlyphDrawer.GLYPH_DERIVATIONS[j].size,
									width: baseGlyphset.glyphData[glyphChar].width * 
											GlyphDrawer.GLYPH_DERIVATIONS[j].size,
									height: baseGlyphset.glyphData[glyphChar].height * 
											GlyphDrawer.GLYPH_DERIVATIONS[j].size,
									lineHeight:baseGlyphset.glyphData[glyphChar].lineHeight * 
											GlyphDrawer.GLYPH_DERIVATIONS[j].size
								};
							}
							// Reconstruct glyph image, scaling to a canvas
							derivedGlyphset.glyphs = document.createElement('canvas');
							derivedGlyphset.glyphs.width = baseGlyphset.glyphs.width * 
									GlyphDrawer.GLYPH_DERIVATIONS[j].size;
							derivedGlyphset.glyphs.height = baseGlyphset.glyphs.height * 
									GlyphDrawer.GLYPH_DERIVATIONS[j].size;
							var ctx = derivedGlyphset.glyphs.getContext('2d');
							ctx.drawImage(baseGlyphset.glyphs, 0, 0, 
									derivedGlyphset.glyphs.width, 
									derivedGlyphset.glyphs.height);
							GlyphDrawer.glyphs[GlyphDrawer.GLYPH_DERIVATIONS[j].glyphs + 
											'_' + GlyphDrawer.GLYPH_DERIVATIONS[j].size] = 
									derivedGlyphset;
						}
						callback();
					}
				});			
			});
		})(i);
	}
};


GlyphDrawer.drawText = function(ctx, setName, text, x, y, width, height) {
	var glyphset = GlyphDrawer.glyphs[setName];
	if (!glyphset) {
		throw 'Unavailable glyphset [' + setName + ']';
	}
	var currLine = 0;
	var lineStart = 0;
	var possibleLineEnd = 0;
	var widthLeft = width;
	for (var i = 0; i < text.length; i++) {
		var currChar = text.charAt(i);
		var charProps = glyphset.glyphData[currChar];
		// If any character exceeds the height limit, do not draw any more glyphs
		if (charProps.height > height) {
			return;
		}
		if (currChar == ' ') {
			possibleLineEnd = i;
		}
		if ((widthLeft -= charProps.width + GlyphDrawer.CHAR_SPACING) < 0 || 
				i == text.length - 1) {
			if (i == text.length - 1) {
				possibleLineEnd = text.length;
			}
			// Draw all characters from possibleLineEnd to lineStart
			var letterX = 0;
			for (var j = lineStart; j < possibleLineEnd; j++) {
				var drawnCharProps = glyphset.glyphData[text.charAt(j)];
				ctx.drawImage(glyphset.glyphs, drawnCharProps.x, drawnCharProps.y, 
						drawnCharProps.width, drawnCharProps.height, x + letterX, 
						y + currLine * (glyphset.lineSpacing + GlyphDrawer.LINE_SPACING) + 
								glyphset.linePos - drawnCharProps.lineHeight, 
						drawnCharProps.width, drawnCharProps.height);
				letterX += drawnCharProps.width + GlyphDrawer.CHAR_SPACING;
			}
			currLine++;
			lineStart = possibleLineEnd + 1;
			possibleLineEnd = lineStart;
			widthLeft = width;
			height -= glyphset.lineSpacing + GlyphDrawer.LINE_SPACING;
		}
	}
};