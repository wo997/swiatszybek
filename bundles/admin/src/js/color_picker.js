/* js[admin] */

window.addEventListener("register-form-components", (ev) => {
	// @ts-ignore
	registerColorPickers(ev.detail.parent);
});

domload(() => {
	/** @type {PiepNode} */
	let picker_target;
	/** @type {PiepNode} */
	let picker_wrapper;

	let wanna_dispatch_change = false;

	let picker;

	const hide = () => {
		if (picker_target) {
			picker_target.classList.remove("shown");
		}
		picker_target = undefined;
		if (!picker_wrapper) {
			return;
		}
		picker_wrapper._animate(
			`0%{transform:scale(1);opacity:1}
                100%{transform:scale(0.8);opacity:0}`,
			200,
			{
				callback: () => {
					picker_wrapper.classList.remove("visible");
				},
			}
		);
	};

	setInterval(() => {
		if (!wanna_dispatch_change || !picker_target) {
			return;
		}
		picker_target._dispatch_change();
		wanna_dispatch_change = false;
	}, 100);

	document.addEventListener("click", (ev) => {
		const target = $(ev.target);
		const clr_picker = target._parent("color-picker");
		const tacz_picker_wrapper = target._parent(".picker_wrapper");

		if (clr_picker) {
			picker_wrapper = undefined; // prevents animation, ezy
			hide();

			picker_target = clr_picker;
			picker_target.classList.add("shown");

			if (picker) {
				picker.destroy();
			}
			const parent = picker_target._scroll_parent();
			let first = true;
			picker = new Picker({
				parent,
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

			picker_wrapper = parent._child(".picker_wrapper");
			const picker_done = picker_wrapper._child(".picker_done");
			picker_done.outerHTML = html`
				<button class="btn subtle erase_btn small"><i class="fas fa-eraser"></i></button>
				<button class="btn subtle close_btn small"><i class="fas fa-check"></i></button>
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
				picker_target._dispatch_change();
				hide();
			});
			picker_wrapper._child(".close_btn").addEventListener("click", () => {
				hide();
			});

			picker_wrapper.classList.add("visible");
			const target_rect = picker_target.getBoundingClientRect();
			const scp_rect = parent.getBoundingClientRect();
			let left = target_rect.left + (target_rect.width - picker_wrapper.offsetWidth) * 0.5 - scp_rect.left + parent.scrollLeft;
			// let top = target_rect.top - picker_wrapper.offsetHeight;
			let top = target_rect.top + picker_target.offsetHeight + 1 - scp_rect.top + parent.scrollTop;
			const off = 5;
			left = clamp(off, left, parent.scrollWidth - picker_wrapper.offsetWidth - off);
			//top = clamp(off, top, parent.scrollHeight - picker_wrapper.offsetHeight - off);
			if (top > parent.scrollHeight - picker_wrapper.offsetHeight - 1 - off) {
				top = target_rect.top - picker_wrapper.offsetHeight - 1 - scp_rect.top + parent.scrollTop;
			}
			//top = clamp(off, top, parent.scrollHeight - picker_wrapper.offsetHeight - off);

			// picker_wrapper.style.left = left + "px";
			// picker_wrapper.style.top = top + "px";
			picker_wrapper.style.left = left + "px";
			picker_wrapper.style.top = top + "px";
			// picker_wrapper.style.left = left + parent.scrollLeft + "px";
			// picker_wrapper.style.top = top + parent.scrollTop + "px";

			picker_wrapper._animate(
				`0%{transform:scale(0.8);opacity:0}
                    100%{transform:scale(1);opacity:1}`,
				200
			);
		} else if (!tacz_picker_wrapper) {
			hide();
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
