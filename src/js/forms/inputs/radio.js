/* js[global] */

document.addEventListener("click", (e) => {
	var target = $(e.target);

	var option = target.findParentByTagName("radio-option");
	if (option) {
		var input = option.findParentByTagName("radio-input");
		input._children("radio-option").forEach((e) => {
			e.classList.toggle("selected", e === option);
		});
		input._dispatch_change();
	}
});

function getRadioInputValue(input) {
	var value = "";
	var selected = input._child(".selected");
	if (!selected) {
		selected = input._child("[data-default]");
	}
	if (selected) {
		value = selected.getAttribute("value");
	}
	return value;
}

function setRadioInputValue(input, value, params = {}) {
	var option_exists = input._child(`radio-option[value="${value}"]`);
	if (!!option_exists) {
		input._children(`radio-option`).forEach((e) => {
			e.classList.toggle("selected", e.getAttribute("value") == value);
		});
	}
}
