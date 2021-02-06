/* js[view] */

/**
 * @typedef {{
 * product_feature: ProductFeatureCompData
 * }} ProducttFeatureModalCompData
 *
 * @typedef {{
 * _data: ProducttFeatureModalCompData
 * _set_data(data?: ProducttFeatureModalCompData, options?: SetCompDataOptions)
 * _nodes: {
 *      save_btn: PiepNode
 * }
 * } & BaseComp} ProductFeatureModalComp
 */

/**
 * @param {ProductFeatureModalComp} comp
 * @param {*} parent
 * @param {ProducttFeatureModalCompData} data
 */
function productFeatureModalComp(comp, parent, data = { product_feature: { product_feature_id: -1, name: "", options: [] } }) {
	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<div class="custom-toolbar">
				<span class="title">Cecha produktu</span>
				<button class="btn subtle" onclick="hideParentModal(this)">Zamknij <i class="fas fa-times"></i></button>
				<button class="btn primary" data-node="{${comp._nodes.save_btn}}" disabled="{${false}}">Zapisz</button>
			</div>
			<div class="scroll-panel scroll-shadow panel-padding">
				<product-feature-comp data-bind="{${data.product_feature}}"></product-feature-comp>
			</div>
		`,
		initialize: () => {
			comp._nodes.save_btn.addEventListener("click", () => {
				xhr({
					url: STATIC_URLS["ADMIN"] + "product/feature/save",
					params: {
						product_feature: {
							name: comp._data.product_feature.name,
						},
					},
					success: (res) => {
						//console.log(res);
						hideParentModal(comp);

						/** @type {DatatableComp} */
						// @ts-ignore
						const dt_product_features = $("#selectProductFeatures datatable-comp");

						if (dt_product_features) {
							dt_product_features._datatable_search();
						}
					},
				});
				//hideParentModal(this);
			});
		},
	});
}
