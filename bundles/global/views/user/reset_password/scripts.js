/* js[view] */

function resetPassword() {
	const params = getFormData($("#resetPasswordForm"));

	xhr({
		url: "/reset_password",
		params,
		success: (res) => {
			if (res.success) {
				let body = /*html*/ `Hasło zostało zresetowane`;
				let footer = /*html*/ `
                    <button class='btn subtle medium' onclick='hideParentModal(this)'>
                        Zamknij <i class="fas fa-times"></i>
                    </button>
                    <button class='btn success medium' onclick='showModal("loginForm",{source:this});hideParentModal(this)'>
                        Zaloguj się <i class='fas fa-user'></i>
                    </button>
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
}
