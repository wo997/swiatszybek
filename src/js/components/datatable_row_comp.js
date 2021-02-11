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
				/** @type {string[]} */
				let cells_html = [];

				if (data.columns === undefined) {
					console.trace();
				}

				for (const column of data.columns) {
					let cell_html = "";

					if (column.editable) {
						if (column.editable === "checkbox") {
							cell_html += html`<p-checkbox data-bind="${column.key}"></p-checkbox>`;
						} else if (column.editable === "number") {
							cell_html += html`<input type="number" class="field small" data-bind="${column.key}" />`;
						} else if (column.editable === "string") {
							cell_html += html`<input type="text" class="field small" data-bind="${column.key}" />`;
						}
					} else if (column.render) {
						cell_html += column.render(data.row);
					} else {
						cell_html += def(data.row[column.key], "");
					}

					cell_html = `<div class='dt_cell'>${cell_html}</div>`;

					cells_html.push(cell_html);
				}

				setNodeChildren(comp._nodes.dt_row, cells_html);
			},
		});
	};

	createComp(comp, parent, data, {
		template: html`<div data-node="{${comp._nodes.dt_row}}" class="dt_row {even:${data.row_index % 2 === 0}}"></div>`,
	});
}
