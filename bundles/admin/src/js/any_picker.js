/* js[admin] */

/**
 * @typedef {{
 * target: PiepNode
 * wrapper: PiepNode
 * show(target: PiepNode)
 * hide()
 * }} AnyPicker
 */

/** @type {AnyPicker} */
let any_picker;

domload(() => {
	const any_picker_wrapper = $(document.createElement("DIV"));
	any_picker_wrapper.classList.add("any_picker_wrapper");

	any_picker = {
		target: undefined,
		wrapper: any_picker_wrapper,
		show: (target) => {
			any_picker.target = target;
			target.classList.add("any_picker_shown");

			const parent = target._scroll_parent();
			parent.append(any_picker_wrapper);

			// reset pos
			any_picker_wrapper.classList.add("visible");
			any_picker_wrapper._set_absolute_pos(0, 0);

			const target_rect = target.getBoundingClientRect();
			const scp_rect = parent.getBoundingClientRect();

			let left = target_rect.left + (target_rect.width - any_picker_wrapper.offsetWidth) * 0.5 - scp_rect.left + parent.scrollLeft;
			let top = target_rect.top + target_rect.height + 1 - scp_rect.top + parent.scrollTop;
			const off = 5;
			left = clamp(off, left, parent.scrollWidth - any_picker_wrapper.offsetWidth - off);
			if (top > parent.scrollHeight - any_picker_wrapper.offsetHeight - 1 - off) {
				top = target_rect.top - any_picker_wrapper.offsetHeight - 1 - scp_rect.top + parent.scrollTop;
			}

			any_picker_wrapper._set_absolute_pos(left, top);

			any_picker_wrapper._animate(
				`0%{transform:scale(0.8);opacity:0}
                100%{transform:scale(1);opacity:1}`,
				200
			);
		},
		hide: () => {
			const target = any_picker.target;
			if (!target) {
				return;
			}

			target.dispatchEvent(new Event("any_picker_hidden"));
			target.classList.remove("any_picker_shown");

			any_picker.target = undefined;

			any_picker_wrapper._animate(
				`0%{transform:scale(1);opacity:1}
                100%{transform:scale(0.8);opacity:0}`,
				200,
				{
					callback: () => {
						if (!any_picker.target) {
							any_picker_wrapper.classList.remove("visible");
						}
					},
				}
			);
		},
	};

	document.addEventListener("click", (ev) => {
		const target = $(ev.target);

		if (!target._parent(".any_picker_wrapper") || target._parent(".any_picker_wrapper .close_btn")) {
			any_picker.hide();
		}
	});
});
