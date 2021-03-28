/* js[view] */

domload(() => {
	const daneFirmyForm = $(`#daneFirmyForm`);
	// daneFirmyForm._children("[data-name]").forEach(field => {

	// })
	Object.entries(company_info).forEach(([key, val]) => {
		const field = daneFirmyForm._child(`[data-name="${key}"]`);
		if (field) {
			field._set_value(val);
		}
	});

	$(".save_company_info_btn").addEventListener("click", () => {
		const params = {
			company: Object.fromEntries(daneFirmyForm._children("[data-name]").map((field) => [field.dataset.name, field._get_value()])),
		};
		console.log(params);
		return;

		xhr({
			url: STATIC_URLS["ADMIN"] + "/save_dane_firmy",
			params,
			success: () => {
				window.location.reload();
			},
		});
	});
});
