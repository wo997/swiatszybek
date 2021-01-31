/* js[global] */

/**
 *
 * @typedef {{
 *  row: any
 *  columns: DatatableColumnDef[]
 * }} DatatableRowCompData
 *
 * @typedef {{
 *  _data: DatatableRowCompData
 *  _prev_data: DatatableRowComp
 *  _set_data(data?: DatatableRowCompData, options?: SetCompDataOptions)
 *  _getData()
 *  _nodes: {
 *  }
 * } & BaseComp} DatatableRowComp
 */

/**
 * @param {DatatableRowComp} node
 * @param {*} parent
 * @param {DatatableRowCompData} data
 */
function datatableRowComp(node, parent, data = { row: {}, columns: [] }) {
	node._pointSelfData = () => {
		return { obj: node._data, key: "row" };
	};

	node._set_data = (data = undefined, options = {}) => {
		if (data === undefined) {
			data = node._data;
		}

		setCompData(node, data, {
			...options,
			render: () => {},
		});
	};

	createComp(node, parent, data, {
		template: /*html*/ `
            {${JSON.stringify(data.row)}}
            <list-comp>
                <datatable-cell-comp></datatable-cell-comp>
            </list-comp>
        `,
		initialize: () => {},
	});
}
