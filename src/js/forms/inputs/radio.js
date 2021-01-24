/* js[global] */

document.addEventListener("click", (e) => {
	var target = $(e.target);

	var option = target._parent("radio-option", { skip: 0 });
	if (option) {
		var input = option._parent("radio-input", { skip: 0 });
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
