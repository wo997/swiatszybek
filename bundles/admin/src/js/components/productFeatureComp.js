/* js[admin] */

/**
 * @typedef {{
 * datatable?: DatatableCompData
 * product_feature_id: number
 * name: string
 * current_group_id: number
 * groups: any[]
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

	/** @type {DatatableCompData} */
	const dt = {
		columns: [
			{ label: "Opcja", key: "name", width: "1", editable: "string" },
			{
				label: "Opcja nadrzędna (Grupa)",
				key: "parent_product_feature_option_id",
				width: "1",
				map_name: "product_feature_option",
			},
		],
		maps: [
			{
				name: "product_feature_option",
				getMap: () => {
					const map = product_feature_options.map((option) => {
						const obj = {
							val: option.product_feature_option_id,
							label: option.full_name,
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
			comp._data.datatable.dataset = [];
		} else {
			const feature = product_features.find((f) => f.product_feature_id === id);
			if (feature) {
				comp._data.name = feature.name;
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

		if (comp._data.datatable.dataset.length === 0) {
			showNotification("Musisz dodać min. 1 opcję", { type: "error", one_line: true });
			return;
		}

		xhr({
			url: STATIC_URLS["ADMIN"] + "/product/feature/save",
			params: {
				product_feature: {
					name: comp._data.name,
					product_feature_id: comp._data.product_feature_id,
					options: comp._data.datatable.dataset.map((e, index) => ({
						product_feature_option_id: e.product_feature_option_id,
						name: e.name,
						parent_product_feature_option_id: e.parent_product_feature_option_id,
						pos: index + 1,
					})),
				},
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
		setCompData(comp, data, {
			...options,
			render: () => {
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
					group_btns.unshift(html`<button class="btn ${data.current_group_id === -1 ? "primary" : "subtle"} group_nav" data-option_id="-1">
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
			},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<div class="label first">Nazwa cechy produktu</div>
			<input type="text" class="field" data-bind="{${data.name}}" data-node="{${comp._nodes.name}}" data-validate="string" />

			<div>
				<div class="label" style="font-size: 1.2em;">Grupy opcji</div>

				<div>
					<p class="user_info" style="margin-top:5px">
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
					class="btn {${data.datatable.selection.length > 0}?important:subtle}"
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
		`,
		ready: () => {
			const datatable_label = comp._nodes.datatable._child(".datatable_label");
			datatable_label._parent().insertBefore(comp._child(".adv_controls"), datatable_label._next());

			comp._nodes.add_option_btn.addEventListener("click", () => {
				for (const input of comp._nodes.datatable._children(`.list_row input[data-bind="name"]`)) {
					if (input._get_value() === "") {
						input.focus();
						return;
					}
				}

				comp._data.datatable.dataset.unshift({
					name: "",
					product_feature_option_id: -1,
					parent_product_feature_option_id: comp._data.current_group_id,
				});
				comp._render();
				setTimeout(() => {
					const input = comp._nodes.datatable._child(`.list_row:first-child input[data-bind="name"]`);
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
