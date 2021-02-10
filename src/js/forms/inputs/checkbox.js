/* js[global] */

window.addEventListener("register-form-components", registerCheckboxes);

function registerCheckboxes() {
	$$("p-checkbox:not(.checkbox-registered)").forEach((c) => {
		c.classList.add("checkbox-registered", "field");

		c.insertAdjacentHTML(
			"afterbegin",
			html`
				<div class="circle">
					<i class="fas fa-minus"></i>
					<i class="fas fa-check"></i>
				</div>
			`
		);

		c.addEventListener("click", () => {
			c.classList.toggle("checked");
			c._set_value();
		});
	});
}
