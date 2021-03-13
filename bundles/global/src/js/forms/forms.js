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
