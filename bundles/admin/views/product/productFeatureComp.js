/* js[view] */

/**
 * @typedef {{
 * datatable?: DatatableCompData
 * product_feature_id: number
 * name: string
 * current_group_id: number
 * }} ProductFeatureCompData
 *
 * @typedef {{
 * _data: ProductFeatureCompData
 * _set_data(data?: ProductFeatureCompData, options?: SetCompDataOptions)
 * _nodes: {
 *  add_option_btn: PiepNode
 *  select_parent_option_btn: PiepNode
 *  datatable: DatatableComp
 *  groups: PiepNode
 *  case_has_groups: PiepNode
 * }
 * _load_data(id: number, options?:{callback?: CallableFunction})
 * _save_data()
 * _delete()
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
		};
	}

	/** @type {DatatableCompData} */
	const dt = {
		columns: [
			{ label: "Opcja", key: "name", width: "20%", editable: "string" },
			{
				label: "Opcja nadrzędna (Grupa)",
				key: "parent_product_feature_option_id",
				width: "20%",
				map_name: "product_feature_option",
			},
		],
		maps: [
			{
				name: "product_feature_option",
				getMap: () => {
					const map = product_feature_options.map((option) => ({
						val: option.product_feature_option_id,
						label: option.feature_name + ": " + option.name,
					}));
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
		label: "Opcje",
	};

	data.datatable = def(data.datatable, dt);

	comp._load_data = (id, options = {}) => {
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
		comp._nodes.datatable._warmup_maps();
		comp._data.current_group_id = -1;
		comp._data.datatable.filters = [];
		comp._render({ force_render: true, freeze: true });
	};

	const hideAndSearch = () => {
		hideParentModal(comp);
		refreshProductFeatures();
	};

	comp._save_data = () => {
		xhr({
			url: STATIC_URLS["ADMIN"] + "product/feature/save",
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
				showNotification(comp._data.product_feature_id === -1 ? "Dodano cechę" : "Zapisano cechę", {
					one_line: true,
					type: "success",
				});
			},
		});
	};

	comp._delete = () => {
		if (comp._data.product_feature_id !== -1) {
			xhr({
				url: STATIC_URLS["ADMIN"] + "product/feature/delete/" + comp._data.product_feature_id,
				params: {
					product_feature: comp._data,
				},
				success: (res) => {
					hideAndSearch();
					showNotification("Usunięto cechę", {
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
				const options_ids = data.datatable.dataset.map((e) => e.parent_product_feature_option_id).filter(onlyUnique);

				let group_btns = [];

				const map = data.datatable.maps.find((e) => e.name === "product_feature_option");
				if (map && map.map) {
					map.map
						.filter((e) => options_ids.includes(e.val))
						.forEach((e) => {
							group_btns.push(html`<button
								class="btn ${e.val === data.current_group_id ? "primary" : "subtle"} group_nav"
								data-option_id="${e.val}"
							>
								${e.label}
							</button> `);
						});
				}

				expand(comp._nodes.case_has_groups, group_btns.length > 0);

				if (group_btns.length > 0) {
					group_btns.unshift(html`<button
						class="btn ${data.current_group_id === null ? "primary" : "subtle"} group_nav"
						data-option_id="null"
					>
						<i class="fas fa-ban"></i> Bez grupy
					</button> `);
					group_btns.unshift(html`<button class="btn ${data.current_group_id === -1 ? "primary" : "subtle"} group_nav" data-option_id="-1">
						<i class="fas fa-border-all"></i> Wszystkie
					</button> `);
				}

				comp._nodes.groups._set_content(group_btns.join(""));

				comp._nodes.groups._children(".group_nav").forEach((e) => {
					e.addEventListener("click", () => {
						const option_id = e.dataset.option_id === "null" ? null : +e.dataset.option_id;
						comp._data.current_group_id = option_id;
						if (option_id === -1) {
							comp._data.datatable.filters = [];
						} else {
							comp._data.datatable.filters = [{ key: "parent_product_feature_option_id", data: { type: "exact", val: option_id } }];
						}
						comp._render();
					});
				});
			},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<div class="label first">Nazwa cechy produktu</div>
			<input type="text" class="field" data-bind="{${data.name}}" />

			<div data-node="{${comp._nodes.case_has_groups}}" class="expand_y">
				<div>
					<div class="label" style="font-size: 1.2em;">Grupy opcji</div>
					<span
						data-node="{${comp._nodes.groups}}"
						class="glue_children"
						style="display: inline-flex;flex-wrap: wrap;padding-bottom:10px"
					></span>
				</div>
			</div>

			<div class="adv_controls">
				<button class="btn primary" data-node="{${comp._nodes.add_option_btn}}">Dodaj nową <i class="fas fa-plus"></i></button>
				<button
					class="btn {${data.datatable.selection.length > 0}?important:subtle}"
					data-node="{${comp._nodes.select_parent_option_btn}}"
					data-tooltip="{${data.datatable.selection.length === 0 ? "Najpierw zaznacz opcje na liście poniżej" : ""}}"
				>
					Połącz (<span html="{${data.datatable.selection.length}}"></span>) z opcją nadrzędną
					<i class="fas fa-search"></i>
				</button>
			</div>
			<datatable-comp
				style="margin-top:var(--form-spacing)"
				data-bind="{${data.datatable}}"
				data-node="{${comp._nodes.datatable}}"
			></datatable-comp>
		`,
		ready: () => {
			const datatable_label = comp._nodes.datatable._child(".datatable_label");
			datatable_label._parent().insertBefore(comp._child(".adv_controls"), datatable_label._next());

			comp._nodes.add_option_btn.addEventListener("click", () => {
				comp._data.datatable.dataset.push({
					name: "",
					product_feature_option_id: -1,
					parent_product_feature_option_id: comp._data.current_group_id === -1 ? null : comp._data.current_group_id,
				});
				comp._render();
			});

			const select_product_feature_option_modal_comp = registerSelectProductFeatureOptionModal();

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
		},
	});
}
