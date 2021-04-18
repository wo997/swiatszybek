/* js[!global] */

/**
 * @typedef {{
 * name: string
 * value: string
 * }} PaletteColorData
 *
 */

/**
 * @type {PaletteColorData[]}
 */
let colors_palette = [];

function loadedColorPalette() {
	window.dispatchEvent(new CustomEvent("color_palette_changed"));
}
