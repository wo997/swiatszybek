domload(() => {
	$$(".password_form .password_requirements p").forEach((p) => {
		p.insertAdjacentHTML(
			"afterbegin",
			html`
				<i class="fas fa-check"></i>
				<i class="fas fa-times"></i>
			`
		);
	});

	const password_form_input = $(`.password_form .password`);
	const psswchng = () => {
		const value = password_form_input._get_value();
		$(".password_requirements .eigth_characters").classList.toggle("correct", value.length >= 8);
		$(".password_requirements .one_small_letter").classList.toggle("correct", value.match(/[a-z]/));
		$(".password_requirements .one_big_letter").classList.toggle("correct", value.match(/[A-Z]/));
		$(".password_requirements .one_digit").classList.toggle("correct", value.match(/\d/));
	};
	password_form_input.addEventListener("input", psswchng);
	password_form_input.addEventListener("change", psswchng);

	let password_visible = false;
	const toggle_password = $$(`.toggle_password`);
	toggle_password.forEach((toggle_for_ev) => {
		toggle_for_ev.addEventListener("click", () => {
			password_visible = !password_visible;
			toggle_password.forEach((toggle) => {
				toggle.dataset.tooltip = password_visible ? "Ukryj hasło" : "Pokaż hasło";
				const i = toggle._child("i");
				i.classList.toggle("fa-eye", !password_visible);
				i.classList.toggle("fa-eye-slash", password_visible);
				toggle
					._parent(".label")
					._next()
					.setAttribute("type", password_visible ? "text" : "password");
			});
		});
	});
});
