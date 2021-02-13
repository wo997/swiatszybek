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
	parent._children("p-checkbox:not(.checkbox-registered)").forEach((ch) => {
		ch.classList.add("checkbox-registered");

		ch.insertAdjacentHTML(
			"afterbegin",
			html`
				<div class="circle">
					<i class="fas fa-minus"></i>
					<i class="fas fa-check"></i>
				</div>
			`
		);

		const clickable = def(ch._parent("label"), ch);
		clickable.addEventListener("click", () => {
			ch.classList.toggle("checked");
			ch._dispatch_change();
		});

		const radio_group = ch._parent(".radio_group");

		if (radio_group) {
			if (!radio_group.classList.contains("rg_registered")) {
				radio_group.classList.add("rg_registered");

				radio_group.addEventListener("change", () => {
					radio_group._children("p-checkbox").forEach((ch) => {
						ch._set_value(ch.dataset.value === radio_group.dataset.value ? 1 : 0, { quiet: true });
					});
				});
			}

			if (!ch.classList.contains("square")) {
				ch.classList.add("circle");
			}
			ch.addEventListener("change", () => {
				radio_group._set_value(ch._get_value() ? ch.dataset.value : "");
			});
		}
	});
}
