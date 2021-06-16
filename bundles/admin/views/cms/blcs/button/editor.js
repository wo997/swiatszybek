/* js[piep_cms_dependencies] */
{
	const vertical_container_priority = 10;

	/**
	 *
	 * @param {vDomNodeData} v_node_data
	 * @returns
	 */
	const inVerticalContainerMatcher = (v_node_data) => {
		const parent_v_node = v_node_data.parent_v_nodes[0];
		return !parent_v_node || parent_v_node.classes.includes("vertical_container");
	};

	/**
	 *
	 * @param {vDomNodeData} v_node_data
	 * @returns
	 */
	const verticalContainerMatcher = (v_node_data) => {
		return v_node_data.v_node.classes.includes("vertical_container");
	};

	piep_cms_manager.registerBlcSchema({
		id: "button",
		// <i class="vertical_container_icon">
		//     <div></div>
		//     <div></div>
		//     <div></div>
		// </i>
		icon: html`<i class="fas fa-hand-pointer"></i>`,
		label: html`Przycisk (jeszcze nie działa)`,
		group: "module",
		standalone: true,
		priority: 50,
		v_node: {
			tag: "button",
			id: -1,
			children: [
				{
					tag: "p",
					id: -1,
					styles: {},
					classes: [],
					attrs: {},
					children: [
						{
							id: -1,
							tag: "span",
							text: "Przycisk",
							attrs: {},
							classes: [],
							styles: {},
						},
					],
				},
			],
			styles: {
				df: {},
			},
			classes: ["vertical_container", "btn", "primary"],
			module_name: "button",
			attrs: {},
		},
	});
}
