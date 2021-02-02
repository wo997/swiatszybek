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

		let range = 2;
		let min_page_id = 0;
		let max_page_id = data.page_count - 1;
		let center = clamp(min_page_id + range, data.page_id, max_page_id - range);
		let min = Math.max(min_page_id, center - range);
		let max = Math.min(max_page_id, center + range);

		if (min > min_page_id) {
			data.buttons.push({ page_id: min_page_id, active: false });
		}
		if (min > min_page_id + 1) {
			data.buttons.push({ page_id: -1, active: false, splitter: true });
		}
		for (let i = min; i <= max; i++) {
			data.buttons.push({ page_id: i, active: i === data.page_id });
		}
		if (max < max_page_id - 1) {
			data.buttons.push({ page_id: -2, active: false, splitter: true });
		}
		if (max < max_page_id) {
			data.buttons.push({ page_id: max_page_id, active: false });
		}

		setCompData(comp, data, {
			...options,
			render: () => {},
		});
	};

	createComp(comp, parent, data, {
		template: /*html*/ `
            <div class="pages">
                <select data-bind="{${data.row_count}}" class="field inline" data-number>
                    <option value='1'>1</option>
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
