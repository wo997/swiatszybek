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
 * }
 * } & BaseComp} ProductFeatureModalComp
 */

/**
 * @param {ProductFeatureModalComp} comp
 * @param {*} parent
 * @param {ProducttFeatureModalCompData} data
 */
function productFeatureModalComp(comp, parent, data = { product_feature: { feature_id: -1, name: "", options: [] } }) {
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
				<button class="btn primary" onclick="hideParentModal(this)" disabled="{${true}}">Zapisz</button>
			</div>
			<div class="scroll-panel scroll-shadow panel-padding">
				<product-feature-comp></product-feature-comp>
			</div>
		`,
		initialize: () => {},
	});
}
