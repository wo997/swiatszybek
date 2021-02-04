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

var scrollingToInvalid = false;
function scrollToInvalid(field) {
	if (scrollingToInvalid) {
		return;
	}
	scrollingToInvalid = true;
	scrollIntoView(field, {
		callback: () => {
			scrollingToInvalid = false;
			field.focus();
		},
	});
}

domload(() => {
	registerForms();
});

function registerForms(form = undefined) {
	form = $(form);
	let inputs = [];
	if (form === undefined) {
		inputs = $(document.body)._children(
			//"[data-form] [data-validate]:not(.change-registered)"
			`[data-form] [name]:not(.change-registered)`
		);
	} else {
		//inputs = $(form)._children("[data-validate]:not(.change-registered)");
		inputs = form._children(`[name]:not(.change-registered)`);

		form.addEventListener("keydown", (e) => {
			// IT DOES NOT WORK, it's because we register all forms at once every time, these need to be changed
			// btw u might wanna change registered to abbrev like rdy
			setTimeout(() => {
				if (e.key === "Enter") {
					var submit = $(form)._child("[data-submit]");
					if (submit) {
						submit.click();
					}
				}
			});
		});
	}

	window.dispatchEvent(new Event("register-form-components"));

	var unique_forms = [];
	inputs.forEach((field) => {
		const parent_form = field._parent("[data-form]");

		field.parent_form = parent_form;

		if (unique_forms.indexOf(parent_form) === -1) {
			unique_forms.push(parent_form);
		}

		field.classList.add("change-registered");
		field.addEventListener("change", formFieldOnChangeEvent);

		let obj = field;
		if (field.type == "checkbox") {
			obj = obj._parent();
		}

		if (
			field.classList.contains("field") &&
			!field.classList.contains("warn-triangle") &&
			!field.classList.contains("warn-outline") &&
			!field.classList.contains("no-wrap")
		) {
			// TODO: what if the user defined the field wrapper already? should be left as it is
			obj.insertAdjacentHTML("afterend", `<div class="field-wrapper"></div>`);
			const field_wrapper = obj._next();
			field_wrapper.appendChild(obj);
			if (field.classList.contains("inline")) {
				field_wrapper.classList.add("inline");
			}
			const dwc = field.getAttribute("data-wrapper-class");
			if (dwc) {
				field_wrapper.classList.add(...dwc.split(" "));
			}

			const dws = field.getAttribute("data-wrapper-style");
			if (dws) {
				field_wrapper.style.cssText = dws;
			}

			if (field.hasAttribute("data-validate")) {
				field_wrapper.insertAdjacentHTML(
					"beforeend",
					html`
						<div class="input_nodes">
							<div class="correctness">
								<i class="fas fa-check correct"></i>
								<i class="fas fa-times wrong"></i>
							</div>
							<div class="message_wrapper expand_y hidden animate_hidden">
								<div class="message"></div>
							</div>
						</div>
					`
				);
			}
		}

		if (field.hasAttribute("data-input-change")) {
			field.addEventListener("input", () => {
				var ddc = field.getAttribute("data-input-change");
				if (ddc) {
					setTimeout(() => {
						field._set_value();
					}, ddc);
				} else {
					field._set_value();
				}
			});
		}
	});

	for (const form of unique_forms) {
		registerFormHistory(form);
	}
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

function togglePasswordFieldType(btn, input, make_visible = null) {
	var make_visible = def(make_visible, btn.classList.contains("fa-eye"));
	if (make_visible) {
		btn.classList.replace("fa-eye", "fa-eye-slash");
		btn.setAttribute("data-tooltip", "Ukryj hasło");
		input.type = "text";
	} else {
		btn.classList.replace("fa-eye-slash", "fa-eye");
		btn.setAttribute("data-tooltip", "Pokaż hasło");
		input.type = "password";
	}
}

function rewrite(source, target, options = {}) {
	var val = source._get_value();
	if (options.link) {
		val = escapeUrl(val);
	}
	target._set_value(val);
}
