/* js[global] */

window.addEventListener("register-form-components", registerCheckboxes);

function registerCheckboxes() {
	$$("checkbox:not(.checkbox-registered)").forEach((c) => {
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

		c.addEventListener(IS_TOUCH_DEVICE ? "touchstart" : "mousedown", (e) => {
			c.classList.toggle("checked");
			c._set_value();
		});
	});
}
