/* js[global] */

/**
 * @typedef {{
 *  key: string
 *  width: string
 * }} DatatableColumnDef
 *
 * @typedef {{
 *  rows: Array
 *  columns: DatatableColumnDef[]
 * }} DatatableCompData
 *
 * @typedef {{
 *  _data: DatatableCompData
 *  _prev_data: DatatableComp
 *  _set_data(data?: DatatableCompData, options?: SetCompDataOptions)
 *  _getData()
 *  _nodes: {
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
			render: () => {},
		});
	};

	createComp(node, parent, data, {
		template: /*html*/ `
            <div class="table_header">
                header    
            </div>
            <div class="table_body">
                <list-comp data-bind="{${data.rows}}">
                    <datatable-row-comp></datatable-row-comp>
                </list-comp>
            </div>
            <div class="table_footer">
                footer
            </div>
        `,
		initialize: () => {},
	});
}
