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
