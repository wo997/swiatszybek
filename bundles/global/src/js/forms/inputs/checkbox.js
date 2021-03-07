/* js[global] */

window.addEventListener("register-form-components", (ev) => {
	// @ts-ignore
	registerCheckboxes(ev.detail.parent);
});

document.addEventListener("mouseup", () => {
	$$("p-checkbox.focus").forEach((e) => {
		e.classList.remove("focus");
		// @ts-ignore
		e._child("input").select();
	});
});

/**
 *
 * @param {PiepNode} radio_group
 */
function onRadioGroupValueSet(radio_group) {
	radio_group._children("p-checkbox").forEach((ch) => {
		ch._set_value(ch.dataset.value === radio_group.dataset.value ? 1 : 0, { quiet: true });
	});
}

/**
 *
 * @param {PiepNode} parent
 */
function registerCheckboxes(parent) {
	parent._children("p-checkbox:not(.checkbox-registered)").forEach((input) => {
		input.classList.add("checkbox-registered");

		input.insertAdjacentHTML(
			"afterbegin",
			html`
				<input type="checkbox" />
				<div class="circle">
					<i class="fas fa-minus"></i>
					<i class="fas fa-check"></i>
				</div>
			`
		);

		const native = input._child("input");

		/** @type {PiepNode} */
		const checkbox_area = def(input._parent(".checkbox_area"), input);

		const checkbox_change = () => {
			setCheckboxValue(input, !input.classList.contains("checked"));
			input._dispatch_change();
		};

		checkbox_area.addEventListener("click", (ev) => {
			if (ev.target && $(ev.target).tagName !== "INPUT") {
				checkbox_change();
			}
		});

		checkbox_area.addEventListener("mousedown", () => {
			input.classList.add("focus");
			native.focus();
		});

		native.addEventListener("keypress", () => {
			native.click();
		});

		native.addEventListener("change", () => {
			checkbox_change();
		});

		const radio_group = input._parent(".radio_group");

		if (radio_group) {
			if (!radio_group.classList.contains("rg_registered")) {
				radio_group.classList.add("rg_registered");

				radio_group.addEventListener("change", () => {
					onRadioGroupValueSet(radio_group);
				});
			}

			if (!input.classList.contains("square")) {
				input.classList.add("circle");
			}
			input.addEventListener("change", () => {
				radio_group._set_value(input._get_value() ? input.dataset.value : "");
			});

			radio_group.dataset.value = "";
		}
	});
}

/**
 *
 * @param {PiepNode} input
 * @param {*} value
 */
function setCheckboxValue(input, value) {
	const checkbox_area = input._parent(".checkbox_area");
	const radio_group = input._parent(".radio_group");

	if (radio_group && !radio_group.classList.contains("unselectable") && radio_group.dataset.value === input.dataset.value && !value) {
		return;
	}

	input.classList.toggle("checked", !!value);
	if (checkbox_area) {
		checkbox_area.classList.toggle("checked", !!value);
	}
}
