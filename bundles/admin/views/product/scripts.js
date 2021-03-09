/* js[view] */

domload(() => {
	/** @type {ProductComp} */
	// @ts-ignore
	const product_comp = $("product-comp");

	productComp(product_comp, undefined);

	$(".main_header .inject_header_nodes").appendChild(product_comp._child(".injectable_header"));

	const nameChange = () => {
		$$(`.product_name`).forEach((e) => {
			e._set_content(product_comp._data.name ? product_comp._data.name : "Nowy produkt");
		});
	};
	product_comp.addEventListener("change", nameChange);
	window.addEventListener("modal-show", nameChange);
	nameChange();

	const data = product_comp._data;

	data.general_product_id = general_product_data ? general_product_data.general_product_id : -1;
	if (general_product_data) {
		data.name = general_product_data.name;

		data.product_feature_ids = [];
		for (const feature of general_product_data.features.sort((a, b) => Math.sign(a._meta_pos - b._meta_pos))) {
			data.product_feature_ids.push(feature.product_feature_id);
		}

		data.product_feature_option_ids = [];
		for (const feature of general_product_data.feature_options.sort((a, b) => Math.sign(a._meta_pos - b._meta_pos))) {
			data.product_feature_option_ids.push(feature.product_feature_option_id);
		}

		data.products_dt.dataset = [];
		for (const product of general_product_data.products) {
			product.feature_options.forEach((opt) => {
				const product_feature_option_id = opt.product_feature_option_id;
				const product_feature_option = product_feature_options.find((e) => e.product_feature_option_id === product_feature_option_id);
				if (product_feature_option) {
					const fkey = getFeatureKeyFromId(product_feature_option.product_feature_id);
					product[fkey] = product_feature_option_id;
				}
			});
			delete product.feature_options;

			data.products_dt.dataset.push(product);
		}

		{
			const category_ids = general_product_data.categories.map((e) => e.product_category_id);
			const ordered_category_ids = [];

			/**
			 * @param {ProductCategoryBranch[]} categories
			 */
			const traverse = (categories) => {
				categories.forEach((cat) => {
					if (category_ids.includes(cat.product_category_id)) {
						ordered_category_ids.push(cat.product_category_id);
					}

					traverse(cat.sub_categories);
				});
			};

			traverse(product_categories_tree);
			data.category_ids = ordered_category_ids;
		}

		data.main_img_url = general_product_data.main_img_url;

		data.images = general_product_data.images
			.sort((a, b) => Math.sign(a.pos - b.pos))
			.map((e) => {
				return { ...e, product_feature_options: e.product_feature_options.map((op) => op.product_feature_option_id) };
			});

		product_feature_options;

		product_comp._render();

		// rendering provides important informations
		product_comp._add_missing_products({ dont_ask: true });
	}
	product_comp._render();
});
