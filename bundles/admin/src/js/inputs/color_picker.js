/* js[admin] */

window.addEventListener("register-form-components", (ev) => {
	// @ts-ignore
	registerColorPickers(ev.detail.parent);
});

domload(() => {
	let wanna_dispatch_change = false;

	let picker;

	setInterval(() => {
		if (!wanna_dispatch_change || !any_picker.target) {
			return;
		}
		any_picker.target._dispatch_change();
		wanna_dispatch_change = false;
	}, 100);

	document.addEventListener("click", (ev) => {
		const target = $(ev.target);
		const picker_target = target._parent("color-picker");

		if (picker_target) {
			if (picker) {
				picker.destroy();
			}

			const scroll_parent = picker_target._scroll_parent();
			scroll_parent.append(any_picker.wrapper);
			any_picker.wrapper._empty();

			let first = true;
			picker = new Picker({
				parent: any_picker.wrapper,
				popup: false,
				color: picker_target._get_value(),
				onChange: (a) => {
					if (first) {
						first = false;
						return;
					}
					if (picker_target) {
						setColorPickerValue(picker_target, a.hex);
						wanna_dispatch_change = true;
					}
				},
				alpha: picker_target.classList.contains("alpha"),
			});

			const picker_wrapper = any_picker.wrapper._child(".picker_wrapper");
			const picker_done = any_picker.wrapper._child(".picker_done");
			picker_done.outerHTML = html`
				<button class="btn subtle erase_btn small" data-tooltip="Wyczyść"><i class="fas fa-eraser"></i></button>
				<button class="btn subtle close_btn small" data-tooltip="Wybierz"><i class="fas fa-check"></i></button>
			`;
			const picker_cancel = picker_wrapper._child(".picker_cancel");
			if (picker_cancel) {
				picker_cancel.remove();
			}
			const edit_input = picker_wrapper._child(".picker_editor input");
			if (edit_input) {
				edit_input.classList.add("field", "small");
			}
			picker_wrapper._child(".erase_btn").addEventListener("click", () => {
				setColorPickerValue(picker_target, "");
				any_picker.target._dispatch_change();
				any_picker.hide();
			});

			any_picker.show(picker_target);
		}
	});
});

/**
 *
 * @param {PiepNode} parent
 */
function registerColorPickers(parent) {
	parent._children("color-picker:not(.clrpckr_rgstrd)").forEach((input) => {
		input.classList.add("clrpckr_rgstrd", "field");

		input._set_content(
			html`
				<div class="icon">
					<i class="fas fa-eye-dropper"></i>
				</div>
			`
		);
	});
}

/**
 *
 * @param {PiepNode} input
 * @param {string} value
 */
function setColorPickerValue(input, value) {
	input.dataset.value = value;
	input.classList.toggle("empty", !value);
	input.style.setProperty("--selected_color", value);
}

/**
 *
 * @param {PiepNode} input
 */
function getColorPickerValue(input) {
	return input.dataset.value;
}
