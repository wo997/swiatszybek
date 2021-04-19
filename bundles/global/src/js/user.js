/* js[global] */

// keep connected
setInterval(() => {
	xhr({
		url: "/ping.php",
		success: () => {},
	});
}, 60000);

function logout() {
	if (!confirm("Czy aby na pewno chesz się wylogować?")) {
		return;
	}
	if (USER_TYPE == "f") {
		xhr({ url: STATIC_URLS["USER"] + "/logout", success: () => {} });
	} else if (USER_TYPE == "g") {
		try {
			// @ts-ignore
			var auth2 = gapi.auth2.getAuthInstance();
			auth2.signOut().then(function () {
				xhr({ url: STATIC_URLS["USER"] + "/logout", success: () => {} });
			});
			auth2.disconnect();
		} catch (error) {
			console.log(error);

			xhr({ url: STATIC_URLS["USER"] + "/logout", success: () => {} });
		}
	} else {
		xhr({ url: STATIC_URLS["USER"] + "/logout", success: () => {} });
	}
}

// // TODO: replace with XHR
// function onSignIn(googleUser) {
// 	var form = $("#google-form");
// 	if (IS_LOGGED || !form) return;

// 	var id_token = googleUser.getAuthResponse().id_token;
// 	if (!id_token) return;

// 	form.id_token.value = id_token;
// 	form.submit();
// }

function validateLoginUserEmail(input) {
	const loginForm = $(`#loginForm`);

	xhr({
		url: "/user/validate_email",
		params: {
			email: loginForm._child(".node_email")._get_value(),
		},
		success: (res) => {
			const errors = [];
			if (res.status == "unauthenticated") {
				errors.push(html`<span style="color: black">
					Konto nieaktywne<br />
					<b style="color:var(--success-clr);" class="link" onclick="registerUser({user_id:${res.user_id}})"> WYŚLIJ LINK AKTYWACYJNY</b>
				</span>`);
			} else if (res.status != "exists") {
				errors.push("Takie konto nie istnieje");
			}
			showInputErrors(input, errors);
		},
	});
}

window.addEventListener("modal_show", (event) => {
	// @ts-ignore
	if (event.detail.node.id != "loginForm") {
		return;
	}

	/** @type {LoginFormModalComp} */
	// @ts-ignore
	const login_form_modal_comp = $("#loginForm login-form-modal-comp");
	login_form_modal_comp._data.password_visible = false;
	login_form_modal_comp._render();
});

domload(() => {
	registerModalContent(
		html`
			<form id="loginForm" data-dismissable data-expand onsubmit="return false">
				<div class="modal_body">
					<login-form-modal-comp class="flex_stretch"></login-form-modal-comp>
				</div>
			</form>
		`
	);

	/** @type {LoginFormModalComp} */
	// @ts-ignore
	const login_form_modal_comp = $("#loginForm login-form-modal-comp");
	LoginFormModalComp(login_form_modal_comp, undefined);
});

function registerUser(params) {
	showLoader();
	xhr({
		url: params.user_id === undefined ? "/user/register" : "/user/resend_activation_token",
		params,
		success: (res) => {
			hideLoader();
			if (res.success) {
				let body = html`Link do aktywacji konta został wysłany<br />na ${res.email}`;
				let footer = html` <a class="btn subtle" href="/">Zamknij <i class="fas fa-times"></i></a> `;

				if (res.email_client_url) {
					footer += html`
						<a class="btn primary" target="_blank" rel="noopener noreferrer" href="${res.email_client_url}">
							Przejdź do poczty <i class="fas fa-envelope-open"></i>
						</a>
					`;
				} else {
					body += html`
						<br />
						<span class="semi_bold" style="color: #444">
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
