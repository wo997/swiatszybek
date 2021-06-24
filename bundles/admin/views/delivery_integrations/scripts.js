/* js[view] */

domload(() => {
	const deliveryIntegrationsForm = $(`#deliveryIntegrationsForm`);

	Object.entries(delivery_integrations_data).forEach(([key, val]) => {
		const field = deliveryIntegrationsForm._child(`[data-name="${key}"]`);
		if (field) {
			field._set_value(val);
		}
	});

	$(".save_delivery_integrations_btn").addEventListener("click", () => {
		const params = {
			delivery_integrations: Object.fromEntries(
				deliveryIntegrationsForm._children("[data-name]").map((field) => [field.dataset.name, field._get_value()])
			),
		};

		xhr({
			url: STATIC_URLS["ADMIN"] + "/settings/save_delivery_integrations",
			params,
			success: () => {
				showNotification("Zapisano zmiany", { one_line: true, type: "success" });
			},
		});
	});
});
