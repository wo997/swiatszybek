/* js[piep_cms_dependencies] */
{
	const grid_priority = 100;

	/**
	 *
	 * @param {vDomNodeData} v_node_data
	 * @returns
	 */
	const gridCellMatcher = (v_node_data) => {
		const parent = v_node_data.parent_v_nodes[0];
		if (parent && parent.module_name === "grid") {
			return true;
		}
		return false;
	};

	piep_cms_manager.registerProp({
		name: "grid_template_columns",
		blc_groups: [{ module_names: ["grid"], priority: grid_priority }],
		type_groups: ["layout"],
		menu_html: html`
			<div class="label">Kolumny siatki</div>
			<input class="field" data-blc_prop="styles.gridTemplateColumns" />
		`,
	});

	piep_cms_manager.registerProp({
		name: "grid_template_rows",
		blc_groups: [{ module_names: ["grid"], priority: grid_priority }],
		type_groups: ["layout"],
		menu_html: html`
			<div class="label">Wiersze siatki</div>
			<input class="field" data-blc_prop="styles.gridTemplateRows" />
		`,
	});

	piep_cms_manager.registerProp({
		name: "grid_area",
		blc_groups: [{ matcher: gridCellMatcher, priority: grid_priority }],
		type_groups: ["layout"],
		menu_html: html`
			<div class="label">Pozycja w siatce</div>
			row start
			<input class="field" data-blc_prop="styles.gridRowStart" />
			column start
			<input class="field" data-blc_prop="styles.gridColumnStart" />
			row end
			<input class="field" data-blc_prop="styles.gridRowEnd" />
			column end
			<input class="field" data-blc_prop="styles.gridColumnEnd" />
		`,
	});

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
					gridTemplateRows: "1fr",
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
							gridRowStart: "1",
							gridColumnStart: "1",
							gridRowEnd: "2",
							gridColumnEnd: "2",
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
							gridRowStart: "1",
							gridColumnStart: "2",
							gridRowEnd: "2",
							gridColumnEnd: "3",
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
