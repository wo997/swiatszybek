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

window.addEventListener("DOMContentLoaded", () => {
    registerModalContent(`
    <div id="loginForm" data-form data-modal data-dismissable>
      <div class="modal-body">
          <button class="close-modal-btn"><img src="/src/img/cross.svg"></button>
          <h3 class="modal-header">
            <img class="user-icon" src="/src/img/user_icon.svg">
            Logowanie
          </h3>
          <div class="scroll-panel scroll-shadow panel-padding">
              <div>
                <div class="field-title first">E-mail</div>
                <input class="field" type="text" autocomplete="username" name="email" data-validate="backend|custom:validateLoginUserEmail|delay:300">
          
              <div class="field-title">
                <span>Hasło</span>
                <i class="fas fa-eye btn" onclick="togglePasswordFieldType(this,$(this).parent().next())" data-tooltip="Pokaż hasło" data-position="right"></i>
              </div>
              <input class="field" type="password" autocomplete="current-password" name="password" data-validate="backend|blank_on_change:true">
              <div style="margin-top:10px;text-align:center">
                  <label class="checkbox-wrapper">
                      <input type="checkbox" name="remember_me" value="1">
                      <div class="checkbox"></div>
                      Zapamiętaj mnie
                  </label>
              </div>
            <button class="btn primary medium" style="margin:10px 0; width: 100%" onclick="login()" data-submit>
              Zaloguj się
              <i class="fa fa-chevron-right"></i>
            </button>
        
            <div style="text-align: center; padding: 10px 0">
                <a href="/rejestracja" class="btn buff subtle" style="font-weight: 600;">
                Zarejestruj się <i class="fa fa-user-plus"></i>
                </a>
                <div style="height: 10px;"></div>
                    <a href="/resetowanie-hasla" class="btn buff subtle" style="font-weight: 600;">
                    Zresetuj hasło <i class="fa fa-lock-open"></i>
                    </a>
                </div>
                <div style="text-align: center;">lub</div>
                <div class="g-signin2" data-onsuccess="onSignIn"></div>
                ` + decodeHtmlEntities(fb_login_btn) + `
            </div>
          </div>
      </div>
    </div>    
`)
});