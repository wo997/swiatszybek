/* js[!global] */

let fonts = {};
let main_font_family = "";

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
let colors_palette;

/**
 * @typedef {{
 * name: string
 * df_value: string
 * bg_value: string
 * md_value: string
 * sm_value: string
 * }} FontSizeData
 *
 */

/**
 * @type {FontSizeData[]}
 */
let font_sizes;

function loadedThemeSettings() {
	window.dispatchEvent(new CustomEvent("theme_settings_changed"));
}
