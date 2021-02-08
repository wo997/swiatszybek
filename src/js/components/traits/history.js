/* js[global] */

/**
 * @typedef {{
 * _data_history: Array
 * _history_steps_back: number
 * _setting_data_from_history: boolean
 * _active_element: Element
 * _clean_history()
 * _separate_history_timeout: number | undefined
 * } & AnyComp} CompWithHistory
 */

/**
 * @param {CompWithHistory} comp
 */
function renderCompHistory(comp) {
	comp._nodes.history_undo.toggleAttribute("disabled", comp._history_steps_back >= comp._data_history.length - 1);
	comp._nodes.history_redo.toggleAttribute("disabled", comp._history_steps_back === 0);
}

let history_attention = false;
document.addEventListener(
	"click",
	() => {
		history_attention = true;
		console.log(1);
	},
	true
);

/**
 * @param {BaseComp} c
 */
function clearCompHistory(c) {
	/** @type {CompWithHistory} */
	// @ts-ignore
	const comp = c;
	if (comp._data !== undefined && comp._data_history === undefined) {
		console.error("Component doesn't have history", comp);
		return;
	}
	comp._data_history = [];
	if (comp._data) {
		comp._data_history.push(JSON.stringify(comp._data));
	}
	comp._history_steps_back = 0;
	comp._active_element = undefined;
	renderCompHistory(comp);
}

registerCompTrait("history", {
	template: html`<div data-node="history" class="history_btns">
		<button class="btn subtle fas fa-undo" data-node="history_undo" data-tooltip="Cofnij zmiany"></button>
		<button class="btn subtle fas fa-redo" data-node="history_redo" data-tooltip="Ponów zmiany"></button>
	</div>`,
	initialize: (c) => {
		/** @type {CompWithHistory} */
		// @ts-ignore
		const comp = c;

		comp._setting_data_from_history = false;

		const setCompDataFromHistory = () => {
			comp.classList.add("freeze");
			comp._setting_data_from_history = true;
			comp._set_data(JSON.parse(comp._data_history[comp._data_history.length - 1 - comp._history_steps_back]));
			setTimeout(() => {
				comp._setting_data_from_history = false;
				comp.classList.remove("freeze");
			});
		};

		comp._nodes.history_undo.addEventListener("click", () => {
			comp._history_steps_back = Math.min(comp._history_steps_back + 1, comp._data_history.length - 1);
			setCompDataFromHistory();
		});
		comp._nodes.history_redo.addEventListener("click", () => {
			comp._history_steps_back = Math.max(0, comp._history_steps_back - 1);
			setCompDataFromHistory();
		});

		clearCompHistory(comp);
	},
	render: (c) => {
		/** @type {CompWithHistory} */
		// @ts-ignore
		const comp = c;

		if (comp._setting_data_from_history) {
			renderCompHistory(comp);
			return;
		}

		setTimeout(() => {
			const json = JSON.stringify(comp._data);

			if (comp._history_steps_back > 0) {
				comp._data_history.splice(comp._data_history.length - comp._history_steps_back, comp._history_steps_back);
				comp._history_steps_back = 0;
			} else if (history_attention) {
				history_attention = false;
			} else if (comp._active_element === document.activeElement && json !== def(comp._data_history[comp._data_history.length - 2])) {
				comp._data_history.splice(comp._data_history.length - 1, 1);
			}
			comp._active_element = document.activeElement;

			if (comp._separate_history_timeout) {
				clearTimeout(comp._separate_history_timeout);
			}
			comp._separate_history_timeout = setTimeout(() => {
				comp._active_element = undefined;
				comp._separate_history_timeout = undefined;
			}, 3000);

			if (comp._data) {
				if (json !== getLast(comp._data_history)) {
					comp._data_history.push(json);
				}
			}

			renderCompHistory(comp);
		});

		comp._setting_data_from_history = false;
	},
});
