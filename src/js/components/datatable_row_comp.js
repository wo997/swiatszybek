/* js[global] */

/**
 *
 * @typedef {{
 *  row_data: any
 *  columns: DatatableColumnDef[]
 * } & ListCompRowData} DatatableRowCompData
 *
 * @typedef {{
 *  _data: DatatableRowCompData
 *  _set_data(data?: DatatableRowCompData, options?: SetCompDataOptions)
 *  _getData()
 *  _nodes: {
 *      dt_row: PiepNode
 *  }
 * } & BaseComp} DatatableRowComp
 */

/**
 * @param {DatatableRowComp} comp
 * @param {*} parent
 * @param {DatatableRowCompData} data
 */
function datatableRowComp(comp, parent, data = { row_data: {}, columns: [] }) {
	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {
				const cells_html = getDatatableRowHtml(data);

				setNodeChildren(comp, cells_html);

				/** @type {DatatableComp} */
				// @ts-ignore
				const dt = comp._parent_comp._parent_comp;

				const row = comp._parent();
				const _row_id = +row.dataset.primary;
				const row_data = dt._data.dataset.find((d) => d._row_id === _row_id);

				registerForms(comp);

				if (row_data) {
					row._children("[data-bind]").forEach((input) => {
						const key = input.dataset.bind;
						input._set_value(row_data[key], { quiet: true });
					});
				}

				comp.classList.toggle("even", data.row_index % 2 === 0);
			},
		});
	};

	createComp(comp, parent, data, {
		ready: () => {
			comp.classList.add("dt_row");

			/** @type {DatatableComp} */
			// @ts-ignore
			const dt = comp._parent_comp._parent_comp;

			const row = comp._parent();
			const _row_id = +row.dataset.primary;

			registerForms();

			row._children("[data-bind]").forEach((input) => {
				const key = input.dataset.bind;
				input.addEventListener("change", () => {
					if (dt._data.search_url) {
						console.warn("TODO");
					} else {
						const row_data = dt._data.dataset.find((d) => d._row_id === _row_id); // recreate ref
						const value = input._get_value();
						const prev_value = row_data[key];
						row_data[key] = value;
						dt.dispatchEvent(
							new CustomEvent("editable_change", {
								detail: {
									_row_id,
									row_data,
									key,
									prev_value,
									value,
								},
							})
						);
						dt._render();

						// well, sometimes there is a need to modify a field to it's previous value, so that is necessary, fails at 82.59999 blah
						comp._render({ force_render: true });
					}
				});
				// b.addEventListener("input", () => {
				// 	b._dispatch_change();
				// });

				// @ts-ignore
				if (input.type === "text" || input.tagName === "SELECT" || input.tagName === "P-CHECKBOX") {
					input.addEventListener("keydown", (ev) => {
						const up = ev.key === "ArrowUp";
						const right = ev.key === "ArrowRight";
						const down = ev.key === "ArrowDown";
						const left = ev.key === "ArrowLeft";

						if (up || down || (input.tagName === "SELECT" && (right || left))) {
							ev.preventDefault();
						}

						if (ev.ctrlKey) {
							/**
							 *
							 * @param {PiepNode} next_input
							 */
							const selectInput = (next_input) => {
								if (next_input.tagName === "P-CHECKBOX") {
									next_input._child("input").focus();
								}
								if (next_input.focus) {
									next_input.focus();
								}
								if (next_input instanceof HTMLInputElement) {
									setTimeout(() => {
										next_input.select();
									}, 0);
								}
							};

							if (up || down) {
								const dt_cell = input._parent(".dt_cell");
								const list_row = dt_cell._parent(".list_row");
								let next_list_row = up ? list_row._prev() : list_row._next();
								if (!next_list_row) {
									next_list_row = up ? list_row._last_sibling() : list_row._first_sibling();
								}
								const next_list_column = next_list_row._child(`[data-column_id="${dt_cell.dataset.column_id}"]`);
								const next_input = next_list_column._child(`[data-bind="${input.dataset.bind}"]`);
								scrollIntoView(next_input, {
									callback: () => {
										selectInput(next_input);
									},
								});
							}

							if (left || right) {
								const dt_cell = input._parent(".dt_cell");
								let next_cell = dt_cell;

								let next_input = undefined;
								while (!next_input) {
									next_cell = left ? next_cell._prev() : next_cell._next();
									if (!next_cell) {
										next_cell = left ? dt_cell._last_sibling() : dt_cell._first_sibling();
									}

									if (next_cell) {
										next_input = next_cell._child(`[data-bind]`);
									}
								}

								selectInput(next_input);
							}
						}
					});
				}
			});
		},
	});
}

/**
 * @param {DatatableRowCompData} row
 * @param {{just_editables?: boolean}} opts
 */
function getDatatableRowHtml(row, opts = {}) {
	/** @type {string[]} */
	let cells_html = [];

	let column_id = -1;
	for (const column of row.columns) {
		column_id++;
		let cell_html = "";

		if (column.editable) {
			cell_html += getEditableCellHtml(column);
		} else if (column.render) {
			cell_html += column.render(row.row_data);
		} else {
			cell_html += def(row.row_data[column.key], "");
		}

		cell_html = html`<div class="dt_cell" data-column_id="${column_id}">${cell_html}</div>`;

		cells_html.push(cell_html);
	}

	return cells_html;
}

/**
 *
 * @param {DatatableColumnDef} column
 */
function getEditableCellHtml(column) {
	let cell_html = "";
	if (column.editable === "checkbox") {
		cell_html += html`<p-checkbox data-bind="${column.key}"></p-checkbox>`;
	} else if (column.editable === "number") {
		// dumb shit doesn't support selection so I use text
		cell_html += html`<input type="text" class="field small" data-bind="${column.key}" data-number />`;
	} else if (column.editable === "string") {
		cell_html += html`<input type="text" class="field small" data-bind="${column.key}" />`;
	} else if (column.editable === "select") {
		let options = "";
		let number = "";
		column.select_options.forEach((e) => {
			options += html`<option value="${e.val}">${e.label}</option>`;
			if (typeof e.val === "number") {
				number = "data-number";
			}
		});
		cell_html += html`<select class="field small" data-bind="${column.key}" ${number}>
			${options}
		</select>`;
	}
	return cell_html;
}
