/* js[view] */

//@include(bundles/global/src/js/traits/password.js)

domload(() => {
	const changePasswordForm = $("#changePasswordForm");
	changePasswordForm._child(".submit_btn").addEventListener("click", () => {
		const current_password_input = changePasswordForm._child(".current_password");
		const current_password = current_password_input._get_value();
		if (!current_password) {
			showNotification("Musisz podać obecne hasło", { type: "error", one_line: true });
			return;
		}

		const errors = validateInputs(changePasswordForm._children(".password_rewrite, .password"));
		if (errors.length > 0) {
			return;
		}

		showLoader();
		xhr({
			url: STATIC_URLS["USER"] + "/change_password",
			params: {
				current_password,
				password: changePasswordForm._child(".password")._get_value(),
			},
			success: (res) => {
				hideLoader();
				if (res.success) {
					let body = html`Hasło zostało zresetowane`;
					let footer = html`
						<button class="btn primary" onclick="window.location.reload()">Ok</a>
					`;

					showMessageModal(getMessageHTML({ type: "success", body, footer }));
				} else {
					showMessageModal(
						getMessageHTML({
							type: res.is_info ? "info" : "error",
							body: def(res.errors, ["Wystąpił błąd zmiany hasła"]).join("<br>"),
						})
					);
				}
			},
		});
	});
});
