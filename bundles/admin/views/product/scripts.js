/* js[view] */

function refreshProductFeatures() {
	xhr({
		url: STATIC_URLS["ADMIN"] + "product/feature/all",
		success: (res) => {
			product_features = res;
		},
	});

	xhr({
		url: STATIC_URLS["ADMIN"] + "product/feature/option/all",
		success: (res) => {
			product_feature_options = res;
		},
	});

	/** @type {ProductComp} */
	// @ts-ignore
	const product_comp = $("product-comp");

	// HEY, it watches removals only, what about changes????
	product_comp._data.features = product_comp._data.features.filter((curr_feature) => {
		return !!product_features.find((feature) => {
			return feature.product_feature_id === curr_feature.product_feature_id;
		});
	});

	// rework this shit
	// product_comp._data.features.forEach((curr_feature) => {
	// 	curr_feature.options = curr_feature.options.filter((curr_option) => {
	// 		return !!product_feature_options.find((option) => {
	// 			return option.product_feature_option_id === curr_option.product_feature_option_id;
	// 		});
	// 	});
	// });

	product_comp._render();
}

domload(() => {
	/** @type {ProductComp} */
	// @ts-ignore
	const product_comp = $("product-comp");

	productComp(product_comp, undefined, {
		id: -1,
		name: "",
		sell_by: "qty",
		features: [],
		product_feature_option_ids: [],
		products: [],
	});

	const nameChange = () => {
		$$(`.product_name`).forEach((e) => {
			e._set_content(product_comp._data.name ? product_comp._data.name : "Nowy produkt");
		});
	};
	product_comp.addEventListener("change", nameChange);
	nameChange();
});
