/* js[admin] */

/**
 * @typedef {{
 *  product_id: number
 *  active: number
 *  net_price: number
 *  vat_id: number
 *  gross_price: number
 *  stock: number
 *  is_necessary?: boolean
 * }} ProductData
 *
 * @typedef {{
 *  general_product_id: number
 *  name: string
 *  active: number
 *  sell_by: string
 *  product_feature_option_ids: number[]
 *  product_feature_ids: number[]
 *  features: Product_FeatureCompData[]
 *  missing_products_features: Object[]
 *  unnecessary_product_ids?: number[]
 *  products_dt?: DatatableCompData
 *  category_ids: number[]
 *  main_img_url: string
 *  images: product_imgCompData[]
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
 *      remove_all_products_btn: PiepNode
 *      save_btn: PiepNode
 *      add_category_btn: PiepNode
 *      print_categories: PiepNode
 *      preview_btn: PiepNode
 *      open_btn: PiepNode
 *      add_image_btn: PiepNode
 *      delete_btn: PiepNode
 *  } & CompWithHistoryNodes
 *  _add_missing_products(params?: {similar_products?: {new_option_id, option_id}[], options_existed?: number[], dont_ask?: boolean})
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
function productComp(comp, parent, data = undefined) {
	if (data === undefined) {
		data = {
			active: 0,
			general_product_id: -1,
			name: "",
			sell_by: "qty",
			product_feature_ids: [],
			product_feature_option_ids: [],
			missing_products_features: [],
			features: [],
			category_ids: [],
			main_img_url: "",
			images: [],
		};
	}

	/** @type {DatatableCompData} */
	const table = {
		columns: [
			{
				key: "active",
				label: "Aktywny",
				width: "76px",
				searchable: "boolean",
				editable: "checkbox",
				batch_edit: true,
			},
			{
				key: "net_price",
				label: "Cena Netto",
				width: "1",
				sortable: true,
				searchable: "number",
				editable: "number",
				batch_edit: true,
			},
			{
				key: "vat_id",
				label: "Vat",
				width: "1",
				sortable: true,
				editable: "select",
				map_name: "vat",
				batch_edit: true,
			},
			{ key: "gross_price", label: "Cena Brutto", width: "1", sortable: true, editable: "number", batch_edit: true },
			{ key: "stock", label: "Stan magazynowy", width: "1", sortable: true, editable: "number", batch_edit: true },
		],
		empty_html: "Brak produktów",
		dataset: [],
		label: "Pełna lista produktów",
		selectable: true,
		pagination_data: { row_count: 15 }, // 5 -> 1000 ms // 15 -> 1400 ms // 50 -> 4600 ms  10 in 400 ms, 35 in 3200 ms
		print_row_as_string: (row_data) => {
			return Object.entries(row_data)
				.filter(([key, option_id]) => getFeatureIdFromKey(key))
				.map(([key, option_id]) => product_feature_options.find((option) => option.product_feature_option_id === option_id).value)
				.join(" ");
		},
		maps: [
			{
				name: "vat",
				getMap: () => {
					return [
						{ label: "23%", val: 1 },
						{ label: "8%", val: 2 },
						{ label: "5%", val: 3 },
					];
				},
			},
			{
				name: "product_feature_option",
				getMap: () => {
					return product_feature_options.map((option) => ({ val: option.product_feature_option_id, label: option.value }));
				},
			},
		],
	};

	data.products_dt = def(data.products_dt, table);
	data.unnecessary_product_ids = [];

	comp._add_missing_products = (params = {}) => {
		const data = comp._data;
		const add_products = [];

		const all_feature_keys = data.product_feature_ids.map((feature_id) => getFeatureKeyFromId(feature_id));

		data.missing_products_features.forEach((features) => {
			/** @type {ProductData} */
			const product_data = { gross_price: 0, net_price: 0, product_id: -1, vat_id: 1, active: 1, stock: 0 };

			for (const [feature_id, option_id] of Object.entries(features)) {
				const key = getFeatureKeyFromId(feature_id);
				product_data[key] = option_id;
			}

			if (params && params.options_existed) {
				data.products_dt.dataset.forEach((/** @type {ProductData} */ other_product) => {
					params.options_existed.forEach((option_id) => {
						const feature_id = product_feature_options.find((option) => option.product_feature_option_id === option_id).product_feature_id;
						const feature_key = getFeatureKeyFromId(feature_id);
						other_product[feature_key] = option_id;
					});
				});
			}

			let copy_product = undefined;
			let max_shared_features_for_similar_products = 0;
			let product_existed = false;
			data.products_dt.dataset.forEach((/** @type {ProductData} */ other_product) => {
				let shared_features = 0;
				let shared_features_for_similar_products = 0;

				for (const feature_key of all_feature_keys) {
					const pr_opt_id = product_data[feature_key];

					if (pr_opt_id === other_product[feature_key]) {
						shared_features++;
						shared_features_for_similar_products++;
					}

					if (params && params.similar_products) {
						params.similar_products.forEach((e) => {
							if (e.new_option_id === pr_opt_id && e.option_id === other_product[feature_key]) {
								shared_features_for_similar_products++;
							}
						});
					}
				}

				if (shared_features_for_similar_products > max_shared_features_for_similar_products) {
					max_shared_features_for_similar_products = shared_features_for_similar_products;
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
			const feature_id = product_feature_options.find((opt) => opt.product_feature_option_id === option_id).product_feature_id;
			if (!options_after[feature_id]) {
				options_after[feature_id] = [];
			}
			options_after[feature_id].push(option_id);
		});

		/** @type {ManageProductList_QuestionCompData[]} */
		const questions = [];

		for (const feature_id of Object.keys(options_after)) {
			if (options_after[feature_id].length < 2) {
				continue;
			}
			const feature_name = product_features.find((fe) => fe.product_feature_id === +feature_id).name;
			if (options_before[feature_id]) {
				for (const option_after_id of options_after[feature_id]) {
					if (!options_before[feature_id].includes(option_after_id)) {
						const options = options_before[feature_id].filter(onlyUnique).map((option_id) => {
							return {
								label: product_feature_options.find((op) => op.product_feature_option_id === option_id).value,
								value: option_id,
							};
						});
						options.push({ label: "Nie kopiuj (utwórz puste)", value: -1 });

						const option_name = product_feature_options.find((op) => op.product_feature_option_id === option_after_id).value;

						questions.push({
							type: "copy",
							copy_option_id: option_after_id,
							label: `Które dane chcesz skopiować dla opcji <span style="text-decoration:underline">${option_name}</span> (${feature_name})?`,
							options,
						});
					}
					if (options_after[feature_id].length < 2) {
						return;
					}
				}
			} else {
				if (data.products_dt.dataset.length > 0) {
					const options = options_after[feature_id].filter(onlyUnique).map((option_id) => {
						return { label: product_feature_options.find((op) => op.product_feature_option_id === option_id).value, value: option_id };
					});
					options.push({ label: "Nie", value: -1 });

					questions.push({
						type: "existed",
						label: `Czy któraś opcja cechy ${feature_name} należała już do produktu?`,
						options,
					});
				}
			}
		}

		const answered = params.options_existed || params.similar_products;
		if (questions.length === 0 || answered || params.dont_ask) {
			add_products.forEach((p) => {
				data.products_dt.dataset.push(p);
			});

			data.product_feature_ids.forEach((feature_id) => {
				const key = getFeatureKeyFromId(feature_id);
				const feature = data.features.find((f) => f.product_feature_id === feature_id);
				if (!feature || feature.options.length < 2) {
					return;
				}

				const columns = data.products_dt.columns;
				const column_index = columns.findIndex((column) => column.key === key);

				if (column_index === -1) {
					columns.unshift({ key });
				}
			});

			comp._render();
		} else {
			const manage_product_list_modal_comp = getManageProductListModal();
			manage_product_list_modal_comp._data.questions = questions;
			manage_product_list_modal_comp._data.add_products = add_products;
			manage_product_list_modal_comp._render();

			manage_product_list_modal_comp._show({ source: comp._nodes.add_products_btn });
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
		data.products_dt.dataset.forEach((row_data) => {
			// warmup
			const vat = vats.find((e) => e.vat_id === row_data.vat_id);
			const vat_val = vat ? vat.value : 0;
			row_data.net_price = round(row_data.gross_price / (1 + vat_val), 2);
		});

		setCompData(comp, data, {
			...options,
			pass_list_data: [{ what: "features", where: "images" }],
			render: () => {
				const data = comp._data;
				const missing_feature_ids = [];

				const cd = comp._changed_data;

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

					/** @type {DatatableColumnDef} */
					const column = {
						key,
						label: feature.name,
						width: "1",
						searchable: "select",
						sortable: true,
						map_name: "product_feature_option",
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

				const selection_changed = cd.product_feature_ids || cd.product_feature_option_ids;
				if (selection_changed || cd.products_dt) {
					/** @type {DatatableColumnDef[]} */
					const columns = data.products_dt.columns;
					/** @type {DatatableColumnDef[]} */
					const set_columns = [columns.find((c) => c.key === "select")];

					const multi_feature_ids = data.features.filter((fea) => fea.options.length > 1).map((fea) => fea.product_feature_id);

					multi_feature_ids.forEach((feature_id) => {
						const feature_key = getFeatureKeyFromId(feature_id);
						const column = columns.find((c) => c.key === feature_key);
						if (column) {
							set_columns.push(column);
						}
					});

					set_columns.push(...data.products_dt.columns.filter((column) => column.key !== "select" && !getFeatureIdFromKey(column.key)));

					data.products_dt.columns = set_columns;
				}

				if (selection_changed || cd.products_dt) {
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
							if (option) {
								product_features[option.product_feature_id] = product_feature_option_id;
							}
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
			},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<div class="injectable_header">
				<p-trait data-trait="history"></p-trait>

				<button class="btn primary" disabled data-node="{${comp._nodes.preview_btn}}">Podgląd <i class="fas fa-eye"></i></button>
				<button class="btn primary" data-node="{${comp._nodes.open_btn}}" data-tooltip="Otwórz produkt w nowej karcie">
					Pokaż <i class="fas fa-external-link-square-alt"></i>
				</button>
				<button class="btn primary" data-node="{${comp._nodes.save_btn}}">Zapisz <i class="fas fa-save"></i></button>
			</div>

			<div style="max-width:600px">
				<div class="radio_group boxes hide_checks" data-number data-bind="{${data.active}}">
					<div class="checkbox_area box error">
						<div>
							<p-checkbox data-value="0"></p-checkbox>
							<span class="semi_bold">Nieaktywny <i class="fas fa-eye-slash"></i></span>
						</div>
					</div>
					<div class="checkbox_area box success">
						<div>
							<p-checkbox data-value="1"></p-checkbox>
							<span class="semi_bold">Aktywny <i class="fas fa-eye"></i></span>
						</div>
					</div>
				</div>

				<div class="label">Nazwa produktu</div>
				<input type="text" class="field" data-bind="{${data.name}}" data-validate="" />

				<div class="label">Sprzedawaj na (do wdrożenia)</div>
				<select class="field" data-bind="{${data.sell_by}}">
					<option value="qty">Sztuki</option>
					<option value="weight">Wagę</option>
					<option value="length">Długość</option>
				</select>

				<div style="margin-top:var(--form_small_spacing)">
					<span class="label inline list_label" html="{${"Kategorie (" + data.category_ids.length + ")"}}"></span>
					<button data-node="{${comp._nodes.add_category_btn}}" class="btn primary">Dodaj kategorie <i class="fas fa-plus"></i></button>
					<div class="scroll_panel scroll_preview" style="max-height:200px;margin-top:var(--form_small_spacing);cursor:pointer">
						<div data-node="{${comp._nodes.print_categories}}"></div>
					</div>
				</div>

				<div style="margin:var(--form_small_spacing) 0">
					<span class="label inline list_label" html="{${"Cechy (" + data.features.length + ")"}}"></span>
					<button data-node="{${comp._nodes.add_feature_btn}}" class="btn primary">Dodaj cechy <i class="fas fa-plus"></i></button>
				</div>
				<list-comp data-bind="{${data.features}}" data-primary="product_feature_id" class="wireframe space">
					<product_feature-comp></product_feature-comp>
				</list-comp>

				<div style="margin:var(--form_small_spacing) 0">
					<span class="label inline list_label" html="{${"Zdjęcia (" + data.images.length + ")"}}"></span>
					<button data-node="{${comp._nodes.add_image_btn}}" class="btn primary">Dodaj zdjęcie <i class="fas fa-plus"></i></button>
				</div>
				<list-comp class="wireframe space" data-bind="{${data.images}}">
					<product_img-comp></product_img-comp>
				</list-comp>
			</div>

			<div>
				<p class="user_info">
					<i class="fas fa-info-circle"></i> Na podstawie cech zostanie wygenerowana lista produktów - tych samych, które są w Twoim
					magazynie.<br />Przykładowo jeśli wybierzemy kolory czerwony i niebieski, oraz rozmiary 36, 37 i 38,<br />otrzymamy 6 produktów
					będących "krzyżówką" podanych cech.<br />Domyślnie (bez wybrania cech) będzie to tylko 1 produkt.
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
			<button
				class="btn error_light"
				data-node="{${comp._nodes.remove_all_products_btn}}"
				disabled="{${data.products_dt.dataset.length === 0}}"
			>
				Usuń wszystkie produkty (<span html="{${data.products_dt.dataset.length}}"></span>)
			</button>

			<div>
				<p class="user_info">
					<i class="fas fa-info-circle"></i> Aby szybciej edytować dane tabelki warto rozważyć obsługę przy użyciu klawiatury.<br />
					Poruszanie się po polach: <span style="text-decoration:underline;white-space:nowrap">CRTL + Strzałki</span>.<br />
					Otwieranie pola wyboru / zmiana wartości: <span style="text-decoration:underline;white-space:nowrap">ENTER</span>
				</p>
			</div>

			<datatable-comp data-bind="{${data.products_dt}}" data-node="{${comp._nodes.all_products}}"></datatable-comp>

			<div style="height:100px"></div>

			<div style="margin-top: auto;padding-top: 10px;text-align: right;">
				<button class="btn error" data-node="{${comp._nodes.delete_btn}}">Usuń <i class="fas fa-trash"></i></button>
			</div>
		`,
		ready: () => {
			comp._nodes.add_feature_btn.addEventListener("click", () => {
				const select_product_features_modal_comp = getSelectProductFeaturesModal();
				select_product_features_modal_comp._show({ source: comp._nodes.add_feature_btn });
			});

			comp._nodes.add_image_btn.addEventListener("click", () => {
				const select_file_modal = getSelectFileModal();
				select_file_modal._data.file_manager.select_callback = (src) => {
					comp._data.images.push({ img_url: src, product_img_id: -1, product_feature_options: [] });
					comp._render();
				};
				select_file_modal._render();
				select_file_modal._show();
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

			comp._nodes.preview_btn.addEventListener("click", () => {
				previewUrl(`/produkt/${comp._data.general_product_id}`);
			});

			comp._nodes.delete_btn.addEventListener("click", () => {
				if (!confirm("Czy aby na pewno chcesz usunąć ten produkt?")) {
					return;
				}

				xhr({
					url: STATIC_URLS["ADMIN"] + "/general_product/delete/" + comp._data.general_product_id,
					success: (res) => {
						window.location.href = STATIC_URLS["ADMIN"] + "/produkty";
					},
				});
			});

			comp._nodes.save_btn.addEventListener("click", () => {
				const data = comp._data;
				const errors = validateInputs(directCompNodes(comp, "[data-validate]"));

				if (errors.length === 0) {
					const db_products = cloneObject(data.products_dt.dataset);
					db_products.forEach((product) => {
						product.feature_options = [];
						data.product_feature_ids.forEach((fid) => {
							const fkey = getFeatureKeyFromId(fid);
							product.feature_options.push(product[fkey]);
							delete product[fkey];
						});
					});

					xhr({
						url: STATIC_URLS["ADMIN"] + "/general_product/save",
						params: {
							general_product: {
								general_product_id: data.general_product_id,
								name: data.name,
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
								products: db_products,
								images: data.images.map((e, index) => ({ ...e, pos: index + 1 })),
							},
						},
						success: (res) => {
							if (!res.general_product_id) {
								alert("Wystąpił błąd krytyczny");
							}

							showNotification(comp._data.general_product_id === -1 ? "Dodano produkt" : "Zapisano produkt", {
								one_line: true,
								type: "success",
							});

							comp._data.general_product_id = res.general_product_id;
							comp._render();
						},
					});
				}
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

			comp._nodes.all_products.addEventListener("editable_change", (ev) => {
				// @ts-ignore
				const detail = ev.detail;
				/** @type {ProductData} */
				const row_data = detail.row_data;
				const key = detail.key;
				const vat = vats.find((e) => e.vat_id === row_data.vat_id);
				const vat_val = vat ? vat.value : 0;

				row_data.gross_price = round(row_data.gross_price, 2);
				row_data.net_price = round(row_data.net_price, 2);
				if (key === "gross_price") {
					row_data.net_price = round(row_data.gross_price / (1 + vat_val), 2);
				}
				if (key === "net_price" || key === "vat_id") {
					row_data.gross_price = round(row_data.net_price * (1 + vat_val), 2);
				}
			});

			window.addEventListener("product_features_changed", () => {
				comp._nodes.all_products._warmup_maps();
				comp._render({ force_render: true });
			});
			window.addEventListener("product_categories_changed", () => {
				comp._render({ force_render: true });
			});
		},
	});
}
