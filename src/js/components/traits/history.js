/* js[global] */

/**
 * @typedef {{
 * _data_history: Array
 * _history_steps_back: number
 * } & AnyComp} CompWithHistory
 */

{
	const trait_name = "history";
	registerCompTrait(trait_name, {
		template: html`<div data-node="${trait_name}" class="history_btns">
			<button class="btn subtle fas fa-undo" data-tooltip="Cofnij zmiany"></button>
			<button class="btn subtle fas fa-redo" disabled data-tooltip="Ponów zmiany"></button>
		</div>`,
		initialize: (c) => {
			/** @type {CompWithHistory} */
			const comp = c;

			comp._nodes[trait_name]._child(".fa-undo").addEventListener("click", () => {
				console.log("<---");
			});
			comp._nodes[trait_name]._child(".fa-redo").addEventListener("click", () => {
				console.log("--->");
			});

			comp._data_history = [];
			comp._history_steps_back = 0;
		},
		render: (c) => {
			/** @type {CompWithHistory} */
			const comp = c;
			setTimeout(() => {
				console.log(comp._data);
				comp._data_history = {};
			});
		},
	});
}
