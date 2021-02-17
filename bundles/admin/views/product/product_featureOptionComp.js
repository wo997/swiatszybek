/* js[view] */

/**
 * @typedef {{
 * product_feature_id?: number
 * product_feature_option_id: number
 * name?: string
 * } & ListCompRowData} Product_FeatureOptionCompData
 *
 * @typedef {{
 * _data: Product_FeatureOptionCompData
 * _set_data(data?: Product_FeatureOptionCompData, options?: SetCompDataOptions)
 * _nodes: {
 *  option_name: PiepNode
 * } & ListControlTraitNodes
 * } & BaseComp} Product_FeatureOptionComp
 */

/**
 * @param {Product_FeatureOptionComp} comp
 * @param {*} parent
 * @param {Product_FeatureOptionCompData} data
 */
function product_featureOptionComp(comp, parent, data = { product_feature_option_id: -1, name: "", product_feature_id: -1 }) {
	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<div class="option_header">
				<div class="title inline" html="{${data.name}}"></div>
				<div style="margin-left:auto">
					<p-batch-trait data-trait="list_controls"></p-batch-trait>
				</div>
			</div>
		`,
		initialize: () => {
			/** @type {ProductComp} */
			// @ts-ignore
			const product_comp = $("product-comp");

			/** @type {ListComp} */
			// @ts-ignore
			const list = comp._parent_comp;

			list.addEventListener("remove_row", (ev) => {
				// @ts-ignore
				const detail = ev.detail;
				if (detail.res.removed || !comp._data) {
					return;
				}

				if (detail.row_index !== comp._data.row_index) {
					return;
				}

				detail.res.removed = true;

				const pfoi = product_comp._data.product_feature_option_ids;
				const id = pfoi.indexOf(comp._data.product_feature_option_id);
				if (id !== -1) {
					pfoi.splice(id, 1);
				}
				product_comp._render();
			});

			list.addEventListener("move_row", (ev) => {
				// @ts-ignore
				const detail = ev.detail;
				if (detail.res.moved || !comp._data) {
					return;
				}

				const from_id = detail.from;
				if (from_id !== comp._data.row_index) {
					return;
				}

				detail.res.moved = true;

				const pfoi = product_comp._data.product_feature_option_ids;
				const id = pfoi.indexOf(comp._data.product_feature_option_id);
				if (id !== -1) {
					// swaping is possible because we made sure that the data options are always next each other
					const other_id = id + detail.to - from_id;

					const from = clamp(0, id, pfoi.length - 1);
					const to = clamp(0, other_id, pfoi.length - 1);

					const temp = pfoi.splice(from, 1);
					pfoi.splice(to, 0, ...temp);
				}
				product_comp._render();
			});
		},
	});
}
