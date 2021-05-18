/* js[view] */

domload(() => {
	const daneFirmyForm = $(`#companyInfoForm`);
	daneFirmyForm._children("[data-name]").forEach((field) => {
		field.setAttribute("autocomplete", Math.random().toPrecision(10));
	});

	Object.entries(company_info).forEach(([key, val]) => {
		const field = daneFirmyForm._child(`[data-name="${key}"]`);
		if (field) {
			field._set_value(val);
		}
	});

	$(".save_company_info_btn").addEventListener("click", () => {
		const params = {
			company_info: Object.fromEntries(daneFirmyForm._children("[data-name]").map((field) => [field.dataset.name, field._get_value()])),
		};

		xhr({
			url: STATIC_URLS["ADMIN"] + "/settings/save_company_info",
			params,
			success: () => {
				showNotification("Zapisano zmiany", { one_line: true, type: "success" });
			},
		});
	});
});
