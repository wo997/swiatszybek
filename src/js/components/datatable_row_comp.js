/* js[global] */

/**
 *
 * @typedef {{
 *  row: any
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
function datatableRowComp(comp, parent, data = { row: {}, columns: [] }) {
	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {
				/** @type {string[]} */
				let cells_html = [];

				if (data.columns === undefined) {
					console.trace();
				}

				let column_id = -1;
				for (const column of data.columns) {
					column_id++;
					let cell_html = "";

					if (column.editable) {
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
					} else if (column.render) {
						cell_html += column.render(data.row);
					} else {
						cell_html += def(data.row[column.key], "");
					}

					cell_html = html`<div class="dt_cell" data-column_id="${column_id}">${cell_html}</div>`;

					cells_html.push(cell_html);
				}

				setNodeChildren(comp._nodes.dt_row, cells_html);

				/** @type {DatatableComp} */
				// @ts-ignore
				const dt = comp._parent_comp._parent_comp;

				const row = comp._parent();
				const _row_id = +row.dataset.primary;
				const row_data = dt._data.dataset.find((d) => d._row_id === _row_id);

				registerForms(comp._nodes.dt_row);

				if (row_data) {
					row._children("[data-bind]").forEach((input) => {
						const key = input.dataset.bind;
						input._set_value(row_data[key], { quiet: true });

						input.addEventListener("change", () => {
							if (dt._data.search_url) {
								console.warn("TODO");
							} else {
								const row_data = dt._data.dataset.find((d) => d._row_id === _row_id); // recreate ref
								const val = input._get_value();
								const prev_value = row_data[key];
								row_data[key] = val;
								dt.dispatchEvent(
									new CustomEvent("editable_change", {
										detail: {
											_row_id,
											row_data,
											key,
											prev_value: prev_value,
											value: val,
										},
									})
								);
								dt._render();
							}
						});
						// b.addEventListener("input", () => {
						// 	b._dispatch_change();
						// });

						// @ts-ignore
						if (input.type === "text") {
							input.addEventListener("keydown", (ev) => {
								const down = ev.key === "ArrowDown";
								const up = ev.key === "ArrowUp";
								if (up || down) {
									ev.preventDefault();

									const dt_cell = input._parent(".dt_cell");
									const list_row = dt_cell._parent(".list_row");
									let next_list_row = up ? list_row._prev() : list_row._next();
									if (up && !next_list_row) {
										next_list_row = list_row._last_sibling();
									}
									if (down && !next_list_row) {
										next_list_row = list_row._first_sibling();
									}
									const next_list_column = next_list_row._child(`[data-column_id="${dt_cell.dataset.column_id}"]`);
									const next_input = next_list_column._child(`[data-bind="${input.dataset.bind}"]`);
									scrollIntoView(next_input, {
										callback: () => {
											next_input.focus();
											// @ts-ignore
											const x = next_input.value.length;
											// @ts-ignore
											next_input.setSelectionRange(x, x);
										},
									});
								}

								const left = ev.key === "ArrowLeft";
								const right = ev.key === "ArrowRight";

								// @ts-ignore
								if ((left && input.selectionStart === 0) || (right && input.selectionEnd === input.value.length)) {
									const dt_cell = input._parent(".dt_cell");
									let next_cell = dt_cell;

									let next_input = undefined;
									while (!next_input) {
										next_cell = left ? next_cell._prev() : next_cell._next();
										if (left && !next_cell) {
											next_cell = dt_cell._last_sibling();
										}
										if (right && !next_cell) {
											next_cell = dt_cell._first_sibling();
										}

										if (next_cell) {
											next_input = next_cell._child(`input[type="text"][data-bind]`);
										}
									}
									// @ts-ignore
									const x = right ? next_input.value.length : 0;
									// @ts-ignore
									next_input.setSelectionRange(x, x);
									next_input.focus();
								}
							});
						}
					});
				}
			},
		});
	};

	createComp(comp, parent, data, {
		template: html`<div data-node="{${comp._nodes.dt_row}}" class="dt_row {${data.row_index % 2 === 0}?even}"></div>`,
	});
}
