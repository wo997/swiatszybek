/* js[global] */

/**
 * @typedef {{
 *  label?: string
 *  key?: string
 *  width?: string
 *  sortable?: boolean | undefined
 *  searchable?: string
 *  render?(data: any)
 * }} DatatableColumnDef
 *
 * @typedef {("asc" | "desc" | "")} DatatableSortOrder
 *
 * @typedef {{
 * key: string
 * order: DatatableSortOrder
 * }} DatatableSortData
 *
 * @typedef {{
 * key: string
 * }} DatatableFilterData
 *
 * @typedef {{
 * row:any
 * } & ListCompRowData} DatatableRowData
 *
 * @typedef {{
 *  primary_key?: string
 *  search_url?: string
 *  dataset?: Array
 *  rows?: DatatableRowData[]
 *  columns: DatatableColumnDef[]
 *  sort?: DatatableSortData | false
 *  filters?: DatatableFilterData[]
 *  pagination_data?: PaginationCompData
 *  quick_search?: string
 *  empty_html?: string
 *  label?: string
 *  after_label?: string
 *  selectable?: boolean
 *  selection?: number[]
 *  save_state_name?: string
 * }} DatatableCompData
 *
 * @typedef {{
 *  _data: DatatableCompData
 *  _prev_data: DatatableCompData
 *  _set_data(data?: DatatableCompData, options?: SetCompDataOptions)
 *  _getData()
 *  _nodes: {
 *      table_header: PiepNode
 *      style: PiepNode
 *      empty_table: PiepNode
 *      list: ListComp
 *      clear_filters_btn: PiepNode
 *  }
 * _datatable_search(delay?: number)
 * _client_search()
 * _search_timeout: number
 * _search_request: XMLHttpRequest | undefined
 * _save_state()
 * _load_state(data_obj)
 * _set_dataset(Array)
 * } & BaseComp} DatatableComp
 */

/**
 * @param {DatatableComp} comp
 * @param {*} parent
 * @param {DatatableCompData} data
 */
function datatableComp(comp, parent, data) {
	data.filters = def(data.filters, []);
	data.sort = def(data.sort, false);
	data.dataset = def(data.dataset, []);
	data.quick_search = def(data.quick_search, "");
	data.pagination_data = def(data.pagination_data, {});

	data.rows = [];

	if (data.selectable) {
		if (!data.primary_key) {
			console.error("Primary key is required!");
			return;
		}

		data.selection = [];

		data.columns.unshift({
			label: html`<p-checkbox class="square select_all_rows shrink"></p-checkbox>`,
			key: "",
			width: "37px",
			render: (row) => {
				return html`<p-checkbox class="square select_row shrink" data-primary_id="${row[data.primary_key]}"></p-checkbox>`;
			},
		});

		comp.addEventListener("click", (ev) => {
			const target = $(ev.target);
			const select_row = target._parent(".select_row", { skip: 0 });
			if (select_row) {
				// just in case
				setTimeout(() => {
					const primary_id = +select_row.dataset.primary_id;

					if (select_row._get_value()) {
						comp._data.selection.push(primary_id);
						comp._render();
					} else {
						const index = comp._data.selection.indexOf(primary_id);
						if (index !== -1) {
							comp._data.selection.splice(index, 1);
							comp._render();
						}
					}
				});
			}
			const select_all_rows = target._parent(".select_all_rows", { skip: 0 });
			if (select_all_rows) {
				const selection = [];

				if (select_all_rows._get_value()) {
					for (const row_data of comp._data.rows) {
						selection.push(row_data.row[data.primary_key]);
					}
				}
				comp._data.selection = selection;
				comp._render();
			}
		});
	}

	const rewriteState = (src, to) => {
		to.filters = src.filters;
		to.quick_search = src.quick_search;
		to.sort = src.sort;
		to.pagination_data = src.pagination_data;
	};

	comp._save_state = () => {
		const state = {};
		rewriteState(comp._data, state);
		const state_json = JSON.stringify(state);
		localStorage.setItem("datatable_" + data.save_state_name, state_json);
	};

	comp._load_state = (data_obj) => {
		const state_json = localStorage.getItem("datatable_" + data.save_state_name);
		if (!state_json) {
			return;
		}
		const state = JSON.parse(state_json);
		rewriteState(state, data_obj);
	};

	comp._set_dataset = (dataset = undefined) => {
		if (dataset) {
			comp._data.dataset = dataset;
		}

		comp.dispatchEvent(
			new CustomEvent("dataset_set", {
				detail: {
					data: comp._data,
				},
			})
		);

		if (comp._data.search_url) {
			comp._data.rows = comp._data.dataset.map((e) => ({ row: e }));
			comp._render();
		} else {
			comp._client_search();
		}
	};

	comp._client_search = (delay = 0) => {
		if (comp._search_timeout) {
			clearTimeout(comp._search_timeout);
			comp._search_timeout = undefined;
		}
		comp._search_timeout = setTimeout(() => {
			let rows = cloneObject(comp._data.dataset);

			const qs = comp._data.quick_search.trim();
			if (qs) {
				rows = rows.filter((r) => {
					for (const v of Object.values(r)) {
						if ((v + "").indexOf(qs) !== -1) {
							return true;
						}
					}

					return false;
				});
			}

			if (comp._data.sort) {
				const sort_key = comp._data.sort.key;
				const order = comp._data.sort.order === "asc" ? 1 : -1;
				rows = rows.sort((a, b) => {
					if (a[sort_key] < b[sort_key]) return -order;
					if (a[sort_key] > b[sort_key]) return order;
					return 0;
				});
			}

			comp._data.rows = rows.map((e) => ({ row: e }));

			comp._render();
		}, delay);
	};

	comp._datatable_search = (delay = 0) => {
		if (comp._search_timeout) {
			clearTimeout(comp._search_timeout);
			comp._search_timeout = undefined;
		}
		comp._search_timeout = setTimeout(() => {
			if (comp._search_request) {
				comp._search_request.abort();
				comp._search_request = undefined;
			}

			const datatable_params = {};
			const data = comp._data;
			if (data.sort) {
				datatable_params.order = data.sort.key + " " + data.sort.order.toUpperCase();
			}
			if (data.filters) {
				datatable_params.filters = data.filters;
			}
			datatable_params.row_count = data.pagination_data.row_count;
			datatable_params.page_id = data.pagination_data.page_id;
			datatable_params.quick_search = data.quick_search;

			comp.classList.add("searching");
			comp._search_request = xhr({
				url: data.search_url,
				params: {
					datatable_params,
				},
				success: (res) => {
					if (!res) {
						console.error(`Datatable search error: ${data.search_url}`, res);
						return;
					}

					comp._search_request = undefined;

					if (res.rows.length === 0 && data.pagination_data.page_id > 0 && data.search_url) {
						data.pagination_data.page_id = 0;
						comp._datatable_search();
						return;
					}

					data.pagination_data.page_count = res.page_count;
					data.pagination_data.total_rows = res.total_rows;

					comp._set_dataset(res.rows);

					comp.classList.remove("freeze");
					comp.classList.remove("searching");
				},
			});
		}, delay);
	};

	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			pass_list_data: [{ what: "columns", where: "rows" }],
			render: () => {
				const cd = comp._changed_data;

				if (cd.quick_search) {
					if (data.search_url) {
						comp._datatable_search(300);
					} else {
						comp._client_search(300);
					}
				}

				if (
					!comp._prev_data ||
					cd.sort ||
					cd.filters ||
					comp._prev_data.pagination_data.page_id != data.pagination_data.page_id ||
					comp._prev_data.pagination_data.row_count != data.pagination_data.row_count
				) {
					let styles_html = "";

					/** @type {string[]} */
					let cells_html = [];

					let column_index = -1;
					for (const column of data.columns) {
						column_index++;

						let cell_html = "";

						cell_html += /*html*/ `<div class="dt_cell" data-column="${column_index}">`;
						cell_html += html`<span class="label">${column.label}</span>`;

						if (column.sortable || column.searchable) {
							cell_html += /*html*/ ` <div class="dt_header_controls">`;

							if (column.sortable) {
								let icon = "fa-sort";
								let btn_class = "transparent";
								let tooltip = "Sortuj malejąco";
								if (data.sort && data.sort.key === column.key) {
									if (data.sort.order === "desc") {
										icon = "fa-arrow-down";
										btn_class = "primary";
										tooltip = "Sortuj rosnąco";
									} else if (data.sort.order === "asc") {
										icon = "fa-arrow-up";
										btn_class = "primary";
										if (data.search_url) {
											tooltip = "Wyłącz sortowanie";
										}
									}
								}
								cell_html += html` <button class="btn ${btn_class} dt_sort fas ${icon}" data-tooltip="${tooltip}"></button>`;
							}
							if (column.searchable) {
								cell_html += html` <button class="btn transparent dt_filter fas fa-search" data-tooltip="Filtruj wyniki"></button>`;
							}
							cell_html += /*html*/ `</div>`;
						}

						cell_html += /*html*/ `</div>`;

						cells_html.push(cell_html);

						const flex_grow = column.width && column.width.includes("px") ? 0 : 1;
						styles_html += `.${comp._dom_class} .dt_cell:nth-child(${column_index + 1}) {
                            width:${def(column.width, "10%")};flex-grow:${flex_grow};
                        }`;
					}

					setNodeChildren(comp._nodes.table_header, cells_html);

					comp._nodes.style._set_content(styles_html);
					registerForms();

					if (data.search_url) {
						comp._datatable_search(0);
					} else {
						comp._client_search();
					}
				}

				expand(comp._nodes.empty_table, data.rows.length === 0);

				if (data.selectable) {
					let select_count = 0;
					/** @type {number[]} */
					const visible_selection = [];
					const ids = [];
					comp._nodes.list._getRows().forEach((row) => {
						const select_row = row._child(".select_row");
						const primary_id = +select_row.dataset.primary_id;
						ids.push(primary_id);
						const selected = comp._data.selection.indexOf(primary_id) !== -1;
						if (selected) {
							visible_selection.push(primary_id);
							select_count++;
						}
						select_row._set_value(selected, { quiet: true });
					});

					comp._data.selection = visible_selection;

					const select_all = select_count === comp._data.rows.length && comp._data.rows.length > 0;
					const select_all_rows = comp._child(".select_all_rows");
					if (select_all_rows) {
						select_all_rows._set_value(select_all ? 1 : 0);
					}

					// never used but keep it
					// if (cd.selection) {
					// 	comp.dispatchEvent(
					// 		new CustomEvent("selection_changed", {
					// 			detail: {
					// 				selection: comp._data.selection,
					// 			},
					// 		})
					// 	);
					// }
				}

				if (data.save_state_name) {
					comp._save_state();
				}

				comp._nodes.clear_filters_btn.classList.toggle("active", !!(data.filters.length > 0 || data.quick_search.trim() || data.sort));
			},
		});
	};

	if (data.save_state_name) {
		comp._load_state(data);
	}

	createComp(comp, parent, data, {
		template: html`
			<div style="margin-bottom:10px;display:flex;align-items:center">
				<span class="datatable_label" html="{${data.label}}"></span>
				<span html="{${data.after_label}}"></span>
				<div style="flex-grow:1"></div>
				<div class="btn error_light" data-node="{${comp._nodes.clear_filters_btn}}" data-tooltip="Wyczyść wszystkie filtry">
					<i class="fas fa-times"></i>
				</div>
				<div class="float-icon" style="display: inline-block;">
					<input type="text" placeholder="Szukaj..." class="field inline" data-bind="{${data.quick_search}}" />
					<i class="fas fa-search"></i>
				</div>
			</div>

			<div style="position:relative">
				<div class="table_header" data-node="{${comp._nodes.table_header}}"></div>

				<div class="table_body">
					<list-comp
						data-node="{${comp._nodes.list}}"
						data-bind="{${data.rows}}"
						${data.primary_key ? `data-primary="row.${data.primary_key}"` : ""}
					>
						<datatable-row-comp></datatable-row-comp>
					</list-comp>
				</div>
			</div>

			<div class="expand_y" data-node="empty_table">
				<div class="empty_table" html="{${def(data.empty_html, "Brak wyników")}}"></div>
			</div>

			<pagination-comp data-bind="{${data.pagination_data}}"></pagination-comp>

			<style data-node="style"></style>
		`,
		initialize: () => {
			comp.addEventListener("click", (event) => {
				const target = $(event.target);
				if (!target) {
					return;
				}
				const dt_sort = target._parent(".dt_sort", { skip: 0 });
				const dt_filter = target._parent(".dt_filter", { skip: 0 });

				if (dt_sort) {
					const data = comp._data;
					const column_data = data.columns[+dt_sort._parent(".dt_cell").dataset.column];

					const curr_order = data.sort && data.sort.key === column_data.key ? data.sort.order : "";
					/** @type {DatatableSortOrder} */
					let new_order = "desc";
					if (curr_order === "desc") {
						new_order = "asc";
					} else if (curr_order === "asc" && data.search_url) {
						new_order = "";
					}
					data.sort = new_order ? { key: column_data.key, order: new_order } : false;
					comp._render();
				}

				if (dt_filter) {
					return;
				}
			});

			comp._nodes.clear_filters_btn.addEventListener("click", () => {
				const data = comp._data;
				data.filters = [];
				data.quick_search = "";
				data.sort = false;
				data.pagination_data.page_id = 0;

				if (data.search_url) {
					comp._render();
					comp._datatable_search(0);
				} else {
					comp._client_search();
				}
			});
		},
		unfreeze_by_self: true,
		ready: () => {
			// warmup
			if (comp.dataset) {
				comp._set_dataset(comp._data.dataset);
			}
		},
	});
}
