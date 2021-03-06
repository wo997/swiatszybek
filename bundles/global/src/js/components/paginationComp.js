/* js[global] */

/**
 *
 * @typedef {{
 * page_id?: number
 * page_count?: number
 * row_count?: number
 * total_rows?: number
 * row_count_options?: number[]
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
function PaginationComp(comp, parent, data = {}) {
	comp._set_data = (data, options = {}) => {
		data.page_id = def(data.page_id, 0);
		data.row_count = def(data.row_count, 15);
		data.total_rows = def(data.total_rows, 0);
		data.page_count = Math.ceil(data.total_rows / data.row_count);
		data.row_count_options = def(data.row_count_options, [5, 10, 15, 20, 50]);

		const cd = comp._changed_data;
		if (cd.row_count_options) {
			const select = comp._child("select");
			select._set_content(data.row_count_options.map((e) => html`<option value="${e}">${e}</option>`).join(""));
			select._set_value(data.row_count, { quiet: true });
		}

		if (data.page_id > 0 && data.page_id > data.page_count - 1) {
			data.page_id = 0;
			return;
		}

		setCompData(comp, data, {
			...options,
			render: () => {
				const print_page = (i) => {
					return comp._data.total_rows > 0
						? `${i + 1} (${i * data.row_count + 1} - ${Math.min((i + 1) * data.row_count, data.total_rows)})`
						: " ".repeat(7);
				};

				let options = "";
				for (let i = 0; i < data.page_count; i++) {
					options += html`<option value="${i}">${print_page(i)}</option>`;
				}
				comp._nodes.select._set_content(options ? options : html`<option value="0">1</option>`);
				comp._nodes.select_overlay._set_content(options ? print_page(data.page_id) : "1");
				comp._nodes.select.style.width = print_page(data.page_count - 1).length * 7 + 18 + "px";

				comp.classList.toggle("hidden", data.total_rows === 0);
			},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<div class="pages">
				<select data-bind="{${data.row_count}}" class="field inline number"></select>
				/ stronę z <span html="{${data.total_rows}}"></span>
			</div>

			<div class="arrows glue_children">
				<button class="btn subtle" disabled="{${data.page_id <= 0}}" data-node="{${comp._nodes.prev}}">
					<i class="fas fa-chevron-left"></i>
				</button>
				<div style="position:relative;margin:0 -1px">
					<select data-node="{${comp._nodes.select}}" class="field inline blank number" data-bind="{${data.page_id}}"></select>
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
				comp._render();
			});
			comp._nodes.prev.addEventListener("click", () => {
				comp._data.page_id = Math.max(0, comp._data.page_id - 1);
				comp._render();
			});
		},
	});
}
