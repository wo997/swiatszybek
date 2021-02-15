/* js[global] */

window.addEventListener("register-form-components", (ev) => {
	// @ts-ignore
	registerCheckboxes(ev.detail.parent);
});

document.addEventListener("mouseup", () => {
	$$("p-checkbox.focus").forEach((e) => {
		e.classList.remove("focus");
	});
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
				<input type="checkbox" />
				<div class="circle">
					<i class="fas fa-minus"></i>
					<i class="fas fa-check"></i>
				</div>
			`
		);

		const native = ch._child("input");

		const clickable = def(ch._parent("label"), ch);
		clickable.addEventListener("click", () => {
			native.click();
			native.focus();
		});
		clickable.addEventListener("mousedown", () => {
			ch.classList.add("focus");
		});

		native.addEventListener("keypress", () => {
			native.click();
		});

		native.addEventListener("change", () => {
			ch.classList.toggle("checked");
			ch._dispatch_change();
			ch.classList.remove("focus");
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
