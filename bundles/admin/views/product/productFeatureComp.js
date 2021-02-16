/* js[view] */

/**
 * @typedef {{
 * datatable?: DatatableCompData
 * product_feature_id: number
 * name: string
 * }} ProductFeatureCompData
 *
 * @typedef {{
 * _data: ProductFeatureCompData
 * _set_data(data?: ProductFeatureCompData, options?: SetCompDataOptions)
 * _nodes: {
 *  add_option_btn: PiepNode
 *  select_parent_option_btn: PiepNode
 *  datatable: DatatableComp
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
		};
	}

	/** @type {DatatableCompData} */
	const dt = {
		columns: [
			{ label: "Opcja", key: "name", width: "20%", sortable: true, searchable: "string", editable: "string" },
			{
				label: "Opcja nadrzędna",
				key: "parent_product_feature_option_id",
				width: "20%",
				map_name: "product_feature_option",
				searchable: "select",
			},
		],
		maps: [
			{
				name: "product_feature_option",
				getMap: () => {
					return product_feature_options.map((option) => ({
						val: option.product_feature_option_id,
						label: option.feature_name + " " + option.name,
					}));
				},
			},
		],
		empty_html: html`Brak opcji`,
		label: "Opcje",
		dataset: [],
		selectable: true,
		pagination_data: { row_count: 50 },
	};

	data.datatable = def(data.datatable, dt);

	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {},
		});
	};

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
				//comp._data.datatable.dataset.forEach((e) => (e.parent_product_feature_option_id = 59));
			}
			// xhr({
			// 	url: STATIC_URLS["ADMIN"] + "product/feature/get/" + id,
			// 	success: (res) => {
			// 		//comp._set_data(res.product_feature);
			// 		//rewritePropsObjHas(res.product_feature, comp._data);
			// 		comp._data.name = res.product_feature.name;
			// 		comp._data.product_feature_id = res.product_feature.name;
			// 		comp._render();
			// 		if (options.callback) {
			// 			options.callback();
			// 		}
			// 	},
			// });
		}
		comp._render();
	};

	const hideAndSearch = () => {
		hideParentModal(comp);
		refreshProductFeatures();
	};

	comp._save_data = () => {
		xhr({
			url: STATIC_URLS["ADMIN"] + "product/feature/save",
			params: {
				product_feature: comp._data,
			},
			success: (res) => {
				hideAndSearch();
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
				},
			});
		} else {
			hideAndSearch();
		}
	};

	createComp(comp, parent, data, {
		template: html`
			<div class="label first">Nazwa cechy produktu</div>
			<input type="text" class="field" data-bind="{${data.name}}" />
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
				comp._data.datatable.dataset.push({ name: "", product_feature_option_id: -1 });
				comp._render();
			});

			const select_product_feature_option_modal_comp = registerSelectProductFeatureOptionModal();

			comp._nodes.select_parent_option_btn.addEventListener("click", () => {
				if (comp._data.datatable.selection.length > 0) {
					select_product_feature_option_modal_comp._show({
						source: comp._nodes.select_parent_option_btn,
						callback: (option_id) => {
							const selection = comp._data.datatable.selection;
							console.log(selection);
							comp._data.datatable.dataset.forEach((/** @type {ProductFeatureOptionData} */ e) => {
								// @ts-ignore
								if (selection.includes(e._row_id)) {
									e.parent_product_feature_option_id = option_id;
								}
							});
							comp._render();
						},
					});
				}
			});
		},
	});
}
