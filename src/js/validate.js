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
		inputs_errors.push({ input, errors });
	}

	return inputs_errors;
}

function inputChangeValidation(ev) {
	const input = ev.target;
	const errors = getInputValidationErrors(input);
	showValidationErrors(input, errors);
}

/**
 *
 * @param {PiepNode[]} inputs
 */
function showManyValidationErrors(inputs) {
	const inputs_errors = getManyValidationErrors(inputs);
	inputs_errors.forEach((input_errors) => {
		showValidationErrors(input_errors.input, input_errors.errors);
	});
}

/**
 *
 * @param {PiepNode} input
 * @param {string[]} errors
 */
function showValidationErrors(input, errors) {
	console.log(input);
	console.trace();
	if (!input.classList.contains("input_registered")) {
		input.addEventListener("change", inputChangeValidation);
		input.addEventListener("input", inputChangeValidation);
	}
	input.classList.toggle("invalid", errors.length > 0);
	input.dataset.tooltip = errors.join("<br>");
}

/**
 *
 * @param {PiepNode} input
 * @returns {string[]}
 */
function getInputValidationErrors(input) {
	const validator = input.dataset.validate;
	const errors = [];
	// @ts-ignore
	const value = input.value;
	switch (validator) {
		case "number": {
			if (!strNumerical(value)) {
				errors.push("Wpisz liczbę");
			}
			break;
		}
		case "string": {
			if (value.length === 0) {
				errors.push("Uzupełnij to pole");
			}
			break;
		}
	}

	return errors;
}
