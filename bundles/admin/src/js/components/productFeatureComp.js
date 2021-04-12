/* js[admin] */

/**
 * @typedef {{
 * data_type?: string
 * physical_measure?: string
 * list_type?: string
 * datatable?: DatatableCompData
 * product_feature_id: number
 * name: string
 * current_group_id: number
 * groups: any[]
 * extra?: string
 * }} ProductFeatureCompData
 *
 * @typedef {{
 * _data: ProductFeatureCompData
 * _set_data(data?: ProductFeatureCompData, options?: SetCompDataOptions)
 * _nodes: {
 *  add_option_btn: PiepNode
 *  select_parent_option_btn: PiepNode
 *  remove_parent_option_btn: PiepNode
 *  datatable: DatatableComp
 *  groups: PiepNode
 *  name: PiepNode
 *  options_wrapper: PiepNode
 *  physical_measures_wrapper: PiepNode
 * }
 * _load_data(id: number)
 * _save()
 * _delete()
 * _select_current_group_id(id: any)
 * } & BaseComp} ProductFeatureComp
 */

/**
 * @param {ProductFeatureComp} comp
 * @param {*} parent
 * @param {ProductFeatureCompData} data
 */
function productFeatureComp(comp, parent, data) {
	if (data === undefined) {
		data = {
			product_feature_id: -1,
			name: "",
			current_group_id: -1,
			groups: [],
		};
	}

	data.data_type = def(data.data_type, "text_list");
	data.list_type = def(data.list_type, "multi");
	data.extra = def(data.extra, "");

	data.physical_measure = def(data.physical_measure, "none");

	/** @type {DatatableCompData} */
	const dt = {
		columns: [
			{
				label: "Opcja nadrzędna (Grupa)",
				key: "parent_product_feature_option_id",
				width: "1.3",
				map_name: "product_feature_option",
			},
			{ label: "Opcja", key: "value", width: "1", editable: "string" },
		],
		maps: [
			{
				name: "product_feature_option",
				getMap: () => {
					const map = product_feature_options.map((option) => {
						const obj = {
							val: option.product_feature_option_id,
							label: option.full_value,
						};
						return obj;
					});
					return map;
				},
			},
		],
		empty_html: html`Brak opcji`,
		dataset: [],
		selectable: true,
		pagination_data: { row_count: 50 },
		sortable: true,
		deletable: true,
		require_sort: { key: "pos", order: "asc" },
		require_sort_filter: "parent_product_feature_option_id",
		required_empty_sortable: true,
		label: "Opcje",
	};

	data.datatable = def(data.datatable, dt);

	comp._select_current_group_id = (option_id) => {
		comp._data.current_group_id = option_id;
		if (option_id === 0) {
			comp._data.datatable.filters = [];
		} else {
			comp._data.datatable.filters = [{ key: "parent_product_feature_option_id", data: { type: "exact", val: option_id } }];
		}
		comp._render();
	};

	comp._load_data = (id) => {
		comp._data.product_feature_id = id;
		if (id === -1) {
			comp._data.name = "";
			comp._data.data_type = "text_list";
			comp._data.datatable.dataset = [];
			comp._data.physical_measure = "none";
			comp._data.list_type = "multi";
			comp._data.extra = "";
		} else {
			const feature = product_features.find((f) => f.product_feature_id === id);
			if (feature) {
				comp._data.name = feature.name;
				comp._data.data_type = feature.data_type;
				comp._data.physical_measure = feature.physical_measure;
				comp._data.list_type = feature.list_type;
				comp._data.extra = feature.extra;
				comp._data.datatable.dataset = product_feature_options.filter((e) => e.product_feature_id === id);
			}
		}

		comp._data.current_group_id = 0;
		comp._data.datatable.filters = [];
		comp._data.groups = [];
		comp._render({ force_render: true, freeze: true });
	};

	const hideAndSearch = () => {
		hideParentModal(comp);
		refreshProductFeatures();
	};

	comp._save = () => {
		const errors = validateInputs([comp._nodes.name]);

		if (errors.length > 0) {
			return;
		}

		const data = comp._data;
		const product_feature = {
			name: data.name,
			data_type: data.data_type,
			product_feature_id: data.product_feature_id,
			physical_measure: data.physical_measure,
			list_type: data.list_type,
			extra: data.extra,
		};

		const is_list = comp._data.data_type.endsWith("_list");
		if (is_list) {
			if (comp._data.datatable.dataset.length === 0) {
				showNotification("Musisz dodać min. 1 opcję", { type: "error", one_line: true });
				return;
			}

			product_feature.options = comp._data.datatable.dataset.map((option, index) => {
				const extra = {};
				if (option.extra_color !== undefined) {
					extra.color = option.extra_color;
				}
				return {
					product_feature_option_id: option.product_feature_option_id,
					value: option.value,
					parent_product_feature_option_id: option.parent_product_feature_option_id,
					pos: index + 1,
					extra_json: JSON.stringify(extra),
				};
			});
		} else {
			// product_feature.options = []; // don't do it, it actually deletes every option from the DB
		}

		xhr({
			url: STATIC_URLS["ADMIN"] + "/product/feature/save",
			params: {
				product_feature,
			},
			success: (res) => {
				hideAndSearch();
				showNotification(comp._data.product_feature_id === -1 ? "Dodano cechę produktu" : "Zapisano cechę produktu", {
					one_line: true,
					type: "success",
				});
			},
		});
	};

	comp._delete = () => {
		if (comp._data.product_feature_id !== -1) {
			xhr({
				url: STATIC_URLS["ADMIN"] + "/product/feature/delete/" + comp._data.product_feature_id,
				params: {
					product_feature: comp._data,
				},
				success: (res) => {
					hideAndSearch();
					showNotification(`Usunięto cechę ${comp._data.name}`, {
						one_line: true,
						type: "success",
					});
				},
			});
		} else {
			hideAndSearch();
		}
	};

	comp._set_data = (data, options = {}) => {
		const color_col_index = data.datatable.columns.findIndex((c) => c.key === "extra_color");
		if (data.extra === "color") {
			if (color_col_index === -1) {
				data.datatable.columns.push({ label: "Kolor", key: "extra_color", width: "100px", editable: "color" });
			}
		} else {
			if (color_col_index !== -1) {
				data.datatable.columns.splice(color_col_index, 1);
			}
		}

		setCompData(comp, data, {
			...options,
			render: () => {
				const is_list = data.data_type.endsWith("_list");
				expand(comp._nodes.options_wrapper, is_list);

				const is_double_value = data.data_type === "double_value";
				expand(comp._nodes.physical_measures_wrapper, is_double_value);

				if (!is_list) {
					const getCount = (option_id) => {
						return data.datatable.dataset.filter((e) => e.parent_product_feature_option_id === option_id).length;
					};

					const want_groups = data.datatable.dataset.map((e) => e.parent_product_feature_option_id).filter(onlyUnique);

					if (!want_groups.includes(comp._data.current_group_id)) {
						want_groups.push(comp._data.current_group_id);
					}
					want_groups.forEach((option_id) => {
						if (!comp._data.groups.includes(option_id)) {
							comp._data.groups.push(option_id);
						}
					});

					let group_btns = [];

					const map = data.datatable.maps.find((e) => e.name === "product_feature_option");
					if (map && map.map) {
						comp._data.groups.forEach((option_id) => {
							const map_option = map.map.find((map_option) => map_option.val === option_id);
							if (map_option) {
								group_btns.push(html`<button
									class="btn ${map_option.val === data.current_group_id ? "primary" : "subtle"} group_nav"
									data-option_id="${map_option.val}"
								>
									${map_option.label} (${getCount(option_id)})
								</button> `);
							}
						});
					}

					if (group_btns.length > 0) {
						group_btns.unshift(html`<button
							class="btn ${data.current_group_id === -1 ? "primary" : "subtle"} group_nav"
							data-option_id="-1"
						>
							<i class="fas fa-ban"></i> Bez grupy (${getCount(-1)})
						</button> `);
					}
					group_btns.unshift(html`<button class="btn ${data.current_group_id === 0 ? "primary" : "subtle"} group_nav" data-option_id="0">
						<i class="fas fa-border-all"></i> Wszystkie (${data.datatable.dataset.length})
					</button> `);

					group_btns.push(html`<button class="btn subtle group_nav" data-option_id="new" data-tooltip="Utwórz nową grupę">
						<i class="fas fa-plus"></i>
					</button> `);

					comp._nodes.groups._set_content(group_btns.join(""));

					comp._nodes.groups._children(".group_nav").forEach((e) => {
						e.addEventListener("click", () => {
							if (e.dataset.option_id === "new") {
								/** @type {SelectProductFeatureOptionModalComp} */
								// @ts-ignore
								const select_product_feature_option_modal_comp = $("#selectProductFeatureOption select-product-feature-option-modal-comp");

								select_product_feature_option_modal_comp._show({
									source: comp._nodes.select_parent_option_btn,
									callback: (option_id) => {
										comp._select_current_group_id(+option_id);
									},
									exclude: comp._data.datatable.dataset.map((e) => e.parent_product_feature_option_id).filter(onlyUnique),
								});
							} else {
								comp._select_current_group_id(+e.dataset.option_id);
							}
						});
					});
				}
			},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<div class="label first">Nazwa cechy produktu</div>
			<input type="text" class="field" data-bind="{${data.name}}" data-node="{${comp._nodes.name}}" data-validate="" />

			<div class="label">Typ wartości</div>
			<select class="field" data-bind="{${data.data_type}}">
				${Object.entries(feature_data_types)
					.map(([name, data]) => {
						return html`<option value="${name}">${data.description}</option>`;
					})
					.join("")}
			</select>

			<div class="expand_y" data-node="{${comp._nodes.physical_measures_wrapper}}">
				<div class="label">Miara fizyczna (jednostki) - JEŚLI CZEGOŚ BRAK TO POPROŚ WOJTUHA</div>
				<select class="field" data-bind="{${data.physical_measure}}">
					${Object.entries(physical_measures)
						.map(([name, measure_data]) => {
							let dis = measure_data.description;
							if (measure_data.units.length > 0) {
								dis += " [" + measure_data.units.map((e) => e.name).join(", ") + "]";
							}
							return html`<option value="${name}">${dis}</option>`;
						})
						.join("")}
				</select>
			</div>

			<div class="expand_y" data-node="{${comp._nodes.options_wrapper}}">
				<div class="label">Typ wyboru filtrów</div>
				<select class="field" data-bind="{${data.list_type}}">
					<option value="multi">Wielokrotny (można filtrować wg wielu opcji, np. kolor czerwony i zielony)</option>
					<option value="single">Jednokrotny (opcje się wykluczają, np. tak / nie)</option>
				</select>

				<div class="label">Dodatkowe informacje</div>
				<select class="field" data-bind="{${data.extra}}">
					<option value="">Brak</option>
					<option value="color">Kolor (pojawi się przy filtrach produktów)</option>
				</select>

				<div>
					<div class="label" style="font-size: 1.2em;">Grupy opcji</div>

					<div>
						<p class="user_info" style="margin:5px 0 20px">
							<i class="fas fa-info-circle"></i> Czym są grupy opcji? Jest to sposób na uporządkowanie danych w systemie dla sprzedawcy oraz
							klienta. <br />Zamiast tworzyć listę np. 100 modeli telefonów, można podzielić je na grupy - producent A, producent B itd.
							<br />Klient nie zobaczy już listy 100 modeli, tylko wybierze jednego z 10 producentów, a potem jeden z 10 modeli od wybranego
							producenta. <br />W razie potrzeby mozna wprowadzić podział np. Producent <i class="fas fa-chevron-right"></i> Seria
							<i class="fas fa-chevron-right"></i> Model.
						</p>
					</div>

					<span
						data-node="{${comp._nodes.groups}}"
						class="glue_children"
						style="display: inline-flex;flex-wrap: wrap;padding-bottom:10px"
					></span>
				</div>

				<div class="adv_controls">
					<button class="btn primary" data-node="{${comp._nodes.add_option_btn}}">Dodaj opcję <i class="fas fa-plus"></i></button>
					<button
						class="btn {${data.datatable.selection.length > 0}?important:subtle}"
						data-node="{${comp._nodes.select_parent_option_btn}}"
						data-tooltip="{${data.datatable.selection.length === 0 ? "Najpierw zaznacz opcje na liście poniżej" : ""}}"
					>
						Połącz (<span html="{${data.datatable.selection.length}}"></span>) z grupą
						<i class="fas fa-search"></i>
					</button>
					<button
						class="btn subtle"
						data-node="{${comp._nodes.remove_parent_option_btn}}"
						data-tooltip="{${data.datatable.selection.length === 0 ? "Najpierw zaznacz opcje na liście poniżej" : ""}}"
					>
						Odłącz (<span html="{${data.datatable.selection.length}}"></span>) od grupy
						<i class="fas fa-times"></i>
					</button>
				</div>
				<datatable-comp
					style="margin-top:var(--form_spacing)"
					data-bind="{${data.datatable}}"
					data-node="{${comp._nodes.datatable}}"
				></datatable-comp>
			</div>
		`,
		ready: () => {
			const datatable_label = comp._nodes.datatable._child(".datatable_label");
			datatable_label._parent().insertBefore(comp._child(".adv_controls"), datatable_label._next());

			comp._nodes.add_option_btn.addEventListener("click", () => {
				for (const input of comp._nodes.datatable._children(`.list_row input[data-bind="value"]`)) {
					if (input._get_value() === "") {
						input.focus();
						return;
					}
				}

				comp._data.datatable.dataset.unshift({
					value: "",
					product_feature_option_id: -1,
					parent_product_feature_option_id: comp._data.current_group_id === 0 ? -1 : comp._data.current_group_id,
					extra_color: "",
				});
				comp._render();
				setTimeout(() => {
					const input = comp._nodes.datatable._child(`.list_row:first-child input[data-bind="value"]`);
					console.log(comp._nodes.datatable, input);
					if (input) {
						input.focus();
					}
				}, 150);
			});

			const select_product_feature_option_modal_comp = getSelectProductFeatureOptionModal();

			comp._nodes.select_parent_option_btn.addEventListener("click", () => {
				if (comp._data.datatable.selection.length > 0) {
					select_product_feature_option_modal_comp._show({
						source: comp._nodes.select_parent_option_btn,
						callback: (option_id) => {
							const selection = comp._data.datatable.selection;
							comp._data.datatable.dataset.forEach((/** @type {ProductFeatureOptionData} */ e) => {
								// @ts-ignore
								if (selection.includes(e._row_id)) {
									e.parent_product_feature_option_id = option_id;
								}
							});
							comp._data.datatable.selection = [];
							comp._render();
						},
					});
				}
			});

			comp._nodes.remove_parent_option_btn.addEventListener("click", () => {
				if (comp._data.datatable.selection.length > 0) {
					const selection = comp._data.datatable.selection;
					comp._data.datatable.dataset.forEach((/** @type {ProductFeatureOptionData} */ e) => {
						// @ts-ignore
						if (selection.includes(e._row_id)) {
							e.parent_product_feature_option_id = -1;
						}
					});
					comp._data.datatable.selection = [];
					comp._render();
				}
			});

			window.addEventListener("product_features_changed", () => {
				comp._nodes.datatable._warmup_maps();
			});
		},
	});
}
