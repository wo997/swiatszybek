/* js[view] */

//@include(bundles/global/src/js/traits/password.js)

function accountExists(src) {
	$(`#loginForm .node_email`)._set_value($(`#registerForm .email`)._get_value());
	showModal("loginForm", { source: src });
}

function validateUserEmailExists() {
	const registerForm = $(`#registerForm`);
	const email = registerForm._child(".email");

	xhr({
		url: "/user/validate_email",
		params: {
			email: email._get_value(),
		},
		success: (res) => {
			let errors = [];
			if (res.status == "exists") {
				let message = "";
				let log_html = "";
				if (!IS_LOGGED) {
					log_html += html` <b class="link" onclick="accountExists(this)">ZALOGUJ SIĘ</b>`;
				}
				message += html`<span style="color: black">To konto jest aktywne</span> ${log_html}`;
				errors.push(message);
			} else if (res.status == "unauthenticated") {
				errors.push(
					html`<span style="color: black">
						Konto istnieje
						<b class="link" onclick="registerUser({user_id:${res.user_id}})"> WYŚLIJ LINK AKTYWACYJNY</b>
					</span>`
				);
			} else if (res.status == "invalid") {
				errors.push("Wpisz poprawny adres email");
			}

			showInputErrors(email, errors);
		},
	});
}

domload(() => {
	const registerForm = $(`#registerForm`);
	const email = registerForm._child(`.email`);

	if (register_email) {
		email._set_value(register_email);
	}

	$("#registerForm .submit_btn").addEventListener("click", () => {
		const registerForm = $(`#registerForm`);

		const errors = validateInputs(registerForm._children(".password_rewrite, .password, .email"));
		if (errors.length > 0) {
			return;
		}

		const params = {
			email: registerForm._child(".email")._get_value(),
			password: registerForm._child(".password")._get_value(),
		};
		registerUser(params);
	});
});
