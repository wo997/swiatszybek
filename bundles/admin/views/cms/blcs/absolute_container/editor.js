/* js[piep_cms_dependencies] */
{
	const priority = 100;

	/**
	 *
	 * @param {vDomNodeData} v_node_data
	 * @returns
	 */
	const absoluteBlcMatcher = (v_node_data) => {
		const parent = v_node_data.parent_v_nodes[0];
		if (parent && parent.module_name === "absolute_container") {
			return true;
		}
		return false;
	};

	const position_unit_input = html`
		<input />
		<select>
			<option value="" class="novalue">-</option>
			<option value="%">%</option>
			<option value="px">px</option>
			<option value="var(--default_padding)" class="novalue">Domyślny</option>
			<option value="0" class="novalue">Brak</option>
			<option value="*" class="case_advanced">*</option>
		</select>
	`;

	piep_cms_manager.registerProp({
		name: "absolute_position",
		blc_groups: [{ matcher: absoluteBlcMatcher, priority }],
		type_groups: ["layout"],
		menu_html: html`
			<div class="label">Pozycja w kontenerze absolutnym</div>
			<div class="combo_directions" data-bind_wrapper="margins">
				<div class="top">
					<unit-input data-blc_prop="styles.top" data-bind_dir="top"> ${position_unit_input} </unit-input>
					<div class="responsive_info"></div>
				</div>
				<div class="left">
					<unit-input data-blc_prop="styles.left" data-bind_dir="left"> ${position_unit_input} </unit-input>
					<div class="responsive_info"></div>
				</div>
				<div class="right">
					<unit-input data-blc_prop="styles.right" data-bind_dir="right"> ${position_unit_input} </unit-input>
					<div class="responsive_info"></div>
				</div>
				<div class="bottom">
					<unit-input data-blc_prop="styles.bottom" data-bind_dir="bottom"> ${position_unit_input} </unit-input>
					<div class="responsive_info"></div>
				</div>
			</div>
		`,
	});

	piep_cms_manager.registerBlcSchema({
		id: "absolute_container",
		icon: html`<i class="fas fa-anchor"></i>`,
		label: html`Kontener absolutny`,
		group: "container",
		standalone: true,
		cannot_nest_in_itself: true,
		priority: 10,
		can_have_aspect_ratio: true,
		layout_schema: "has_content",
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
