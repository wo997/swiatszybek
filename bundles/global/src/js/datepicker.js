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

domload(() => {
	document.addEventListener("mousemove", (ev) => {
		const target = $(ev.target);

		const default_datepicker = target._parent(".default_datepicker");
		if (default_datepicker && !default_datepicker.classList.contains("dtp_rgstrd")) {
			default_datepicker.classList.add("dtp_rgstrd", "datepicker-input");
			createDatePicker(default_datepicker);
		}

		const default_daterangepicker = target._parent(".default_daterangepicker");
		if (default_daterangepicker && !default_daterangepicker.classList.contains("dtrp_rgstrd")) {
			default_daterangepicker.classList.add("dtrp_rgstrd");
			createDateRangePicker(default_daterangepicker);
		}
	});
});

/**
 *
 * @param {PiepNode} parent
 */
function registerDatepickers(parent) {
	parent._children(".default_datepicker:not(.datepicker-input)").forEach((e) => {
		e.classList.add("datepicker-input");
	});
	parent._children(".default_daterangepicker:not(.dtpc_r)").forEach((e) => {
		e.classList.add("dtpc_r");
		e._children("input").forEach((i) => {
			i.classList.add("datepicker-input");
		});
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
	const dateRangePicker = new DateRangePicker(node, getDatepickerDefaultOptions(node));

	for (let i = 0; i < 2; i++) {
		const node = $(dateRangePicker.inputs[i]);
		dateRangePicker.datepickers[i].setOptions(getDatepickerDefaultOptions(node));
	}

	return dateRangePicker;
}
