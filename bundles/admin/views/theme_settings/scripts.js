/* js[view] */

domload(() => {
	/** @type {ThemeSettingsComp} */
	// @ts-ignore
	const theme_settings_comp = $("theme-settings-comp.main");
	ThemeSettingsComp(theme_settings_comp, undefined);

	const data = theme_settings_comp._data;

	data.colors = colors_palette;
	data.font_family = main_font_family;
	data.font_sizes = font_sizes;
	data.container_max_width = container_max_width;
	theme_settings_comp._render();

	$(".main_header .custom_toolbar").append(theme_settings_comp._nodes.save_btn);
});
