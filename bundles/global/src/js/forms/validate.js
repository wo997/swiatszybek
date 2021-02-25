/* js[global] */

/**
 *
 * @typedef {{
 * input: PiepNode
 * errors: string[]
 * }} InputErrors
 */

/**
 *
 * @param {PiepNode[]} inputs
 * @returns {InputErrors[]}
 */
function getManyValidationErrors(inputs) {
	/** @type {InputErrors[]} */
	const inputs_errors = [];
	for (const input of inputs) {
		const errors = getInputValidationErrors(input);
		if (errors.length > 0) {
			inputs_errors.push({ input, errors });
		}
	}

	return inputs_errors;
}

function inputChangeValidation(input) {
	const errors = getInputValidationErrors(input);
	showValidationErrors(input, errors);
}

/**
 *
 * @param {PiepNode[]} inputs
 */
function validateInputs(inputs) {
	const inputs_errors = getManyValidationErrors(inputs);
	inputs_errors.forEach((input_errors) => {
		showValidationErrors(input_errors.input, input_errors.errors);
	});

	return inputs_errors;
}

/**
 *
 * @param {PiepNode} input
 * @param {string[]} errors
 */
function showValidationErrors(input, errors) {
	const wrong = errors.length > 0;
	if (!input.classList.contains("input_registered") && wrong) {
		input.addEventListener("change", () => {
			inputChangeValidation(input);
		});
		input.addEventListener("input", () => {
			inputChangeValidation(input);
		});
	}
	input.classList.toggle("invalid", wrong);
	input.dataset.tooltip = errors.join("<br>");
	if (wrong) {
		scrollIntoView(input, {
			callback: () => {
				input.focus();
			},
		});
	}
}

/**
 *
 * @param {PiepNode} input
 * @returns {string[]}
 */
function getInputValidationErrors(input) {
	const validator = input.dataset.validate;
	if (!validator) {
		return [];
	}
	const errors = [];
	const value = input._get_value({ plain: true });

	const [type, ...extra] = validator.split("|");

	if (!extra.includes("optional")) {
		if (value.trim() === "") {
			if (validator === "radio") {
				errors.push("Wybierz 1 opcję");
			} else {
				errors.push("Uzupełnij to pole");
			}
		}
	} else {
		switch (type) {
			case "number": {
				if (isNaN(value)) {
					errors.push("Podaj liczbę");
				}
				break;
			}
			// case "string": {
			// }
			// case "radio": {
			// }
		}
	}

	return errors;
}

// function fieldErrors(field) {
// 	field = $(field);

// 	var field_errors = [];
// 	var newError = (message) => {
// 		message = message ? message.trim() : "";
// 		if (field_errors.indexOf(message)) {
// 			field_errors.push(message);
// 		}
// 	};

// 	if (!field.hasAttribute("data-validate")) {
// 		return [];
// 	}

// 	var validator = field.getAttribute("data-validate");
// 	var [validatorType, ...validatorParams] = validator.split("|");

// 	var val = field._get_value();

// 	var optional = validator.indexOf("|optional") !== -1;

// 	if (val === "") {
// 		// if not empty - validate, clear af
// 		if (optional) {
// 			return [];
// 		}

// 		// show just one field that requires filling, dont abuse our cute user
// 		if (window.fieldRequiringFilling && window.fieldRequiringFilling != field) {
// 			return null;
// 		}

// 		window.fieldRequiringFilling = field;
// 		newError("Uzupełnij to pole");
// 		return field_errors;
// 	}

// 	var isList = false;

// 	if (field.classList.contains("simple-list")) {
// 		isList = true;
// 		validateSimpleList(field).forEach((error) => {
// 			newError(error);
// 		});
// 	}

// 	var params = {};
// 	if (validatorParams !== undefined && validatorParams.length !== 0) {
// 		validatorParams.forEach((param) => {
// 			var parts = param.split(":");
// 			if (parts.length == 0) {
// 				parts[1] = null;
// 			}
// 			params[parts[0]] = parts[1];
// 		});

// 		if (params["value"]) {
// 			var isCorrect = val == params["value"];
// 			if (!isCorrect) {
// 				if (params["value"] == 0) {
// 					newError("Musi być odznaczone");
// 				} else {
// 					newError("Pole wymagane");
// 				}
// 			}
// 		}

// 		if (params["match"]) {
// 			var target = $(params["match"]);
// 			if (!target) {
// 				console.error("Field missing");
// 			}
// 			var isCorrect = val == target._get_value();
// 			if (!isCorrect) {
// 				newError("Wartości nie są identyczne");
// 			}
// 		}

// 		if (params["length"]) {
// 			var errors = getSizeValidationErrors(val.length, params["length"], (info) => {
// 				return `Wymagana ilość znaków: ${info}`;
// 			});
// 			if (errors) {
// 				newError(errors);
// 			}
// 		}

// 		if (params["custom"]) {
// 			if (params["delay"]) {
// 				delay(params["custom"], params["delay"], window, [field]);
// 				return null;
// 			} else {
// 				var errors = window[params["custom"]](field);
// 				if (errors) {
// 					newError(errors);
// 				}
// 			}
// 		}

// 		if (params["blank_on_change"]) {
// 			return "blank";
// 		}

// 		if (isList) {
// 			var list = field.list;

// 			if (params["count"]) {
// 				var errors = getSizeValidationErrors(list.values.length, params["count"], (info) => {
// 					return `Wymagana ilość elementów: ${info}`;
// 				});

// 				if (errors) {
// 					newError(errors);
// 				}
// 			}
// 		}
// 	}
// 	// if you want to add another validator do it down below ;)
// 	if (validatorType == "tel") {
// 		if (!/[\d\+\- ]{6,}/.test(val)) {
// 			newError("Wpisz poprawny numer telefonu");
// 		}
// 	} else if (validatorType == "nip") {
// 		if (val.replace(/[^0-9]/g, "").length != 10) {
// 			newError("Wpisz poprawny NIP (10 cyfr)");
// 		}
// 	} else if (validatorType == "email") {
// 		const re = /\S+@\S+\.\S+/;
// 		if (!re.test(String(val).toLowerCase())) {
// 			newError("Wpisz poprawny adres email");
// 		}
// 	} else if (validatorType == "password") {
// 		// default password length
// 		if (!params || !params["length"]) {
// 			var isCorrect = val.length >= 8;

// 			if (!isCorrect) {
// 				newError("Wymagana długość: 8 znaków");
// 			}
// 		}
// 	} else if (validatorType == "price") {
// 		if (+val <= 0.001) {
// 			newError("Wpisz dodatnią wartość");
// 		}
// 	} else if (validatorType == "youtube-video") {
// 		if (!getIdFromYoutubeUrl(val)) {
// 			newError("Wpisz poprawny link do filmu z Youtube");
// 		}
// 	} else if (validatorType == "backend") {
// 		return null;
// 	} else if (validatorType == "url") {
// 		if (!validURL(val)) {
// 			newError("Wpisz poprawny adres url");
// 		}
// 	}

// 	return field_errors;
// }

// function getSizeValidationErrors(valLen, condition, message) {
// 	var lengthInfo = "";
// 	if (condition.indexOf("+") > 0) {
// 		var minLen = condition.replace("+", "");
// 		if (valLen < minLen) {
// 			lengthInfo = `min. ${minLen}`;
// 		}
// 	} else if (condition.indexOf("-") > 0) {
// 		var maxLen = condition.replace("-", "");
// 		if (valLen > maxLen) {
// 			lengthInfo = `max. ${maxLen}`;
// 		}
// 	} else if (/\d-\d/.test(condition)) {
// 		var [from, to] = condition.split("-");
// 		from = parseInt(from);
// 		to = parseInt(to);
// 		if (valLen < from || valLen > to) {
// 			lengthInfo = `${from}-${to}`;
// 		}
// 	} else {
// 		var reqLen = condition;
// 		if (valLen != reqLen) {
// 			lengthInfo = reqLen;
// 		}
// 	}
// 	if (lengthInfo) {
// 		return message(lengthInfo);
// 	}
// 	return false;
// }
