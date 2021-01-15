/* module_block[product_list] */
MODULE_BLOCK = {
	title: "Lista produktów",
	icon: '<i class="fas fa-cube"></i>',
	formOpen: (params, form) => {
		loadCategoryPicker("product_categories", { skip: 2 }, () => {
			form
				._child(`[name="category_ids"]`)
				.setValue(def(params["category_ids"], "[]"));
		});
	},
	formClose: (form_data) => {
		return form_data;
	},
	render: (params) => {
		const productListCount = params["product_list_count"];
		return productListCount ? `Liczba produktów: ${productListCount}` : "";
	},
};
