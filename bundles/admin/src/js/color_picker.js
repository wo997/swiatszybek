/* js[admin] */

window.addEventListener("register-form-components", (ev) => {
	// @ts-ignore
	registerColorPickers(ev.detail.parent);
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

		input.addEventListener("click", () => {
			const ir = input.getBoundingClientRect();
			const spr = input._scroll_parent().getBoundingClientRect();
			let popup = "bottom";
			if (spr.width > 600) {
				popup = ir.left + ir.width < spr.left + spr.width - 200 ? "right" : "left";
			}
			popupBasic.setOptions({
				popup,
			});
		});

		const popupBasic = new Picker({
			parent: input,
			alpha: input.classList.contains("alpha"),
			onOpen: (a, b, c, d) => {
				const picker_wrapper = input._child(".picker_wrapper");
				const picker_done = picker_wrapper._child(".picker_done");
				if (picker_done) {
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
				}
				input.classList.add("nohover");
			},
			onChange: (a) => {
				console.log(a);
			},
			onClose: () => {
				input.classList.remove("nohover");
			},
		});
	});
}
