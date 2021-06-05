/* js[piep_cms_dependencies] */
{
	const grid_priority = 10;

	piep_cms_manager.registerBlcSchema({
		id: "grid",
		icon: html`<i class="fas fa-border-all"></i>`,
		label: html`Siatka`,
		group: "container",
		standalone: true,
		priority: 10,
		v_node: {
			tag: "div",
			id: -1,
			styles: {
				df: {
					gridTemplateColumns: "1fr 1fr",
				},
			},
			classes: [],
			attrs: {},
			settings: {},
			module_name: "grid",
			children: [
				{
					id: -1,
					tag: "div",
					styles: {
						df: {
							gridArea: "1 / 1 / 2 / 2",
						},
					},
					attrs: {},
					classes: ["vertical_container"],
					children: [],
				},
				{
					id: -1,
					tag: "div",
					styles: {
						df: {
							gridArea: "1 / 2 / 2 / 3",
						},
					},
					attrs: {},
					classes: ["vertical_container"],
					children: [],
				},
			],
		},
	});
}
