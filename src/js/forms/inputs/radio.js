/* js[global] */

document.addEventListener("click", (e) => {
	var target = $(e.target);

	var option = target.findParentByTagName("radio-option");
	if (option) {
		var input = option.findParentByTagName("radio-input");
		input.findAll("radio-option").forEach((e) => {
			e.classList.toggle("selected", e === option);
		});
		input.dispatchChange();
	}
});

function getRadioInputValue(input) {
	var value = "";
	var selected = input.find(".selected");
	if (!selected) {
		selected = input.find("[data-default]");
	}
	if (selected) {
		value = selected.getAttribute("value");
	}
	return value;
}

function setRadioInputValue(input, value, params = {}) {
	var option_exists = input.find(`radio-option[value="${value}"]`);
	if (!!option_exists) {
		input.findAll(`radio-option`).forEach((e) => {
			e.classList.toggle("selected", e.getAttribute("value") == value);
		});
	}
}
