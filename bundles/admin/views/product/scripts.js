/* js[view] */

function refreshProductFeatures() {
	xhr({
		url: STATIC_URLS["ADMIN"] + "product/feature/all",
		success: (res) => {
			console.log(res);
		},
	});
}

domload(() => {
	/** @type {ProductComp} */
	// @ts-ignore
	const product_comp = $("product-comp");

	productComp(product_comp, undefined, {
		id: -1,
		name: "",
		sell_by: "qty",
		variants: [],
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
