/* js[view] */

function accountExists(src) {
	$(`#loginForm .node_email`)._set_value($(`#registerForm .email`)._get_value());
	showModal("loginForm", { source: src });
}

function validateUserEmailExists() {
	const registerForm = $(`#registerForm`);
	const email = registerForm._child(".email");

	xhr({
		url: "/validate_email",
		params: {
			email: email._get_value(),
		},
		success: (res) => {
			let errors = [];
			if (res == "exists") {
				let message = html`<span style="color: black"></span>`;
				message += html`To konto jest aktywne`;
				if (!IS_LOGGED) {
					message += html` <b style="color:var(--success-clr);" class="link" onclick="accountExists(this)">ZALOGUJ SIĘ</b>`;
				}
				message += html`</span>`;
				errors.push(message);
			} else if (res == "unauthenticated") {
				errors.push(
					html`<span style="color: black">
						Konto istnieje
						<b style="color:var(--success-clr);" class="link" onclick="register(false)"> WYŚLIJ LINK AKTYWACYJNY</b>
					</span>`
				);
			} else if (res == "invalid") {
				errors.push("Wpisz poprawny adres email");
			}

			$("#registerForm .submit_btn").toggleAttribute("disabled", errors.length > 0);

			showInputErrors(email, errors);
		},
	});
}

function registerUser(user_id = undefined) {
	const registerForm = $(`#registerForm`);

	if (user_id === undefined) {
		const errors = validateInputs(registerForm._children(".password, .password_rewrite"));
		if (errors.length > 0) {
			return;
		}
	}

	const params =
		user_id === undefined
			? {
					email: registerForm._child(".email")._get_value(),
					password: registerForm._child(".password")._get_value(),
			  }
			: { user_id };

	xhr({
		url: user_id === undefined ? "/user/register" : "/user/resend_activation_token",
		params,
		success: (res) => {
			if (res.success) {
				let body = html`Link do aktywacji konta został wysłany<br />na ${res.email}`;
				let footer = html` <button class="btn subtle" onclick="hideParentModal(this)">Zamknij <i class="fas fa-times"></i></button> `;

				if (res.email_client_url) {
					footer += html`
						<a class="btn primary" target="_blank" rel="noopener noreferrer" href="${res.email_client_url}">
							Przejdź do poczty <i class="fas fa-envelope-open"></i>
						</a>
					`;
				} else {
					body += html`
						<br />
						<span style="color: #444;font-weight: 600;">
							Nieznany adres pocztowy
							<i
								class="fas fa-info-circle"
								style="opacity:0.85"
								data-tooltip="Czy aby na pewno adres email jest prawidłowy?<br>Sprawdź swoją skrzynkę pocztową."
							></i>
						</span>
					`;
				}

				showMessageModal(getMessageHTML({ type: "success", body, footer }));
			} else {
				showMessageModal(getMessageHTML({ type: "error", body: "Wystąpił błąd rejestracji" }));
			}
		},
	});
}

domload(() => {
	const registerForm = $(`#registerForm`);
	const email = registerForm._child(`.email`);

	if (register_email) {
		email._set_value(register_email);
	}

	email.addEventListener("input", () => {
		delay("validateUserEmailExists", 500);
	});

	email.addEventListener("change", () => {
		delay("validateUserEmailExists");
	});

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
		registerUser();
	});
});
