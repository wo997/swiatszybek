/* js[view] */

function refreshProductCategories() {
	xhr({
		url: STATIC_URLS["ADMIN"] + "product/categories/all_with_options",
		success: (res) => {
			product_categories = res.categories;
			window.dispatchEvent(new CustomEvent("product_categories_changed"));
		},
	});
}

domload(() => {
	/** @type {ProductCategoriesComp} */
	// @ts-ignore
	const product_categories_comp = $("product-categories-comp");

	let d = {
		categories: [
			{
				product_category_id: 4,
				name: "Nazwa",
				category_list: {
					categories: [
						{
							name: "x",
							category_list: {
								categories: [
									{
										name: "Nazwa z",
										category_list: {
											categories: [],
										},
									},
									{
										name: "mmm",
										category_list: {
											categories: [],
										},
									},
								],
							},
						},
						{
							name: "mmm",
							category_list: {
								categories: [],
							},
						},
						{
							name: "2 x",
							category_list: {
								categories: [
									{
										name: "Nazwa z",
										category_list: {
											categories: [],
										},
									},
									{
										name: "z",
										category_list: {
											categories: [],
										},
									},
									{
										name: "Nazwa casd",
										category_list: {
											categories: [],
										},
									},
								],
							},
						},
					],
				},
			},
			{
				name: "4 xxxxxxx",
				category_list: {
					categories: [
						{
							name: "6 zasxaxs",
							category_list: {
								categories: [],
							},
						},
						{
							name: "7 zasdadsasd",
							category_list: {
								categories: [],
							},
						},
						{
							name: "8 453453",
							category_list: {
								categories: [],
							},
						},
					],
				},
			},
			{
				name: "LL xxxxxxx 8888888",
				category_list: {
					categories: [
						{
							name: "Nazwa zasxaxs 8888888",
							category_list: {
								categories: [],
							},
						},
						{
							name: "Nazwa zasdadsasd 8888888",
							category_list: {
								categories: [],
							},
						},
						{
							name: "Nazwa 453453 8888888",
							category_list: {
								categories: [],
							},
						},
					],
				},
			},
		],
	};

	//d.categories = [...d.categories, ...d.categories, ...d.categories, ...d.categories];
	//d.categories = [...d.cloneObject(d.categories), ...cloneObject(d.categories)];
	let arr = [];
	d.categories.forEach((e) => {
		arr.push(cloneObject(e));
		//arr.push(cloneObject(e));
		//arr.push(cloneObject(e));
		//arr.push(cloneObject(e));
	});
	d.categories.push(...arr);

	productCategoriesComp(product_categories_comp, undefined, { category_list: d });
});
