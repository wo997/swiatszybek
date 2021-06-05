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

	const gap_unit_input = html`
		<input />
		<select>
			<option value="" class="novalue">-</option>
			<option value="px">px</option>
			<option value="var(--default_padding)" class="novalue">Domyślny</option>
			<option value="0" class="novalue">Brak</option>
			<option value="*" class="case_advanced">*</option>
		</select>
	`;

	piep_cms_manager.registerProp({
		name: "grid_gap",
		blc_groups: [{ module_names: ["grid"], priority: grid_priority }],
		type_groups: ["layout"],
		menu_html: html`
			<div class="label">Odstępy pomiędzy komórkami</div>
			<div class="flex">
				<div class="fill">
					<div class="label">
						Poziome
						<i class="fas fa-arrows-alt-h"></i>
					</div>
					<unit-input data-blc_prop="styles.columnGap"> ${gap_unit_input} </unit-input>
					<div class="responsive_info"></div>
				</div>
				<div class="ml2 fill">
					<div class="label">
						Pionowe
						<i class="fas fa-arrows-alt-v"></i>
					</div>
					<unit-input data-blc_prop="styles.rowGap"> ${gap_unit_input} </unit-input>
					<div class="responsive_info"></div>
				</div>
			</div>
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
					columnGap: "var(--default_padding)",
					rowGap: "var(--default_padding)",
					paddingLeft: "var(--default_padding)",
					paddingTop: "var(--default_padding)",
					paddingRight: "var(--default_padding)",
					paddingBottom: "var(--default_padding)",
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
