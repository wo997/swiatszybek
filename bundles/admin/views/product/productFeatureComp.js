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
			{ label: "Opcja nadrzędna", key: "parent_option", width: "20%" },
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
		if (id === -1) {
			comp._set_data();
		} else {
			xhr({
				url: STATIC_URLS["ADMIN"] + "product/feature/get/" + id,
				success: (res) => {
					//comp._set_data(res.product_feature);
					rewritePropsObjHas(res.product_feature, comp._data);
					comp._data.name = res.product_feature.name;
					comp._data.product_feature_id = res.product_feature.name;
					comp._render();
					if (options.callback) {
						options.callback();
					}
				},
			});
		}
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
					class="btn {${true}?important:subtle}"
					data-node="{${comp._nodes.select_parent_option_btn}}"
					data-tooltip="{${!true ? "Najpierw wybierz opcje z listy poniżej" : ""}}"
				>
					Połącz <span class="semi-bold" html="{${"(" + 0 + ")"}}"></span> z opcją nadrzędną
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
		},
	});
}
