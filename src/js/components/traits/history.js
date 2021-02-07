/* js[global] */

{
	/**
	 * @typedef {{
	 * _data_history: Array
	 * _history_steps_back: number
	 * _setting_data_from_history: boolean
	 * } & AnyComp} CompWithHistory
	 */

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
				comp._setting_data_from_history = true;
				comp._set_data(JSON.parse(comp._data_history[comp._data_history.length - 1 - comp._history_steps_back]));
				setTimeout(() => {
					comp._setting_data_from_history = false;
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

			comp._data_history = [];
			comp._history_steps_back = 0;
		},
		render: (c) => {
			/** @type {CompWithHistory} */
			// @ts-ignore
			const comp = c;

			const afterRender = () => {
				// -2 just because a single entry is necessary
				comp._nodes.history_undo.toggleAttribute("disabled", comp._history_steps_back >= comp._data_history.length - 1);
				comp._nodes.history_redo.toggleAttribute("disabled", comp._history_steps_back === 0);
			};

			if (comp._setting_data_from_history) {
				afterRender();
				return;
			}

			setTimeout(() => {
				if (comp._history_steps_back > 0) {
					comp._data_history.splice(comp._data_history.length - comp._history_steps_back, comp._history_steps_back);
					comp._history_steps_back = 0;
				}

				const json = JSON.stringify(comp._data);
				if (json !== getLast(comp._data_history)) {
					comp._data_history.push(json);
				}

				afterRender();
			});

			comp._setting_data_from_history = false;
		},
	});
}
