/* js[admin] */

window.addEventListener("register-form-components", (ev) => {
	// @ts-ignore
	registerUnitInputs(ev.detail.parent);
});

/**
 *
 * @param {PiepNode} parent
 */
function registerUnitInputs(parent) {
	parent._children("unit-input:not(.unin_rgstrd)").forEach((container) => {
		container.classList.add("unin_rgstrd", "glue_children");
		const input = container._child("input");
		/** @type {HTMLSelectElement & PiepNode} */
		// @ts-ignore
		const select = container._child("select");

		input.classList.add("field");
		select.classList.add("field", "inline", "blank", "unit_picker");

		let last_val;

		/**
		 *
		 * @param {string} value
		 * @param {SetDataOptions} options
		 */
		container._set_value = (value = null, options = {}) => {
			const new_val = container._get_value();
			const same = new_val === last_val;

			value = def(value, "");
			let unit;
			for (const option of select.options) {
				if (typeof value === "string" && value.endsWith(option.value)) {
					if (!unit || option.value.length > unit.length) {
						unit = option.value;
					}
				}
			}

			// no unit and no char that aint a number, then give default - first
			if (!unit && !value.match(/[^\d]/)) {
				for (const option of select.options) {
					unit = option.value;
					break;
				}
			}

			select._set_value(unit, { quiet: true });
			input._set_value(value.substr(0, value.length - unit.length), { quiet: true });

			if (!options.quiet && !same) {
				container._dispatch_change();
			}
		};

		/**
		 *
		 * @param {GetDataOptions} options
		 */
		container._get_value = (options = {}) => {
			return input._get_value() + select._get_value();
		};
	});
}
