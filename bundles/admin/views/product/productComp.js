/* js[view] */

/**
 * @typedef {{
 *  product_id: number
 *  name: string
 *  net_price: number
 *  vat: number
 *  gross_price: number
 * }} ProductData
 *
 * @typedef {{
 *  id: number
 *  name: string
 *  sell_by: string
 *  features: Product_FeatureCompData[]
 *  product_feature_option_ids: number[]
 *  products: ProductData[]
 *  products_dt?: DatatableCompData
 * }} ProductCompData
 *
 * @typedef {{
 *  _data: ProductCompData
 *  _set_data(data?: ProductCompData, options?: SetCompDataOptions)
 *  _getData()
 *  _nodes: {
 *      add_variant_btn: PiepNode
 *  }
 * } & BaseComp} ProductComp
 */

/**
 * @param {ProductComp} comp
 * @param {*} parent
 * @param {ProductCompData} data
 */
function productComp(comp, parent, data) {
	/** @type {ProductData[]} */
	const products = [
		{ product_id: 2, name: "sadfas", gross_price: 234, net_price: 40, vat: 23 },
		{ product_id: 3, name: "a", gross_price: 234, net_price: 12, vat: 23 },
		{ product_id: 4, name: "b", gross_price: 100, net_price: 40, vat: 5 },
		{ product_id: 5, name: "c", gross_price: 264, net_price: 4, vat: 8 },
		{ product_id: 6, name: "b", gross_price: 100, net_price: 40, vat: 5 },
		{ product_id: 7, name: "c", gross_price: 264, net_price: 4, vat: 8 },
	]; // will be empty

	/** @type {DatatableCompData} */
	const table = {
		columns: [
			{ key: "product_id", label: "ID", width: "10%", sortable: true, searchable: "number" },
			{ key: "name", label: "Nazwa", width: "10%", sortable: true, searchable: "string" },
			{ key: "net_price", label: "Cena Netto", width: "10%", sortable: true, searchable: "number" },
			{ key: "vat", label: "Vat", width: "10%", sortable: true, searchable: "number" },
			{ key: "gross_price", label: "Cena Brutto", width: "10%", sortable: true, searchable: "number" },
		],
		dataset: products,
		label: "Pełna lista produktów",
		primary_key: "product_id",
	};

	data.products_dt = def(data.products_dt, table);

	comp._set_data = (data, options = {}) => {
		data.features.forEach((feature) => {
			feature.options = data.product_feature_option_ids
				.filter((product_feature_option_id) => {
					return (
						product_feature_options.find((pfo) => {
							return pfo.product_feature_option_id === product_feature_option_id;
						}).product_feature_id === feature.product_feature_id
					);
				})
				.map((product_feature_option_id) => {
					const fo = product_feature_options.find((e) => {
						return e.product_feature_option_id === product_feature_option_id;
					});
					return {
						product_feature_option_id,
						product_feature_id: fo.product_feature_id,
						name: fo.name,
					};
				});
		});

		setCompData(comp, data, {
			...options,
			render: () => {
				//expand(comp._nodes.case_sell_by_qty, data.sell_by === "qty");
			},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<p-trait data-trait="history"></p-trait>

			<div class="label first">Nazwa produktu</div>
			<input type="text" class="field" data-bind="{${data.name}}" />

			<div class="label">Sprzedawaj na</div>
			<select class="field" data-bind="{${data.sell_by}}">
				<option value="qty">Sztuki</option>
				<option value="weight">Wagę</option>
				<option value="length">Długość</option>
			</select>

			<div class="label">
				<span html="{${"Cechy (" + data.features.length + ")"}}"></span>
				<button data-node="add_variant_btn" class="btn primary small">Wybierz <i class="fas fa-search"></i></button>
			</div>

			<list-comp data-bind="{${data.features}}" class="features" data-primary="product_feature_id">
				<product_feature-comp></product_feature-comp>
			</list-comp>

			<div class="label"></div>
			<datatable-comp data-bind="{${data.products_dt}}"></datatable-comp>

			<h3>Display form json</h3>
			<div html="{${JSON.stringify(data)}}"></div>
		`,
		initialize: () => {
			// selectProductFeatures
			registerModalContent(html`
				<div id="selectProductFeatures" data-expand data-dismissable>
					<div class="modal-body">
						<select-product-features-modal-comp></select-product-features-modal-comp>
					</div>
				</div>
			`);

			/** @type {SelectProductFeaturesModalComp} */
			// @ts-ignore
			const select_product_features_modal_comp = $("#selectProductFeatures select-product-features-modal-comp");
			selectProductFeaturesModalComp(select_product_features_modal_comp, undefined);

			// selectProductFeatures
			registerModalContent(html`
				<div id="selectProductFeatureOptions" data-expand data-dismissable>
					<div class="modal-body">
						<select-product-feature-options-modal-comp></select-product-feature-options-modal-comp>
					</div>
				</div>
			`);

			/** @type {SelectProductFeatureOptionsModalComp} */
			// @ts-ignore
			const select_product_feature_options_modal_comp = $("#selectProductFeatureOptions select-product-feature-options-modal-comp");
			selectProductFeatureOptionsModalComp(select_product_feature_options_modal_comp, undefined);

			// productFeature
			registerModalContent(html`
				<div id="productFeature" data-expand data-dismissable>
					<div class="modal-body">
						<product-feature-modal-comp></product-feature-modal-comp>
					</div>
				</div>
			`);

			/** @type {ProductFeatureModalComp} */
			// @ts-ignore
			const product_feature_modal_comp = $("#productFeature product-feature-modal-comp");
			productFeatureModalComp(product_feature_modal_comp, undefined, {
				product_feature: { name: "", product_feature_id: -1, options: [] },
			});

			// other
			comp._nodes.add_variant_btn.addEventListener("click", () => {
				select_product_features_modal_comp._show({ source: comp._nodes.add_variant_btn });
			});

			const history_btns = comp._child(".history_btns");
			const history_btns_wrapper = $(".custom-toolbar .history_btns_wrapper");
			if (history_btns_wrapper) {
				history_btns_wrapper.appendChild(history_btns);
			}
		},
	});
}
