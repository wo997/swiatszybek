/* js[view] */

domload(() => {
	/** @type {ProductComp} */
	// @ts-ignore
	const my_list_node = $("product-comp");

	productComp(my_list_node, undefined, {
		id: 5,
		name: "asdsad",
		sell_by: "qty",
		variants: [
			{ name: "123", email: "555" },
			{ name: "", email: "" },
		],
	});
});
