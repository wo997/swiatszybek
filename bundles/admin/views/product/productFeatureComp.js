/* js[view] */

/**
 * @typedef {{
 * product_feature_id: number
 * name: string
 * options: ProductFeatureOptionCompData[]
 * selection?: Array
 * selection_ok?: boolean
 * }} ProductFeatureCompData
 *
 * @typedef {{
 * _data: ProductFeatureCompData
 * _set_data(data?: ProductFeatureCompData, options?: SetCompDataOptions)
 * _nodes: {
 *  add_option_btn: PiepNode
 *  select_parent_option_btn: PiepNode
 * }
 * _load_data(id: number,options?:{callback?: CallableFunction})
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
	comp._set_data = (data = { product_feature_id: -1, name: "", options: [] }, options = {}) => {
		data.selection = data.options.filter((e) => e.selected);
		data.selection_ok = data.selection.length > 0;

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
			<div class="label">
				Opcje
				<button class="btn primary small" data-node="{${comp._nodes.add_option_btn}}">Dodaj nową <i class="fas fa-plus"></i></button>
				<button
					class="btn {important:${data.selection_ok}} {subtle:${!data.selection_ok}} small"
					data-node="{${comp._nodes.select_parent_option_btn}}"
					data-tooltip="{${!data.selection_ok ? "Najpierw wybierz opcje z listy poniżej" : ""}}"
				>
					Połącz <span class="semi-bold" html="{${data.selection.length ? "(" + data.selection.length + ")" : ""}}"></span> z opcją
					nadrzędną
					<i class="fas fa-search"></i>
				</button>
			</div>
			<list-comp data-bind="{${data.options}}" data-primary="product_feature_option_id">
				<product-feature-option-comp></product-feature-option-comp>
			</list-comp>
		`,
		initialize: () => {
			comp._nodes.add_option_btn.addEventListener("click", () => {
				comp._data.options.push({ name: "", product_feature_option_id: -1 });
				comp._render();
			});
		},
	});
}
