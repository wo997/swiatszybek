/* js[admin] */

/**
 * @typedef {{
 * product_feature_id: number
 * options: Product_FeatureOptionCompData[]
 * } & ListCompRowData} Product_FeatureCompData
 *
 * @typedef {{
 * _data: Product_FeatureCompData
 * _set_data(data?: Product_FeatureCompData, options?: SetCompDataOptions)
 * _nodes: {
 *  feature_name: PiepNode
 *  edit_feature_btn: PiepNode
 *  add_option_btn: PiepNode
 * } & ListControlTraitNodes
 * } & BaseComp} Product_FeatureComp
 */

/**
 * @param {Product_FeatureComp} comp
 * @param {*} parent
 * @param {Product_FeatureCompData} data
 */
function product_featureComp(comp, parent, data = { product_feature_id: -1, options: [] }) {
	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			pass_list_data: [{ what: "product_feature_id", where: "options" }],
			render: () => {
				const feature = product_features.find((e) => e.product_feature_id === data.product_feature_id);
				if (feature) {
					comp._nodes.feature_name._set_content(`${data.row_index + 1}. ${feature.name}`);
				}
			},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<div class="variant_header">
				<div class="title inline semi-bold" data-node="{${comp._nodes.feature_name}}"></div>
				<button
					style="margin-left:5px"
					data-node="{${comp._nodes.add_option_btn}}"
					class="btn {${data.options.length === 0}?important:primary} small"
				>
					Dodaj opcje <i class="fas fa-plus"></i>
				</button>

				<div style="margin-left:auto">
					<button data-node="{${comp._nodes.edit_feature_btn}}" class="btn subtle small">Edytuj cechę <i class="fas fa-cog"></i></button>
					<p-batch-trait data-trait="list_controls"></p-batch-trait>
				</div>
			</div>

			<list-comp data-bind="{${data.options}}" class="wireframe" data-primary="product_feature_option_id">
				<product_feature-option-comp></product_feature-option-comp>
			</list-comp>
		`,
		initialize: () => {
			/** @type {ProductFeatureModalComp} */
			// @ts-ignore
			const product_feature_modal_comp = $("#productFeature product-feature-modal-comp");

			comp._nodes.edit_feature_btn.addEventListener("click", () => {
				product_feature_modal_comp._show(comp._data.product_feature_id, { source: comp._nodes.edit_feature_btn });
			});

			/** @type {SelectProductFeatureOptionsModalComp} */
			// @ts-ignore
			const select_product_features_modal_comp = $("#selectProductFeatureOptions select-product-feature-options-modal-comp");

			comp._nodes.add_option_btn.addEventListener("click", () => {
				select_product_features_modal_comp._show(comp._data.product_feature_id, {
					source: comp._nodes.add_option_btn,
				});
			});

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

				const pfi = product_comp._data.product_feature_ids;
				const id = pfi.indexOf(comp._data.product_feature_id);
				if (id !== -1) {
					pfi.splice(id, 1);
				}
				product_comp._render();
			});

			list.addEventListener("move_row", (ev) => {
				// @ts-ignore
				const detail = ev.detail;
				let from = detail.from;
				if (detail.res.moved || !comp._data) {
					return;
				}

				if (from !== comp._data.row_index) {
					return;
				}
				let to = detail.to;

				detail.res.moved = true;

				const pfi = product_comp._data.product_feature_ids;
				const id = pfi.indexOf(comp._data.product_feature_id);
				if (id !== -1) {
					from = clamp(0, from, pfi.length - 1);
					to = clamp(0, to, pfi.length - 1);

					const temp = pfi.splice(from, 1);
					pfi.splice(to, 0, ...temp);
				}
				product_comp._render();
			});
		},
	});
}