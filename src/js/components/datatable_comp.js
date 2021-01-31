/* js[global] */

/**
 * @typedef {{
 *  label: string
 *  key: string
 *  width: string
 *  sortable?: boolean
 *  primary?: boolean
 * }} DatatableColumnDef
 *
 * @typedef {{
 *  rows: {row:any}[]
 *  columns: DatatableColumnDef[]
 * }} DatatableCompData
 *
 * @typedef {{
 *  _data: DatatableCompData
 *  _prev_data: DatatableComp
 *  _set_data(data?: DatatableCompData, options?: SetCompDataOptions)
 *  _getData()
 *  _nodes: {
 *  table_header: PiepNode
 *  }
 * } & BaseComp} DatatableComp
 */

/**
 * @param {DatatableComp} node
 * @param {*} parent
 * @param {DatatableCompData} data
 */
function datatableComp(node, parent, data = { rows: [], columns: [] }) {
	node._set_data = (data = undefined, options = {}) => {
		if (data === undefined) {
			data = node._data;
		}

		setCompData(node, data, {
			...options,
			pass_list_data: [{ what: "columns", where: "rows" }],
			render: () => {
				if (node._changed_data.columns) {
					let header_html = "";

					for (const column of node._data.columns) {
						let cell_html = "";

						cell_html += `<div class='datatable_cell' style="width:${def(column.width, "10%")}">${column.label}</div>`;

						header_html += cell_html;
					}
					node._nodes.table_header._set_content(header_html);
				}
			},
		});
	};

	const primary_kolumn = data.columns.find((e) => e.primary);
	const primary_column_key = primary_kolumn ? "row." + primary_kolumn.key : undefined;

	createComp(node, parent, data, {
		template: /*html*/ `
            <div class="table_header" data-node="table_header">
                
            </div>
            <div class="table_body">
                <list-comp data-bind="{${data.rows}}" ${primary_column_key ? `data-primary="${primary_column_key}"` : ""}>
                    <datatable-row-comp></datatable-row-comp>
                </list-comp>
            </div>
        `,
		initialize: () => {},
	});
}
