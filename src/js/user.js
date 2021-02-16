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
	const loginForm = $(`#loginForm .modal-body`);

	if (!validateForm(loginForm)) {
		return;
	}

	showLoader(loginForm);

	xhr({
		url: "/login",
		params: getFormData(loginForm),
		success: (res) => {
			if (res.success) {
				loginForm.classList.add("success");
				//setTimeout(() => {
				if (res.data && res.data.redirect_url) {
					window.location.href = res.data.redirect_url;
				} else {
					window.location.reload();
				}
				//}, 200);

				//hideLoader(loginForm);
			} else {
				showFieldErrors(loginForm._child(`[name="password"]`), ["Niepoprawne hasło"], { scroll: true });
			}
		},
	});
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

domload(() => {
	registerModalContent(
		html`<div id="loginForm" data-form data-modal data-dismissable class="loginForm">
			<div class="modal-body">
				<button class="close-modal-btn"><i class="fas fa-times"></i></button>

				<h3 class="modal-header">
					<img class="user-icon" src="/src/img/user_icon.svg" />
					Logowanie
				</h3>

				<div class="scroll-panel scroll-shadow panel-padding">
					<div>
						<div class="label first">E-mail</div>
						<input
							class="field"
							type="text"
							autocomplete="username"
							name="email"
							data-validate="backend|custom:validateLoginUserEmail|delay:300"
						/>

						<div class="label">
							<span>Hasło</span>
							<i
								class="fas fa-eye btn small"
								onclick="togglePasswordFieldType(this,$(this)._parent()._next())"
								data-tooltip="Pokaż hasło"
								data-tooltip_position="right"
							></i>
						</div>
						<input
							class="field"
							type="password"
							autocomplete="current-password"
							name="password"
							data-validate="backend|blank_on_change:true"
						/>

						<div style="margin-top:10px;text-align:center">
							<label class="label">
								<p-checkbox class="inline square" style="margin-right:4px"></p-checkbox>
								Zapamiętaj mnie
							</label>
						</div>

						<button class="btn primary medium login_btn" style="margin:10px 0; width: 100%" onclick="login()" data-submit>
							<span>Zaloguj się <i class="fa fa-chevron-right"></i></span>
							<i class="fa fa-check"></i>
						</button>

						<div style="text-align: center; padding: 10px 0">
							<a href="/rejestracja" class="btn buff subtle" style="font-weight: 600;"> Zarejestruj się <i class="fa fa-user-plus"></i> </a>
							<div style="height: 10px;"></div>
							<a href="/resetowanie-hasla" class="btn buff subtle" style="font-weight: 600;">
								Zresetuj hasło <i class="fa fa-lock-open"></i>
							</a>
						</div>

						<div style="text-align: center;">lub</div>
						<div class="g-signin2" data-onsuccess="onSignIn"></div>
					</div>
				</div>
			</div>
		</div>`
	);
	//<?= $fb_login_btn ?>
});
