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
		xhr({ url: "/logout", success: () => {} });
	} else if (USER_TYPE == "g") {
		try {
			// @ts-ignore
			var auth2 = gapi.auth2.getAuthInstance();
			auth2.signOut().then(function () {
				xhr({ url: "/logout", success: () => {} });
			});
			auth2.disconnect();
		} catch (error) {
			console.log(error);

			xhr({ url: "/logout", success: () => {} });
		}
	} else {
		xhr({ url: "/logout", success: () => {} });
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
				errors.push("Konto nie zostało aktywowane");
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
			<div id="loginForm" data-dismissable data-expand>
				<div class="modal_body">
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
