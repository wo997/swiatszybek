/* js[view] */

domload(() => {
	const additionalScriptsForm = $(`#additionalScriptsForm`);

	Object.entries(additional_scripts).forEach(([key, val]) => {
		const field = additionalScriptsForm._child(`[data-name="${key}"]`);
		if (field) {
			field._set_value(val);
		}
	});

	$(".main_header .save_btn").addEventListener("click", () => {
		const params = {
			additional_scripts: Object.fromEntries(
				additionalScriptsForm._children("[data-name]").map((field) => [field.dataset.name, field._get_value()])
			),
		};

		xhr({
			url: STATIC_URLS["ADMIN"] + "/settings/save_additional_scripts",
			params,
			success: () => {
				showNotification("Zapisano zmiany", { one_line: true, type: "success" });
			},
		});
	});
});
