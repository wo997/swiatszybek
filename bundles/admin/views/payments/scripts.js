/* js[view] */

domload(() => {
	const paymentsForm = $(`#paymentsForm`);

	Object.entries(payments_data).forEach(([key, val]) => {
		const field = paymentsForm._child(`[data-name="${key}"]`);
		if (field) {
			field._set_value(val);
		}
	});

	$(".save_payments_btn").addEventListener("click", () => {
		const params = {
			payments: Object.fromEntries(paymentsForm._children("[data-name]").map((field) => [field.dataset.name, field._get_value()])),
		};

		xhr({
			url: STATIC_URLS["ADMIN"] + "/settings/save_payments",
			params,
			success: () => {
				showNotification("Zapisano zmiany", { one_line: true, type: "success" });
			},
		});
	});
});
