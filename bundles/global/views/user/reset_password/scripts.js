/* js[view] */

domload(() => {
	const resetPasswordForm = $("#resetPasswordForm");
	resetPasswordForm._child(".submit_btn").addEventListener("click", () => {
		const errors = validateInputs(resetPasswordForm._children(".password_rewrite, .password"));
		if (errors.length > 0) {
			return;
		}

		showLoader();
		xhr({
			url: "/user/reset_password",
			params: {
				password: resetPasswordForm._child(".password")._get_value(),
				user_id: resetPasswordForm._child(".user_id")._get_value(),
				authentication_token: resetPasswordForm._child(".authentication_token")._get_value(),
			},
			success: (res) => {
				hideLoader();
				if (res.success) {
					let body = html`Hasło zostało zresetowane`;
					let footer = html`
						<a class="btn subtle" href="/">Zamknij <i class="fas fa-times"></i></a>
						<button class="btn primary" onclick="showModal('loginForm',{source:this});">Zaloguj się <i class="fas fa-user"></i></button>
					`;

					showMessageModal(getMessageHTML({ type: "success", body, footer }));
				} else {
					showMessageModal(
						getMessageHTML({
							type: res.is_info ? "info" : "error",
							body: def(res.errors, ["Wystąpił błąd zmiany hasła"]).join("<br>"),
						})
					);
				}
			},
		});
	});
});
