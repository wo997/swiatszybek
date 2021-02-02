/* js[global] */

/**
 *
 * @typedef {{
 * page_id?: number
 * page_count?: number
 * row_count?: number
 * total_rows?: number
 * }} PaginationCompData
 *
 * @typedef {{
 *  _data: PaginationCompData
 *  _set_data(data?: PaginationCompData, options?: SetCompDataOptions)
 *  _getData()
 *  _nodes: {
 *      next: PiepNode
 *      prev: PiepNode
 *      select: PiepNode
 *      select_overlay: PiepNode
 *  }
 * } & BaseComp} PaginationComp
 */

/**
 * @param {PaginationComp} comp
 * @param {*} parent
 * @param {PaginationCompData} data
 */
function paginationComp(comp, parent, data = {}) {
	comp._set_data = (data = undefined, options = {}) => {
		if (data === undefined) {
			data = comp._data;
		}

		data.page_id = def(data.page_id, 0);
		data.page_count = def(data.page_count, 0);
		data.row_count = def(data.row_count, 20);
		data.total_rows = def(data.total_rows, 0);

		setCompData(comp, data, {
			...options,
			render: () => {
				const print_page = (i) => {
					return comp._data.total_rows > 0
						? `${i + 1} (${i * comp._data.row_count + 1} - ${Math.min((i + 1) * comp._data.row_count, comp._data.total_rows)})`
						: " ".repeat(7);
				};

				let options = "";
				for (let i = 0; i < comp._data.page_count; i++) {
					options += /*html*/ `<option value="${i}">${print_page(i)}</option>`;
				}
				comp._nodes.select._set_content(options);
				comp._nodes.select_overlay._set_content(print_page(comp._data.page_id));
				comp._nodes.select.style.width = print_page(comp._data.page_count - 1).length * 7 + 18 + "px";
			},
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

            <div class="arrows glue-children">
                <button class="btn subtle" disabled="{${data.page_id <= 0}}" data-node="{${comp._nodes.prev}}">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <div style="position:relative">
                    <select data-node="{${comp._nodes.select}}" class="field inline" data-number data-bind="{${data.page_id}}"></select>
                    <div class="select_overlay" data-node="{${comp._nodes.select_overlay}}"></div>
                </div>
                <button class="btn subtle" disabled="{${data.page_id >= data.page_count - 1}}" data-node="{${comp._nodes.next}}">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        `,
		initialize: () => {
			comp._nodes.next.addEventListener("click", () => {
				comp._data.page_id = Math.min(comp._data.page_id + 1, comp._data.page_count - 1);
				comp._set_data();
			});
			comp._nodes.prev.addEventListener("click", () => {
				comp._data.page_id = Math.max(0, comp._data.page_id - 1);
				comp._set_data();
			});
		},
	});
}
