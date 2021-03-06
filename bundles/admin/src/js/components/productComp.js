/* js[admin] */

/**
 * @typedef {{
 *  name: string
 *  img_url: string
 *  __name?: string
 *  __img_url?: string
 *  general_product_id?: number
 *  product_id: number
 *  sell_by: string
 *  base_unit: string
 *  qty_step: number
 *  active: number
 *  net_price: number
 *  vat_id: number
 *  gross_price: number
 *  discount_gross_price: number
 *  discount_untill: string
 *  stock: number
 *  is_necessary?: boolean
 *  weight: number
 *  length: number
 *  width: number
 *  height: number
 *  variant_options?: any
 * }} DtProductData
 *
 * @typedef {{
 *  general_product_id: number
 *  name: string
 *  active: number
 *  sell_by: string
 *  base_unit: string
 *  qty_step: number
 *  product_feature_option_ids: number[]
 *  product_feature_ids: number[]
 *  features: Product_FeatureCompData[]
 *  missing_products_variants: Object[]
 *  unnecessary_product_ids?: number[]
 *  products_dt?: DatatableCompData
 *  category_ids: number[]
 *  main_img_url: string
 *  images: Product_ImgCompData[]
 *  product_list_view: string
 *  variants: Product_VariantCompData[]
 *  product_type: string
 * }} ProductCompData
 *
 * @typedef {{
 *  _data: ProductCompData
 *  _set_data(data?: ProductCompData, options?: SetCompDataOptions)
 *  _getData()
 *  _nodes: {
 *      add_feature_btn: PiepNode
 *      products_dt: DatatableComp
 *      add_products_btn: PiepNode
 *      remove_products_btn: PiepNode
 *      remove_all_products_btn: PiepNode
 *      save_btn: PiepNode
 *      add_category_btn: PiepNode
 *      print_categories: PiepNode
 *      edit_page_btn: PiepNode
 *      open_btn: PiepNode
 *      add_image_btn: PiepNode
 *      add_variant_btn: PiepNode
 *      delete_btn: PiepNode
 *      products_dt_wrapper: PiepNode
 *      dt_descriptions: PiepNode
 *      case_has_base_unit: PiepNode
 *      base_unit: PiepNode
 *      unit_qty_info: PiepNode
 *  } & CompWithHistoryNodes
 *  _add_missing_products(params?: {similar_products?: {new_option_id, option_id}[], options_existed?: number[], pls_add_columns?: boolean})
 *  _add_variant?(options?: {common?: number, callback?()})
 *  _remove_missing_products()
 * } & BaseComp} ProductComp
 */

const product_copy_keys = [
	"net_price",
	"vat",
	"gross_price",
	"active",
	"weight",
	"length",
	"width",
	"height",
	"discount_gross_price",
	"discount_untill",
];

/**
 *
 * @param {number} variant_id
 * @returns
 */
const getVariantKeyFromId = (variant_id) => {
	return `variant_${variant_id}`;
};
/**
 *
 * @param {string} key
 * @returns
 */
const getVariantIdFromKey = (key) => {
	const variant_id = +key.replace(`variant_`, "");
	if (isNaN(variant_id)) {
		return 0;
	}
	return variant_id;
};

/**
 * @param {ProductComp} comp
 * @param {*} parent
 * @param {ProductCompData} data
 */
function ProductComp(comp, parent, data = undefined) {
	if (data === undefined) {
		data = {
			active: 0,
			general_product_id: -1,
			name: "",
			sell_by: "qty",
			product_feature_ids: [],
			product_feature_option_ids: [],
			missing_products_variants: [],
			features: [],
			category_ids: [],
			main_img_url: "",
			images: [],
			variants: [],
			product_list_view: "active",
			product_type: "normal",
			base_unit: "",
			qty_step: 1,
		};
	}

	/** @type {DatatableCompData} */
	const datatable = {
		columns: [
			/* dynamic */
		],
		empty_html: "Brak produktów",
		dataset: [],
		label: "",
		searchable: false,
		selectable: true,
		pagination_data: { row_count: 15 },
		print_row_as_string: (row_data) => {
			return Object.entries(row_data)
				.filter(([key, option_id]) => getVariantIdFromKey(key))
				.map(([key, option_id]) => {
					const option = comp._data.variants
						.map((variant) => variant.options)
						.flat(1)
						.find((option) => option.product_variant_option_id === option_id);
					return option ? option.name : "";
				})
				.join(" ");
		},
		maps: [
			{
				name: "vat",
				getMap: () => vats.map((v) => ({ val: v.vat_id, label: `${v.value * 100}%` })),
			},
			{
				name: "product_variant_option",
				getMap: () => {
					return def(comp._data, data)
						.variants.map((v) => v.options)
						.flat(1)
						.map((option) => ({ val: option.product_variant_option_id, label: option.name }));
				},
			},
		],
	};

	data.products_dt = def(data.products_dt, datatable);
	data.unnecessary_product_ids = [];

	comp._add_missing_products = (params = {}) => {
		const data = comp._data;
		const add_products = [];

		const all_variant_keys = data.variants.map((variant) => variant.options.length >= 2 && getVariantKeyFromId(variant.product_variant_id));

		data.missing_products_variants.forEach((variants) => {
			/** @type {DtProductData} */
			const product_data = {
				gross_price: 0,
				net_price: 0,
				product_id: -1,
				vat_id: 1,
				active: 1,
				sell_by: "qty",
				stock: 0,
				height: 0,
				length: 0,
				weight: 0,
				width: 0,
				img_url: "",
				name: "",
				discount_gross_price: null,
				discount_untill: null,
				base_unit: "",
			};

			for (const [variant_id, option_id] of Object.entries(variants)) {
				const key = getVariantKeyFromId(+variant_id);
				product_data[key] = option_id;
			}

			if (params && params.options_existed) {
				data.products_dt.dataset.forEach((/** @type {DtProductData} */ other_product) => {
					params.options_existed.forEach((option_id) => {
						const variant = data.variants.find((v) => v.options.find((vo) => vo.product_variant_option_id === option_id));
						if (!variant) {
							return;
						}
						const variant_id = variant.product_variant_id;
						const variant_key = getVariantKeyFromId(variant_id);
						other_product[variant_key] = option_id;
					});
				});
			}

			let copy_product = undefined;
			let max_shared_variants_for_similar_products = 0;
			let product_existed = false;
			data.products_dt.dataset.forEach((/** @type {DtProductData} */ other_product) => {
				let shared_variants = 0;
				let shared_variants_for_similar_products = 0;

				for (const variant_key of all_variant_keys) {
					const pr_opt_id = product_data[variant_key];

					if (pr_opt_id === other_product[variant_key]) {
						shared_variants++;
						shared_variants_for_similar_products++;
					}

					if (params && params.similar_products) {
						params.similar_products.forEach((e) => {
							if (e.new_option_id === pr_opt_id && e.option_id === other_product[variant_key]) {
								shared_variants_for_similar_products++;
							}
						});
					}
				}

				if (shared_variants_for_similar_products > max_shared_variants_for_similar_products) {
					max_shared_variants_for_similar_products = shared_variants_for_similar_products;
					copy_product = other_product;
				}

				if (shared_variants === all_variant_keys.length) {
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

		// compare variants
		const options_before = {};

		data.products_dt.dataset.forEach((/** @type {DtProductData} */ product) => {
			for (const [variant_key, option_id] of Object.entries(product)) {
				const variant_id = getVariantIdFromKey(variant_key);
				if (!variant_id) {
					continue;
				}

				if (!options_before[variant_id]) {
					options_before[variant_id] = [];
				}
				options_before[variant_id].push(option_id);
			}
		});

		const options_after = {};
		data.variants.forEach((variant) => {
			const variant_id = variant.product_variant_id;
			options_after[variant_id] = variant.options.map((opt) => opt.product_variant_option_id);
		});

		/** @type {ManageProductList_QuestionCompData[]} */
		const questions = [];

		for (const variant_id of Object.keys(options_after)) {
			if (options_after[variant_id].length < 2) {
				continue;
			}
			const variant_name = data.variants.find((v) => v.product_variant_id === +variant_id).name;
			if (options_before[variant_id]) {
				for (const option_after_id of options_after[variant_id]) {
					if (!options_before[variant_id].includes(option_after_id)) {
						const options = options_before[variant_id].filter(onlyUnique).map((option_id) => {
							return {
								label: data.variants
									.map((v) => v.options)
									.flat(1)
									.find((opt) => opt.product_variant_option_id === option_id).name,
								value: option_id,
							};
						});
						options.push({ label: "Nie kopiuj (utwórz puste)", value: -1 });

						const option_name = data.variants
							.map((v) => v.options)
							.flat(1)
							.find((opt) => opt.product_variant_option_id === option_after_id).name;

						questions.push({
							type: "copy",
							copy_option_id: option_after_id,
							label: `Które dane chcesz skopiować dla opcji <span class="underline">${option_name}</span> (${variant_name})?`,
							options,
						});
					}
					if (options_after[variant_id].length < 2) {
						return;
					}
				}
			} else {
				if (data.products_dt.dataset.length > 0) {
					const options = options_after[variant_id].filter(onlyUnique).map((option_id) => {
						return {
							label: data.variants
								.map((v) => v.options)
								.flat(1)
								.find((opt) => opt.product_variant_option_id === option_id).name,
							value: option_id,
						};
					});
					options.push({ label: "Nie", value: -1 });

					questions.push({
						type: "existed",
						label: `Czy któraś opcja cechy ${variant_name} należała już do produktu?`,
						options,
					});
				}
			}
		}

		const answered = params.options_existed || params.similar_products;
		const allow = questions.length === 0 || answered;

		if (allow || params.pls_add_columns) {
			data.variants.forEach((variant) => {
				if (variant.common) {
					return;
				}
				const key = getVariantKeyFromId(variant.product_variant_id);
				const columns = data.products_dt.columns;
				if (!columns.find((column) => column.key === key)) {
					columns.unshift({ key });
				}
			});
		}
		if (!params.pls_add_columns) {
			if (allow) {
				add_products.forEach((p) => {
					data.products_dt.dataset.push(p);
				});

				comp._render({ freeze: true });
			} else {
				const manage_product_list_modal_comp = getManageProductListModal();
				manage_product_list_modal_comp._data.questions = questions;
				manage_product_list_modal_comp._data.add_products = add_products;
				manage_product_list_modal_comp._render();

				manage_product_list_modal_comp._show({ source: comp._nodes.add_products_btn });
			}
		}
	};

	comp._remove_missing_products = () => {
		const data = comp._data;

		data.products_dt.dataset = data.products_dt.dataset.filter((/** @type {DtProductData} */ product) => {
			return product.is_necessary;
		});

		comp._render();
	};

	comp._add_variant = (options = {}) => {
		showLoader();

		const product_variant = {
			general_product_id: comp._data.general_product_id,
			name: "",
			common: def(options.common, 0),
			options: [],
		};

		xhr({
			url: STATIC_URLS["ADMIN"] + "/general_product/variant/save",
			params: {
				product_variant,
			},
			success: (res) => {
				const product_variant = res.product_variant;
				/** @type {Product_VariantCompData} */
				const variant = {
					product_variant_id: product_variant.product_variant_id,
					general_product_id: product_variant.general_product_id,
					name: product_variant.name,
					options: product_variant.options,
					common: product_variant.common,
				};

				if (options.common) {
					comp._data.variants.unshift(variant);
				} else {
					comp._data.variants.push(variant);
				}
				comp._render();
				hideLoader();

				if (options.callback) {
					options.callback();
				}
			},
		});
	};

	comp._set_data = (data, options = {}) => {
		data.products_dt.dataset.forEach((row_data) => {
			// warmup
			let vat = vats.find((e) => e.vat_id === row_data.vat_id);
			if (!vat) {
				const default_vat = vats[0];
				if (default_vat) {
					row_data.vat_id = default_vat.vat_id;
					vat = vats.find((e) => e.vat_id === row_data.vat_id);
				}
			}
			const vat_val = vat ? vat.value : 0;
			row_data.net_price = round(row_data.gross_price / (1 + vat_val), 2);
		});

		if (!OPTIMIZE_COMPONENTS) {
			const common_variant = data.variants.find((v) => v.common);
			if (common_variant) {
				const variant_used_fids = [];
				data.variants.forEach((variant) => {
					if (variant.common) {
						return;
					}
					variant.options.forEach((option) => {
						option.selected_product_feature_options = option.selected_product_feature_options.filter((e) =>
							data.product_feature_option_ids.includes(e)
						);
						variant_used_fids.push(...option.selected_product_feature_options);
					});
				});

				const first_option = common_variant.options[0];
				if (first_option && first_option.selected_product_feature_options) {
					data.product_feature_option_ids.forEach((pfoid) => {
						const ind = first_option.selected_product_feature_options.indexOf(pfoid);
						const first_option_has = ind !== -1;
						if (!variant_used_fids.includes(pfoid)) {
							if (!first_option_has) {
								first_option.selected_product_feature_options.push(pfoid);
							}
						} else {
							if (first_option_has) {
								first_option.selected_product_feature_options.splice(ind, 1);
							}
						}
					});

					const key = getVariantKeyFromId(common_variant.product_variant_id);
					data.products_dt.dataset.forEach((data) => {
						data[key] = first_option.product_variant_option_id;
					});
				}
			}
		}

		setCompData(comp, data, {
			...options,
			pass_list_data: [
				{ what: "features", where: "images" },
				{ what: "features", where: "variants" },
			],
			render: () => {
				const data = comp._data; // actually important

				const cd = comp._changed_data;

				if (cd.sell_by) {
					expand(comp._nodes.case_has_base_unit, data.sell_by !== "qty");

					const physical_measure = physical_measures[data.sell_by];
					comp._nodes.base_unit._set_content(
						physical_measure ? physical_measure.units.map((e) => html`<option value="${e.id}">${e.name}</option>`).join("") : ""
					);
					if (!comp._nodes.base_unit._child(`option[value="${data.base_unit}"]`)) {
						const first_option = comp._nodes.base_unit._child(`option`);
						if (first_option) {
							// @ts-ignore
							data.base_unit = first_option.value;
						}
					}
					comp._nodes.base_unit._set_value(data.base_unit, { quiet: true });
				}

				if (cd.sell_by || cd.base_unit || cd.qty_step) {
					let unit_qty_info_html = "Dozwolone wartości: ";
					if (data.qty_step) {
						for (const i of [1, 2, 3, 10, 25]) {
							if (i > 1) {
								unit_qty_info_html += ", ";
							}
							unit_qty_info_html += `${round(i * data.qty_step, 5)} ${data.base_unit}`;
						}
						unit_qty_info_html += ", itd...";
					} else {
						unit_qty_info_html = "Dowolna liczba";
					}
					comp._nodes.unit_qty_info._set_content(unit_qty_info_html);
				}

				const missing_feature_ids = [];
				if (cd.product_feature_ids) {
					data.features = data.product_feature_ids.map((product_feature_id) => {
						const fe = product_features.find((pf) => {
							return pf.product_feature_id === product_feature_id;
						});
						if (fe) {
							return {
								product_feature_id: fe.product_feature_id,
								name: fe.name,
								data_type: fe.data_type,
								options: [],
								physical_measure: fe.physical_measure,
							};
						} else {
							missing_feature_ids.push(product_feature_id);
						}
					});

					data.product_feature_ids = data.product_feature_ids.filter((e) => missing_feature_ids.indexOf(e) === -1);
				}

				if (cd.product_feature_ids || cd.product_feature_option_ids) {
					const missing_option_ids = [];
					const product_feature_option_ids = [];

					data.features.forEach((feature) => {
						feature.options = data.product_feature_option_ids
							.map((product_feature_option_id) => {
								const fo = product_feature_options.find((pfo) => pfo.product_feature_option_id === product_feature_option_id);
								if (!fo || fo.product_feature_id !== feature.product_feature_id) {
									return undefined;
								}
								if (fo) {
									return fo;
								} else {
									missing_option_ids.push(product_feature_option_id);
									return undefined;
								}
							})
							.filter((e) => e);

						product_feature_option_ids.push(...feature.options.map((option) => option.product_feature_option_id));
					});

					// important usage of product_feature_option_ids, these are ordered properly
					data.product_feature_option_ids = product_feature_option_ids.filter((e) => missing_option_ids.indexOf(e) === -1);
				}
				// full product list
				let cross_variants = [[]];
				data.variants.forEach((variant) => {
					if (variant.common) {
						return;
					}

					const cross_variants_next = [];
					cross_variants.forEach((variant_set) => {
						variant.options.forEach((option) => {
							const variant_set_copy = cloneObject(variant_set);

							variant_set_copy.push(option.product_variant_option_id);
							cross_variants_next.push(variant_set_copy);
						});
					});
					cross_variants = cross_variants_next;
				});

				data.variants.forEach((variant) => {
					if (variant.common) {
						return;
					}

					const key = getVariantKeyFromId(variant.product_variant_id);

					/** @type {DatatableColumnDef} */
					const column = {
						key,
						label: variant.name,
						width: "1",
						searchable: "select",
						map_name: "product_variant_option",
						quick_filter: true,
					};

					const columns = data.products_dt.columns;
					const column_index = columns.findIndex((column) => column.key === key);

					if (column_index !== -1) {
						if (!isEquivalent(columns[column_index], column)) {
							columns[column_index] = column;
						}
					}
				});

				if (cd.products_dt) {
					let missing_price = 0;
					let missing_dim = 0;
					let missing_stock = 0;
					data.products_dt.dataset.forEach((/** @type {DtProductData} */ product) => {
						if (!product.active) {
							return;
						}
						if (+product.gross_price === 0) {
							missing_price++;
						}
						if (+product.weight === 0 || +product.length === 0 || +product.width === 0 || +product.height === 0) {
							missing_dim++;
						}
						if (+product.stock <= 0) {
							missing_stock++;
						}
					});

					const prices_tab = comp._child(`[data-value="prices"]`)._parent();
					const stock_tab = comp._child(`[data-value="stock"]`)._parent();
					const dim_tab = comp._child(`[data-value="weight_dimensions"]`)._parent();

					prices_tab.classList.toggle("attention", !!missing_price);
					stock_tab.classList.toggle("attention", !!missing_stock);
					dim_tab.classList.toggle("attention", !!missing_dim);

					prices_tab.dataset.tooltip = missing_price ? `Nie uzupełniono cen: ${missing_price}` : "";
					stock_tab.dataset.tooltip = missing_stock ? `Zerowy stan magazynowy produktów: ${missing_stock}` : "";
					dim_tab.dataset.tooltip = missing_dim ? `Nie uzupełniono wymiarów / wag: ${missing_dim}` : "";
				}

				if (cd.variants || cd.products_dt) {
					// redefine products DT columns to make sure the order is right etc

					/** @type {DatatableColumnDef[]} */
					const columns = data.products_dt.columns;
					/** @type {DatatableColumnDef[]} */
					const set_columns = [columns.find((c) => c.key === "select")];

					data.variants.forEach((variant) => {
						if (variant.common) {
							return;
						}

						const variant_key = getVariantKeyFromId(variant.product_variant_id);
						const column = columns.find((c) => c.key === variant_key);
						if (column) {
							set_columns.push(column);
						}
					});

					const keys_we_have = set_columns.map((c) => c.key);
					set_columns.push(...data.products_dt.columns.filter((column) => !keys_we_have.includes(column.key)));
					data.products_dt.columns = set_columns;

					// missing product variant columns
					const missing_products_variants = [];

					/** @type {DtProductData[]} */
					const products = data.products_dt.dataset;
					products.forEach((p) => {
						p.is_necessary = false;
					});

					cross_variants.forEach((variant_set) => {
						const variant_option_map = {};
						variant_set.forEach((product_variant_option_id) => {
							const variant = data.variants.find((v) => v.options.find((vo) => vo.product_variant_option_id === product_variant_option_id));
							if (variant) {
								variant_option_map[variant.product_variant_id] = product_variant_option_id;
							}
						});

						let missing_product = true;
						products.forEach((product) => {
							if (product.is_necessary) {
								return;
							}

							let options_match = true;
							for (const [variant_id, option_id] of Object.entries(variant_option_map)) {
								const key = getVariantKeyFromId(+variant_id);
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
							// that be there, some just aint missin?
							missing_products_variants.push(variant_option_map);
						}
					});

					data.missing_products_variants = missing_products_variants;
					data.unnecessary_product_ids = products.filter((p) => !p.is_necessary).map((p) => p.product_id);
				}

				if (cd.category_ids) {
					const cats_html = data.category_ids
						.map((category_id) => product_categories.find((e) => e.product_category_id === category_id))
						.map((e) => {
							if (!e) {
								return;
							}
							let dis = e.name;
							let parents = 0;
							let s = e;
							while (e.parent_product_category_id !== -1) {
								e = product_categories.find((c) => c.product_category_id === e.parent_product_category_id);
								if (!e) {
									break;
								}
								parents++;
							}

							return "― ".repeat(parents) + dis;
						})
						.join("<br>");

					comp._nodes.print_categories._set_content(cats_html ? cats_html : "BRAK");
				}

				if (cd.products_dt) {
					comp._nodes.products_dt._nodes.list._direct_children().forEach((r) => {
						const product = data.products_dt.dataset.find((e) => e._row_id === +r.dataset.primary);
						const active = product ? product.active : 0;
						r.classList.toggle("inactive", !active);
					});
				}

				if (cd.product_list_view) {
					comp._nodes.dt_descriptions._children(".user_info").forEach((u) => {
						u.classList.toggle("hidden", u.dataset.tab !== data.product_list_view);
					});

					if (data.product_list_view === "active") {
						comp._nodes.products_dt._add_column({
							key: "active",
							label: "Aktywny",
							width: "140px",
							searchable: "boolean",
							editable: "checkbox",
							batch_edit: true,
						});
					} else {
						comp._nodes.products_dt._remove_column("active");
					}

					if (data.product_list_view === "prices") {
						comp._nodes.products_dt._add_column({
							key: "net_price",
							label: "Cena Netto (zł)",
							width: "1",
							searchable: "number",
							editable: "number",
							batch_edit: true,
						});
						comp._nodes.products_dt._add_column({
							key: "vat_id",
							label: "VAT",
							width: "1",
							editable: "select",
							map_name: "vat",
							batch_edit: true,
						});
						comp._nodes.products_dt._add_column({
							name: "edit_gross_price",
							key: "gross_price",
							label: "Cena Brutto (zł)",
							width: "1",
							editable: "number",
							batch_edit: true,
						});
					} else {
						comp._nodes.products_dt._remove_column("net_price");
						comp._nodes.products_dt._remove_column("vat_id");
						comp._nodes.products_dt._remove_column("edit_gross_price");
					}

					if (data.product_list_view === "discount") {
						comp._nodes.products_dt._add_column({
							name: "display_gross_price",
							key: "gross_price",
							label: "Cena Brutto (zł)",
							width: "1",
						});
						comp._nodes.products_dt._add_column({
							key: "discount_gross_price",
							label: "Rabatowa Cena Brutto (zł)",
							width: "1",
							editable: "number",
							editable_classes: ["empty_null"],
							batch_edit: true,
						});
						comp._nodes.products_dt._add_column({
							key: "discount_untill",
							label: "Rabat do",
							width: "1",
							editable: "date",
							editable_classes: ["empty_null"],
							batch_edit: true,
						});
					} else {
						comp._nodes.products_dt._remove_column("display_gross_price");
						comp._nodes.products_dt._remove_column("discount_gross_price");
						comp._nodes.products_dt._remove_column("discount_untill");
					}

					if (data.product_list_view === "stock") {
						comp._nodes.products_dt._add_column({
							key: "stock",
							label: "Stan magazynowy",
							width: "1",
							editable: "number",
							batch_edit: true,
						});
					} else {
						comp._nodes.products_dt._remove_column("stock");
					}

					if (data.product_list_view === "weight_dimensions") {
						comp._nodes.products_dt._add_column({
							key: "weight",
							label: "Waga (g)",
							width: "1",
							editable: "number",
							batch_edit: true,
						});
						comp._nodes.products_dt._add_column({
							key: "length",
							label: "Długość (cm)",
							width: "1",
							editable: "number",
							batch_edit: true,
						});
						comp._nodes.products_dt._add_column({
							key: "width",
							label: "Szerokość (cm)",
							width: "1",
							editable: "number",
							batch_edit: true,
						});
						comp._nodes.products_dt._add_column({
							key: "height",
							label: "Wysokość (cm)",
							width: "1",
							editable: "number",
							batch_edit: true,
						});
					} else {
						comp._nodes.products_dt._remove_column("weight");
						comp._nodes.products_dt._remove_column("length");
						comp._nodes.products_dt._remove_column("width");
						comp._nodes.products_dt._remove_column("height");
					}

					comp._nodes.products_dt._render();
				}

				if (cd.variants) {
					setTimeout(() => {
						comp._nodes.products_dt._warmup_maps();
					});
				}

				const products_dt_wrapper = comp._nodes.products_dt_wrapper;
				products_dt_wrapper.classList.toggle("missing_products", data.missing_products_variants.length > 0);
				products_dt_wrapper.dataset.tooltip =
					data.missing_products_variants.length > 0 ? `Najpierw uzupełnij listę produktów klikając "Dodaj brakujące produkty"` : "";
			},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<div class="injectable_header">
				<p-trait data-trait="history"></p-trait
				><button class="btn primary ml1" data-node="{${comp._nodes.open_btn}}" data-tooltip="Otwórz produkt w nowej karcie">
					Pokaż <i class="fas fa-external-link-square-alt"></i></button
				><button class="btn primary ml1" data-node="{${comp._nodes.save_btn}}">Zapisz <i class="fas fa-save"></i></button
				><button class="btn subtle ml1" data-node="{${comp._nodes.edit_page_btn}}">Edytuj stronę <i class="fas fa-file-alt"></i></button>
			</div>

			<div style="max-width:700px" class="mtfn">
				<div class="label">Nazwa produktu</div>
				<input class="field" data-bind="{${data.name}}" data-validate="" />

				<div class="case_has_page">
					<div class="label">Widoczność w sklepie</div>
					<div class="radio_group boxes hide_checks number flex" data-bind="{${data.active}}">
						<div class="checkbox_area error">
							<div>
								<p-checkbox data-value="0"></p-checkbox>
								<span class="semi_bold">Nieaktywny <i class="fas fa-eye-slash"></i></span>
							</div>
						</div>
						<div class="checkbox_area success">
							<div>
								<p-checkbox data-value="1"></p-checkbox>
								<span class="semi_bold">Aktywny <i class="fas fa-eye"></i></span>
							</div>
						</div>
					</div>
				</div>

				<div class="label">Typ produktu</div>
				<div class="radio_group boxes hide_checks flex" data-bind="{${data.product_type}}">
					<div class="checkbox_area" data-tooltip="Do wysyłki">
						<div>
							<p-checkbox data-value="normal"></p-checkbox>
							<span class="semi_bold">Produkt standardowy</span>
						</div>
					</div>
					<div class="checkbox_area" data-tooltip="Np. usługa, rezerwacja, plik do pobrania">
						<div>
							<p-checkbox data-value="virtual"></p-checkbox>
							<span class="semi_bold">Produkt wirtualny</span>
						</div>
					</div>
				</div>

				<div class="label">Sprzedawaj na</div>
				<div class="radio_group boxes hide_checks flex" data-bind="{${data.sell_by}}">
					<div class="checkbox_area">
						<div>
							<p-checkbox data-value="qty"></p-checkbox>
							<i class="number_icon"></i>
							<span class="semi_bold">Sztuki</span>
						</div>
					</div>
					<div class="checkbox_area">
						<div>
							<p-checkbox data-value="weight"></p-checkbox>
							<i class="fas fa-weight-hanging"></i>
							<span class="semi_bold">Wagę</span>
						</div>
					</div>
					<div class="checkbox_area">
						<div>
							<p-checkbox data-value="length"></p-checkbox>
							<i class="fas fa-ruler"></i>
							<span class="semi_bold">Długość</span>
						</div>
					</div>
				</div>

				<div class="expand_y hidden animate_hidden" data-node="{${comp._nodes.case_has_base_unit}}">
					<div class="label">Jednostka miary</div>
					<select class="field" data-node="{${comp._nodes.base_unit}}" data-bind="{${data.base_unit}}"></select>

					<div class="label">Podziałka / Jednostka sprzedaży</div>
					<input class="field number empty_null" data-bind="{${data.qty_step}}" />

					<div class="user_info mt2" data-node="{${comp._nodes.unit_qty_info}}"></div>

					<!-- <div class="glue_children">
						<div class="grow">
							<div class="label">Ilość min.</div>
							<input class="field empty_null" data-bind="{${data.qty_min}}" />
						</div>
						<div class="grow ml2">
							<div class="label">Ilość max.</div>
							<input class="field empty_null" data-bind="{${data.qty_max}}" />
						</div>
					</div> -->
				</div>

				<div class="mt5">
					<div class="sticky_subheader mb2">
						<span class="medium bold mr1"> Kategorie (<span html="{${data.category_ids.length}}"></span>) </span>
						<button data-node="{${comp._nodes.add_category_btn}}" class="btn primary small">
							Dodaj kategorie <i class="fas fa-plus"></i>
						</button>
					</div>

					<div class="scroll_panel scroll_preview" style="max-height:200px;cursor:pointer">
						<div data-node="{${comp._nodes.print_categories}}"></div>
					</div>
				</div>

				<div class="mt5">
					<div class="sticky_subheader mb2">
						<span class="medium bold"> Cechy (<span html="{${data.features.length}}"></span>) </span>
						<div class="hover_info">
							Uzupełnij każdą z cech produktu (np. producenta, kolor, rozmiar). Dzieki temu klient sprawniej odnajdzie produkt.
						</div>
						<button data-node="{${comp._nodes.add_feature_btn}}" class="btn primary small ml1">
							Dodaj cechy <i class="fas fa-plus"></i>
						</button>
					</div>

					<list-comp class="wireframe space separate light_gray_rows" data-bind="{${data.features}}" data-primary="product_feature_id">
						<product_feature-comp></product_feature-comp>
					</list-comp>
				</div>

				<div class="mt5">
					<div class="sticky_subheader mb2">
						<span class="medium bold"> Zdjęcia (<span html="{${data.images.length}}"></span>) </span>
						<div class="hover_info">
							Dodaj zdjęcia produktu i ustaw je w kolejności zaczynając od zdjęcia głównego. Dodatkowo możesz powiązać każde z nich z
							cechami. Dzięki temu, klient który przegląda produkty i zaznaczył filtr "Kolor: czerwony" zobaczy czerwony wariant produktu, a
							pozostałe zdjęcia będą widoczne po najechaniu np. kursorem.
						</div>
						<button data-node="{${comp._nodes.add_image_btn}}" class="btn primary small ml1">
							Dodaj zdjęcie <i class="fas fa-plus"></i>
						</button>
					</div>

					<list-comp class="wireframe space" data-bind="{${data.images}}" data-primary="product_img_id">
						<product_img-comp></product_img-comp>
					</list-comp>
				</div>

				<div class="mt5">
					<div class="sticky_subheader mb2">
						<span class="medium bold"> Pola wyboru / Warianty (<span html="{${data.variants.length - 1}}"></span>) </span>
						<div class="hover_info">
							Określ wszystkie warianty produktu.
							<div style="height:7px"></div>
							<span class="bold">Przykład</span><br />
							<div style="height:7px"></div>
							Pole wyboru 1. Kolor: czerwony, niebieski<br />
							Pole wyboru 2. Rozmiar: 36, 37, 38<br />
							<div style="height:7px"></div>
							Z podanych wariantów i ich opcji powstanie lista 6 produktów: <br />
							⋅ Czerwony 36 <br />
							⋅ Czerwony 37 <br />
							⋅ Czerwony 38 <br />
							⋅ Niebieski 36 <br />
							⋅ Niebieski 37 <br />
							⋅ Niebieski 38<br />
							<div style="height:7px"></div>
							Domyślnie (bez określenia wariantów) będzie to tylko 1 produkt.
							<div style="height:7px"></div>
							Zaleca się by każdy z wariantów połączyć z odpowiadającymi cechami. <br /><br />MIEJSCE NA DODANIE ZDJĘĆ KIEDY SKLEP BĘDZIE
							GOTOWY
						</div>
						<button data-node="{${comp._nodes.add_variant_btn}}" class="btn primary small ml1">
							Dodaj pole wyboru <i class="fas fa-plus"></i>
						</button>
					</div>

					<list-comp class="wireframe space separate light_gray_rows" data-bind="{${data.variants}}" data-primary="product_variant_id">
						<product_variant-comp></product_variant-comp>
					</list-comp>
				</div>
			</div>

			<div class="mt5 mb2">
				<div class="sticky_subheader">
					<div class="medium bold inline">Pełna lista produktów</div>
					<div class="hover_info">
						Kliknij przycisk "Dodaj brakujące produkty", a lista produktów uzupełni się automatycznie na podstawie podanych powyżej
						wariantów.
						<br />
						<div style="height:7px"></div>
						Aby szybciej edytować dane tabelki warto rozważyć obsługę przy użyciu klawiatury.<br />
						Poruszanie się po polach (pierwsze z nich musimy kliknąć):
						<span class="underline inline">CRTL + Strzałki</span>.<br />
						Otwieranie pola wyboru / zmiana wartości: <span class="underline inline">ENTER</span>
					</div>
				</div>

				<button
					class="btn {${data.missing_products_variants.length > 0}?important:subtle} mr1"
					data-node="{${comp._nodes.add_products_btn}}"
					data-tooltip="{${data.missing_products_variants.length > 0
						? "Zalecane po uzupełnieniu wszystkich wariantów produktu"
						: "Wszystko się zgadza!"}}"
				>
					Dodaj brakujące produkty (<span html="{${data.missing_products_variants.length}}"></span>)</button
				><button
					class="btn {${data.unnecessary_product_ids.length > 0}?error_light:subtle} mr1"
					data-node="{${comp._nodes.remove_products_btn}}"
					disabled="{${data.missing_products_variants.length > 0}}"
					data-tooltip="{${data.unnecessary_product_ids.length === 0 ? "Wszystko się zgadza!" : "Pamiętaj o przepisaniu istotnych danych"}}"
				>
					Usuń niepotrzebne produkty (<span html="{${data.unnecessary_product_ids.length}}"></span>)</button
				><button
					class="btn subtle"
					data-node="{${comp._nodes.remove_all_products_btn}}"
					disabled="{${data.products_dt.dataset.length === 0}}"
				>
					Usuń wszystkie produkty (<span html="{${data.products_dt.dataset.length}}"></span>)
				</button>

				<br />

				<div data-node="{${comp._nodes.products_dt_wrapper}}" data-tooltip_position="over">
					<div class="pretty_radio glue_children semi_bold mt2" data-bind="{${data.product_list_view}}">
						<div class="checkbox_area">
							<p-checkbox data-value="active"></p-checkbox>
							<span> <i class="fas fa-check"></i> Aktywne </span>
						</div>
						<div class="checkbox_area">
							<p-checkbox data-value="prices"></p-checkbox>
							<span> <i class="fas fa-dollar-sign"></i> Ceny </span>
						</div>
						<div class="checkbox_area">
							<p-checkbox data-value="discount"></p-checkbox>
							<span> <i class="fas fa-percentage"></i> Rabaty </span>
						</div>
						<div class="checkbox_area">
							<p-checkbox data-value="stock"></p-checkbox>
							<span> <i class="fas fa-sort-numeric-up"></i> Magazyn </span>
						</div>
						<div class="checkbox_area">
							<p-checkbox data-value="codes"></p-checkbox>
							<span> <i class="fas fa-barcode"></i> Kody </span>
						</div>
						<div class="checkbox_area" data-tooltipbase="">
							<p-checkbox data-value="weight_dimensions"></p-checkbox>
							<span> <i class="fas fa-ruler-vertical"></i> Waga / Wymiary </span>
						</div>
					</div>

					<div data-node="{${comp._nodes.dt_descriptions}}" class="inline mt2 mb2">
						<div data-tab="active" class="user_info">
							<i class="fas fa-info-circle"></i> Określ, które produkty należą do oferty sklepu.<br />Ważne! Klient nie będzie mógł
							skorzystać z powiadomienia o dostępności produktu jeśli ten jest nieaktywny.<br />W takim przypadku należy ustawić produkt
							jako aktywny, pomimo braków w magazynie.
						</div>
						<div data-tab="weight_dimensions" class="user_info">
							<i class="fas fa-info-circle"></i>
							Dane wykorzystywane są do wyznaczania gabarytu paczki
						</div>
					</div>

					<datatable-comp data-bind="{${data.products_dt}}" data-node="{${comp._nodes.products_dt}}"></datatable-comp>
				</div>

				<div style="height:100px"></div>

				<div class="mta pt2" style="text-align: right;">
					<button class="btn error" data-node="{${comp._nodes.delete_btn}}">Usuń produkt <i class="fas fa-trash"></i></button>
				</div>
			</div>
		`,
		ready: () => {
			comp._nodes.add_feature_btn.addEventListener("click", () => {
				const select_product_features_modal_comp = getSelectProductFeaturesModal();
				select_product_features_modal_comp._show({ source: comp._nodes.add_feature_btn });
			});

			comp._nodes.add_image_btn.addEventListener("click", () => {
				const data = comp._data;
				upload_file_default_name = data.name;
				const select_file_modal = getSelectFileModal();
				select_file_modal._data.file_manager.select_callback = (src) => {
					data.images.push({ img_url: src, product_img_id: -1, selected_product_feature_options: [] });
					comp._render();
				};
				select_file_modal._render();
				select_file_modal._show({ source: comp._nodes.add_image_btn });
			});

			comp._nodes.add_variant_btn.addEventListener("click", () => {
				comp._add_variant();
			});

			comp._nodes.add_category_btn.addEventListener("click", () => {
				const select_product_categories_modal_comp = getSelectProductCategoriesModal();
				select_product_categories_modal_comp._show(
					{
						category_ids: comp._data.category_ids,
						close_callback: (category_ids) => {
							comp._data.category_ids = category_ids;
							comp._render();
						},
					},
					{ source: comp._nodes.add_category_btn }
				);
			});
			comp._nodes.print_categories.addEventListener("click", () => {
				comp._nodes.add_category_btn.click();
			});

			comp._nodes.open_btn.addEventListener("click", () => {
				window.open(`/produkt/${comp._data.general_product_id}`, "product_page");
			});

			comp._nodes.edit_page_btn.addEventListener("click", () => {
				if (page_data) {
					window.location.href = `${STATIC_URLS["ADMIN"]}/strona?nr_strony=${page_data.page_id}`;
				} else {
					window.location.href = `${STATIC_URLS["ADMIN"]}/strony?utworz&general_product_id=${comp._data.general_product_id}`;
				}
			});

			comp._nodes.delete_btn.addEventListener("click", () => {
				if (!confirm("Czy aby na pewno chcesz usunąć ten produkt?")) {
					return;
				}

				xhr({
					url: `${STATIC_URLS["ADMIN"]}/general_product/delete/${comp._data.general_product_id}`,
					success: (res) => {
						window.location.href = STATIC_URLS["ADMIN"] + "/produkty-w-sklepie";
					},
				});
			});

			comp._nodes.save_btn.addEventListener("click", () => {
				const data = comp._data;
				const errors = validateInputs(directCompNodes(comp, "[data-validate]"));

				if (errors.length > 0) {
					return;
				}

				if (data.missing_products_variants.length > 0) {
					showNotification(html`<div class="header">Błąd zapisywania</div>
						Musisz najpierw dodać brakujące produkty do listy`);
					return;
				}
				if (data.unnecessary_product_ids.length > 0) {
					showNotification(html`<div class="header">Błąd zapisywania</div>
						Musisz najpierw usunąć niepotrzebne produkty z listy`);
					return;
				}

				/** @type {DtProductData[]} */
				const save_products = cloneObject(data.products_dt.dataset);
				save_products.forEach((product) => {
					product.variant_options = [];
					data.variants.forEach((v) => {
						const vkey = getVariantKeyFromId(v.product_variant_id);
						product.variant_options.push(product[vkey]);
						delete product[vkey];
					});
				});

				// get ids of modified product feature options yay, dataset handles all the data
				const option_ids = modifyProductFeatures();
				// in case it was a new product we must make sure it's ready to go on backend
				const save_product_feature_options = product_feature_options.filter((pfo) => option_ids.includes(pfo.product_feature_option_id));

				data.variants.forEach((variant, index) => {
					variant.pos = index + 1;
					variant.options.forEach((option, index) => {
						option.pos = index + 1;
						// @ts-ignore
						option.product_feature_options = option.selected_product_feature_options;
					});
				});

				xhr({
					url: STATIC_URLS["ADMIN"] + "/general_product/save",
					params: {
						general_product: {
							general_product_id: data.general_product_id,
							name: data.name,
							product_type: data.product_type,
							active: data.active,
							main_img_url: data.main_img_url,
							features: data.product_feature_ids.map((product_feature_id, index) => ({
								product_feature_id,
								_meta_pos: index + 1,
							})),
							feature_options: data.product_feature_option_ids.map((product_feature_option_id, index) => ({
								product_feature_option_id,
								_meta_pos: index + 1,
							})),
							categories: data.category_ids,
							products: save_products,
							images: data.images.map((e, index) => ({
								...e,
								product_feature_options: e.selected_product_feature_options,
								pos: index + 1,
							})),
							variants: data.variants,
							sell_by: data.sell_by,
							base_unit: data.base_unit,
							qty_step: data.qty_step,
						},
						product_feature_options: save_product_feature_options,
					},
					success: (res) => {
						const data = comp._data;

						showNotification("Zapisano produkt", {
							one_line: true,
							type: "success",
						});

						data.general_product_id = res.general_product_id;
						data.products_dt.dataset = unpackProductsDT(data.variants, res.products);
						comp._render({ freeze: true });

						// hey, it's been right?
						// const make_sure_url_is_cool = `${STATIC_URLS["ADMIN"] + "/produkt/" + res.general_product_id}`;
						// history.replaceState(undefined, "", make_sure_url_is_cool);

						setTimeout(() => {
							comp.dispatchEvent(new CustomEvent("saved_state"));
						});
					},
				});
			});

			comp._nodes.add_products_btn.addEventListener("click", () => {
				comp._add_missing_products();
			});

			comp._nodes.remove_products_btn.addEventListener("click", () => {
				comp._remove_missing_products();
			});

			comp._nodes.remove_all_products_btn.addEventListener("click", () => {
				if (
					confirm(
						`Czy aby na pewno chcesz usunąć informacje dotyczące wszystkich produktów na liście poniżej?
                        Operację możesz później cofnąć używając przycisków historii`
					)
				) {
					comp._data.products_dt.dataset = [];
					comp._render();
				}
			});

			comp._nodes.products_dt.addEventListener("editable_change", (ev) => {
				// @ts-ignore
				const detail = ev.detail;
				/** @type {DtProductData} */
				const row_data = detail.row_data;
				const key = detail.key;
				const vat = vats.find((e) => e.vat_id === row_data.vat_id);
				const vat_val = vat ? vat.value : 0;

				row_data.gross_price = round(row_data.gross_price, 2);
				row_data.net_price = round(row_data.net_price, 2);

				let set_what = "";

				if (key === "vat_id") {
					// anything to rewrite?
					if (numberFromStr(row_data.gross_price + "")) {
						set_what = "net_price";
					} else if (numberFromStr(row_data.net_price + "")) {
						set_what = "gross_price";
					}
				} else {
					if (key === "gross_price") {
						set_what = "net_price";
					} else if (key === "net_price") {
						set_what = "gross_price";
					}
				}

				if (set_what === "net_price") {
					row_data.net_price = round(row_data.gross_price / (1 + vat_val), 2);
				} else if (set_what === "gross_price") {
					row_data.gross_price = round(row_data.net_price * (1 + vat_val), 2);
				}
			});

			window.addEventListener("product_features_changed", () => {
				comp._render({ force_render: true });
			});

			window.addEventListener("product_categories_changed", () => {
				comp._render({ force_render: true });
			});
		},
	});
}

function unpackProductsDT(variants, products) {
	const res_products = [];
	for (const product of products) {
		product.variant_options.forEach((opt) => {
			const product_variant_option_id = opt.product_variant_option_id;
			const product_variant = variants.find((v) => v.options.find((vo) => vo.product_variant_option_id === product_variant_option_id));
			if (product_variant) {
				const vkey = getVariantKeyFromId(product_variant.product_variant_id);
				product[vkey] = product_variant_option_id;
			}
		});
		delete product.variant_options;

		res_products.push(product);
	}

	return res_products;
}
