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
 *  map_name?: string
 *  quick_filter?: boolean
 *  flex?: boolean
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
 *  dataset_filtered?: Array
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
 *  print_row_as_string?(row_data: any): string
 *  maps?: {
 *      name: string
 *      getMap?(): {val:any,label:any}[]
 *      map?: {val:any,label:any}[]
 *  }[]
 *  sortable?: boolean
 *  deletable?: boolean
 *  require_sort?: DatatableSortData
 *  require_sort_filter?: string
 *  required_empty_sortable?: boolean
 *  db_table?: string
 *  sort_on_backend?: boolean
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
 * _datatable_search()
 * _search_request: XMLHttpRequest | undefined
 * _save_state()
 * _load_state(data_obj)
 * _warmup_maps(render?: boolean)
 * } & BaseComp} DatatableComp
 */

/**
 * @param {DatatableComp} comp
 * @param {*} parent
 * @param {DatatableCompData} data
 */
function datatableComp(comp, parent, data) {
	data.filters = def(data.filters, []);
	data.sort = def(data.require_sort, def(data.sort, false));

	data.dataset = def(data.dataset, []);
	data.quick_search = def(data.quick_search, "");
	data.pagination_data = def(data.pagination_data, {});

	data.rows = [];
	data.maps = def(data.maps, []);

	if (!data.primary_key && !data.search_url) {
		data.primary_key = "_row_id";
	}
	if (data.selectable) {
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
				return html`<p-checkbox class="square select_row shrink"></p-checkbox>`;
			},
			flex: true,
		});

		comp.addEventListener("click", (ev) => {
			const target = $(ev.target);
			const select_row = target._parent(".select_row", { skip: 0 });
			if (select_row) {
				const primary_id = +select_row._parent(`.list_row`).dataset.primary;

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
		["filters", "quick_search", "sort", "pagination_data", "rows"].forEach((key) => {
			const d = src[key];
			if (d) {
				to[key] = d;
			}
		});
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

	comp._datatable_search = () => {
		if (!comp._data.search_url) {
			console.error("No search url");
			console.trace();
			return;
		}
		if (comp._search_request) {
			//comp._search_request.abort();
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
				const data = comp._data; // somehow the ref was lost ugh

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
	};

	comp._warmup_maps = (render = true) => {
		for (const map of comp._data.maps) {
			if (map.getMap) {
				map.map = map.getMap();
			}
		}
		comp._nodes.list._children("datatable-row-comp").forEach((/** @type {DatatableRowComp} */ r) => {
			r._render({ force_render: true });
		});

		if (render) {
			comp._render();
		}
	};

	comp._set_data = (data, options = {}) => {
		if (!data.search_url) {
			const dataset_changed =
				!isEquivalent(data.dataset, def(comp._prev_data.dataset, [])) || !isEquivalent(data.maps, def(comp._prev_data.maps, []));

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

			if (data.sortable && data.sort) {
				const key = data.sort.key;
				data.dataset = data.dataset.sort((a, b) => Math.sign(a[key] - b[key]));
			}

			/** @type {Array} */
			let rows = cloneObject(data.dataset);

			/**
			 * @param {string} str
			 */
			const minify_word = (str) => {
				if (!str) {
					return "";
				}
				return replacePolishLetters((str + "").toLocaleLowerCase());
			};

			/** @type {string} */
			const qs = minify_word(def(data.quick_search, "").trim().replace(/ {2}/g, " "));

			rows = rows.filter((r) => {
				let search_parts = qs.split(" ").filter((e) => e.length > 0);
				for (let [key, val] of Object.entries(r)) {
					//const column = data.columns.find((e) => e.key === key);

					// if (column && column.render) {
					// 	val = column.render(r);
					// }

					const filter = data.filters.find((e) => e.key === key);
					if (filter) {
						const fd = filter.data;
						if (fd.type === "string") {
							if (fd.full_match) {
								if (minify_word(val).indexOf(minify_word(fd.string)) === -1) {
									return false;
								}
							} else {
								/** @type {string} */
								const sss = minify_word(fd.string.trim().replace(/ {2}/g, " "));
								if (
									!sss
										.split(" ")
										.filter((e) => e.length > 0)
										.reduce((acc, ss) => {
											return acc && minify_word(val).indexOf(ss) !== -1;
										}, true)
								) {
									return false;
								}
							}
						} else if (fd.type === "exact") {
							if (val !== fd.val) {
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

					if (qs) {
						const column = data.columns.find((e) => e.key === key);
						if (column) {
							let comp_val = val;
							if (column.map_name) {
								const map = data.maps.find((map) => map.name === column.map_name);
								if (map) {
									const opt = map.map.find((e) => e.val === val);
									if (opt) {
										comp_val = opt.label;
									}
								}
							}
							//const comp_val = column.render ? column.render(r) : val;
							const found_words = [];
							for (const word of search_parts) {
								if (minify_word(comp_val).indexOf(word) !== -1) {
									found_words.push(word);
								}
							}
							search_parts = search_parts.filter((e) => !found_words.includes(e));
						}
					}
				}
				if (search_parts.length > 0) {
					return false;
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

			data.dataset_filtered = rows;
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

			if (data.sortable) {
				let pos = 0;
				const filtered_row_ids = data.dataset_filtered.map((e) => e._row_id);

				data.dataset
					.filter((e) => filtered_row_ids.includes(e._row_id))
					.forEach((e) => {
						pos++;
						e.pos = pos;
					});
			}
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
			pass_list_data: [
				{ what: "columns", where: "rows" },
				{ what: "filters", where: "rows" },
				{ what: "sortable", where: "rows" },
			],
			render: () => {
				const cd = comp._changed_data;

				if (cd.quick_search) {
					if (data.search_url) {
						comp._datatable_search();
					}
				}

				if (cd.maps) {
					comp._warmup_maps(false);
				}

				const chng =
					!comp._prev_data ||
					cd.sort ||
					cd.filters ||
					cd.columns ||
					cd.selection ||
					comp._prev_data.pagination_data.page_id != data.pagination_data.page_id ||
					comp._prev_data.pagination_data.row_count != data.pagination_data.row_count ||
					cd.sortable ||
					cd.deletable;

				if (chng) {
					let styles_html = "";

					/** @type {string[]} */
					let cells_html = [];

					let column_index = -1;
					for (const column of data.columns) {
						column_index++;

						let cell_html = "";

						cell_html += html`<span class="label">${column.label}</span>`;

						if (data.require_sort && column.sortable) {
							console.error("Table can't be sortable with required_sorting applied");
						}

						if (column.sortable || column.searchable || column.batch_edit) {
							let dt_header_controls = "";

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
								dt_header_controls += html` <button class="btn ${btn_class} dt_sort fas ${icon}" data-tooltip="${tooltip}"></button>`;
							}
							if (column.searchable) {
								let btn_class = "transparent";
								if (data.filters.find((e) => e.key === column.key)) {
									btn_class = "primary";
								}
								dt_header_controls += html` <button
									class="btn ${btn_class} dt_filter fas fa-search"
									data-tooltip="Filtruj wyniki"
								></button>`;
							}
							if (column.batch_edit) {
								const tooltip =
									data.selection.length > 0
										? `Edytuj dane zaznaczonych wierszy (${data.selection.length})`
										: `Edytuj dane wszystkich przefiltrowanych wierszy (${data.pagination_data.total_rows})`;
								dt_header_controls += html` <button class="btn transparent dt_batch_edit fas fa-edit" data-tooltip="${tooltip}"></button>`;
							}

							dt_header_controls = html`<div class="dt_header_controls">${dt_header_controls}</div>`;

							cell_html += dt_header_controls;
						}

						cell_html = html`<div class="dt_cell" data-column="${column_index}">${cell_html}</div>`;

						cells_html.push(cell_html);

						let cell_style = "";
						if (column.width && column.width.includes("px")) {
							cell_style = `flex:0 0 ${column.width};`;
						} else {
							cell_style = `flex:${def(column.width, "1")} 1 0;`;
						}
						styles_html += `.${comp._dom_class} .dt_cell:nth-child(${column_index + 1}) { ${cell_style} }`;
					}

					if (data.sortable || data.deletable) {
						cells_html.push(html`<div class="dt_cell sortable_width"></div>`);
					}

					setNodeChildren(comp._nodes.table_header, cells_html);

					comp._nodes.style._set_content(styles_html);
					registerForms();

					if (data.search_url) {
						if (!cd.selection) {
							comp._datatable_search();
						}
					} else {
						setTimeout(() => {
							comp._children(".dt_batch_edit").forEach((e) => {
								e.toggleAttribute("disabled", comp._data.pagination_data.total_rows === 0);
							});
						});
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
						const primary_id = +row.dataset.primary;
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
					const column = data.columns.find((c) => data.sort && c.key === data.sort.key);
					if (column) {
						filters_info.push(`Sortuj ${column.label} ${data.sort.order === "asc" ? "rosnąco" : "malejąco"}`);
					}
				}

				if (!data.require_sort_filter) {
					const remove_filters = [];
					data.filters.forEach((f) => {
						const column = data.columns.find((c) => c.key === f.key);
						if (!column) {
							console.error(`Column ${f.key} not found`, comp);
							remove_filters.push(f.key);
						} else {
							filters_info.push(column.label + ": " + f.data.display);
						}
					});
					if (remove_filters.length > 0) {
						setTimeout(() => {
							comp._data.filters = data.filters.filter((e) => !remove_filters.includes(e.key));
							comp._render();
						});
					}
					comp._nodes.filters_info._set_content(
						filters_info.length ? `<i class="fas fa-filter"></i> Filtry (${filters_info.length}) ` : ""
					);
					comp._nodes.filters_info.dataset.tooltip = filters_info.join("<br>");

					comp._nodes.clear_filters_btn.classList.toggle("active", filters_info.length > 0);
				}

				if (data.sortable) {
					let sortable = filters_info.length === 0;
					const rsf = data.require_sort_filter;
					if (rsf) {
						sortable = data.filters.filter((e) => e.key === rsf).length > 0 && data.filters.filter((e) => e.key !== rsf).length === 0;
					}
					if (
						!sortable &&
						data.required_empty_sortable &&
						!data.dataset.find((e) => ![null, undefined, -1, 0, "", false].includes(e[rsf]))
					) {
						sortable = true;
					}
					comp.classList.toggle("sortable", sortable);
				}

				if (cd.deletable) {
					comp.classList.toggle("deletable", data.deletable);
				}
			},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<div style="margin-bottom:10px;display:flex;align-items:center">
				<span class="datatable_label medium" html="{${def(data.label, "")}}"></span>
				<span html="{${data.after_label}}"></span>
				<div style="flex-grow:1"></div>
				<div data-node="{${comp._nodes.filters_info}}" style="padding:0 10px;font-weight:600"></div>
				<div class="btn error_light" data-node="{${comp._nodes.clear_filters_btn}}" data-tooltip="Wyczyść wszystkie filtry">
					<i class="fas fa-times"></i>
				</div>
				<div class="float_icon" style="display: inline-block;">
					<input type="text" placeholder="Szukaj..." class="field inline" data-bind="{${data.quick_search}}" data-input_delay="300" />
					<i class="fas fa-search"></i>
				</div>
			</div>

			<div style="position:relative">
				<div class="scroll_panel scroll_shadow horizontal">
					<div class="table_container">
						<div class="table_header" data-node="{${comp._nodes.table_header}}"></div>

						<div class="table_body">
							<list-comp
								data-node="{${comp._nodes.list}}"
								data-bind="{${data.rows}}"
								${data.primary_key ? `data-primary="row_data.${data.primary_key}"` : ""}
								class="striped open"
							>
								<datatable-row-comp></datatable-row-comp>
							</list-comp>
						</div>

						<div class="expand_y animate_hidden hidden" data-node="{${comp._nodes.empty_table}}">
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
			if (data.save_state_name) {
				comp._load_state(data);

				setTimeout(() => {
					comp._datatable_search();
				}, 0);
			}

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
				const dt_filter = target._parent(".dt_filter", { skip: 0 });
				const dt_batch_edit = target._parent(".dt_batch_edit", { skip: 0 });

				const dt_cell = target._parent(".dt_cell");
				const data = comp._data;
				const column = dt_cell ? data.columns[+dt_cell.dataset.column] : undefined;

				const dt_quick_filter = target._parent(".dt_quick_filter", { skip: 0 });
				const dt_rm_quick_filter = target._parent(".dt_rm_quick_filter", { skip: 0 });

				if (dt_quick_filter || dt_rm_quick_filter) {
					const x = def(dt_quick_filter, dt_rm_quick_filter);
					const key = x.dataset.key;
					comp._data.filters = comp._data.filters.filter((e) => e.key !== x.dataset.key);
					if (dt_quick_filter) {
						comp._data.filters.push({
							key,
							data: { type: "exact", val: +x.dataset.val, display: dt_cell.innerText },
						});
					}
					comp._render();
					return;
				}

				if (dt_batch_edit) {
					let modify_rows;

					if (data.selection.length > 0) {
						modify_rows = data.dataset_filtered.filter((row_data) => data.selection.includes(row_data._row_id));
					} else {
						modify_rows = data.dataset_filtered;
					}

					const cont = $("#datatableBatchEdit .scroll_panel");
					cont._set_content(html`
						<div class="label first">${column.label}</div>
						${getEditableCellHtml(comp, column)}

						<div class="label">Wiersze, które zostaną zmodyfikowane <b>(${modify_rows.length + "/" + data.dataset.length})</b>:</div>
						<div class="scroll_panel scroll_preview" style="max-height:200px;">
							<div>${modify_rows.map((row_data) => data.print_row_as_string(row_data)).join("<br>")}</div>
						</div>

						<div class="label"></div>

						<button class="btn primary accept">Potwierdź</button>
					`);

					const val = highestOccurence(modify_rows.map((e) => e[column.key]));
					cont._child(`[data-bind="${column.key}"]`)._set_value(val);

					showModal("datatableBatchEdit", { source: dt_batch_edit });

					cont._child(".accept").addEventListener("click", () => {
						const key = column.key;
						const ids = modify_rows.map((e) => e._row_id);
						const value = cont._child(`[data-bind="${key}"]`)._get_value();
						let changes = 0;
						data.dataset
							.filter((e) => ids.includes(e._row_id))
							.forEach((row_data) => {
								const prev_value = row_data[key];
								if (prev_value !== value) {
									changes++;
								}
								row_data[key] = value;
								comp.dispatchEvent(
									new CustomEvent("editable_change", {
										detail: {
											_row_id: row_data._row_id,
											row_data,
											key,
											prev_value,
											value,
										},
									})
								);
							});
						comp._render();

						hideParentModal(cont);

						showNotification(`Zmodyfikowano ${changes} wyników`, {
							one_line: true,
							type: "success",
						});
					});
				} else if (dt_sort || dt_filter) {
					if (dt_sort) {
						const curr_order = data.sort && data.sort.key === column.key ? data.sort.order : "";
						/** @type {DatatableSortOrder} */
						let new_order = "desc";
						if (curr_order === "desc") {
							new_order = "asc";
						} else if (curr_order === "asc") {
							new_order = "";
						}
						data.sort = new_order ? { key: column.key, order: new_order } : false;
						data.pagination_data.page_id = 0;
					} else if (dt_filter) {
						if (dt_filter.classList.contains("open")) {
							hideFilterMenu();
							return;
						}
						filterFocusChange();
						dt_filter.classList.add("open");
						const curr_filter = data.filters.find((f) => f.key === column.key);

						const filter_menu_data = filter_menus.find((e) => e.name === column.searchable);

						if (filter_menu_data) {
							filter_menu.classList.add("active");
							filter_menu.classList.add("visible");

							filter_menu.dataset.filter = filter_menu_data.name;

							filter_menu._set_content(
								html`<div
									style="display: flex;margin-bottom: 10px;align-items: center;justify-content: space-between;padding-bottom: 5px;border-bottom: 1px solid #ccc;"
								>
									<span class="semi-bold">Filtruj ${column.label}</span>
									<button class="btn transparent small close" style="margin: -5px;"><i class="fas fa-times"></i></button>
								</div>` +
									filter_menu_data.getHtml(column, data) +
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
								const filter_data = filter_menu_data.apply(filter_menu);
								if (filter_data) {
									comp._data.filters = comp._data.filters.filter((f) => f.key !== column.key);
									if (filter_data.display) {
										comp._data.filters.push({ key: column.key, data: filter_data });
									}
									data.pagination_data.page_id = 0;
									comp._render();
									hideFilterMenu();
								}
							});
							filter_menu._child(".clear").addEventListener("click", () => {
								//filter_menu_data.clear(filter_menu);
								comp._data.filters = comp._data.filters.filter((f) => f.key !== column.key);
								comp._render();

								hideFilterMenu();
							});
							filter_menu._child(".close").addEventListener("click", () => {
								hideFilterMenu();
							});
						}
					}
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
				data.sort = def(data.require_sort, false);
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

			if (!$("#datatableBatchEdit")) {
				// selectProductFeatures
				registerModalContent(html`
					<div id="datatableBatchEdit" data-dismissable>
						<div class="modal_body">
							<div class="custom_toolbar">
								<span class="title medium">Grupowa edycja danych</span>
								<button class="btn subtle" onclick="hideParentModal(this)">Zamknij <i class="fas fa-times"></i></button>
							</div>
							<div class="scroll_panel scroll_shadow panel_padding"></div>
						</div>
					</div>
				`);
			}
		},
		ready: () => {
			if (comp._data.sortable || comp._data.deletable) {
				const list = comp._nodes.list;

				const orderBackend = () => {
					const data = comp._data;

					if (data.sortable && data.sort) {
						const key = data.sort.key;
						data.dataset = data.dataset.sort((a, b) => Math.sign(a[key] - b[key]));
					}

					if (comp._data.sort_on_backend) {
						const filtered_row_ids = data.dataset_filtered.map((e) => e._row_id);

						const positions = data.dataset.filter((e) => filtered_row_ids.includes(e._row_id)).map((e) => e[data.primary_key]);

						xhr({
							url: STATIC_URLS["ADMIN"] + "/datatable/sort",
							params: {
								table: comp._data.db_table,
								order_key: "pos",
								positions,
								// offset: comp._data.pagination_data.row_count * comp._data.pagination_data.page_id
								// might be good to use for backend search if u ever do it but pls don't
							},
							success: (res) => {
								showNotification("Zapisano zmianę kolejności", {
									one_line: true,
									type: "success",
								});
							},
						});
					}
				};

				list.addEventListener("remove_row", (ev) => {
					// @ts-ignore
					const detail = ev.detail;

					if (detail.res.removed) {
						return;
					}
					const data = comp._data;

					detail.res.removed = true;

					const filtered_row_ids = data.dataset_filtered.map((e) => e._row_id);

					const row_data = data.dataset.filter((e) => filtered_row_ids.includes(e._row_id)).find((e) => e.pos === detail.row_index + 1);

					if (row_data) {
						const index = data.dataset.findIndex((e) => e._row_id === row_data._row_id);
						if (index !== -1) {
							data.dataset.splice(index, 1);
						}
					}
					orderBackend();

					comp._render();
				});

				list.addEventListener("move_row", (ev) => {
					// @ts-ignore
					const detail = ev.detail;

					if (detail.res.moved) {
						return;
					}
					const data = comp._data;

					const ind_offset = comp._data.pagination_data.row_count * comp._data.pagination_data.page_id;
					let from_pos = detail.from + 1 + ind_offset;
					let to_pos = detail.to + 1 + ind_offset;

					detail.res.moved = true;

					const filtered_row_ids = data.dataset_filtered.map((e) => e._row_id);

					data.dataset
						.filter((e) => filtered_row_ids.includes(e._row_id))
						.forEach((e) => {
							let tar;
							if (e.pos === from_pos) {
								e.pos = to_pos;
							} else if (to_pos > from_pos) {
								if (from_pos < e.pos && e.pos <= to_pos) {
									e.pos--;
								}
							} else {
								if (to_pos <= e.pos && e.pos < from_pos) {
									e.pos++;
								}
							}
						});

					orderBackend();

					comp._render();
				});
			}
		},
		unfreeze_by_self: !!data.search_url,
	});
}
