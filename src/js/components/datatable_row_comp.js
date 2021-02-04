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
function datatableRowComp(comp, parent, data = { row: {}, columns: [] }) {
	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {
				let row_html = "";

				for (const column of data.columns) {
					let cell_html = "";

					cell_html += `<div class='dt_cell'>${data.row[column.key]}</div>`;

					row_html += cell_html;
				}

				if (comp._nodes.dt_row.innerHTML != row_html) {
					comp._nodes.dt_row._set_content(row_html);
				}
			},
		});
	};

	createComp(comp, parent, data, {
		template: html`<div data-node="{${comp._nodes.dt_row}}" class="dt_row {even:${data.row_index % 2 === 0}}"></div>`,
	});
}
