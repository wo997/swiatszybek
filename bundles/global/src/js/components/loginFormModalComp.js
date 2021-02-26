/* js[global] */

/**
 * @typedef {{
 * email: string
 * password: string
 * remember_me: number
 * password_visible: boolean
 * }} LoginFormModalCompData
 *
 * @typedef {{
 * _data: LoginFormModalCompData
 * _set_data(data?: LoginFormModalCompData, options?: SetCompDataOptions)
 * _nodes: {
 *  login_btn: PiepNode
 *  email: PiepNode
 *  password: PiepNode
 *  password_visible_btn: PiepNode
 * }
 * } & BaseComp} LoginFormModalComp
 */

/**
 * @param {LoginFormModalComp} comp
 * @param {*} parent
 * @param {LoginFormModalCompData} data
 */
function loginFormModalComp(comp, parent, data = undefined) {
	if (data === undefined) {
		data = {
			email: "",
			password: "",
			remember_me: 0,
			password_visible: false,
		};
	}

	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<button class="close_modal_btn"><i class="fas fa-times"></i></button>

			<h3 class="modal_header">
				<img class="user_icon" src="/src/img/user_icon.svg" />
				Logowanie
			</h3>

			<div class="scroll_panel scroll_shadow panel_padding">
				<div>
					<div class="label first">E-mail</div>
					<input data-node="{${comp._nodes.email}}" class="field" type="text" autocomplete="username" name="email" data-validate="email" />

					<div class="label">
						<span>Hasło</span>
						<i
							data-node="{${comp._nodes.password_visible_btn}}"
							class="fas {${data.password_visible}?fa-eye-slash:fa-eye} btn small"
							onclick="togglePasswordFieldType(this,$(this)._parent()._next())"
							data-tooltip="{${data.password_visible ? "Ukryj hasło" : "Pokaż hasło"}}"
							data-tooltip_position="right"
						></i>
					</div>
					<input
						data-node="{${comp._nodes.password}}"
						class="field"
						type="{${data.password_visible ? "text" : "password"}}"
						autocomplete="current-password"
						name="password"
					/>

					<div style="margin-top:10px;text-align:center">
						<label class="label">
							<p-checkbox class="inline square" style="margin-right:4px"></p-checkbox>
							Zapamiętaj mnie
						</label>
					</div>

					<button class="btn primary medium" style="margin:10px 0; width: 100%" data-node="{${comp._nodes.login_btn}}" data-submit>
						Zaloguj się <i class="fa fa-chevron-right"></i>
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
		`,
		ready: () => {
			comp._nodes.password_visible_btn.addEventListener("click", () => {
				comp._data.password_visible = !comp._data.password_visible;
				comp._render();
			});

			comp._nodes.login_btn.addEventListener("click", () => {
				if (!validateInputs([comp._nodes.email, comp._nodes.password])) {
					return;
				}

				showLoader(comp);

				xhr({
					url: "/login",
					params: {
						email: comp._nodes.email._get_value(),
						password: comp._nodes.password._get_value(),
					},
					success: (res) => {
						if (res.success) {
							if (res.data && res.data.redirect_url) {
								window.location.href = res.data.redirect_url;
							} else {
								window.location.reload();
							}
						} else {
							showNotification("Błąd logowania", { one_line: true, type: "error" });
							showValidationErrors(comp._nodes.password, ["Niepoprawnie hasło"]);
							hideLoader(comp);
						}
					},
				});
			});
		},
	});
}
