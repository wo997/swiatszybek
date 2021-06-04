/* js[view] */

domload(() => {
	/** @type {ThemeSettingsComp} */
	// @ts-ignore
	const theme_settings_comp = $("theme-settings-comp.main");
	ThemeSettingsComp(theme_settings_comp, undefined);

	setThemeSettingsCompData(theme_settings_comp);

	$(".main_header .custom_toolbar").append(theme_settings_comp._nodes.save_btn);
});
