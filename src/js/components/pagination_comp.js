/* js[global] */

/**
 *
 * @typedef {{
 * page_id?: number
 * page_count?: number
 * row_count?: number
 * total_rows?: number
 * buttons?: PaginationBtnCompData[]
 * }} PaginationCompData
 *
 * @typedef {{
 *  _data: PaginationCompData
 *  _set_data(data?: PaginationCompData, options?: SetCompDataOptions)
 *  _getData()
 *  _nodes: {
 *  }
 * } & BaseComp} PaginationComp
 */

/**
 * @param {PaginationComp} comp
 * @param {*} parent
 * @param {PaginationCompData} data
 */
function paginationComp(comp, parent, data = {}) {
	// data.buttons = def(data.buttons, []);
	// data.page_id = def(data.page_id, 0);
	// data.page_count = def(data.page_count, 0);
	// data.row_count = def(data.row_count, 20);
	comp._set_data = (data = undefined, options = {}) => {
		if (data === undefined) {
			data = comp._data;
		}

		data.buttons = [];
		for (let i = 0; i < data.page_count; i++) {
			data.buttons.push({ page_id: i, curr_page_id: data.page_id });
		}

		setCompData(comp, data, {
			...options,
			render: () => {},
		});
	};

	createComp(comp, parent, data, {
		template: /*html*/ `
            <div>
                <select data-bind="{${data.row_count}}" class="field inline" data-number>
                    <option value='3'>3</option>
                    <option value='10'>10</option>
                    <option value='20'>20</option>
                    <option value='7'>7</option>
                </select>
                na stronę
            </div>
            <list-comp data-bind="{${data.buttons}}" class="horizontal" data-primary="page_id">
                <pagination-btn-comp></pagination-btn-comp>
            </list-comp>
        `,
	});
}
