/* js[global] */

/**
 * @typedef {{
 *  label: string
 *  key: string
 *  width: string
 *  sortable?: boolean | undefined
 *  searchable?: string
 *  primary?: boolean
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
 *  primary_key?: string
 *  search_url?: string
 *  dataset?: Array
 *  rows?: {row:any}[]
 *  columns: DatatableColumnDef[]
 *  sort?: DatatableSortData | undefined
 *  filters?: DatatableFilterData[]
 *  pagination_data?: PaginationCompData
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
 *  }
 * _datatable_search(delay?: number)
 * _search_timeout: number
 * _search_request: XMLHttpRequest | undefined
 * } & BaseComp} DatatableComp
 */

/**
 * @param {DatatableComp} comp
 * @param {*} parent
 * @param {DatatableCompData} data
 */
function datatableComp(comp, parent, data = { rows: [], columns: [], filters: [], sort: undefined }) {
	if (!data.filters) {
		data.filters = [];
	}
	if (!data.sort) {
		data.sort = undefined;
	}
	if (!data.dataset) {
		data.dataset = [];
	}
	if (!data.pagination_data) {
		data.pagination_data = { page_count: 0, page_id: 0, row_count: 20 };
	}

	data.rows = [];

	comp._datatable_search = (delay = 0) => {
		if (comp._search_timeout) {
			clearTimeout(comp._search_timeout);
			comp._search_timeout = undefined;
		}
		comp._search_timeout = setTimeout(() => {
			if (comp._search_request) {
				//node._search_request.abort(); // causes a shitty delay
				comp._search_request = undefined;
			}

			const datatable_params = {};
			if (comp._data.sort) {
				datatable_params.order = comp._data.sort.key + " " + comp._data.sort.order.toUpperCase();
			}
			if (comp._data.filters) {
				datatable_params.filters = comp._data.filters;
			}
			datatable_params.row_count = comp._data.pagination_data.row_count;
			datatable_params.page_id = comp._data.pagination_data.page_id;

			comp._search_request = xhr({
				url: comp._data.search_url,
				params: {
					datatable_params,
				},
				success: (res) => {
					comp._search_request = undefined;

					if (res.rows.length === 0 && comp._data.pagination_data.page_id > 0) {
						comp._data.pagination_data.page_id = 0;
						comp._datatable_search();
						return;
					}

					comp._data.dataset = res.rows;
					comp._data.pagination_data.page_count = res.page_count;
					comp._data.pagination_data.total_rows = res.total_rows;
					comp._set_data();

					comp.classList.remove("freeze");
				},
			});
		}, delay);
	};

	comp._set_data = (data = undefined, options = {}) => {
		if (data === undefined) {
			data = comp._data;
		}

		data.rows = [];
		data.dataset.forEach((e) => {
			data.rows.push({ row: e });
		});

		setCompData(comp, data, {
			...options,
			pass_list_data: [{ what: "columns", where: "rows" }],
			render: () => {
				const cd = comp._changed_data;

				if (
					!comp._prev_data ||
					cd.sort ||
					cd.filters ||
					comp._prev_data.pagination_data.page_id != comp._data.pagination_data.page_id ||
					comp._prev_data.pagination_data.row_count != comp._data.pagination_data.row_count
				) {
					let styles_html = "";
					let header_html = "";

					let column_index = -1;
					for (const column of comp._data.columns) {
						column_index++;

						let cell_html = "";

						cell_html += /*html*/ `<div class="dt_cell" data-column="${column_index}">`;
						cell_html += /*html*/ `<span class="label">${column.label}</span>`;
						cell_html += /*html*/ ` <div class="dt_header_controls">`;

						if (column.sortable) {
							let icon = "fa-sort";
							let btn_class = "transparent";
							let tooltip = "Sortuj malejąco";
							if (comp._data.sort && comp._data.sort.key === column.key) {
								if (comp._data.sort.order === "desc") {
									icon = "fa-arrow-down";
									btn_class = "primary";
									tooltip = "Sortuj rosnąco";
								} else if (comp._data.sort.order === "asc") {
									icon = "fa-arrow-up";
									btn_class = "primary";
									tooltip = "Wyłącz sortowanie";
								}
							}
							cell_html += /*html*/ ` <button class="btn ${btn_class} dt_sort fas ${icon}" data-tooltip="${tooltip}"></button>`;
						}
						if (column.searchable) {
							cell_html += /*html*/ ` <button class="btn transparent dt_filter fas fa-search" data-tooltip="Filtruj wyniki"></button>`;
						}

						cell_html += /*html*/ `</div>`;
						cell_html += /*html*/ `</div>`;

						header_html += cell_html;

						styles_html += `.${comp._dom_class} .dt_cell:nth-child(${column_index + 1}) {width:${def(column.width, "10%")};}\n`;
					}
					comp._nodes.table_header._set_content(header_html);
					comp._nodes.style._set_content(styles_html);

					comp._datatable_search(100);
				}
			},
		});
	};

	createComp(comp, parent, data, {
		template: /*html*/ `
            <div style="margin-bottom:10px;display:flex;align-items:center">
                <span class="datatable_label">Produkty</span>
                <a href="${
									STATIC_URLS["ADMIN"]
								}produkt" style="margin:0 10px" class="btn important">Dodaj nowy <i class="fas fa-plus"></i></a>
                <div class="float-icon" style="display: inline-block;margin-left:auto">
                    <input type="text" placeholder="Szukaj..." data-param="search" class="field inline">
                    <i class="fas fa-search"></i>
                </div>
            </div>

            <div class="table_header" data-node="table_header"></div>

            <div class="table_body">
                <list-comp data-bind="{${data.rows}}" ${data.primary_key ? `data-primary="row.${data.primary_key}"` : ""}>
                    <datatable-row-comp></datatable-row-comp>
                </list-comp>
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
					const column_data = comp._data.columns[+dt_sort._parent(".dt_cell").dataset.column];

					const curr_order = comp._data.sort && comp._data.sort.key === column_data.key ? comp._data.sort.order : "";
					/** @type {DatatableSortOrder} */
					let new_order = "desc";
					if (curr_order === "desc") {
						new_order = "asc";
					} else if (curr_order === "asc") {
						new_order = "";
					}
					comp._data.sort = new_order ? { key: column_data.key, order: new_order } : undefined;
					comp._set_data();
				}

				if (dt_filter) {
					return;
				}
			});
		},
		unfreeze_by_self: true,
	});
}
