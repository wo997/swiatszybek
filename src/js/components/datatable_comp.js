/* js[global] */

/**
 * @typedef {{
 *  label?: string
 *  key?: string
 *  width?: string
 *  sortable?: boolean | undefined
 *  searchable?: string
 *  render?(data: any)
 *  editable?: string
 *  batch_edit?: boolean
 *  select_options?: {label: string, val: any}[]
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
 * data: any
 * }} DatatableFilterData
 *
 * @typedef {{
 * row_data:any
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
 *      filters_info: PiepNode
 *      filter_menu: PiepNode
 *  }
 * _datatable_search(delay?: number)
 * _client_search(delay?: number)
 * _search_timeout: number
 * _search_request: XMLHttpRequest | undefined
 * _save_state()
 * _load_state(data_obj)
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
		if (!data.primary_key && !data.search_url) {
			data.primary_key = "_row_id";
		}

		if (!data.primary_key) {
			console.error("Primary key is required!");
			return;
		}

		data.selection = [];

		data.columns.unshift({
			label: html`<p-checkbox class="square select_all_rows shrink"></p-checkbox>`,
			key: "",
			width: "38px",
			render: (row) => {
				return html`<p-checkbox class="square select_row shrink" data-primary_id="${row[data.primary_key]}"></p-checkbox>`;
			},
		});

		comp.addEventListener("click", (ev) => {
			const target = $(ev.target);
			const select_row = target._parent(".select_row", { skip: 0 });
			if (select_row) {
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
			}
			const select_all_rows = target._parent(".select_all_rows", { skip: 0 });
			if (select_all_rows) {
				const selection = [];

				if (select_all_rows._get_value()) {
					for (const row_data of comp._data.rows) {
						selection.push(row_data.row_data[data.primary_key]);
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

	comp._datatable_search = (delay = 0) => {
		if (!comp._data.search_url) {
			console.error("No search url");
			console.trace();
			return;
		}
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
			datatable_params.filters = data.filters;
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
					comp._search_request = undefined;

					if (!res) {
						console.error(`Datatable search error: ${data.search_url}`, res);
						return;
					}

					data.pagination_data.page_count = res.page_count;
					data.pagination_data.total_rows = res.total_rows;

					data.rows = res.rows.map((d) => {
						return { row_data: d };
					});

					comp.dispatchEvent(
						new CustomEvent("rows_set", {
							detail: {
								data: comp._data,
							},
						})
					);

					comp.classList.remove("searching");

					comp._render();
					comp.classList.remove("freeze");
				},
			});
		}, delay);
	};

	comp._set_data = (data, options = {}) => {
		if (!data.search_url) {
			const dataset_changed = !comp._prev_data || !isEquivalent(data.dataset, def(comp._prev_data.dataset, []));
			if (dataset_changed) {
				let nextRowId = 0;
				data.dataset.forEach((d) => {
					if (d._row_id === undefined) {
						if (data.primary_key && d[data.primary_key] && d[data.primary_key] !== -1) {
							d._row_id = d[data.primary_key];
						} else {
							if (nextRowId === 0) {
								nextRowId = applyToArray(Math.min, [...data.dataset.map((e) => e._row_id).filter((e) => e), -1000]);
							}
							d._row_id = --nextRowId;
						}
					}
				});
			}

			/** @type {Array} */
			let rows = cloneObject(data.dataset);

			const qs = def(data.quick_search, "").trim();

			rows = rows.filter((r) => {
				for (let [key, val] of Object.entries(r)) {
					const column = data.columns.find((e) => e.key === key);

					if (column && column.render) {
						val = column.render(r);
					}

					/**
					 * @param {string} str
					 */
					const minify_word = (str) => {
						if (!str) {
							return "";
						}
						return replacePolishLetters((str + "").toLocaleLowerCase());
					};

					// TODO: split qs and hope that all pieces match
					if (qs && minify_word(val).indexOf(minify_word(qs)) === -1) {
						return false;
					}

					const filter = data.filters.find((e) => e.key === key);
					if (filter) {
						const fd = filter.data;
						if (fd.type === "string") {
							if (minify_word(val).indexOf(minify_word(fd.string)) === -1) {
								return false;
							}
						} else if (fd.type === "boolean") {
							if (xor(val, fd.value)) {
								return false;
							}
						} else if (fd.type === "number") {
							const precision = 0.0001;
							if (fd.operator === "=") {
								return Math.abs(val - fd.num) < precision;
							} else if (fd.operator === ">=") {
								return val > fd.num - precision;
							} else if (fd.operator === "<=") {
								return val < fd.num + precision;
							} else if (fd.operator === "<>") {
								return fd.more_than - precision < val && val < fd.less_than + precision;
							}
						}
					}
				}

				return true;
			});

			if (data.sort) {
				const sort_key = data.sort.key;
				const order = data.sort.order === "asc" ? 1 : -1;
				rows = rows.sort((a, b) => {
					if (a[sort_key] < b[sort_key]) return -order;
					if (a[sort_key] > b[sort_key]) return order;
					return 0;
				});
			}

			data.pagination_data.total_rows = rows.length;

			const rc = data.pagination_data.row_count;
			const pi = data.pagination_data.page_id;

			data.rows = rows.slice(pi * rc, (pi + 1) * rc).map((e) => {
				const ret = { row_data: e };
				if (e._row_id) {
					ret.row_id = e._row_id;
				}
				return ret;
			});
		}

		comp.dispatchEvent(
			new CustomEvent("rows_set", {
				detail: {
					data: comp._data,
				},
			})
		);

		setCompData(comp, data, {
			...options,
			pass_list_data: [{ what: "columns", where: "rows" }],
			render: () => {
				const cd = comp._changed_data;

				if (cd.quick_search) {
					if (data.search_url) {
						comp._datatable_search();
					}
				}

				const chng =
					!comp._prev_data ||
					cd.sort ||
					cd.filters ||
					cd.columns ||
					cd.selection ||
					comp._prev_data.pagination_data.page_id != data.pagination_data.page_id ||
					comp._prev_data.pagination_data.row_count != data.pagination_data.row_count;

				if (chng) {
					let styles_html = "";

					/** @type {string[]} */
					let cells_html = [];

					let column_index = -1;
					for (const column of data.columns) {
						column_index++;

						let cell_html = "";

						cell_html += /*html*/ `<div class="dt_cell" data-column="${column_index}">`;
						cell_html += html`<span class="label">${column.label}</span>`;

						if (column.sortable || column.searchable || column.batch_edit) {
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
										tooltip = "Wyłącz sortowanie";
									}
								}
								cell_html += html` <button class="btn ${btn_class} dt_sort fas ${icon}" data-tooltip="${tooltip}"></button>`;
							}
							if (column.searchable) {
								let btn_class = "transparent";
								if (data.filters.find((e) => e.key === column.key)) {
									btn_class = "primary";
								}
								cell_html += html` <button class="btn ${btn_class} dt_filter fas fa-search" data-tooltip="Filtruj wyniki"></button>`;
							}
							if (column.batch_edit) {
								const tooltip =
									data.selection.length > 0
										? `Edytuj dane zaznaczonych wierszy (${data.selection.length})`
										: `Edytuj dane wszystkich przefiltrowanych wierszy (${data.pagination_data.total_rows})`;
								cell_html += html` <button class="btn transparent dt_batch_edit fas fa-edit" data-tooltip="${tooltip}"></button>`;
							}
							cell_html += /*html*/ `</div>`;
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
						comp._datatable_search();
					}
				}

				setTimeout(() => {
					// it listens to list's event
					expand(comp._nodes.empty_table, data.rows.length === 0);
				});

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
				const filters_info = [];
				if (data.quick_search) {
					filters_info.push(`Wyszukaj ${data.quick_search}`);
				}
				if (data.sort) {
					filters_info.push(
						`Sortuj
                        ${data.columns.find((c) => data.sort && c.key === data.sort.key).label}
                        ${data.sort.order === "asc" ? "rosnąco" : "malejąco"}`
					);
				}
				data.filters.forEach((f) => {
					filters_info.push(data.columns.find((c) => c.key === f.key).label + ": " + f.data.display);
				});
				comp._nodes.filters_info._set_content(filters_info.length ? `<i class="fas fa-filter"></i> Filtry (${filters_info.length}) ` : "");
				comp._nodes.filters_info.dataset.tooltip = filters_info.join("<br>");

				comp._nodes.clear_filters_btn.classList.toggle("active", filters_info.length > 0);
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
				<div data-node="{${comp._nodes.filters_info}}" style="padding:0 10px;font-weight:600"></div>
				<div class="btn error_light" data-node="{${comp._nodes.clear_filters_btn}}" data-tooltip="Wyczyść wszystkie filtry">
					<i class="fas fa-times"></i>
				</div>
				<div class="float-icon" style="display: inline-block;">
					<input type="text" placeholder="Szukaj..." class="field inline" data-bind="{${data.quick_search}}" data-input_delay="300" />
					<i class="fas fa-search"></i>
				</div>
			</div>

			<div style="position:relative">
				<div class="scroll-panel scroll-shadow horizontal">
					<div class="table_container">
						<div class="table_header" data-node="{${comp._nodes.table_header}}"></div>

						<div class="table_body">
							<list-comp
								data-node="{${comp._nodes.list}}"
								data-bind="{${data.rows}}"
								${data.primary_key ? `data-primary="row_data.${data.primary_key}"` : ""}
							>
								<datatable-row-comp></datatable-row-comp>
							</list-comp>
						</div>

						<div class="expand_y" data-node="{${comp._nodes.empty_table}}">
							<div class="empty_table" html="{${def(data.empty_html, "Brak wyników")}}"></div>
						</div>
					</div>
				</div>
			</div>

			<div data-node="{${comp._nodes.filter_menu}}"></div>

			<pagination-comp data-bind="{${data.pagination_data}}"></pagination-comp>

			<style data-node="style"></style>
		`,
		initialize: () => {
			const filter_menu = comp._nodes.filter_menu;
			const hideFilterMenu = () => {
				if (!filter_menu.classList.contains("active")) return;

				filter_menu.classList.remove("active");
				filter_menu.style.animation = "hide 0.2s";
				setTimeout(() => {
					filter_menu.style.animation = "";
					filter_menu.classList.remove("visible");
				}, 200);

				filterFocusChange();
			};

			const filterFocusChange = () => {
				comp._children(".dt_filter.open").forEach((e) => {
					e.classList.remove("open");
				});
			};

			comp.addEventListener("click", (event) => {
				const target = $(event.target);
				if (!target) {
					return;
				}
				const dt_sort = target._parent(".dt_sort", { skip: 0 });
				const dt_filter = target._parent(".dt_filter:not(.open)", { skip: 0 });

				if (dt_sort || dt_filter) {
					const data = comp._data;
					const column_data = data.columns[+target._parent(".dt_cell").dataset.column];

					if (dt_sort) {
						const curr_order = data.sort && data.sort.key === column_data.key ? data.sort.order : "";
						/** @type {DatatableSortOrder} */
						let new_order = "desc";
						if (curr_order === "desc") {
							new_order = "asc";
						} else if (curr_order === "asc") {
							new_order = "";
						}
						data.sort = new_order ? { key: column_data.key, order: new_order } : false;
						data.pagination_data.page_id = 0;
					} else if (dt_filter) {
						filterFocusChange();
						dt_filter.classList.add("open");
						const curr_filter = data.filters.find((f) => f.key === column_data.key);

						const filter_menu_data = filter_menus.find((e) => e.name === column_data.searchable);

						if (filter_menu_data) {
							filter_menu.classList.add("active");
							filter_menu.classList.add("visible");

							filter_menu.dataset.filter = filter_menu_data.name;

							filter_menu._set_content(
								html`<div
									style="display: flex;margin-bottom: 10px;align-items: center;justify-content: space-between;padding-bottom: 5px;border-bottom: 1px solid #ccc;"
								>
									<span class="semi-bold">Filtruj ${column_data.label}</span>
									<button class="btn transparent small close" style="margin: -5px;"><i class="fas fa-times"></i></button>
								</div>` +
									filter_menu_data.html +
									html`<div style="display:flex;margin-top:10px;min-width: 215px;">
										<button class="btn primary apply" style="width:50%;margin-right:10px">Zastosuj <i class="fas fa-check"></i></button>
										<button class="btn subtle clear" style="width:50%;">Usuń <i class="fas fa-eraser"></i></button>
									</div>`
							);
							registerForms(filter_menu);

							const pos = nodePositionAgainstScrollableParent(dt_filter);
							const filter_menu_rect = filter_menu.getBoundingClientRect();

							filter_menu.style.left =
								clamp(
									5,
									pos.relative_pos.left + (pos.node_rect.width - filter_menu_rect.width) * 0.5,
									pos.scrollable_parent.scrollWidth - filter_menu_rect.width - 5
								) + "px";
							filter_menu.style.top =
								clamp(5, pos.relative_pos.top + pos.node_rect.height, pos.scrollable_parent.scrollHeight - filter_menu_rect.height - 5) +
								"px";

							filter_menu_data.open(filter_menu, curr_filter ? curr_filter.data : undefined);

							filter_menu._animate(
								`0%{transform-origin:50% 0;transform:scale(0.5);opacity:0}
                                100%{transform-origin:50% 0;transform:scale(1);opacity:1}`,
								200
							);
							filter_menu._child(".apply").addEventListener("click", () => {
								const data = filter_menu_data.apply(filter_menu);
								if (data) {
									comp._data.filters = comp._data.filters.filter((f) => f.key !== column_data.key);
									if (data.display) {
										comp._data.filters.push({ key: column_data.key, data });
									}

									comp._render();
									hideFilterMenu();
								}
							});
							filter_menu._child(".clear").addEventListener("click", () => {
								//filter_menu_data.clear(filter_menu);
								comp._data.filters = comp._data.filters.filter((f) => f.key !== column_data.key);
								comp._render();

								hideFilterMenu();
							});
							filter_menu._child(".close").addEventListener("click", () => {
								hideFilterMenu();
							});
						}
					}
					data.pagination_data.page_id = 0;
					comp._render();
					return;
				}
			});

			const tacz = (ev) => {
				const target = $(ev.target);
				if (target && !target._parent(".node_filter_menu, .dt_filter", { skip: 0 })) {
					hideFilterMenu();
				}
			};

			document.body.addEventListener("mousedown", tacz);
			document.body.addEventListener("touchstart", tacz);

			comp._nodes.clear_filters_btn.addEventListener("click", () => {
				const data = comp._data;
				data.filters = [];
				data.quick_search = "";
				data.sort = false;
				data.pagination_data.page_id = 0;
				comp._render();

				if (data.search_url) {
					comp._datatable_search();
				}
			});

			comp._nodes.list.addEventListener("instant", () => {
				// I think it works but I'm not sure, meh no
				comp._nodes.empty_table.classList.add("freeze");
				setTimeout(() => {
					comp._nodes.empty_table.classList.remove("freeze");
				}, 250);
			});
		},
		unfreeze_by_self: true,
	});
}
