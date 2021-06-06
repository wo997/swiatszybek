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
		name: "grid_template",
		blc_groups: [{ module_names: ["grid"], priority: grid_priority }],
		type_groups: ["layout"],
		menu_html: html`
			<div class="label">Kolumny siatki</div>
			<input class="hidden" data-blc_prop="styles.gridTemplateColumns" />
			<div class="grid_columns"></div>

			<div class="label">Wiersze siatki</div>
			<input class="hidden" data-blc_prop="styles.gridTemplateRows" />
			<div class="grid_rows"></div>
		`,
		init: (piep_cms, menu_wrapper) => {
			const grid_columns = menu_wrapper._child(".grid_columns");
			const grid_rows = menu_wrapper._child(".grid_rows");
			const columns_input = menu_wrapper._child(`[data-blc_prop="styles.gridTemplateColumns"]`);
			const rows_input = menu_wrapper._child(`[data-blc_prop="styles.gridTemplateRows"]`);

			let ignore_render = false;

			/**
			 *
			 * @param {PiepNode} input
			 * @param {string} name
			 * @param {PiepNode} display
			 */
			const render_template = (input, name, display) => {
				if (ignore_render) {
					return;
				}

				/** @type {string[]} */
				const template = input._get_value().split(" ");
				let grid_html = "";
				template.forEach((column, index) => {
					grid_html += html`
						<div class="template_row" data-index="${index}" data-template="${name}">
							<unit-input class="inline_flex">
								<input class="small" />
								<select class="small">
									<option value="fr">fr</option>
									<option value="auto" class="novalue">Automatyczny</option>
									<option value="px">px</option>
									<option value="%">%</option>
									<option value="*" class="case_advanced">*</option>
								</select>
							</unit-input>
							<button class="btn subtle small remove_btn" ${template.length === 1 ? "disabled" : ""}>
								<i class="fas fa-times"></i>
							</button>
						</div>
					`;
				});
				display._set_content(grid_html);
				registerForms();

				display._children(".template_row").forEach((e, index) => {
					const ui = e._child("unit-input");
					ui._set_value(template[index], { quiet: true });

					const upd = () => {
						template[index] = ui._get_value();
						ignore_render = true;
						input._set_value(template.join(" "));
						ignore_render = false;
					};
					ui.addEventListener("input", upd);
					ui.addEventListener("change", upd);
				});
			};

			columns_input.addEventListener("value_set", () => {
				render_template(columns_input, "columns", grid_columns);
			});

			rows_input.addEventListener("value_set", () => {
				render_template(rows_input, "rows", grid_rows);
			});

			menu_wrapper.addEventListener("click", (ev) => {
				const target = $(ev.target);

				const template_row = target._parent(".template_row");
				const remove_btn = target._parent(".remove_btn");
				if (remove_btn) {
					const input = template_row.dataset.template === "columns" ? columns_input : rows_input;
					/** @type {string[]} */
					const template = input._get_value().split(" ");
					template.splice(+template_row.dataset.index, 1);
					input._set_value(template.join(" "));
				}
			});
		},
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
					gridTemplateRows: "auto",
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
