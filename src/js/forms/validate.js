/* js[global] */

function showFieldErrors(field, errors = [], options = {}) {
	if (errors === null) {
		return;
	}

	field = $(field);

	var wrong = Array.isArray(errors) && errors.length > 0;

	// rare
	var error_target = field.getAttribute("data-error-target");
	if (error_target) {
		$(error_target).classList.toggle("field-error-visible", wrong);
	}

	// look above or inside
	var field_title = null;
	var previousNode = field._prev();
	if (!field_title && previousNode) {
		if (
			previousNode.classList.contains("label") ||
			previousNode.classList.contains("above-simple-list")
		) {
			field_title = previousNode;
		} else {
			var maybe = previousNode._child(".label");
			if (maybe) {
				field_title = maybe;
			}
		}
	}
	if (!field_title) {
		var inside = field._child(".label");
		if (inside) {
			field_title = inside;
		}
	}
	if (!field_title) {
		const field_wrapper = field._parent(".field-wrapper");
		if (field_wrapper) {
			field_title = field_wrapper._child(".label");
		}
	}

	if (field.classList.contains("warn-triangle")) {
		if (field_title) {
			var warning = field_title._child(".fa-exclamation-triangle");
			if (warning) {
				warning.remove();
			}

			if (wrong) {
				field_title.insertAdjacentHTML(
					"beforeend",
					`<i
                  class="fas fa-exclamation-triangle"
                  style="color: red;transform: scale(1.25);margin-left:4px"
                  data-tooltip="${errors.join("<br>")}">
                </i>`
				);
			}
		}
	} else if (field.classList.contains("warn-outline")) {
		field.classList.toggle("warn-outline-active", wrong);
	} else {
		var wrapper = field;
		if (field.type == "checkbox") {
			wrapper = wrapper._parent();
		}

		const inputElements = wrapper._next();
		const validationBox = inputElements
			? inputElements._child(".message_wrapper")
			: null;
		const correctIndicator = inputElements
			? inputElements._child(".correctness .correct")
			: null;
		if (!correctIndicator && field.hasAttribute("data-validate")) {
			console.error(
				field,
				"To validate the form you need to be register it with registerForms(form) or add data-form attribute before content is loaded. You can also change the error display type by adding warn-outline class to the field"
			);
			return;
		}
		const wrongIndicator = inputElements
			? inputElements._child(".correctness .wrong")
			: null;
		const toggleErrorIcons = (type) => {
			if (correctIndicator && wrongIndicator) {
				if (type == "correct") {
					wrongIndicator.classList.remove("visible");
					correctIndicator.classList.add("visible");
				} else if (type == "wrong") {
					correctIndicator.classList.remove("visible");
					wrongIndicator.classList.add("visible");
				} else {
					correctIndicator.classList.remove("visible");
					wrongIndicator.classList.remove("visible");
				}
			}
		};

		if (wrong) {
			toggleErrorIcons("wrong");
			validationBox._child(".message").innerHTML = errors.join("<br>");
			expand(validationBox, true, {
				duration: 350,
			});
		} else {
			if (errors === "blank") {
				toggleErrorIcons("blank");
				expand(validationBox, false, {
					duration: 350,
				});
			} else {
				toggleErrorIcons("correct");
				expand(validationBox, false, {
					duration: 350,
				});
			}
		}
	}

	if (wrong) {
		if (options.scroll) {
			scrollToInvalid(field);
		}
	} else {
		if (window.fieldRequiringFilling == field) {
			window.fieldRequiringFilling = null;
		}
	}
}

function validateForm(form, params = {}) {
	// var elem = params.form ? $(params.form) : document;
	form = $(form);

	var fields = form._children("[data-validate]");
	for (const field of fields) {
		if (field._parent(".hidden")) continue;

		if (
			params.except_backend &&
			field.getAttribute("data-validate").indexOf("backend") === 0
		) {
			continue;
		}

		var errors = formFieldOnChange(field, { scroll: true });
		if (Array.isArray(errors) && errors.length > 0) {
			return false;
		}
	}

	return true;
}

function getSizeValidationErrors(valLen, condition, message) {
	var lengthInfo = "";
	if (condition.indexOf("+") > 0) {
		var minLen = condition.replace("+", "");
		if (valLen < minLen) {
			lengthInfo = `min. ${minLen}`;
		}
	} else if (condition.indexOf("-") > 0) {
		var maxLen = condition.replace("-", "");
		if (valLen > maxLen) {
			lengthInfo = `max. ${maxLen}`;
		}
	} else if (/\d-\d/.test(condition)) {
		var [from, to] = condition.split("-");
		from = parseInt(from);
		to = parseInt(to);
		if (valLen < from || valLen > to) {
			lengthInfo = `${from}-${to}`;
		}
	} else {
		var reqLen = condition;
		if (valLen != reqLen) {
			lengthInfo = reqLen;
		}
	}
	if (lengthInfo) {
		return message(lengthInfo);
	}
	return false;
}

function fieldErrors(field) {
	field = $(field);

	var field_errors = [];
	var newError = (message) => {
		message = message ? message.trim() : "";
		if (field_errors.indexOf(message)) {
			field_errors.push(message);
		}
	};

	if (!field.hasAttribute("data-validate")) {
		return [];
	}

	var validator = field.getAttribute("data-validate");
	var [validatorType, ...validatorParams] = validator.split("|");

	var val = field._get_value();

	var optional = validator.indexOf("|optional") !== -1;

	if (val === "") {
		// if not empty - validate, clear af
		if (optional) {
			return [];
		}

		// show just one field that requires filling, dont abuse our cute user
		if (window.fieldRequiringFilling && window.fieldRequiringFilling != field) {
			return null;
		}

		window.fieldRequiringFilling = field;
		newError("Uzupełnij to pole");
		return field_errors;
	}

	var isList = false;

	if (field.classList.contains("simple-list")) {
		isList = true;
		validateSimpleList(field).forEach((error) => {
			newError(error);
		});
	}

	var params = {};
	if (validatorParams !== undefined && validatorParams.length !== 0) {
		validatorParams.forEach((param) => {
			var parts = param.split(":");
			if (parts.length == 0) {
				parts[1] = null;
			}
			params[parts[0]] = parts[1];
		});

		if (params["value"]) {
			var isCorrect = val == params["value"];
			if (!isCorrect) {
				if (params["value"] == 0) {
					newError("Musi być odznaczone");
				} else {
					newError("Pole wymagane");
				}
			}
		}

		if (params["match"]) {
			var target = $(params["match"]);
			if (!target) {
				console.error("Field missing");
			}
			var isCorrect = val == target._get_value();
			if (!isCorrect) {
				newError("Wartości nie są identyczne");
			}
		}

		if (params["length"]) {
			var errors = getSizeValidationErrors(
				val.length,
				params["length"],
				(info) => {
					return `Wymagana ilość znaków: ${info}`;
				}
			);
			if (errors) {
				newError(errors);
			}
		}

		if (params["custom"]) {
			if (params["delay"]) {
				delay(params["custom"], params["delay"], window, [field]);
				return null;
			} else {
				var errors = window[params["custom"]](field);
				if (errors) {
					newError(errors);
				}
			}
		}

		if (params["blank_on_change"]) {
			return "blank";
		}

		if (isList) {
			var list = field.list;

			if (params["count"]) {
				var errors = getSizeValidationErrors(
					list.values.length,
					params["count"],
					(info) => {
						return `Wymagana ilość elementów: ${info}`;
					}
				);

				if (errors) {
					newError(errors);
				}
			}
		}
	}
	// if you want to add another validator do it down below ;)
	if (validatorType == "tel") {
		if (!/[\d\+\- ]{6,}/.test(val)) {
			newError("Wpisz poprawny numer telefonu");
		}
	} else if (validatorType == "nip") {
		if (val.replace(/[^0-9]/g, "").length != 10) {
			newError("Wpisz poprawny NIP (10 cyfr)");
		}
	} else if (validatorType == "email") {
		const re = /\S+@\S+\.\S+/;
		if (!re.test(String(val).toLowerCase())) {
			newError("Wpisz poprawny adres email");
		}
	} else if (validatorType == "password") {
		// default password length
		if (!params || !params["length"]) {
			var isCorrect = val.length >= 8;

			if (!isCorrect) {
				newError("Wymagana długość: 8 znaków");
			}
		}
	} else if (validatorType == "price") {
		if (+val <= 0.001) {
			newError("Wpisz dodatnią wartość");
		}
	} else if (validatorType == "youtube-video") {
		if (!getIdFromYoutubeUrl(val)) {
			newError("Wpisz poprawny link do filmu z Youtube");
		}
	} else if (validatorType == "backend") {
		return null;
	} else if (validatorType == "url") {
		if (!validURL(val)) {
			newError("Wpisz poprawny adres url");
		}
	}

	return field_errors;
}

function clearAllErrors(node = null) {
	var fields = node
		? $(node)._children(`[data-validate]`)
		: $$(`[data-form] [data-validate]`);
	fields.forEach((field) => {
		var errors = fieldErrors(field);
		if (Array.isArray(errors) && errors.length > 0) {
			showFieldErrors(field, "blank");
			field.removeEventListener("input", formFieldOnInputEvent);
		}
	});
}
