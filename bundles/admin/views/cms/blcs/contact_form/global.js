/* js[modules/contact_form] */

domload(() => {
	const contactForm = $("#contactForm");
	contactForm.addEventListener("submit", (ev) => {
		ev.preventDefault();

		const errors = validateInputs(contactForm._children("[data-name]"));

		if (errors.length > 0) {
			return;
		}

		showLoader(contactForm);
		xhr({
			url: "/send_contact_form_email",
			params: Object.fromEntries(contactForm._children("[data-name]").map((field) => [field.dataset.name, field._get_value()])),
			success: (res) => {
				hideLoader(contactForm);
				showNotification(`<div class="header">Sukces</div>Wysłano wiadomość`);

				contactForm._children("[data-name]").forEach((input) => {
					input._set_value("", { quiet: true });
				});
				clearInputsErrors(contactForm._children("[data-name]"));
			},
		});
	});
});
