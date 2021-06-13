/* js[view] */

domload(() => {
	startComponentsOptimization();

	/** @type {ProductComp} */
	// @ts-ignore
	const product_comp = $("product-comp");
	ProductComp(product_comp, undefined);
	product_comp.style.visibility = "hidden";

	if (!page_data) {
		const case_has_page = product_comp._child(".case_has_page");
		case_has_page.classList.add("inactive");
		case_has_page.dataset.tooltip = "Zanim opublikujesz produkt musisz utworzyć jego stronę";
	}

	const main_header_height = $(".main_header").offsetHeight;
	const sticky_subheaders = product_comp._children(".sticky_subheader");
	$(".main_admin_scroll").addEventListener("scroll", () => {
		sticky_subheaders.forEach((sticky_subheader) => {
			sticky_subheader.classList.toggle("sticking", sticky_subheader.getBoundingClientRect().top < main_header_height + 3);
		});
	});

	$(".main_header .inject_header_nodes").appendChild(product_comp._child(".injectable_header"));

	const nameChange = () => {
		$$(`.product_name`).forEach((e) => {
			e._set_content(product_comp._data.name ? product_comp._data.name : "Nowy produkt");
		});
	};
	product_comp.addEventListener("change", nameChange);
	window.addEventListener("modal_show", nameChange);
	nameChange();

	let data = product_comp._data;

	data.general_product_id = general_product_data ? general_product_data.general_product_id : -1;
	if (general_product_data) {
		data.name = general_product_data.name;
		data.active = general_product_data.active;

		data.product_feature_ids = [];
		for (const feature of general_product_data.features.sort((a, b) => Math.sign(a._meta_pos - b._meta_pos))) {
			data.product_feature_ids.push(feature.product_feature_id);
		}

		data.product_feature_option_ids = [];
		for (const option_data of general_product_data.feature_options.sort((a, b) => Math.sign(a._meta_pos - b._meta_pos))) {
			data.product_feature_option_ids.push(option_data.product_feature_option_id);
		}

		data.variants = general_product_data.variants
			.map((v) => {
				v.options.forEach((e) => {
					e.selected_product_feature_options = e.product_feature_options.map((op) => op.product_feature_option_id);
				});
				return v;
			})
			.filter((e) => e.pos);
		data.variants.sort((a, b) => Math.sign(a.pos - b.pos));
		data.variants.forEach((variant) => {
			variant.options = variant.options.filter((e) => e.pos);
			variant.options.sort((a, b) => Math.sign(a.pos - b.pos));
		});

		data.products_dt.dataset = [];
		for (const product of general_product_data.products) {
			product.variant_options.forEach((opt) => {
				const product_variant_option_id = opt.product_variant_option_id;
				const product_variant = data.variants.find((v) =>
					v.options.find((vo) => vo.product_variant_option_id === product_variant_option_id)
				);
				if (product_variant) {
					const vkey = getVariantKeyFromId(product_variant.product_variant_id);
					product[vkey] = product_variant_option_id;
				}
			});
			delete product.variant_options;

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

		data.product_type = general_product_data.product_type;

		data.images = general_product_data.images
			.sort((a, b) => Math.sign(a.pos - b.pos))
			.map((e) => {
				return { ...e, selected_product_feature_options: e.product_feature_options.map((op) => op.product_feature_option_id) };
			});

		// data.general_product_variant_ids = [];
		// for (const variant of general_product_data.variants.sort((a, b) => Math.sign(a._meta_pos - b._meta_pos))) {
		// 	data.general_product_variant_ids.push(variant.general_product_variant_id);
		// }

		// data.general_product_variant_option_ids = [];
		// for (const option_data of general_product_data.variant_options.sort((a, b) => Math.sign(a._meta_pos - b._meta_pos))) {
		// 	data.general_product_variant_option_ids.push(option_data.general_product_variant_option_id);
		// }

		product_comp._render();

		// dont cmon
		product_comp._add_missing_products({ pls_add_columns: true });

		// lazyloading won't work nicely because there is some lag
	}
	product_comp._render();

	finishComponentsOptimization();
	product_comp.style.visibility = "";

	// a common variant is necessary to tell which options are... common, for the search dude
	data = product_comp._data;
	const common_variant = data.variants.find((v) => v.common);

	let requesting_common_variant = false;
	let requesting_common_variant_option = false;

	const checkOption = () => {
		data = product_comp._data;
		const common_variant = data.variants.find((v) => v.common);
		if (!common_variant || common_variant.options.length !== 0 || requesting_common_variant_option) {
			return;
		}
		const common_variant_index = data.variants.findIndex((v) => v.common);

		requesting_common_variant_option = true;

		/** @type {Product_VariantComp} */
		// @ts-ignore
		const product_variant_comp = product_comp._direct_children()[common_variant_index]._child("product_variant-comp");
		if (product_variant_comp) {
			product_variant_comp._add_variant_option({
				callback: () => {
					requesting_common_variant_option = false;
				},
			});
		}
	};

	if (!common_variant) {
		if (!requesting_common_variant) {
			// must be first, otherwise sorting might be glitchy duuuudee, ofc if we hide it
			requesting_common_variant = true;
			product_comp._add_variant({
				common: 1,
				callback: () => {
					requesting_common_variant = false;
					setTimeout(() => {
						checkOption();
					});
				},
			});
		}
	} else {
		setTimeout(() => {
			checkOption();
		});
	}
});
