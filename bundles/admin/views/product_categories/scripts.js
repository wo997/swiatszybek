/* js[view] */

domload(() => {
	/** @type {ProductCategoriesComp} */
	// @ts-ignore
	const product_categories_comp = $("product-categories-comp.main");

	productCategoriesComp(product_categories_comp, undefined, {
		categories: [
			{
				name: "Nazwa",
				category_list: {
					categories: [
						{
							name: "Nazwa x",
							category_list: {
								categories: [
									{
										name: "Nazwa z",
										category_list: {
											categories: [],
										},
									},
									{
										name: "Nazwa z",
										category_list: {
											categories: [],
										},
									},
								],
							},
						},
						{
							name: "Nazwa x",
							category_list: {
								categories: [
									{
										name: "Nazwa z",
										category_list: {
											categories: [],
										},
									},
									{
										name: "Nazwa z",
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
				name: "Nazwa xxxxxxx",
				category_list: {
					categories: [
						{
							name: "Nazwa zasxaxs",
							category_list: {
								categories: [],
							},
						},
						{
							name: "Nazwa zasdadsasd",
							category_list: {
								categories: [],
							},
						},
						{
							name: "Nazwa 453453",
							category_list: {
								categories: [],
							},
						},
					],
				},
			},
			{
				name: "Nazwa xxxxxxx 8888888",
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
	});
});
