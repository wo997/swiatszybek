/* js[global] */

document.addEventListener("click", (e) => {
	const target = $(e.target);

	const option = target._parent("radio-option", { skip: 0 });
	if (option) {
		const input = option._parent("radio-input", { skip: 0 });
		input._children("radio-option").forEach((e) => {
			if (input.classList.contains("unselectable")) {
				if (e === option) {
					e.classList.toggle("selected");
				} else {
					e.classList.remove("selected");
				}
			} else {
				e.classList.toggle("selected", e === option);
			}
		});
		input._dispatch_change();
	}
});

/**
 *
 * @param {PiepNode} input
 */
function getRadioInputValue(input) {
	let value = "";
	let selected = input._child(".selected");
	if (!selected) {
		selected = input._child(".default");
	}
	if (selected) {
		value = selected.getAttribute("value");
		selected.classList.add("selected");
	}
	return value;
}

function setRadioInputValue(input, value, params = {}) {
	input._children(`radio-option`).forEach((e) => {
		e.classList.toggle("selected", e.getAttribute("value") == value);
	});
}
