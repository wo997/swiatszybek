/* js[view] */

function resetPassword() {
	const params = getFormData($("#resetPasswordForm"));

	xhr({
		url: "/reset_password_link",
		params,
		success: (res) => {
			if (res.success) {
				let body = /*html*/ `Link do zresetowania hasła został wysłany<br>na ${params.email}`;
				let footer = /*html*/ `
                    <button class='btn subtle medium' onclick='hideParentModal(this)'>
                        Zamknij <i class="fas fa-times"></i>
                    </button>
                `;

				if (res.data && res.data.email_client_url) {
					footer += /*html*/ `
                        <a class='btn success medium' target='_blank' rel='noopener noreferrer' href='${res.data.email_client_url}'>
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
