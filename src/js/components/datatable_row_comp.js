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
 *  _prev_data: DatatableRowComp
 *  _set_data(data?: DatatableRowCompData, options?: SetCompDataOptions)
 *  _getData()
 *  _nodes: {
 *      dt_row: PiepNode
 *  }
 * } & BaseComp} DatatableRowComp
 */

/**
 * @param {DatatableRowComp} node
 * @param {*} parent
 * @param {DatatableRowCompData} data
 */
function datatableRowComp(node, parent, data = { row: {}, columns: [] }) {
	node._set_data = (data = undefined, options = {}) => {
		if (data === undefined) {
			data = node._data;
		}

		setCompData(node, data, {
			...options,
			render: () => {
				let row_html = "";

				for (const column of node._data.columns) {
					let cell_html = "";

					cell_html += `<div class='dt_cell'>${node._data.row[column.key]}</div>`;

					row_html += cell_html;
				}

				if (node._nodes.dt_row.innerHTML != row_html) {
					node._nodes.dt_row._set_content(row_html);
				}
			},
		});
	};

	createComp(node, parent, data, {
		template: /*html*/ `<div data-node="{${node._nodes.dt_row}}" class="dt_row {even:${data.row_index % 2 === 0}}"></div>`,
	});
}
