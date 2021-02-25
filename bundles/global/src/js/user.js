/* js[global] */

// keep connected
setInterval(() => {
	xhr({
		url: "/ping.php",
	});
}, 60000);

function logout() {
	if (!confirm("Czy aby na pewno chesz się wylogować?")) {
		return;
	}
	if (USER_TYPE == "f") {
		xhr({ url: "/logout" });
	} else if (USER_TYPE == "g") {
		try {
			var auth2 = gapi.auth2.getAuthInstance();
			auth2.signOut().then(function () {
				xhr({ url: "/logout" });
			});
			auth2.disconnect();
		} catch (error) {
			console.log(error);

			xhr({ url: "/logout" });
		}
	} else {
		xhr({ url: "/logout" });
	}
}

// TODO: replace with XHR
function onSignIn(googleUser) {
	var form = $("#google-form");
	if (IS_LOGGED || !form) return;

	var id_token = googleUser.getAuthResponse().id_token;
	if (!id_token) return;

	form.id_token.value = id_token;
	form.submit();
}

function validateLoginUserEmail(input) {
	const loginForm = $(`#loginForm`);

	xhr({
		url: "/validate_email",
		params: getFormData(loginForm),
		success: (res) => {
			var errors = [];
			if (res == "unauthenticated") {
				errors.push("Konto nie zostało aktywowane");
			} else if (res != "exists") {
				errors.push("Takie konto nie istnieje");
			}
			showFieldErrors(input, errors);
		},
	});
}

window.addEventListener("modal-show", (event) => {
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
			<div id="loginForm" data-dismissable data-expand>
				<div class="modal-body" style="align-self: center;height: auto;max-width:330px">
					<login-form-modal-comp class="flex_stretch"></login-form-modal-comp>
				</div>
			</div>
		`
	);

	/** @type {LoginFormModalComp} */
	// @ts-ignore
	const login_form_modal_comp = $("#loginForm login-form-modal-comp");
	loginFormModalComp(login_form_modal_comp, undefined);
});
