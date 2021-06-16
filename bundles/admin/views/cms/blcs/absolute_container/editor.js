/* js[piep_cms_dependencies] */
{
	const priority = 100;

	// /**
	//  *
	//  * @param {vDomNodeData} v_node_data
	//  * @returns
	//  */
	// const gridCellMatcher = (v_node_data) => {
	// 	const parent = v_node_data.parent_v_nodes[0];
	// 	if (parent && parent.module_name === "grid") {
	// 		return true;
	// 	}
	// 	return false;
	// };

	piep_cms_manager.registerBlcSchema({
		id: "absolute_container",
		icon: html`<i class="fas fa-anchor"></i>`,
		label: html`Kontener absolutny`,
		group: "container",
		standalone: true,
		cannot_nest_in_itself: true,
		priority: 10,
		can_have_aspect_ratio: true,
		v_node: {
			tag: "div",
			id: -1,
			styles: {
				df: {
					"--aspect_ratio": "40",
				},
			},
			classes: [],
			attrs: {},
			settings: {},
			module_name: "absolute_container",
			children: [],
		},
	});
}
