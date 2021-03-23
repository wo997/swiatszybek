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

/**
 *
 * @param {PiepNode} input
 */
function inputChangeValidation(input) {
	if (input.dataset.validate === undefined) {
		return;
	}
	const errors = getInputValidationErrors(input);
	showInputErrors(input, errors);
}

/**
 *
 * @param {PiepNode[]} inputs
 */
function validateInputs(inputs) {
	focus_first_error = true;
	const inputs_errors = getManyValidationErrors(inputs);
	inputs_errors.forEach((input_errors) => {
		showInputErrors(input_errors.input, input_errors.errors);
	});

	return inputs_errors;
}

let focus_first_error = false;

/**
 *
 * @param {PiepNode} input
 * @param {string[]} errors
 */
function showInputErrors(input, errors) {
	const wrong = errors.length > 0;
	if (!input.classList.contains("input_rgstrd") && wrong) {
		input.classList.add("input_rgstrd");
		if (!input.classList.contains("has_custom_validator")) {
			input.addEventListener("change", () => {
				inputChangeValidation(input);
			});
			input.addEventListener("input", () => {
				inputChangeValidation(input);
			});
		}
	}
	input.classList.toggle("invalid", wrong);
	if (input.classList.contains("pretty_errors")) {
		const pretty_errors = input._next();
		const input_errors = pretty_errors._child(".input_errors");
		pretty_errors.classList.toggle("correct", errors.length === 0);
		pretty_errors.classList.toggle("wrong", errors.length > 0);
		if (!input.classList.contains("pretty_errors_inline")) {
			if (errors.length > 0) {
				input_errors._set_content(errors.join("<br>"));
			}
			expand(input_errors, errors.length > 0);
		}
	} else {
		input.dataset.tooltip = errors.join("<br>");
	}

	if (wrong) {
		const focus = focus_first_error;
		focus_first_error = false;

		scrollIntoView(input, {
			callback: () => {
				if (focus) {
					input.focus();
				}
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
	if (validator === undefined) {
		return [];
	}
	const errors = [];
	const value = input._get_value({ plain: true });

	const extras = validator.split("|");

	const optional = extras.includes("optional");
	const empty = value.trim() === "";

	if (empty) {
		if (!optional) {
			if (validator === "radio") {
				errors.push("Wybierz 1 opcję");
			} else {
				errors.push("Uzupełnij to pole");
			}
		}
	} else {
		const add_extras = [];
		for (const extra of extras) {
			const [what, extra_val] = extra.split(":");
			if (what === "nip") {
				add_extras.push("length:10");
			}
			if (what === "password") {
				add_extras.push("length:{8,}");
			}
		}

		extras.push(...add_extras);

		for (const extra of extras) {
			const [what, extra_val] = extra.split(":");
			if (what === "email") {
				if (!validateEmail(value)) {
					errors.push(`Błędny adres e-mail`);
				}
			}
			if (what === "number") {
				if (isNaN(value)) {
					errors.push("Podaj liczbę");
				}
			}
			if (what === "length") {
				if (extra_val.match(/\{.*?\}/)) {
					let [min, max] = extra_val.split(",");
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
					const len = numberFromStr(extra_val);
					if (value.length !== len) {
						errors.push(`Wymagane ${len} znaków`);
					}
				}
			}
			if (what === "value") {
				if (extra_val.match(/\{.*?\}/)) {
					let [min, max] = extra_val.split(",");
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
			if (what === "match") {
				const match_input = $(extra_val);
				if (match_input === input) {
					console.error("Circular reference");
					errors.push("Błąd krytyczny");
				} else {
					// show only if other is fine
					if (validateInputs([match_input]).length === 0) {
						const req_val = match_input._get_value();
						if (value !== req_val) {
							errors.push("Wartości się nie zgadzają");
						}
					}
				}
			}
			if (what === "password") {
				const must_contain = [];

				if (!value.match(/[a-z]/)) {
					must_contain.push("min. 1 małą literę (a-z)");
				}
				if (!value.match(/[A-Z]/)) {
					must_contain.push("min. 1 wielką literę (A-Z)");
				}
				if (!value.match(/\d/)) {
					must_contain.push("min. 1 cyfrę (0-9)");
				}
				if (must_contain.length > 0) {
					errors.push(`Hasło musi zawierać ${must_contain.join(", ")}`);
				}
			}
			if (what === "custom") {
				if (extra_val) {
					window[extra_val](input);
				}
			}
		}
	}

	return errors;
}

function validateEmail(email) {
	const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(String(email).toLowerCase());
}
