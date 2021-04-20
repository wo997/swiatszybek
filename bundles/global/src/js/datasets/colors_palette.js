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

function loadedThemeSettings() {
	window.dispatchEvent(new CustomEvent("theme_settings_changed"));
}
