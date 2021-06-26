/* js[piep_cms_dependencies] */
{
	// const vertical_container_priority = 10;

	// /**
	//  *
	//  * @param {vDomNodeData} v_node_data
	//  * @returns
	//  */
	// const inVerticalContainerMatcher = (v_node_data) => {
	// 	const parent_v_node = v_node_data.parent_v_nodes[0];
	// 	return !parent_v_node || parent_v_node.classes.includes("vertical_container");
	// };

	// /**
	//  *
	//  * @param {vDomNodeData} v_node_data
	//  * @returns
	//  */
	// const verticalContainerMatcher = (v_node_data) => {
	// 	return v_node_data.v_node.classes.includes("vertical_container");
	// };

	piep_cms_manager.registerBlcSchema({
		id: "text_list",
		icon: html`<i class="fas fa-list-ul"></i>`,
		label: html`Lista`,
		priority: 30,
		layout_schema: "has_content",
		group: "text",
		v_node: {
			tag: "ul",
			id: -1,
			children: [
				{
					id: -1,
					tag: "li",
					attrs: {},
					classes: [],
					styles: {},
					children: [
						{
							id: -1,
							tag: "span",
							text: "Element listy",
							attrs: {},
							classes: [],
							styles: {},
						},
					],
				},
			],
			styles: {
				df: {
					paddingTop: "var(--default_padding)",
					paddingBottom: "var(--default_padding)",
				},
			},
			classes: [],
			attrs: {},
		},
	});

	piep_cms_manager.registerBlcSchema({
		group: "text",
		icon: html`<i class="fas fa-font"></i>`,
		id: "li",
		label: "Element listy",
		v_node: {
			id: -1,
			tag: "li",
			text: "",
			attrs: {},
			classes: [],
			styles: {},
		},
		layout_schema: "just_content",
		exclude_from_add_blc_menu: true,
	});
}
