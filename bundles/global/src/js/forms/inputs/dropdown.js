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
			const value = option.dataset.value;

			if (value === undefined) {
				return false;
			}

			removeClasses(".selected", ["selected"], input);
			option.classList.add("selected");

			input.dataset.value = value;
			input.classList.toggle("selected", value !== "");
			input._dispatch_change();
			if (input.classList.contains("static_label")) {
				option = first_option;
			}
			selected_option._set_content(option.innerHTML);

			return true;
		};
		selectOption(first_option);

		document.addEventListener("click", (ev) => {
			const target = $(ev.target);

			if (target._parent(".picker_wrapper")) {
				// you might want to add a single class to both datepicker and colorpickers so they don't close any other windows
				return;
			}

			if (!target._parent(input)) {
				input.classList.remove("dropped");
				return;
			}

			const option = target._parent("p-option");
			if (option) {
				const success = selectOption(option);
				if (!success) {
					return;
				}
			}
			const dropped = input.classList.toggle("dropped");

			if (dropped) {
				const children = options_wrapper._direct_children().length;
				// make is a square assuming the items are small enough
				const columns = Math.floor(Math.sqrt(children));
				options_wrapper.style.gridTemplateColumns = `repeat(${columns}, auto)`;
			}
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
