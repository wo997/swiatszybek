/* js[view] */

/**
 * @typedef {{
 * product_feature_id: number
 * name: string
 * options: ProductFeatureOptionCompData[]
 * }} ProductFeatureCompData
 *
 * @typedef {{
 * _data: ProductFeatureCompData
 * _set_data(data?: ProductFeatureCompData, options?: SetCompDataOptions)
 * _nodes: {
 *  add_option_btn: PiepNode
 * }
 * _load_data(id: number)
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
		setCompData(comp, data, {
			...options,
			render: () => {},
		});
	};

	comp._load_data = (id) => {
		if (id === -1) {
			comp._set_data();
		} else {
			xhr({
				url: STATIC_URLS["ADMIN"] + "product/feature/get/" + id,
				success: (res) => {
					//comp._set_data(res.product_feature);
					rewritePropsObjHas(res.product_feature, comp._data);
					comp._render();
				},
			});
		}
	};

	const hideAndSearch = () => {
		hideParentModal(comp);

		/** @type {DatatableComp} */
		// @ts-ignore
		const dt_product_features = $("#selectProductFeatures datatable-comp");

		if (dt_product_features) {
			dt_product_features._datatable_search();
		}
	};

	comp._save_data = () => {
		xhr({
			url: STATIC_URLS["ADMIN"] + "product/feature/save",
			params: {
				product_feature: comp._data,
			},
			success: (res) => {
				//console.log(res);
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
					//console.log(res);
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
				<button class="btn primary small" data-node="{${comp._nodes.add_option_btn}}">Dodaj <i class="fas fa-plus"></i></button>
			</div>
			<list-comp data-bind="{${data.options}}">
				<product-feature-option-comp></product-feature-option-comp>
			</list-comp>
		`,
		initialize: () => {
			comp._nodes.add_option_btn.addEventListener("click", () => {
				comp._data.options.push({ name: "", option_id: -1, options: [] });
				comp._render();
			});
		},
	});
}
