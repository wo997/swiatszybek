/* js[global] */

/**
 * @typedef {{
 * _data_history: Array
 * _history_steps_back: number
 * _setting_data_from_history: boolean
 * _active_element: Element
 * _clean_history()
 * _separate_history_timeout: number | undefined
 * _history_undo()
 * _history_redo()
 * } & AnyComp} CompWithHistory
 */

/**
 * @typedef {{
 * history: PiepNode
 * }} CompWithHistoryNodes
 */

/**
 * @param {CompWithHistory} comp
 */
function renderCompHistory(comp) {
	comp._nodes.history_undo.toggleAttribute("disabled", comp._history_steps_back >= comp._data_history.length - 1);
	comp._nodes.history_redo.toggleAttribute("disabled", comp._history_steps_back === 0);
}

/** @type {CompWithHistory} */
let history_comp_focus = undefined;
let history_attention = false;
function historyFocus(ev) {
	history_attention = true;

	if (!ev.target) {
		return;
	}

	const has_history_trait = $(ev.target)._parent(".has_history_trait");
	if (has_history_trait) {
		// @ts-ignore
		history_comp_focus = has_history_trait;
	}
}
document.addEventListener(
	"mousedown",
	(ev) => {
		historyFocus(ev);
	},
	true
);
document.addEventListener(
	"touchstart",
	(ev) => {
		historyFocus(ev);
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
		comp._data_history.push(cloneObject(comp._data));
	}
	comp._history_steps_back = 0;
	comp._active_element = undefined;
	renderCompHistory(comp);
}

registerCompTrait("history", {
	template: html`<div data-node="history">
		<button class="btn subtle fas fa-undo" data-node="history_undo" data-tooltip="Cofnij zmiany"></button>
		<button class="btn subtle fas fa-redo" data-node="history_redo" data-tooltip="Ponów zmiany"></button>
	</div>`,
	initialize: (c) => {
		/** @type {CompWithHistory} */
		// @ts-ignore
		const comp = c;

		comp._setting_data_from_history = false;

		comp.classList.add("has_history_trait");

		const setCompDataFromHistory = () => {
			comp.classList.add("freeze");
			comp._setting_data_from_history = true;
			comp._set_data(comp._data_history[comp._data_history.length - 1 - comp._history_steps_back]);
			setTimeout(() => {
				comp._setting_data_from_history = false;
				comp.classList.remove("freeze");
			});
		};

		comp._history_undo = () => {
			comp._history_steps_back = Math.min(comp._history_steps_back + 1, comp._data_history.length - 1);
			setCompDataFromHistory();
		};
		comp._history_redo = () => {
			comp._history_steps_back = Math.max(0, comp._history_steps_back - 1);
			setCompDataFromHistory();
		};

		comp._nodes.history_undo.addEventListener("click", () => {
			comp._history_undo();
		});
		comp._nodes.history_redo.addEventListener("click", () => {
			comp._history_redo();
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
			if (comp._history_steps_back > 0) {
				comp._data_history.splice(comp._data_history.length - comp._history_steps_back, comp._history_steps_back);
				comp._history_steps_back = 0;
			} else if (history_attention) {
				history_attention = false;
			} else if (
				comp._active_element === document.activeElement &&
				!isEquivalent(comp._data, comp._data_history[comp._data_history.length - 2])
			) {
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
				if (!isEquivalent(comp._data, getLast(comp._data_history))) {
					comp._data_history.push(cloneObject(comp._data));
				}
			}

			renderCompHistory(comp);
		});

		comp._setting_data_from_history = false;
	},
});

document.addEventListener("keydown", (ev) => {
	if (!history_comp_focus) {
		return;
	}

	if (ev.key && ev.ctrlKey) {
		if (ev.key.toLowerCase() == "z") {
			ev.preventDefault();
			history_comp_focus._history_undo();
		}
		if (ev.key.toLowerCase() == "y") {
			ev.preventDefault();
			history_comp_focus._history_redo();
		}
	}
});
