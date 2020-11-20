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

// requires loginForm included, basically everywhere, chill
function login() {
	const loginForm = $(`#loginForm`);

	if (!validateForm(loginForm)) {
		return;
	}

	xhr({
		url: "/login",
		params: getFormData(loginForm),
		success: (res) => {
			if (res.message && res.error_field_name) {
				showFieldErrors(
					loginForm.find(`[name="${res.error_field_name}"]`),
					[res.message],
					{ scroll: true }
				);
			}
		},
	});
}

function validateLoginUserEmail(input) {
	const loginForm = $(`#loginForm`);

	xhr({
		url: "/validate-email",
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

function hideLoginFormPassword() {
	var btn = $("#loginForm .fa-eye-slash");
	var input = $("#loginForm [name='password']");

	if (!btn || !input) {
		return;
	}
	togglePasswordFieldType(btn, input, false);
}

window.addEventListener("modal-show", (event) => {
	if (event.detail.node.id != "loginForm") {
		return;
	}
	hideLoginFormPassword();
});
