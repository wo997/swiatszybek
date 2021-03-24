/* js[view] */

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
					log_html += html` <b style="color:var(--success-clr);" class="link" onclick="accountExists(this)">ZALOGUJ SIĘ</b>`;
				}
				message += html`<span style="color: black">To konto jest aktywne</span> ${log_html}`;
				errors.push(message);
			} else if (res.status == "unauthenticated") {
				errors.push(
					html`<span style="color: black">
						Konto istnieje
						<b style="color:var(--success-clr);" class="link" onclick="registerUser({user_id:${res.user_id}})"> WYŚLIJ LINK AKTYWACYJNY</b>
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

	let password_visible = false;
	const toggle_password = registerForm._child(`.toggle_password`);
	toggle_password.addEventListener("click", () => {
		password_visible = !password_visible;
		toggle_password.dataset.tooltip = password_visible ? "Ukryj hasło" : "Pokaż hasło";
		const i = toggle_password._child("i");
		i.classList.toggle("fa-eye", !password_visible);
		i.classList.toggle("fa-eye-slash", password_visible);
		registerForm._children(`.password, .password_rewrite`).forEach((e) => {
			e.setAttribute("type", password_visible ? "text" : "password");
		});
	});

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

	$$(".password_requirements p").forEach((p) => {
		p.insertAdjacentHTML(
			"afterbegin",
			html`
				<i class="fas fa-check"></i>
				<i class="fas fa-times"></i>
			`
		);
	});

	const password = registerForm._child(`.password`);
	const psswchng = () => {
		const value = password._get_value();

		$(".password_requirements .eigth_characters").classList.toggle("correct", value.length >= 8);
		$(".password_requirements .one_small_letter").classList.toggle("correct", value.match(/[a-z]/));
		$(".password_requirements .one_big_letter").classList.toggle("correct", value.match(/[A-Z]/));
		$(".password_requirements .one_digit").classList.toggle("correct", value.match(/\d/));
	};
	password.addEventListener("input", psswchng);
	password.addEventListener("change", psswchng);
});
