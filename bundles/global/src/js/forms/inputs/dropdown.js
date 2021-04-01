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

		selected_option._set_content(options_wrapper._direct_children()[0].innerHTML);

		input.addEventListener("click", (ev) => {
			const target = $(ev.target);

			if (target._parent("c-option")) {
			}
			input.classList.toggle("dropped");
		});

		const fix = () => {
			if (input.classList.contains("dropped")) {
				return;
			}
			// 2 comes from margin
			input.style.minWidth = options_wrapper.getBoundingClientRect().width + 2 + "px";
		};
		document.addEventListener("click", () => {
			setTimeout(fix);
		});
		fix();
	});
}

/**
 *
 * @param {PiepNode} input
 * @param {*} value
 */
function setDropdownValue(input, value) {}
