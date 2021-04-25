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
 * parent_variable?: string
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
 * _receive_selection(value)
 * _propagate_selection()
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

	const refreshSuggestions = () => {
		const data = comp._data;
		/** @type {string} */
		const search = comp._nodes.input
			._get_value()
			.trim()
			.replace(/\s{2,}/g, "");
		let suggestions_html = "";
		for (const datapart of data.dataset) {
			if (data.selection.includes(datapart.value)) {
				continue;
			}
			let match = true;
			for (const word of search.split(" ")) {
				if (!datapart.label.toLowerCase().includes(word.toLowerCase())) {
					match = false;
				}
			}
			if (!match) {
				continue;
			}
			suggestions_html += html`<div class="suggestion" data-value="${escapeAttribute(datapart.value)}">${datapart.label}</div>`;
		}
		comp._nodes.suggestions._set_content(suggestions_html);
	};

	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {
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
				comp.dataset.selection = data.selection.length + "";

				comp._propagate_selection();
			},
		});
	};

	comp._receive_selection = (value) => {
		const data = comp._data;
		const get = data.options.single ? (value !== undefined ? [value.toString()] : []) : value.map((e) => e.toString());
		if (data.selection !== get) {
			// propagate selection to ourselves
			data.selection = get;
			comp._render();
		}
	};

	comp._propagate_selection = () => {
		const data = comp._data;
		const parent = comp._parent_comp;

		if (parent) {
			const parent_data = parent._data;
			if (parent_data) {
				const val = data.options.single ? data.selection[0] : data.selection;
				if (parent_data[data.parent_variable] !== val) {
					setTimeout(() => {
						// propagate selection to the parent yay
						parent._data[data.parent_variable] = val;
						parent._render();
					});
				}
			}
		}
	};

	createComp(comp, parent, data, {
		template: html`
			<div style="position:relative">
				<input class="field" data-node="{${comp._nodes.input}}" />
				<div data-node="{${comp._nodes.suggestions}}" class="scroll_panel"></div>
			</div>
			<div data-node="{${comp._nodes.selection}}"></div>
		`,
		initialize: () => {
			if (parent) {
				parent._subscribers.push({
					receiver: comp,
					fetch: () => {
						const parent_data = parent._data;
						if (parent_data) {
							setTimeout(() => {
								comp._receive_selection(parent_data[data.parent_variable]);
							});
						}
					},
				});
			}
		},
		ready: () => {
			// mechanics
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
						comp._nodes.input._set_value("");
					}
					const selection = target._parent(".selection");
					if (selection && target._parent(".btn")) {
						data.selection.splice(data.selection.indexOf(selection.dataset.value), 1);
						comp._render();
					}
				}

				comp._nodes.suggestions.classList.toggle("visible", hit_input);
			});

			comp._nodes.input.addEventListener("change", () => {
				refreshSuggestions();
			});

			comp._nodes.input.addEventListener("input", () => {
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
					comp._nodes.suggestions.classList.add("visible");
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
					comp._nodes.suggestions.classList.remove("visible");
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

				scrollIntoView(select, { duration: 0 });
			});
		},
	});
}
