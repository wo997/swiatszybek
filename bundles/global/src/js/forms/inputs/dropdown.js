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

		const options_wrapper = input._child(".options_wrapper");
		const first_option = options_wrapper._direct_children()[0];

		if (first_option) {
			selectDropdownOption(input, first_option);
		}

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
				const success = selectDropdownOption(input, option);

				if (success) {
					input._dispatch_change();
				} else {
					return;
				}
			}
			const dropped = input.classList.toggle("dropped");

			if (dropped) {
				const children = options_wrapper._direct_children().length;
				// make is a square assuming the items are small enough
				const columns = children > 5 ? Math.floor(Math.sqrt(children)) : 1;
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
 * @param {string} value
 * @param {SetDataOptions} options
 */
function setDropdownValue(input, value, options = {}) {
	const options_wrapper = input._child(".options_wrapper");
	options_wrapper._direct_children().forEach((option) => {
		const match_value = option.dataset.match;
		const option_value = option.dataset.value;

		if (match_value !== undefined) {
			if (!value.match(new RegExp(match_value))) {
				return;
			}

			removeClasses(".selected", ["selected"], input);
			input.dataset.value = value;
			input.classList.add("selected");
			option.classList.add("selected");
		} else if (option_value !== undefined) {
			if (option_value != value) {
				return;
			}
			if (option_value === "" && option_value !== value) {
				return;
			}

			selectDropdownOption(input, option, options);
		}
	});
}

/**
 * @param {PiepNode} input
 * @param {PiepNode} option
 * @param {SetDataOptions} options
 */
function selectDropdownOption(input, option, options = {}) {
	const selected_option = input._child(".selected_option");
	const options_wrapper = input._child(".options_wrapper");

	const value = option.dataset.value;

	if (value === undefined) {
		return false;
	}

	removeClasses(".selected", ["selected"], input);
	option.classList.add("selected");

	input.dataset.value = value;
	input.classList.toggle("selected", value !== "");
	if (input.classList.contains("static_label")) {
		const first_option = options_wrapper._direct_children()[0];
		option = first_option;
	}
	if (option) {
		selected_option._set_content(option.innerHTML);
	}

	return true;
}
