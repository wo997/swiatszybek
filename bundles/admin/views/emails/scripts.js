/* js[view] */

domload(() => {
	const main_email = def(company_data["main_email"], "").trim();
	window.order_emails_list_id = createSimpleList({
		name: "order_emails",
		data_type: "json",
		fields: {
			email: {
				unique: true,
			},
		},
		render: (data) => {
			return html`<input type="text" class="field warn-outline" style="flex-grow:1" name="email" data-validate="email" /> `;
		},
		default_row: {
			email: "",
		},
		onChange: (values, list) => {
			var add_main_email_btn = $(".add_main_to_orders");
			if (add_main_email_btn) {
				var has_main_email = !!values.find((e) => e.email.trim() == main_email);
				add_main_email_btn.classList.toggle("hidden", has_main_email || !main_email);
			}

			setTimeout(() => {
				registerForms();
			});
		},
	});

	window.daily_report_emails_list_id = createSimpleList({
		name: "daily_report_emails",
		data_type: "json",
		fields: {
			email: {
				unique: true,
			},
		},
		render: (data) => {
			return html`<input type="text" class="field warn-outline" style="flex-grow:1" name="email" data-validate="email" /> `;
		},
		default_row: {
			email: "",
		},
		onChange: (values, list) => {
			var add_main_email_btn = $(".add_main_to_daily_report");
			if (add_main_email_btn) {
				var has_main_email = !!values.find((e) => e.email.trim() == main_email);
				add_main_email_btn.classList.toggle("hidden", has_main_email || !main_email);
			}

			// TODO: might not be neeeded
			setTimeout(() => {
				registerForms();
			});
		},
	});

	setFormData(maile, `#maileForm`);
});

function saveMaile() {
	var form = $(`#maileForm`);

	if (!validateForm(form)) {
		return;
	}

	var params = {
		emails: getFormData(form),
	};

	xhr({
		url: STATIC_URLS["ADMIN"] + "/save_emails",
		params: params,
		success: () => {
			setFormInitialState(form);
		},
	});
}
