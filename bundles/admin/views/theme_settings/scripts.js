/* js[view] */

domload(() => {
	/** @type {ThemeSettingsComp} */
	// @ts-ignore
	const theme_settings_comp = $("theme-settings-comp.main");
	ThemeSettingsComp(theme_settings_comp, undefined);

	theme_settings_comp._data.colors = colors_palette;
	theme_settings_comp._data.font_family = main_font_family;
	theme_settings_comp._data.font_sizes = font_sizes;
	theme_settings_comp._render();

	$(".main_header .custom_toolbar").append(theme_settings_comp._nodes.save_btn);
});
