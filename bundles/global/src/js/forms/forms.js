/* js[global] */

// window.addEventListener("beforeunload", function (e) {
// 	var form = $("[data-warn-before-leave]");
// 	if (!form) {
// 		return;
// 	}

// 	const wasState = form.initial_state;
// 	const nowState = getLast(form.history);

// 	if (!isEquivalent(wasState, nowState)) {
// 		e.returnValue = "Czy na pewno chcesz opuścić stronę?";
// 	}
// });

// function checkFormCloseWarning(form) {
// 	const wasState = form.initial_state;
// 	const nowState = form.history ? getLast(form.history) : getFormData(form);

// 	if (!isEquivalent(wasState, nowState)) {
// 		return confirm("Wprowadzone zmiany zostaną usunięte, czy chcesz je anulować?");
// 	}
// 	return true;
// }

domload(() => {
	registerForms();
});
windowload(() => {
	registerForms();
});

let input_delay_timeout;

/**
 *
 * @param {PiepNode} parent
 */
function registerForms(parent = undefined) {
	$$(".field.pretty_errors:not(.prty_err_rgstrd)").forEach((input) => {
		input.classList.add("prty_err_rgstrd");
		input.insertAdjacentHTML(
			"afterend",
			html`
				<div class="pretty_errors">
					<div class="input_correctness">
						<i class="fas fa-check"></i>
						<i class="fas fa-times"></i>
					</div>
					<div class="input_errors_wrapper">
						<div class="input_errors expand_y hidden animate_hidden"></div>
					</div>
				</div>
			`
		);

		const clb = () => {
			input_delay_timeout = undefined;
			const errors = getInputValidationErrors(input);
			if (errors.length === 0 || input._next().classList.contains("correct")) {
				if (input.classList.contains("has_custom_validator")) {
					getInputValidationErrors(input);
				} else {
					showInputErrors(input, errors);
				}
			}
		};

		if (input.dataset.validate === undefined) {
			return;
		}

		const extras = input.dataset.validate.split("|");
		if (extras.find((e) => e.split(":")[0] === "custom")) {
			input.classList.add("has_custom_validator");

			let input_delay = 500;
			let delay_info = extras.find((e) => e.split(":")[0] === "delay");
			if (delay_info) {
				input_delay = numberFromStr(delay_info.split(":")[1]);
			}
			if (input_delay_timeout) {
				clearTimeout(input_delay_timeout);
				input_delay_timeout = undefined;
			}
			input.addEventListener("input", () => {
				input_delay_timeout = setTimeout(clb, input_delay);
			});
		} else {
			input.addEventListener("input", clb);
		}
		input.addEventListener("change", () => {
			const input_delay_timeout_ref = input_delay_timeout;
			clb();

			setTimeout(() => {
				if (input_delay_timeout_ref) {
					clearTimeout(input_delay_timeout_ref);
					input_delay_timeout = undefined;
				}
			});
		});
	});

	$$(".input_correctness:not(.ic_rgstrd)").forEach((e) => {
		const input = e._parent()._prev();
		if (input.offsetHeight) {
			e.classList.add(".ic_rgstrd");
			e.style.setProperty("--top_offset", (-0.5 * input.offsetHeight).toPrecision(2) + "px");
		}
	});

	window.dispatchEvent(
		new CustomEvent("register-form-components", {
			detail: { parent: $(def(parent, document)) },
		})
	);
}

/**
 *
 * @param {PiepNode} form
 */
function submitForm(form) {
	const submit_btn = form._child(".submit_btn");
	if (submit_btn) {
		submit_btn.click();
	}
	return false;
}
