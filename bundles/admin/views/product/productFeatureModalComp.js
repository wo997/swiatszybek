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
 *      product_feature_comp: ProductFeatureComp
 *      delete_btn: PiepNode
 * }
 * _show?(id: number, options?: {source?: PiepNode})
 * } & BaseComp} ProductFeatureModalComp
 */

/**
 * @param {ProductFeatureModalComp} comp
 * @param {*} parent
 * @param {ProducttFeatureModalCompData} data
 */
function productFeatureModalComp(comp, parent, data) {
	comp._show = (id, options = {}) => {
		comp.classList.add("freeze");
		setTimeout(() => {
			showModal("productFeature", {
				source: options.source,
			});
		});

		comp._nodes.product_feature_comp._load_data(id, {
			callback: () => {
				clearCompHistory(comp);
				comp.classList.remove("freeze");
			},
		});
	};

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
				<p-trait data-trait="history"></p-trait>
				<button class="btn subtle" onclick="hideParentModal(this)">Zamknij <i class="fas fa-times"></i></button>
				<button class="btn primary" data-node="{${comp._nodes.save_btn}}" disabled="{${false}}">Zapisz</button>
			</div>
			<div class="scroll-panel scroll-shadow panel-padding">
				<product-feature-comp
					data-node="{${comp._nodes.product_feature_comp}}"
					data-bind="{${data.product_feature}}"
				></product-feature-comp>
				<div style="margin-top: auto;padding-top: 10px;text-align: right;">
					<button class="btn error" data-node="{${comp._nodes.delete_btn}}">Usuń <i class="fas fa-trash"></i></button>
				</div>
			</div>
		`,
		initialize: () => {
			comp._nodes.save_btn.addEventListener("click", () => {
				comp._nodes.product_feature_comp._save_data();
			});
			comp._nodes.delete_btn.addEventListener("click", () => {
				comp._nodes.product_feature_comp._delete();
			});
		},
	});
}