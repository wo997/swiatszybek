/* js[global] */

/**
 *
 * @typedef {{
 *  row_data: any
 *  columns: DatatableColumnDef[]
 *  sortable: boolean
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
function DatatableRowComp(comp, parent, data = { row_data: {}, columns: [], sortable: false }) {
	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {
				/** @type {DatatableComp} */
				// @ts-ignore
				const dt = comp._parent_comp._parent_comp;
				const getRowData = (row_id) => {
					const id_key = dt._data.search_url ? dt._data.primary_key : "_row_id";
					return dt._data ? dt._data.dataset.find((d) => d[id_key] === row_id) : undefined;
				};

				const cells_html = getDatatableRowHtml(dt, data);

				setNodeChildren(comp._nodes.dt_row, cells_html);

				const row = comp._parent();
				const row_id = +row.dataset.primary;
				const row_data = getRowData(row_id);

				registerForms(comp._nodes.dt_row);

				if (row_data) {
					row._children("[data-bind]").forEach((input) => {
						const key = input.dataset.bind;
						input._set_value(row_data[key], { quiet: true });
					});
				}

				// bind
				row._children("[data-bind]:not(.binded)").forEach((input) => {
					input.classList.add("binded");
					const key = input.dataset.bind;

					input.addEventListener("change", () => {
						const row_data = getRowData(row_id); // make sure u recreate the ref

						const value = input._get_value();
						const prev_value = row_data[key];
						if (prev_value === value) {
							// nothing happened
							return;
						}

						row_data[key] = value;
						if (dt._data.search_url) {
							dt.classList.add("searching");
							const column = dt._data.columns.find((col) => col.key === key);
							if (column) {
								column.editable_callback(row_data);
							} else {
								console.error(`Column key "${key}" is missing`);
							}
						} else {
							dt.dispatchEvent(
								new CustomEvent("editable_change", {
									detail: {
										row_data,
										key,
										prev_value,
										value,
									},
								})
							);
							dt._render();

							comp._render({ force_render: true });
						}
					});

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
	};

	createComp(comp, parent, data, {
		template: html`<div data-node="{${comp._nodes.dt_row}}" class="dt_row"></div>
			${data.sortable ? html`<div class="dt_cell sortable_width"><p-batch-trait data-trait="list_controls"></p-batch-trait></div>` : ""}`,
		ready: () => {},
	});
}

/**
 * @param {DatatableComp} dt
 * @param {DatatableRowCompData} row
 * @param {{just_editables?: boolean}} opts
 */
function getDatatableRowHtml(dt, row, opts = {}) {
	/** @type {string[]} */
	let cells_html = [];

	let column_id = -1;
	for (const column of row.columns) {
		column_id++;
		let cell_html = "";

		const val = row.row_data[column.key];

		if (column.editable) {
			cell_html += getEditableCellHtml(dt, column);

			if (column.select_overlay) {
				const map = dt._data.maps.find((e) => e.name === column.map_name);
				const opt = map.map.find((e) => e.val === row.row_data[column.key]);

				const overlay = column.select_overlay(opt.label, row.row_data);

				cell_html = html`<div class="overlay_wrapper">
					${cell_html}
					<div class="overlay">${overlay}</div>
				</div>`;
			}
		} else if (column.map_name) {
			const map = dt._data.maps.find((e) => e.name === column.map_name);

			if (map) {
				const opt = map.map.find((e) => e.val === row.row_data[column.key]);
				if (opt) {
					if (column.render_map) {
						cell_html += def(column.render_map(opt.label, row.row_data), "");
					} else {
						cell_html += opt.label;
					}
				}
			} else {
				console.error("Map is missing: ", column.map_name);
			}
		} else if (column.render) {
			cell_html += def(column.render(val, row.row_data), "");
		} else {
			cell_html += def(val, "");
		}

		cell_html = def(cell_html, "―");

		if (column.quick_filter && val) {
			if (dt._data.filters.find((e) => e.key === column.key)) {
				cell_html = html`
					<button class="dt_rm_quick_filter btn transparent small" data-key="${column.key}" data-tooltip="Usuń szybki filtr">
						<i class="fas fa-filter"></i>
					</button>
					${cell_html}
				`;
			} else {
				cell_html = html`
					<button class="dt_quick_filter btn transparent small" data-val="${val}" data-key="${column.key}" data-tooltip="Szybki filtr">
						<i class="fas fa-filter"></i>
					</button>
					${cell_html}
				`;
			}
		}

		const flex = def(column.flex, def(column.editable || column.quick_filter, false));
		if (!flex) {
			cell_html = html`<div class="cell_wrapper" data-tooltip="html">${cell_html}</div>`;
		}
		cell_html = html`<div class="dt_cell" data-column_id="${column_id}">${cell_html}</div>`;

		cells_html.push(cell_html);
	}

	return cells_html;
}

/**
 * @param {DatatableComp} dt
 * @param {DatatableColumnDef} column
 */
function getEditableCellHtml(dt, column) {
	const classesStr = () => {
		return classes.join(" ");
	};
	/** @type {string[]} */
	const classes = [];
	if (column.editable_classes) {
		classes.push(...column.editable_classes);
	}

	let cell_html = "";
	if (column.editable === "checkbox") {
		cell_html += html`<p-checkbox data-bind="${column.key}" class="${classesStr()}"></p-checkbox>`;
	} else if (column.editable === "number") {
		classes.push("field", "number");
		cell_html += html`<input class="${classesStr()}" data-bind="${column.key}" inputmode="numeric" />`;
	} else if (column.editable === "string") {
		classes.push("field");
		cell_html += html`<input class="${classesStr()}" data-bind="${column.key}" />`;
	} else if (column.editable === "color") {
		cell_html += html`<color-picker class="${classesStr()}" data-bind="${column.key}"></color-picker>`;
	} else if (column.editable === "date") {
		classes.push("field", "default_datepicker");
		cell_html += html`<input class="${classesStr()}" data-bind="${column.key}" inputmode="numeric" />`;
	} else if (column.editable === "select") {
		classes.push("field");
		let options = "";
		if (!column.map_name) {
			console.error("You must define a map for select");
		}
		const map = dt._data.maps.find((e) => e.name === column.map_name);
		if (map) {
			map.map.forEach((e) => {
				options += html`<option value="${e.val}">${e.label}</option>`;
				if (typeof e.val === "number") {
					classes.push("number");
				}
			});
		}

		cell_html += html`<select class="${classesStr()}" data-bind="${column.key}">
			${options}
		</select>`;
	}

	return cell_html;
}

function renderPriceDefault(value) {
	return html`${def(value, 0)} zł`;
}

function renderDatetimeDefault(value) {
	if (typeof value === "string") {
		return value.substring(0, 16);
	}
	return "";
}

function renderDatetimeDate(value) {
	if (typeof value === "string") {
		return value.substring(0, 10);
	}
	return "";
}
