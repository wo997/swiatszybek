/* js[global] */

window.addEventListener("register-form-components", registerDatepickers);

function getDatepickerDefaultOptions(e) {
	var options = {
		todayHighlight: true,
		todayBtn: true,
		clearBtn: true,
		maxView: 2,
		language: "pl",
		autohide: true,
	};
	var scroll_parent = e.findScrollParent();
	if (scroll_parent != window) {
		options.container = scroll_parent;
	}
	var orientation = e.getAttribute("data-orientation");
	if (orientation) {
		options.orientation = orientation;
	}
	return options;
}

// can't go before modals are created from raw html
window.addEventListener("load", () => {
	registerDatepickers();
});

function registerDatepickers() {
	$$(".default_datepicker:not(.registered)").forEach((e) => {
		e.classList.add("registered");
		createDatePicker(e);
	});
}

function createDatePicker(node) {
	return new Datepicker(node, getDatepickerDefaultOptions(node));
}

function createDateRangePicker(node) {
	var dateRangePicker = new DateRangePicker(
		node,
		getDatepickerDefaultOptions(node)
	);

	for (let i = 0; i < 2; i++) {
		dateRangePicker.datepickers[i].setOptions(
			getDatepickerDefaultOptions($(dateRangePicker.inputs[i]))
		);
	}

	return dateRangePicker;
}
