/* js[global] */

window.addEventListener("register-form-components", (ev) => {
	// @ts-ignore
	registerDatepickers(ev.detail.parent);
});

function getDatepickerDefaultOptions(e) {
	var options = {
		todayHighlight: true,
		todayBtn: true,
		clearBtn: true,
		maxView: 2,
		language: "pl",
		autohide: true,
	};
	var scroll_parent = e._scroll_parent();
	if (scroll_parent != window) {
		options.container = scroll_parent;
	}
	var orientation = e.dataset.orientation;
	if (orientation) {
		options.orientation = orientation;
	}
	return options;
}

/**
 *
 * @param {PiepNode} parent
 */
function registerDatepickers(parent) {
	parent._children(".default_datepicker:not(.dtp_rgstrd)").forEach((e) => {
		e.classList.add("dtp_rgstrd");
		createDatePicker(e);
	});
	parent._children(".default_daterangepicker:not(.dtrp_rgstrd)").forEach((e) => {
		e.classList.add("dtrp_rgstrd");
		createDateRangePicker(e);
	});
}

/**
 *
 * @param {PiepNode} node
 * @returns
 */
function createDatePicker(node) {
	node.addEventListener("changeDate", () => {
		node._dispatch_change();
	});
	// @ts-ignore
	return new Datepicker(node, getDatepickerDefaultOptions(node));
}

function createDateRangePicker(node) {
	// @ts-ignore
	var dateRangePicker = new DateRangePicker(node, getDatepickerDefaultOptions(node));

	for (let i = 0; i < 2; i++) {
		dateRangePicker.datepickers[i].setOptions(getDatepickerDefaultOptions($(dateRangePicker.inputs[i])));
	}

	return dateRangePicker;
}
