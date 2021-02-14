/* js[global] */

/**
 *
 * @typedef {{
 *  row_data: any
 *  columns: DatatableColumnDef[]
 * } & ListCompRowData} DatatableBatchEditCompData
 *
 * @typedef {{
 *  _data: DatatableBatchEditCompData
 *  _set_data(data?: DatatableBatchEditCompData, options?: SetCompDataOptions)
 *  _getData()
 *  _nodes: {
 *      dt_row: PiepNode
 *  }
 * } & BaseComp} DatatableBatchEditComp
 */

/**
 * @param {DatatableBatchEditComp} comp
 * @param {*} parent
 * @param {DatatableBatchEditCompData} data
 */
function datatableBatchEditComp(comp, parent, data = { row_data: {}, columns: [] }) {
	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {
				const cells_html = getDatatableRowHtml({ columns: data.columns, row_data: {} });
				console.log(data);

				setNodeChildren(comp, cells_html);

				/** @type {DatatableComp} */
				// @ts-ignore
				const dt = comp._parent_comp._parent_comp;

				// MAYBE
				//registerForms(comp._nodes.dt_row);

				// if (row_data) {
				// 	row._children("[data-bind]").forEach((input) => {
				// 		const key = input.dataset.bind;
				// 		input._set_value(row_data[key], { quiet: true });
				// 	});
				// }
			},
		});
	};

	createComp(comp, parent, data, {
		ready: () => {
			comp.classList.add("dt_row");

			/** @type {DatatableComp} */
			// @ts-ignore
			const dt = comp._parent_comp;

			comp._children("[data-bind]").forEach((input) => {
				const key = input.dataset.bind;
				input.addEventListener("change", () => {
					if (dt._data.search_url) {
						console.warn("TODO");
					} else {
						dt._data.dataset.forEach((row_data) => {
							const val = input._get_value();
							const prev_value = row_data[key];
							row_data[key] = val;
							dt.dispatchEvent(
								new CustomEvent("editable_change", {
									detail: {
										_row_id: row_data._row_id,
										row_data,
										key,
										prev_value: prev_value,
										value: val,
									},
								})
							);
						});

						dt._render();

						// well, sometimes there is a need to modify a field to it's previous value, so that is necessary, fails at 82.59999 blah
						comp._render({ force_render: true });
					}
				});
			});
		},
	});
}
