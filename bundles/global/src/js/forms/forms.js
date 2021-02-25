/* js[global] */

windowload(() => {
	registerForms();
});

window.addEventListener("beforeunload", function (e) {
	var form = $("[data-warn-before-leave]");
	if (!form) {
		return;
	}

	const wasState = form.initial_state;
	const nowState = getLast(form.history);

	if (!isEquivalent(wasState, nowState)) {
		e.returnValue = "Czy na pewno chcesz opuścić stronę?";
	}
});

function checkFormCloseWarning(form) {
	const wasState = form.initial_state;
	const nowState = form.history ? getLast(form.history) : getFormData(form);

	if (!isEquivalent(wasState, nowState)) {
		return confirm("Wprowadzone zmiany zostaną usunięte, czy chcesz je anulować?");
	}
	return true;
}

function setFormInitialState(form) {
	form = $(form);
	form.initial_state = getFormData(form);

	form.history = [form.initial_state];
	registerFormHistory(form);
}

function setFormData(data, form, params = {}) {
	if (!data) {
		console.error("No form data found");
		return;
	}

	form = $(form);

	form.setting_data = true;

	form.dispatchEvent(
		new CustomEvent("before_set_form_data", {
			detail: {
				data,
			},
		})
	);

	if (!data) {
		return;
	}

	registerForms();

	Object.entries(data).forEach(([name, value]) => {
		if (typeof value === "object") {
			var sub_form = form._child(`[data-form="${name}"]`);
			if (sub_form) {
				// not always found, thats tricky
				return setFormData(value, sub_form, params);
			}
		}

		var selector = `[name="${name}"]`;
		var e = form._child(selector);
		if (!e) {
			return;
		}

		var parent_named_node = e._parent("[name]");
		// only direct named children communicate with subform
		if (parent_named_node && parent_named_node._parent(form)) {
			return;
		}

		var value_params = {};
		if (params.data && params.data[name]) {
			value_params = params.data[name];
		}

		if (params.quiet) {
			value_params.quiet = params.quiet;
		}

		if (params.history && e.hasAttribute("data-ignore-history")) {
			return;
		}

		e._set_value(value, value_params);
	});

	delete form.setting_data;

	if (!form.initial_state) {
		setFormInitialState(form);
	}

	resizeCallback();
	lazyLoadImages(false);

	form.dispatchEvent(
		new CustomEvent("after_set_form_data", {
			detail: {
				data,
			},
		})
	);

	form.setAttribute("data-loaded", true);
}

function getFormData(form, params = {}) {
	if (!form) {
		return;
	}
	form = $(form);
	var data = {};

	var excludeHidden = form.hasAttribute("data-exclude-hidden");

	$(form)
		._children(`[name]`)
		.forEach((e) => {
			if (excludeHidden && e._parent(".hidden, .form-hidden")) {
				return;
			}
			var parent_named_node = e._parent("[name]");
			// only direct named children communicate with subform
			if (parent_named_node && parent_named_node._parent(form)) {
				return;
			}

			var field_name = e.getAttribute("name");
			var field_value = e._get_value();

			var parent_sub_form = e;
			var inside = true;

			while (parent_sub_form) {
				if (!parent_sub_form._parent(form)) {
					inside = false;
					break;
				}

				var p = parent_sub_form._parent("[data-form]");
				if (p != form) {
					parent_sub_form = p;
				} else {
					break;
				}
			}
			if (inside && parent_sub_form && parent_sub_form != e) {
				field_name = parent_sub_form.getAttribute("data-form");
				field_value = getFormData(parent_sub_form);
			}

			data[field_name] = field_value;
		});

	form.dispatchEvent(
		new CustomEvent("after_get_form_data", {
			detail: {
				data,
			},
		})
	);

	return data;
}

domload(() => {
	registerForms();
});

/**
 *
 * @param {PiepNode} parent
 */
function registerForms(parent = undefined) {
	window.dispatchEvent(
		new CustomEvent("register-form-components", {
			detail: { parent: $(def(parent, document)) },
		})
	);
}

function formFieldOnChangeEvent(event) {
	const field = event.target;
	formFieldOnChange(field);

	const parent_form = field.parent_form;
	if (parent_form && parent_form.history && !parent_form.setting_data) {
		if (!field.hasAttribute("data-ignore-history")) {
			pushFormHistory(parent_form);
		}
	}
	field.prev_value = field._get_value();
}

function formFieldOnChange(field, options = {}) {
	if (!field.classList.contains("change-registered")) {
		return;
	}
	if (!field.classList.contains("input-registered")) {
		field.classList.add("input-registered");
		field.addEventListener("input", formFieldOnInputEvent);
	}
	return formFieldOnInput(field, options);
}

function formFieldOnInputEvent(event) {
	formFieldOnInput(event.target);
}

function formFieldOnInput(field, options = {}) {
	if (!field.classList.contains("input-registered")) {
		return;
	}
	const errors = fieldErrors(field);

	showFieldErrors(field, errors, options);
	return errors;
}

function rewrite(source, target, options = {}) {
	var val = source._get_value();
	if (options.link) {
		val = escapeUrl(val);
	}
	target._set_value(val);
}
