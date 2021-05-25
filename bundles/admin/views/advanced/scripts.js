/* js[view] */

domload(() => {
	const advancedSettingsForm = $(`#advancedSettingsForm`);

	Object.entries(advanced_settings).forEach(([key, val]) => {
		const field = advancedSettingsForm._child(`[data-name="${key}"]`);
		if (field) {
			field._set_value(val);
		}
	});

	$(".main_header .save_btn").addEventListener("click", () => {
		const params = {
			advanced_settings: Object.fromEntries(
				advancedSettingsForm._children("[data-name]").map((field) => [field.dataset.name, field._get_value()])
			),
		};

		xhr({
			url: STATIC_URLS["ADMIN"] + "/settings/save_advanced_settings",
			params,
			success: () => {
				showNotification("Zapisano zmiany", { one_line: true, type: "success" });
			},
		});
	});
});
