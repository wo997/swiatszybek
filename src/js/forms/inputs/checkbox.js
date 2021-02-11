/* js[global] */

window.addEventListener("register-form-components", (ev) => {
	// @ts-ignore
	registerCheckboxes(ev.detail.parent);
});

/**
 *
 * @param {PiepNode} parent
 */
function registerCheckboxes(parent) {
	parent._children("p-checkbox:not(.checkbox-registered)").forEach((c) => {
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

		const clickable = def(c._parent("label"), c);
		clickable.addEventListener("click", () => {
			c.classList.toggle("checked");
			c._set_value();
		});
	});
}
