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
 * @param {PaginationBtnComp} node
 * @param {*} parent
 * @param {PaginationBtnCompData} data
 */
function paginationBtnComp(node, parent, data) {
	node._set_data = (data = undefined, options = {}) => {
		setCompData(node, data, {
			...options,
			render: () => {},
		});
	};

	createComp(node, parent, data, {
		template: /*html*/ `
            <button class="btn
                {primary:${data.page_id === data.curr_page_id}}
                {subtle:${data.page_id !== data.curr_page_id}}">{${data.page_id + 1}}
            </button>
        `,
		initialize: () => {
			node.addEventListener("click", () => {
				/** @type {PaginationComp} */
				// @ts-ignore
				const parent = node._parent_comp._parent_comp;
				parent._data.page_id = node._data.page_id;
				console.log(parent, parent._data);
				parent._set_data();
			});
		},
	});
}
