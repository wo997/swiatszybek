/* js[view] */

function refreshProductFeatures() {
	xhr({
		url: STATIC_URLS["ADMIN"] + "product/feature/all",
		success: (res) => {
			console.log(res);
		},
	});

	/** @type {ProductComp} */
	// @ts-ignore
	const product_comp = $("product-comp");

	product_comp._data.features = product_comp._data.features.filter((curr_feature) => {
		return !!product_features.find((feature) => {
			return feature.product_feature_id === curr_feature.product_feature_id;
		});
	});

	product_comp._data.features.forEach((curr_feature) => {
		curr_feature.options = curr_feature.options.filter((curr_option) => {
			return !!product_options.find((option) => {
				return option.product_feature_option_id === curr_option.product_feature_option_id;
			});
		});
	});

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
		products: [],
	});

	// finally
	const name_input = product_comp._child(`product-comp [data-bind="name"]`);
	const nameChange = () => {
		$$(`.product_name`).forEach((e) => {
			e._set_content(name_input._get_value());
		});
	};
	name_input.addEventListener("change", nameChange);
	nameChange();
});
