/* js[admin] */

/**
 * @typedef {{
 * product_feature: ProductFeatureCompData
 * }} ProductFeatureModalCompData
 *
 * @typedef {{
 * _data: ProductFeatureModalCompData
 * _set_data(data?: ProductFeatureModalCompData, options?: SetCompDataOptions)
 * _nodes: {
 *      save_btn: PiepNode
 *      product_feature_comp: ProductFeatureComp
 *      delete_btn: PiepNode
 * }
 * _show?(id: number, options?: ShowModalParams)
 * } & BaseComp} ProductFeatureModalComp
 */

/**
 * @param {ProductFeatureModalComp} comp
 * @param {*} parent
 * @param {ProductFeatureModalCompData} data
 */
function ProductFeatureModalComp(comp, parent, data = undefined) {
	if (data === undefined) {
		data = { product_feature: { name: "", data_type: "text_list", product_feature_id: -1, current_group_id: -1, groups: [] } };
	}

	comp._show = (id, options = {}) => {
		comp._nodes.product_feature_comp._load_data(id);
		clearCompHistory(comp);

		showModal("productFeature", {
			source: options.source,
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
			<div class="custom_toolbar">
				<span class="title medium">
					Cecha produktu:
					<span html="{${data.product_feature.name.trim() ? data.product_feature.name : "Nowa"}}"> </span>
				</span>
				<p-trait class="mla" data-trait="history"></p-trait>
				<button class="btn subtle ml1" onclick="hideParentModal(this)">Zamknij <i class="fas fa-times"></i></button>
				<button class="btn primary ml1" data-node="{${comp._nodes.save_btn}}" disabled="{${false}}">
					Zapisz <i class="fas fa-save"></i>
				</button>
			</div>
			<div class="scroll_panel scroll_shadow panel_padding">
				<product-feature-comp
					data-node="{${comp._nodes.product_feature_comp}}"
					data-bind="{${data.product_feature}}"
				></product-feature-comp>

				<div class="mta pt2" style="text-align: right;">
					<button class="btn error" data-node="{${comp._nodes.delete_btn}}">Usuń cechę produktu <i class="fas fa-trash"></i></button>
				</div>
			</div>
		`,
		initialize: () => {
			comp._nodes.save_btn.addEventListener("click", () => {
				comp._nodes.product_feature_comp._save({
					callback: () => {
						comp.dispatchEvent(new CustomEvent("saved_state"));
					},
				});
			});
			comp._nodes.delete_btn.addEventListener("click", () => {
				if (confirm("Czy aby na pewno chcesz usunąć tę cechę?")) {
					comp._nodes.product_feature_comp._delete();
				}
			});
		},
	});
}

function getProductFeatureModal() {
	const ex = $("#productFeature");
	if (!ex) {
		registerModalContent(html`
			<div id="productFeature" data-expand data-dismissable>
				<div class="modal_body" style="max-width: calc(20% + 700px);max-height: calc(75% + 120px);">
					<product-feature-modal-comp class="flex_stretch"></product-feature-modal-comp>
				</div>
			</div>
		`);
	}

	/** @type {ProductFeatureModalComp} */
	// @ts-ignore
	const product_feature_modal_comp = $("#productFeature product-feature-modal-comp");
	if (!ex) {
		ProductFeatureModalComp(product_feature_modal_comp, undefined);
	}

	return product_feature_modal_comp;
}
