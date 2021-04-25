/* js[admin] */

/**
 * @typedef {{
 * value: string
 * label: string
 * }} SelectableOptionData
 *
 * @typedef {{
 * single?: boolean
 * }} SelectableCompOptions
 *
 * @typedef {{
 * options?: SelectableCompOptions
 * dataset: SelectableOptionData[]
 * selection?: string[]
 * }} SelectableCompData
 *
 * @typedef {{
 * _data: SelectableCompData
 * _set_data(data?: SelectableCompData, options?: SetCompDataOptions)
 * _nodes: {
 *  input: PiepNode
 *  suggestions: PiepNode
 *  selection: PiepNode
 * }
 * } & BaseComp} SelectableComp
 */

/**
 * @param {SelectableComp} comp
 * @param {*} parent
 * @param {SelectableCompData} data
 */
function SelectableComp(comp, parent, data = undefined) {
	data.dataset = def(data.dataset, []);
	data.selection = def(data.selection, []);
	data.options = def(data.options, {});

	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {
				comp.dataset.selection = data.selection.length + "";
			},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<div style="position:relative">
				<input class="field" data-node="{${comp._nodes.input}}" />
				<div data-node="{${comp._nodes.suggestions}}"></div>
			</div>
			<div data-node="{${comp._nodes.selection}}"></div>
		`,
		ready: () => {
			const refreshSuggestions = () => {
				const data = comp._data;
				let suggestions_html = "";
				for (const datapart of data.dataset) {
					if (data.selection.includes(datapart.value)) {
						continue;
					}
					suggestions_html += html`<div class="suggestion" data-value="${escapeAttribute(datapart.value)}">${datapart.label}</div>`;
				}
				comp._nodes.suggestions._set_content(suggestions_html);
			};

			const refreshSelection = () => {
				const data = comp._data;
				let selection_html = "";
				for (const sel of data.selection) {
					const datapart = data.dataset.find((e) => e.value === sel);
					if (!datapart) {
						continue;
					}
					selection_html += html`<div class="selection flex align_center" data-value="${escapeAttribute(datapart.value)}">
						${datapart.label}
						<button class="btn transparent small mla">
							<i class="fas fa-trash"></i>
						</button>
					</div>`;
				}
				comp._nodes.selection._set_content(selection_html);
			};

			document.addEventListener("click", (ev) => {
				const target = $(ev.target);
				const data = comp._data;

				const hit_input = !!target._parent(comp._nodes.input);
				if (hit_input) {
					refreshSuggestions();
				}

				if (target._parent(comp)) {
					const suggestion = target._parent(".suggestion");
					if (suggestion) {
						if (data.options.single) {
							data.selection = [];
						}
						data.selection.push(suggestion.dataset.value);
						comp._render();
						refreshSelection();
					}
					const selection = target._parent(".selection");
					if (selection && target._parent(".btn")) {
						data.selection.splice(data.selection.indexOf(selection.dataset.value), 1);
						comp._render();
						refreshSelection();
					}
				}

				comp._nodes.suggestions.classList.toggle("visible", hit_input);
			});

			comp._nodes.input.addEventListener("change", () => {
				refreshSuggestions();
			});

			comp.addEventListener("mousemove", (ev) => {
				const target = $(ev.target);
				const suggestion = target._parent(".suggestion");
				if (suggestion) {
					comp._children(".suggestion").forEach((e) => {
						e.classList.toggle("selected", e === suggestion);
					});
				}
			});

			comp._nodes.input.addEventListener("keydown", (event) => {
				if (!comp._nodes.suggestions.classList.contains("visible")) {
					return;
				}

				const down = event.key == "ArrowDown";
				const up = event.key == "ArrowUp";

				const selected = comp._nodes.suggestions._child(".selected");
				let select;

				if (event.key == "Enter") {
					if (selected) {
						selected.click();
						event.preventDefault();
						return false;
					}
				}

				if (event.key == "Escape") {
					comp._nodes.input.blur();
					comp._nodes.suggestions.classList.remove("active");
				}

				if (!up && !down) {
					return;
				}

				/* prevent moving cursor sideways on up/down keys */
				event.preventDefault();

				if (selected) {
					if (down) {
						select = selected._next();
					} else if (up) {
						select = selected._prev();
					}
				}

				if (!selected) {
					if (down) {
						if (!select) {
							select = comp._nodes.suggestions._first();
						}
					} else if (up) {
						if (!select) {
							select = comp._nodes.suggestions._last();
						}
					}
				}

				comp._nodes.suggestions._children(".suggestion").forEach((e) => {
					e.classList.toggle("selected", e === select);
				});
			});

			refreshSelection();
		},
	});
}
