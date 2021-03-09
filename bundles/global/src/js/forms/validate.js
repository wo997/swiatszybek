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
	showInputErrors(input, errors);
}

/**
 *
 * @param {PiepNode[]} inputs
 */
function validateInputs(inputs) {
	const inputs_errors = getManyValidationErrors(inputs);
	inputs_errors.forEach((input_errors) => {
		showInputErrors(input_errors.input, input_errors.errors);
	});

	return inputs_errors;
}

/**
 *
 * @param {PiepNode} input
 * @param {string[]} errors
 */
function showInputErrors(input, errors) {
	const wrong = errors.length > 0;
	if (!input.classList.contains("input_registered") && wrong) {
		input.classList.add("input_registered");
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
 */
function clearInputErrors(input) {
	showInputErrors(input, []);
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

	const [type, ...extras] = validator.split("|");

	for (const extra of extras) {
		const [what, val] = extra.split(":");
		if (what === "length") {
			if (val.match(/\{.*?\}/)) {
				let [min, max] = val.split(",");
				// @ts-ignore
				min = numberFromStr(min);
				// @ts-ignore
				max = numberFromStr(max);

				if (min !== "" && value.length < min) {
					errors.push(`Podaj min. ${min} znaków`);
				}
				if (max !== "" && value.length > max) {
					errors.push(`Podaj max. ${max} znaków`);
				}
			} else {
				const len = numberFromStr(val);
				if (value.length !== len) {
					errors.push(`Wymagane ${len} znaków`);
				}
			}
		}
		if (what === "value") {
			if (val.match(/\{.*?\}/)) {
				let [min, max] = val.split(",");
				// @ts-ignore
				min = numberFromStr(min);
				// @ts-ignore
				max = numberFromStr(max);

				if (min !== "" && value < min) {
					errors.push(`Minimalna wartość: ${min}`);
				}
				if (max !== "" && value > max) {
					errors.push(`Maksymalna wartość: ${max}`);
				}
			}
		}
	}

	if (!extras.includes("optional")) {
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
