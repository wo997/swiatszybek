/* js[global] */

/**
 *
 * @typedef {{
 * page_id: number
 * curr_page_id: number
 * }} PaginationBtnCompData
 *
 * @typedef {{
 *  _data: PaginationBtnCompData
 *  _set_data(data?: PaginationBtnCompData, options?: SetCompDataOptions)
 *  _getData()
 *  _nodes: {
 *  }
 * } & BaseComp} PaginationBtnComp
 */

/**
 * @param {PaginationBtnComp} comp
 * @param {*} parent
 * @param {PaginationBtnCompData} data
 */
function paginationBtnComp(comp, parent, data) {
	comp._set_data = (data = undefined, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {},
		});
	};

	createComp(comp, parent, data, {
		template: /*html*/ `
            <button class="btn
                {primary:${data.page_id === data.curr_page_id}}
                {subtle:${data.page_id !== data.curr_page_id}}">{${data.page_id + 1}}
            </button>
        `,
		initialize: () => {
			comp.addEventListener("click", () => {
				/** @type {PaginationComp} */
				// @ts-ignore
				const parent = comp._parent_comp._parent_comp;
				parent._data.page_id = comp._data.page_id;
				parent._set_data();
			});
		},
	});
}
