/* js[view] */

/**
 * @typedef {{
 *  product_id: number
 *  active: number
 *  net_price: number
 *  vat: number
 *  gross_price: number
 *  stock: number
 *  is_necessary?: boolean
 * }} ProductData
 *
 * @typedef {{
 *  id: number
 *  name: string
 *  sell_by: string
 *  product_feature_option_ids: number[]
 *  product_feature_ids: number[]
 *  features: Product_FeatureCompData[]
 *  missing_products_features: Object[]
 *  unnecessary_product_ids?: number[]
 *  products_dt?: DatatableCompData
 * }} ProductCompData
 *
 * @typedef {{
 *  _data: ProductCompData
 *  _set_data(data?: ProductCompData, options?: SetCompDataOptions)
 *  _getData()
 *  _nodes: {
 *      add_feature_btn: PiepNode
 *      all_products: DatatableComp
 *      add_products_btn: PiepNode
 *      remove_products_btn: PiepNode
 *  }
 *  _add_missing_products(params?: {similar_products: {new_option_id, option_id}[], options_existed: number[]})
 *  _remove_missing_products()
 * } & BaseComp} ProductComp
 */

const product_copy_keys = ["net_price", "vat", "gross_price", "active"];

const getFeatureKeyFromId = (feature_id) => {
	return `feature_${feature_id}`;
};
const getFeatureIdFromKey = (key) => {
	const feature_id = +key.replace(`feature_`, "");
	if (isNaN(feature_id)) {
		return 0;
	}
	return feature_id;
};

/**
 * @param {ProductComp} comp
 * @param {*} parent
 * @param {ProductCompData} data
 */
function productComp(comp, parent, data) {
	/** @type {DatatableCompData} */
	const table = {
		columns: [
			{
				key: "active",
				label: "Aktywny",
				width: "130px",
				sortable: true,
				searchable: "boolean",
				editable: "checkbox",
			},
			{
				key: "net_price",
				label: "Cena Netto",
				width: "10%",
				sortable: true,
				searchable: "number",
				editable: "number",
			},
			{ key: "vat", label: "Vat (stały?)", width: "10%", sortable: true, editable: "number" },
			{ key: "gross_price", label: "Cena Brutto", width: "10%", sortable: true, editable: "number" },
			{ key: "stock", label: "Stan magazynowy", width: "10%", sortable: true, editable: "number" },
		],
		dataset: [],
		label: "Pełna lista produktów",
		selectable: true,
	};

	data.products_dt = def(data.products_dt, table);
	data.unnecessary_product_ids = [];

	comp._add_missing_products = (params) => {
		const data = comp._data;
		const add_products = [];

		const all_feature_keys = data.product_feature_ids.map((feature_id) => getFeatureKeyFromId(feature_id));

		data.missing_products_features.forEach((features) => {
			/** @type {ProductData} */
			const product_data = { gross_price: 0, net_price: 0, product_id: -1, vat: 0, active: 1, stock: 0 };

			for (const [feature_id, option_id] of Object.entries(features)) {
				const key = getFeatureKeyFromId(feature_id);
				product_data[key] = option_id;
			}

			if (params) {
				data.products_dt.dataset.forEach((/** @type {ProductData} */ other_product) => {
					params.options_existed.forEach((option_id) => {
						const feature_id = product_feature_options.find((option) => option.product_feature_option_id === option_id).product_feature_id;
						const feature_key = getFeatureKeyFromId(feature_id);
						other_product[feature_key] = option_id;
					});
				});
			}

			let copy_product = undefined;
			let max_shared_features = 0;
			let product_existed = false;
			data.products_dt.dataset.forEach((/** @type {ProductData} */ other_product) => {
				let shared_features = 0;
				let shared_features_with_similarities = 0;
				for (const feature_key of all_feature_keys) {
					const pr_opt_id = product_data[feature_key];
					const compare_opt_ids = [pr_opt_id];

					if (pr_opt_id === other_product[feature_key]) {
						shared_features++;
					}

					if (params) {
						compare_opt_ids.push(...params.similar_products.filter((e) => e.new_option_id === pr_opt_id).map((e) => e.option_id));
					}

					compare_opt_ids.forEach((opt_id) => {
						if (opt_id === other_product[feature_key]) {
							shared_features_with_similarities++;
						}
					});
				}

				if (shared_features > max_shared_features) {
					max_shared_features = shared_features;
					copy_product = other_product;
				}

				if (shared_features === all_feature_keys.length) {
					product_existed = true;
				}
			});

			if (!product_existed) {
				if (copy_product) {
					for (const key of product_copy_keys) {
						product_data[key] = copy_product[key];
					}
				}

				add_products.push(product_data);
			}
		});

		data.product_feature_ids;
		data.product_feature_option_ids;

		// compare features
		const options_before = {};

		data.products_dt.dataset.forEach((/** @type {ProductData} */ product) => {
			for (const [feature_key, option_id] of Object.entries(product)) {
				const feature_id = getFeatureIdFromKey(feature_key);
				if (!feature_id) {
					continue;
				}

				if (!options_before[feature_id]) {
					options_before[feature_id] = [];
				}
				options_before[feature_id].push(option_id);
			}
		});

		const options_after = {};
		data.product_feature_option_ids.forEach((option_id) => {
			const feature_id = product_feature_options.find((option) => option.product_feature_option_id === option_id).product_feature_id;
			if (!options_after[feature_id]) {
				options_after[feature_id] = [];
			}
			options_after[feature_id].push(option_id);
		});

		/** @type {ManageProductList_QuestionCompData[]} */
		const questions = [];

		for (const feature_id of Object.keys(options_after)) {
			const feature_name = product_features.find((fe) => fe.product_feature_id === +feature_id).name;
			if (options_before[feature_id]) {
				for (const option_after_id of options_after[feature_id]) {
					if (!options_before[feature_id].includes(option_after_id)) {
						const options = options_before[feature_id].filter(onlyUnique).map((option_id) => {
							return {
								label: product_feature_options.find((op) => op.product_feature_option_id === option_id).name,
								value: option_id,
							};
						});
						options.push({ label: "Nie kopiuj (utwórz puste)", value: -1 });

						const option_name = product_feature_options.find((op) => op.product_feature_option_id === option_after_id).name;

						questions.push({
							type: "copy",
							copy_option_id: option_after_id,
							label: `Które dane chcesz skopiować dla opcji <span style="text-decoration:underline">${option_name}</span> (${feature_name})?`,
							options,
						});
					}
				}
			} else {
				const options = options_after[feature_id].filter(onlyUnique).map((option_id) => {
					return { label: product_feature_options.find((op) => op.product_feature_option_id === option_id).name, value: option_id };
				});
				options.push({ label: "Nie", value: -1 });

				questions.push({
					type: "existed",
					label: `Czy któraś opcja (${feature_name}) należała już do produktu?`,
					options,
				});
			}
		}

		if (questions.length > 0 && !params) {
			/** @type {ManageProductListModalComp} */
			// @ts-ignore
			const manage_product_list_modal_comp = $("#manageProductList manage-product-list-modal-comp");

			manage_product_list_modal_comp._data.questions = questions;
			manage_product_list_modal_comp._data.add_products = add_products;
			manage_product_list_modal_comp._render({ freeze: true });

			manage_product_list_modal_comp._show({ source: comp._nodes.add_products_btn });
		} else {
			add_products.forEach((p) => {
				data.products_dt.dataset.push(p);
			});

			comp._render();
		}
	};

	comp._remove_missing_products = () => {
		const data = comp._data;

		data.products_dt.dataset = data.products_dt.dataset.filter((/** @type {ProductData} */ product) => {
			return product.is_necessary;
		});

		comp._render();
	};

	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {
				const data = comp._data;
				const missing_feature_ids = [];

				const ch = comp._changed_data;

				if (ch.product_feature_ids || options.force_render) {
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
				}

				if (ch.product_feature_ids || ch.product_feature_option_ids || options.force_render) {
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
				}

				// full product list
				let cross_features = [[]];
				data.features.forEach((feature) => {
					if (feature.options.length < 2) {
						return;
					}

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

				data.product_feature_ids.forEach((feature_id) => {
					const key = getFeatureKeyFromId(feature_id);
					const feature = product_features.find((feature) => feature.product_feature_id === feature_id);

					if (data.features.find((f) => f.product_feature_id === feature_id).options.length < 2) {
						return;
					}

					const column = {
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
					};

					const columns = data.products_dt.columns;
					const column_index = columns.findIndex((column) => column.key === key);

					if (column_index !== -1) {
						if (!isEquivalent(columns[column_index], column)) {
							columns[column_index] = column;
						}
					} else {
						columns.unshift(column);
					}
				});

				const selection_changed = ch.product_feature_ids || ch.product_feature_option_ids;
				if (selection_changed || options.force_render) {
					let any_column_change = false;
					let column_index = -1;
					/** @type {DatatableColumnDef[]} */
					const feature_columns = [];
					data.products_dt.columns.forEach((column) => {
						column_index++;
						const feature_id = getFeatureIdFromKey(column.key);
						if (feature_id) {
							const req_column_index = data.product_feature_ids.indexOf(feature_id);
							feature_columns[req_column_index] = column;
							if (req_column_index + 1 !== column_index) {
								any_column_change = true;
							}
						}
					});

					if (any_column_change) {
						data.products_dt.columns = data.products_dt.columns.filter((e) => getFeatureIdFromKey(e.key) === 0);
						data.products_dt.columns.splice(1, 0, ...feature_columns.filter((e) => e));
					}
				}

				if (selection_changed || ch.products_dt || options.force_render) {
					const missing_products_features = [];

					/** @type {ProductData[]} */
					const products = data.products_dt.dataset;
					products.forEach((p) => {
						p.is_necessary = false;
					});

					cross_features.forEach((feature_set) => {
						const product_features = {};
						feature_set.forEach((product_feature_option_id) => {
							const option = product_feature_options.find((fo) => fo.product_feature_option_id === product_feature_option_id);
							product_features[option.product_feature_id] = product_feature_option_id;
						});

						let missing_product = true;
						products.forEach((product) => {
							if (product.is_necessary) {
								return;
							}

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
								product.is_necessary = true;
							}
						});

						if (missing_product) {
							missing_products_features.push(product_features);
						}
					});

					data.missing_products_features = missing_products_features;
					data.unnecessary_product_ids = products.filter((p) => !p.is_necessary).map((p) => p.product_id);
				}
			},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<p-trait data-trait="history"></p-trait>

			<div style="max-width:600px">
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
					<button data-node="add_feature_btn" class="btn primary small">Wybierz <i class="fas fa-search"></i></button>
				</div>

				<list-comp data-bind="{${data.features}}" data-primary="product_feature_id">
					<product_feature-comp></product_feature-comp>
				</list-comp>

				<p
					style="margin:25px 0;background: #fafafa;padding: 10px;border-radius: 4px;color: #444;text-align: justify;box-shadow: 0 1px 4px 0 #0003;font-weight: 600;"
				>
					<i class="fas fa-info-circle"></i> Na podstawie cech zostanie wygenerowana lista produktów - tych samych, które są w Twoim
					magazynie. Przykładowo jeśli wybierzemy kolory czerwony i niebieski, oraz rozmiary 36, 37 i 38, otrzymamy 6 produktów będących
					"krzyżówką" podanych cech. Domyślnie (bez wybrania cech) będzie to tylko 1 produkt.
				</p>
			</div>

			<button
				class="btn {${data.missing_products_features.length > 0}?important:subtle}"
				data-node="{${comp._nodes.add_products_btn}}"
				data-tooltip="{${data.missing_products_features.length > 0
					? "Zalecane po uzupełnieniu wszystkich cech produktu"
					: "Wszystko się zgadza!"}}"
			>
				Dodaj brakujące produkty (<span html="{${data.missing_products_features.length}}"></span>)
			</button>
			<button
				class="btn {${data.unnecessary_product_ids.length > 0}?error_light:subtle}"
				data-node="{${comp._nodes.remove_products_btn}}"
				disabled="{${data.missing_products_features.length > 0}}"
				data-tooltip="{${data.unnecessary_product_ids.length === 0 ? "Wszystko się zgadza!" : "Pamiętaj o przepisaniu istotnych danych"}}"
			>
				Usuń niepotrzebne produkty (<span html="{${data.unnecessary_product_ids.length}}"></span>)
			</button>
			<div class="label"></div>

			<datatable-comp data-bind="{${data.products_dt}}" data-node="{${comp._nodes.all_products}}"></datatable-comp>
		`,
		ready: () => {
			// selectProductFeatures
			registerModalContent(html`
				<div id="selectProductFeatures" data-expand data-dismissable>
					<div class="modal-body" style="max-width: calc(75% + 100px);max-height: calc(75% + 100px);">
						<select-product-features-modal-comp class="flex_stretch"></select-product-features-modal-comp>
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
					<div class="modal-body" style="max-width: calc(75% + 100px);max-height: calc(75% + 100px);">
						<select-product-feature-options-modal-comp class="flex_stretch"></select-product-feature-options-modal-comp>
					</div>
				</div>
			`);

			/** @type {SelectProductFeatureOptionsModalComp} */
			// @ts-ignore
			const select_product_feature_options_modal_comp = $("#selectProductFeatureOptions select-product-feature-options-modal-comp");
			selectProductFeatureOptionsModalComp(select_product_feature_options_modal_comp, undefined);

			// productFeature
			registerModalContent(html`
				<div id="manageProductList" data-dismissable>
					<div class="modal-body" style="width: calc(20% + 300px);max-height: calc(75% + 100px);">
						<manage-product-list-modal-comp class="flex_stretch"></manage-product-list-modal-comp>
					</div>
				</div>
			`);

			/** @type {ManageProductListModalComp} */
			// @ts-ignore
			const manage_product_list_modal_comp = $("#manageProductList manage-product-list-modal-comp");
			manageProductListModalComp(manage_product_list_modal_comp, undefined);

			// productFeature
			registerModalContent(html`
				<div id="productFeature" data-expand data-dismissable>
					<div class="modal-body" style="max-width: calc(70% + 100px);max-height: calc(70% + 100px);">
						<product-feature-modal-comp class="flex_stretch"></product-feature-modal-comp>
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
			comp._nodes.add_feature_btn.addEventListener("click", () => {
				select_product_features_modal_comp._show({ source: comp._nodes.add_feature_btn });
			});

			const history_btns = comp._child(".history_btns");
			const history_btns_wrapper = $(".custom-toolbar .history_btns_wrapper");
			if (history_btns_wrapper) {
				history_btns_wrapper.appendChild(history_btns);
			}

			comp._nodes.add_products_btn.addEventListener("click", () => {
				comp._add_missing_products();
			});

			comp._nodes.remove_products_btn.addEventListener("click", () => {
				comp._remove_missing_products();
			});
		},
	});
}
