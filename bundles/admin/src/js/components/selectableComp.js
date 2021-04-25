/* js[admin] */

/**
 * @typedef {{
 * value: string
 * label: string
 * }} SelectableOptionData
 *
 * @typedef {{
 * value: string
 * dataset: SelectableOptionData[]
 * }} SelectableCompData
 *
 * @typedef {{
 * _data: SelectableCompData
 * _set_data(data?: SelectableCompData, options?: SetCompDataOptions)
 * _nodes: {
 *  input: PiepNode
 *  suggestions: PiepNode
 * }
 * } & BaseComp} SelectableComp
 */

/**
 * @param {SelectableComp} comp
 * @param {*} parent
 * @param {SelectableCompData} data
 */
function SelectableComp(comp, parent, data = undefined) {
	if (data === undefined) {
		data = {
			value: "",
			dataset: [],
		};
	}

	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {},
		});
	};

	createComp(comp, parent, data, {
		template: html`<input class="field" data-node="{${comp._nodes.input}}" />
			<div data-node="{${comp._nodes.suggestions}}"></div>`,
		initialize: () => {
			const refreshSuggestions = () => {
				let suggestions_html = "";
				for (const datapart of data.dataset) {
					suggestions_html += html`<div class="suggestion" data-value="${datapart.value}">${datapart.label}</div>`;
				}
				comp._nodes.suggestions._set_content(suggestions_html);
			};

			document.addEventListener("click", (ev) => {
				const target = $(ev.target);

				const hit_input = !!target._parent(comp._nodes.input);
				if (hit_input) {
					refreshSuggestions();
				}

				comp._nodes.suggestions.classList.toggle("visible", hit_input);

				if (target._parent(comp._nodes.suggestions)) {
				}
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
				const down = event.key == "ArrowDown";
				const up = event.key == "ArrowUp";

				const selected = comp._nodes.suggestions._child(".selected");
				let select;

				if (event.key == "Enter") {
					if (selected) {
						selected.click();
						event.preventDefault();
						return false;
					} else if ($(".main_search_wrapper input")._get_value().trim()) {
						goToSearchProducts();
					} else {
						topSearchProducts(true);
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
		},
	});
}
