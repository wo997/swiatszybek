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
 *  product_feature_option_ids: number[]
 *  product_feature_ids: number[]
 *  features: Product_FeatureCompData[]
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
 *      all_products: DatatableComp
 *  }
 * } & BaseComp} ProductComp
 */

/**
 * @param {ProductComp} comp
 * @param {*} parent
 * @param {ProductCompData} data
 */
function productComp(comp, parent, data) {
	/** @type {DatatableCompData} */
	const table = {
		columns: [
			//{ key: "product_id", label: "ID", width: "10%", sortable: true, searchable: "number" },
			{ key: "name", label: "Nazwa", width: "10%", sortable: true, searchable: "string" },
			{ key: "net_price", label: "Cena Netto", width: "10%", sortable: true, searchable: "number" },
			{ key: "vat", label: "Vat (daj stały wyżej)", width: "10%", sortable: true, searchable: "number" },
			{ key: "gross_price", label: "Cena Brutto", width: "10%", sortable: true, searchable: "number" },
		],
		dataset: [],
		label: "Pełna lista produktów",
		primary_key: "product_id",
	};

	data.products_dt = def(data.products_dt, table);
	data.products = [];

	comp._set_data = (data, options = {}) => {
		const missing_feature_ids = [];

		data.features = data.product_feature_ids.map((product_feature_id) => {
			const fe = product_features.find((pf) => {
				return pf.product_feature_id === product_feature_id;
			});
			if (fe) {
				return {
					product_feature_id: fe.product_feature_id,
					name: fe.name,
					options: [],
				};
			} else {
				missing_feature_ids.push(product_feature_id);
			}
		});

		data.product_feature_ids = data.product_feature_ids.filter((e) => missing_feature_ids.indexOf(e) === -1);

		const missing_option_ids = [];
		const product_feature_option_ids = [];

		data.features.forEach((feature) => {
			feature.options = data.product_feature_option_ids
				.filter((product_feature_option_id) => {
					const fo = product_feature_options.find((pfo) => {
						return pfo.product_feature_option_id === product_feature_option_id;
					});
					if (fo) {
						return fo.product_feature_id === feature.product_feature_id;
					} else {
						missing_option_ids.push(product_feature_option_id);
					}
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

			product_feature_option_ids.push(...feature.options.map((option) => option.product_feature_option_id));
		});

		// important usage of product_feature_option_ids, these are ordered properly
		data.product_feature_option_ids = product_feature_option_ids.filter((e) => missing_option_ids.indexOf(e) === -1);

		// full product list
		let cross_features = [[]];
		data.features.forEach((feature) => {
			const cross_features_next = [];
			cross_features.forEach((feature_set) => {
				feature.options.forEach((option) => {
					const feature_set_copy = cloneObject(feature_set);

					feature_set_copy.push(option.product_feature_option_id);
					cross_features_next.push(feature_set_copy);
				});
			});
			cross_features = cross_features_next;
		});

		const getFeatureKeyFromId = (feature_id) => {
			return `feature_${feature_id}`;
		};

		data.product_feature_ids.forEach((feature_id) => {
			const key = getFeatureKeyFromId(feature_id);
			if (!data.products_dt.columns.find((column) => column.key === key)) {
				const feature = product_features.find((feature) => feature.product_feature_id === feature_id);
				data.products_dt.columns.unshift({
					key,
					label: feature.name,
					width: "10%",
					searchable: "string",
					sortable: true,
					render: (data) => {
						const option_id = data[key];
						const option = product_feature_options.find((option) => option.product_feature_option_id === option_id);
						if (option) {
							return option.name;
						}
						return "-";
					},
				});
			}
		});

		cross_features.forEach((feature_set) => {
			const product_features = {};
			feature_set.forEach((product_feature_option_id) => {
				const option = product_feature_options.find((fo) => fo.product_feature_option_id === product_feature_option_id);
				product_features[option.product_feature_id] = product_feature_option_id;
			});

			let missing_product = true;
			data.products.forEach((product) => {
				let options_match = true;
				for (const [feature_id, option_id] of Object.entries(product_features)) {
					const key = getFeatureKeyFromId(feature_id);
					if (product[key] !== option_id) {
						options_match = false;
						break;
					}
				}
				if (options_match) {
					missing_product = false;
				}
			});

			if (missing_product) {
				/** @type {ProductData} */
				const product_data = { name: "asdads", gross_price: 45.6, net_price: 45.2, product_id: -1, vat: 77 };

				for (const [feature_id, option_id] of Object.entries(product_features)) {
					const key = getFeatureKeyFromId(feature_id);
					product_data[key] = option_id;
				}
				data.products.push(product_data);
			}
		});

		comp._nodes.all_products._set_dataset(data.products);

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
			<datatable-comp data-bind="{${data.products_dt}}" data-node="{${comp._nodes.all_products}}"></datatable-comp>

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
