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
 *  search_request?: any
 *  rows?: {row:any}[]
 *  columns: DatatableColumnDef[]
 *  sort?: DatatableSortData | undefined
 *  filters?: DatatableFilterData[]
 * }} DatatableCompData
 *
 * @typedef {{
 *  _data: DatatableCompData
 *  _prev_data: DatatableComp
 *  _set_data(data?: DatatableCompData, options?: SetCompDataOptions)
 *  _getData()
 *  _nodes: {
 *      table_header: PiepNode
 *      style: PiepNode
 *  }
 * _datatable_search()
 * } & BaseComp} DatatableComp
 */

/**
 * @param {DatatableComp} node
 * @param {*} parent
 * @param {DatatableCompData} data
 */
function datatableComp(node, parent, data = { rows: [], columns: [], filters: [], sort: undefined }) {
	if (!data.filters) {
		data.filters = [];
	}
	if (!data.sort) {
		data.sort = undefined;
	}
	if (!data.dataset) {
		data.dataset = [];
	}
	data.rows = [];

	node._datatable_search = () => {
		const datatable_params = {};
		if (node._data.sort) {
			datatable_params.order = node._data.sort.key + " " + node._data.sort.order.toUpperCase();
		}

		node._data.search_request = xhr({
			url: node._data.search_url,
			params: {
				datatable_params,
			},
			success: (res) => {
				node._data.dataset = res.results;
				node._set_data();
				//console.log(res);
			},
		});
	};

	node._set_data = (data = undefined, options = {}) => {
		if (data === undefined) {
			data = node._data;
		}

		data.rows = [];
		data.dataset.forEach((e) => {
			data.rows.push({ row: e });
		});

		setCompData(node, data, {
			...options,
			pass_list_data: [{ what: "columns", where: "rows" }],
			render: () => {
				let styles_html = "";
				let header_html = "";

				let column_index = -1;
				for (const column of node._data.columns) {
					column_index++;

					let cell_html = "";

					cell_html += /*html*/ `<div class="dt_cell" data-column="${column_index}">`;
					cell_html += /*html*/ `<span class="label">${column.label}</span>`;
					cell_html += /*html*/ ` <div class="dt_header_controls">`;

					if (column.sortable) {
						let icon = "fa-sort";
						let btn_class = "subtle";

						if (node._data.sort && node._data.sort.key === column.key) {
							if (node._data.sort.order === "asc") {
								icon = "fa-arrow-up";
								btn_class = "primary";
							} else if (node._data.sort.order === "desc") {
								icon = "fa-arrow-down";
								btn_class = "primary";
							}
						}
						cell_html += /*html*/ ` <button class="btn ${btn_class} dt_sort fas ${icon}" data-tooltip="Sortuj malejąco / rosnąco"></button>`;
					}
					if (column.searchable) {
						cell_html += /*html*/ ` <button class="btn subtle dt_filter fas fa-search" data-tooltip="Filtruj wyniki"></button>`;
					}

					cell_html += /*html*/ `</div>`;
					cell_html += /*html*/ `</div>`;

					header_html += cell_html;

					styles_html += `.${node._dom_class} .dt_cell:nth-child(${column_index + 1}) {width:${def(column.width, "10%")};}\n`;
				}
				node._nodes.table_header._set_content(header_html);
				node._nodes.style._set_content(styles_html);

				if (node._changed_data.sort || node._changed_data.filters) {
					node._datatable_search();
				}
			},
		});
	};

	createComp(node, parent, data, {
		template: /*html*/ `
            <div>
                <span class="datatable_label">Produkty</span>

                <div class="float-icon" style="display: inline-block;">
                    <input type="text" placeholder="Szukaj..." data-param="search" class="field inline">
                    <i class="fas fa-search"></i>
                </div>

                <button class="btn important">Dodaj nowy <i class="fas fa-plus"></i></button>
            </div>

            <br>

            <div class="table_header" data-node="table_header"></div>

            <div class="table_body">
                <list-comp data-bind="{${data.rows}}" ${data.primary_key ? `data-primary="row.${data.primary_key}"` : ""}>
                    <datatable-row-comp></datatable-row-comp>
                </list-comp>
            </div>

            1 2 3 4 5 6 7

            <style data-node="style"></style>
        `,
		initialize: () => {
			node.addEventListener("click", (event) => {
				const target = $(event.target);
				if (!target) {
					return;
				}
				const dt_sort = target._parent(".dt_sort", { skip: 0 });
				const dt_filter = target._parent(".dt_filter", { skip: 0 });

				if (dt_sort) {
					const column_data = node._data.columns[+dt_sort._parent(".dt_cell").dataset.column];

					const curr_order = node._data.sort && node._data.sort.key === column_data.key ? node._data.sort.order : "";
					/** @type {DatatableSortOrder} */
					let new_order = "desc";
					if (curr_order === "desc") {
						new_order = "asc";
					} else if (curr_order === "asc") {
						new_order = "";
					}
					node._data.sort = new_order ? { key: column_data.key, order: new_order } : undefined;
					node._set_data();
				}

				if (dt_filter) {
					return;
				}
			});
		},
	});
}
