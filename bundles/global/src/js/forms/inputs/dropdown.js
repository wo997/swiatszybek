/* js[global] */

window.addEventListener("register-form-components", (ev) => {
	// @ts-ignore
	registerDropdowns(ev.detail.parent);
});

/**
 *
 * @param {PiepNode} parent
 */
function registerDropdowns(parent) {
	parent._children("p-dropdown:not(.drpdwn_rgstrd)").forEach((input) => {
		input.classList.add("drpdwn_rgstrd");

		input._set_content(
			html`
				<div class="selected_option"></div>
				<div class="options_wrapper">${input.innerHTML}</div>
			`
		);

		const selected_option = input._child(".selected_option");
		const options_wrapper = input._child(".options_wrapper");

		const first_option = options_wrapper._direct_children()[0];

		/**
		 *
		 * @param {PiepNode} option
		 */
		const selectOption = (option) => {
			input.dataset.value = option.dataset.value;
			input.classList.toggle("selected", option.dataset.value !== "");
			input._dispatch_change();
			if (input.classList.contains("static_label")) {
				option = first_option;
			}
			selected_option._set_content(option.innerHTML);
		};
		selectOption(first_option);

		document.addEventListener("click", (ev) => {
			const target = $(ev.target);
			if (!target._parent(input)) {
				input.classList.remove("dropped");
				return;
			}

			const option = target._parent("p-option");
			if (option) {
				selectOption(option);
			}
			input.classList.toggle("dropped");
		});

		// I prefer fixed width
		// const fix = () => {
		// 	if (input.classList.contains("dropped")) {
		// 		return;
		// 	}
		// 	// 2 comes from margin
		// 	input.style.minWidth = options_wrapper.getBoundingClientRect().width + 2 + "px";
		// };
		// document.addEventListener("click", () => {
		// 	setTimeout(fix);
		// });
		// fix();
	});
}

/**
 *
 * @param {PiepNode} input
 * @param {*} value
 */
function setDropdownValue(input, value) {}
