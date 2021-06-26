/* js[piep_cms_dependencies] */
{
	const grid_priority = 100;

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

	piep_cms_manager.registerProp({
		name: "grid_template",
		blc_groups: [{ module_names: ["grid"], priority: grid_priority }],
		type_groups: ["layout"],
		menu_html: html`
			<div class="label">
				Kolumny siatki
				<div class="columns_icon">
					<div></div>
					<div></div>
					<div></div>
				</div>
			</div>
			<input class="hidden" data-blc_prop="styles.gridTemplateColumns" />
			<div class="grid_template grid_columns"></div>
			<button class="btn primary small add_btn" data-template="columns">Dodaj kolumnę <i class="fas fa-plus"></i></button>

			<div class="label">
				Wiersze siatki
				<div class="columns_icon vertical">
					<div></div>
					<div></div>
					<div></div>
				</div>
			</div>
			<input class="hidden" data-blc_prop="styles.gridTemplateRows" />
			<div class="grid_template grid_rows"></div>
			<button class="btn primary small add_btn" data-template="rows">Dodaj wiersz <i class="fas fa-plus"></i></button>
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
							<button class="btn subtle small move_btn" ${index === template.length - 1 ? "disabled" : ""} data-dir="1">
								<i class="fas fa-chevron-down"></i>
							</button>
							<button class="btn subtle small move_btn" ${index === 0 ? "disabled" : ""} data-dir="-1">
								<i class="fas fa-chevron-up"></i>
							</button>
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

				const template_id = template_row ? +template_row.dataset.index : undefined;

				if (remove_btn) {
					const input = template_row.dataset.template === "columns" ? columns_input : rows_input;
					/** @type {string[]} */
					const template = input._get_value().split(" ");
					template.splice(template_id, 1);
					input._set_value(template.join(" "));
				}
				const add_btn = target._parent(".add_btn");
				if (add_btn) {
					const input = add_btn.dataset.template === "columns" ? columns_input : rows_input;
					/** @type {string[]} */
					const template = input._get_value().split(" ");
					template.push(add_btn.dataset.template === "columns" ? "1fr" : "auto");
					input._set_value(template.join(" "));
				}

				const move_btn = target._parent(".move_btn");
				if (move_btn) {
					const input = template_row.dataset.template === "columns" ? columns_input : rows_input;
					/** @type {string[]} */
					const template = input._get_value().split(" ");
					const next_id = +move_btn.dataset.dir + template_id;
					const next_ref = template[next_id];
					template[next_id] = template[template_id];
					template[template_id] = next_ref;
					input._set_value(template.join(" "));
				}
			});
		},
	});

	piep_cms_manager.registerProp({
		name: "grid_actions",
		blc_groups: [{ module_names: ["grid"], priority: grid_priority }],
		type_groups: ["layout"],
		menu_html: html`
			<div class="label">Szybka modyfikacja siatki</div>
			<button class="btn primary quick_edit_btn" data-tooltip="Obróć w lewo o 90°" data-action="left">
				<i class="fas fa-undo"></i>
			</button>
			<button class="btn primary quick_edit_btn" data-tooltip="Obróć w prawo o 90°" data-action="right">
				<i class="fas fa-redo"></i>
			</button>
			<button class="btn primary quick_edit_btn" data-tooltip="Obróć w poziomie" data-action="horizontal">
				<i class="fas fa-arrows-alt-h flip_icon"></i>
			</button>
			<button class="btn primary quick_edit_btn" data-tooltip="Obróć w pionie" data-action="vertical">
				<i class="fas fa-arrows-alt-v flip_icon"></i>
			</button>
		`,
		init: (piep_cms, menu_wrapper) => {
			menu_wrapper.addEventListener("click", (ev) => {
				const target = $(ev.target);
				const quick_edit_btn = target._parent(".quick_edit_btn");
				if (quick_edit_btn) {
					const action = quick_edit_btn.dataset.action;
					const v_node = piep_cms.getVNodeById(piep_cms.focus_node_vid);
					const grid_styles = v_node.styles[piep_cms.selected_resolution];
					if (action === "horizontal") {
						/** @type {string[]} */
						const gtc = grid_styles.gridTemplateColumns.split(" ").reverse();
						grid_styles.gridTemplateColumns = gtc.join(" ");
						v_node.children.forEach((child) => {
							const styles = child.styles[piep_cms.selected_resolution];
							const was_start = +styles.gridColumnStart;
							const was_end = +styles.gridColumnEnd;
							styles.gridColumnStart = gtc.length + 2 - was_end + "";
							styles.gridColumnEnd = gtc.length + 2 - was_start + "";
						});
					} else if (action === "vertical") {
						/** @type {string[]} */
						const gtr = grid_styles.gridTemplateRows.split(" ").reverse();
						grid_styles.gridTemplateRows = gtr.join(" ");
						v_node.children.forEach((child) => {
							const styles = child.styles[piep_cms.selected_resolution];
							const was_start = +styles.gridRowStart;
							const was_end = +styles.gridRowEnd;
							styles.gridRowStart = gtr.length + 2 - was_end + "";
							styles.gridRowEnd = gtr.length + 2 - was_start + "";
						});
					} else if (action === "left") {
						/** @type {string[]} */
						const gtr = grid_styles.gridTemplateColumns.split(" ").reverse();
						/** @type {string[]} */
						const gtc = grid_styles.gridTemplateRows.split(" ");
						grid_styles.gridTemplateRows = gtr.join(" ");
						grid_styles.gridTemplateColumns = gtc.join(" ");
						v_node.children.forEach((child) => {
							const styles = child.styles[piep_cms.selected_resolution];
							const was_col_start = +styles.gridColumnStart;
							const was_col_end = +styles.gridColumnEnd;
							const was_row_start = +styles.gridRowStart;
							const was_row_end = +styles.gridRowEnd;
							styles.gridColumnStart = was_row_start + "";
							styles.gridColumnEnd = was_row_end + "";
							styles.gridRowStart = gtr.length + 2 - was_col_end + "";
							styles.gridRowEnd = gtr.length + 2 - was_col_start + "";
						});
					} else if (action === "right") {
						/** @type {string[]} */
						const gtr = grid_styles.gridTemplateColumns.split(" ");
						/** @type {string[]} */
						const gtc = grid_styles.gridTemplateRows.split(" ").reverse();
						grid_styles.gridTemplateRows = gtr.join(" ");
						grid_styles.gridTemplateColumns = gtc.join(" ");
						v_node.children.forEach((child) => {
							const styles = child.styles[piep_cms.selected_resolution];
							const was_col_start = +styles.gridColumnStart;
							const was_col_end = +styles.gridColumnEnd;
							const was_row_start = +styles.gridRowStart;
							const was_row_end = +styles.gridRowEnd;
							styles.gridColumnStart = gtc.length + 2 - was_row_start + "";
							styles.gridColumnEnd = gtc.length + 2 - was_row_end + "";
							styles.gridRowStart = was_col_end + "";
							styles.gridRowEnd = was_col_start + "";
						});
					}

					piep_cms.update({ all: true });
					piep_cms.setBlcMenuFromFocusedNode();
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

	// piep_cms_manager.registerProp({
	// 	name: "grid_area",
	// 	blc_groups: [{ matcher: gridCellMatcher, priority: grid_priority }],
	// 	type_groups: ["layout"],
	// 	menu_html: html`
	// 		<div class="label">Pozycja w siatce</div>
	// 		row start
	// 		<input class="field" data-blc_prop="styles.gridRowStart" />
	// 		column start
	// 		<input class="field" data-blc_prop="styles.gridColumnStart" />
	// 		row end
	// 		<input class="field" data-blc_prop="styles.gridRowEnd" />
	// 		column end
	// 		<input class="field" data-blc_prop="styles.gridColumnEnd" />
	// 	`,
	// });

	piep_cms_manager.registerBlcSchema({
		id: "grid",
		icon: html`<i class="fas fa-border-all"></i>`,
		label: html`Siatka`,
		group: "container",
		standalone: true,
		cannot_nest_in_itself: true,
		layout_schema: "has_content",
		priority: 20,
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
				// {
				// 	id: -1,
				// 	tag: "div",
				// 	styles: {
				// 		df: {
				// 			gridRowStart: "1",
				// 			gridColumnStart: "1",
				// 			gridRowEnd: "2",
				// 			gridColumnEnd: "2",
				// 		},
				// 	},
				// 	attrs: {},
				// 	classes: ["vertical_container"],
				// 	children: [],
				// },
				// {
				// 	id: -1,
				// 	tag: "div",
				// 	styles: {
				// 		df: {
				// 			gridRowStart: "1",
				// 			gridColumnStart: "2",
				// 			gridRowEnd: "2",
				// 			gridColumnEnd: "3",
				// 		},
				// 	},
				// 	attrs: {},
				// 	classes: ["vertical_container"],
				// 	children: [],
				// },
			],
		},
		render: (v_node, node, piep_cms) => {
			/** @type {string} */
			const grid_template_columns = def(piep_cms.getVNodeResponsiveProp("styles", v_node, "gridTemplateColumns"), "");
			/** @type {string} */
			const grid_template_rows = def(piep_cms.getVNodeResponsiveProp("styles", v_node, "gridTemplateRows"), "");
			const columns = grid_template_columns.split(" ");
			const rows = grid_template_rows.split(" ");
			/** @type {string[]} */
			const classes = [];
			for (let r = 1; r < rows.length + 1; r++) {
				for (let c = 1; c < columns.length + 1; c++) {
					let cls = `cell_${r}_${c}`;
					classes.push(cls);
					if (!node._child("." + cls)) {
						node.insertAdjacentHTML(
							"beforeend",
							html`<div class="cell_float ${cls}" style="grid-area:${r}/${c}/${r + 1}/${c + 1}" data-r="${r}" data-c="${c}"></div>`
						);
					}
				}
			}

			const select_cells_to_remove = ".cell_float" + classes.map((e) => `:not(.${e})`).join("");
			node._children(select_cells_to_remove).forEach((r) => {
				r.remove();
			});
		},
	});
}
