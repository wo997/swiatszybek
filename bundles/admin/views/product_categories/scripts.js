/* js[view] */

domload(() => {
	/** @type {ProductCategoriesComp} */
	// @ts-ignore
	const product_categories_comp = $("product-categories-comp.categories");

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
								],
							},
						},
					],
				},
			},
		],
	});
});
