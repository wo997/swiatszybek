/* js[view] */

function validateUserEmailExists(input) {
	const registerForm = $(`#registerForm`);

	xhr({
		url: "/validate_email",
		params: getFormData(registerForm),
		success: (res) => {
			let errors = [];
			if (res == "exists") {
				let m = /*html*/ `<span style='color: black'>`;
				m += /*html*/ `To konto jest aktywne`;
				if (!IS_LOGGED) {
					m += /*html*/ ` <b style="color:var(--success-clr);" class="link" onclick="showModal('loginForm',{source:this})">ZALOGUJ SIĘ</b>`;
				}
				m += /*html*/ `</span>`;
				errors.push(m);
			} else if (res == "unauthenticated") {
				errors.push(
					/*html*/ `<span style="color: black">Konto istnieje <b style="color:var(--success-clr);" class="link" onclick="register(false)">WYŚLIJ LINK AKTYWACYJNY</b></span>`
				);
			} else if (res == "invalid") {
				errors.push("Wpisz poprawny adres email");
			}

			$("#registerForm [data-submit]").toggleAttribute(
				"disabled",
				!!errors.length
			);

			showFieldErrors(input, errors);
		},
	});
}

function register(validate = true) {
	const registerForm = $(`#registerForm`);

	if (
		validate &&
		!validateForm(registerForm, {
			except_backend: true,
		})
	) {
		return;
	}

	const params = getFormData(registerForm);

	xhr({
		url: "/register",
		params: params,
		success: (res) => {
			if (res.success) {
				let body = /*html*/ `Link do aktywacji konta został wysłany<br>na ${params.email}`;
				let footer = /*html*/ `
                    <button class='btn subtle medium' onclick='hideParentModal(this)'>
				        Zamknij <i class="fas fa-times"></i>
                    </button>
                `;

				if (res.email_client_url) {
					footer += /*html*/ `
                        <a class='btn success medium' target='_blank' rel='noopener noreferrer' href='${res.email_client_url}'>
                            Przejdź do poczty <i class='fas fa-envelope-open'></i>
                        </a>
                    `;
				} else {
					body += /*html*/ `
                        <br>
                        <span style='color: #444;font-weight: 600;'>
                            Nieznany adres pocztowy 
                            <i class='fas fa-info-circle' style='opacity:0.85'
                            data-tooltip='Czy aby na pewno adres email jest prawidłowy?<br>Sprawdź swoją skrzynkę pocztową.'></i>
                        </span>
                    `;
				}

				showMessageModal(getMessageHTML({ type: "success", body, footer }));
			} else {
				//showMessageModal(getMessageHTML({ type: "success", body, footer }));
			}
		},
	});
}
