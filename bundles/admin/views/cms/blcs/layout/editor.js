/* js[piep_cms_dependencies] */
{
	// maybe include inline blocks later ;)
	const layout_blc_groups = [{ match_tag: piep_cms_manager.match_textables, priority: 15, exclude: true }];

	piep_cms_manager.registerProp({
		name: "width_type",
		blc_groups: [
			{
				matcher: (v_node_data) => {
					if (v_node_data.v_node.tag.match(piep_cms_manager.match_textables)) {
						return false;
					}
					const parent = v_node_data.parent_v_nodes[0];
					if (parent && parent.classes.includes("columns_container")) {
						return false;
					}
					return true;
				},
				priority: 15,
			},
		],
		type_groups: ["layout"],
		menu_html: html`
			<div class="label">Typ wyznaczania szerokości</div>
			<div class="pretty_radio pretty_blue" data-blc_prop="responsive_settings.width_type" style="--columns:2">
				<div class="checkbox_area">
					<p-checkbox data-value="full"></p-checkbox>
					<div class="container_layout_type_icon">
						<div class="b" style="flex-grow:1"></div>
					</div>
					<span>100%</span>
				</div>
				<div class="checkbox_area">
					<p-checkbox data-value="default_container"></p-checkbox>
					<div class="container_layout_type_icon" style="justify-content:center">
						<div class="a"></div>
						<div class="b"></div>
						<div class="c"></div>
					</div>
					<span>Domyślna</span>
				</div>
				<div class="checkbox_area">
					<p-checkbox data-value="auto"></p-checkbox>
					<div class="container_layout_type_icon">
						<div class="b" style="width:auto;font-size: 0.5em;">Abc</div>
					</div>
					<span>Zawartość</span>
				</div>
				<div class="checkbox_area">
					<p-checkbox data-value="custom"></p-checkbox>
					<div class="container_layout_type_icon">
						<div class="b">
							<i class="fas fa-cog" style="font-size: 0.5em;"></i>
						</div>
					</div>
					<span>Dowolna</span>
				</div>
				<div class="checkbox_area empty case_non_desktop">
					<p-checkbox data-value=""></p-checkbox>
					<span>-</span>
				</div>
			</div>
		`,
		init: (piep_cms, width_type_wrapper) => {
			const width_wrapper = piep_cms.side_menu._child(".prop_width");
			const min_max_width_wrapper = piep_cms.side_menu._child(".prop_min_max_width");
			const width_type_input = width_type_wrapper._child(`[data-blc_prop="responsive_settings.width_type"]`);
			const align_self_horizontally_wrapper = piep_cms.side_menu._child(".prop_align_self_horizontally");
			width_type_input.addEventListener("value_set", () => {
				const width_type = width_type_input._get_value();
				align_self_horizontally_wrapper.classList.toggle("hidden_completely", width_type === "full");
				width_wrapper.classList.toggle("hidden_completely", width_type !== "custom");
				min_max_width_wrapper.classList.toggle("hidden_completely", width_type !== "custom");
			});
		},
	});

	piep_cms_manager.registerProp({
		name: "width",
		blc_groups: layout_blc_groups,
		type_groups: ["layout"],
		menu_html: html`
			<div class="label">Szerokość</div>
			<unit-input data-blc_prop="styles.width">
				<input />
				<select>
					<option value="%">%</option>
					<option value="px">px</option>
					<option value="*" class="case_advanced">*</option>
				</select>
			</unit-input>
		`,
	});

	piep_cms_manager.registerProp({
		name: "min_max_width",
		blc_groups: [
			{
				matcher: (v_node_data) => {
					if (v_node_data.v_node.tag.match(piep_cms_manager.match_textables)) {
						return false;
					}
					const parent = v_node_data.parent_v_nodes[0];
					if (parent && parent.classes.includes("columns_container")) {
						return false;
					}
					return true;
				},
				priority: 15,
			},
		],
		type_groups: ["layout"],
		menu_html: html`
			<div class="glue_children max_min_options">
				<div class="mr2 case_advanced">
					<div class="label">Szerokość min.</div>
					<unit-input data-blc_prop="styles.minWidth">
						<input />
						<select>
							<option value="px">px</option>
							<option value="%">%</option>
							<option value="*" class="case_advanced">*</option>
						</select>
					</unit-input>
				</div>

				<div>
					<div class="label">Szerokość max.</div>
					<unit-input data-blc_prop="styles.maxWidth">
						<input />
						<select>
							<option value="px">px</option>
							<option value="%">%</option>
							<option value="*" class="case_advanced">*</option>
						</select>
					</unit-input>
				</div>
			</div>
		`,
	});

	piep_cms_manager.registerProp({
		name: "height",
		type_groups: ["layout"],
		blc_groups: [{ match_tag: piep_cms_manager.match_textables, priority: 5, exclude: true }],
		menu_html: html`
			<div class="case_has_aspect_ratio">
				<div class="label">Stały stosunek szerokość / wysokość</div>
				<div class="glue_children">
					<input class="field" data-blc_prop="styles.--aspect_ratio" />
					<div class="field_desc">% szerokości</div>
				</div>
			</div>

			<div class="case_no_aspect_ratio">
				<div class="label">Wysokość</div>
				<unit-input data-blc_prop="styles.height">
					<input />
					<select>
						<option value="px">px</option>
						<option value="%">%</option>
						<option value="vw">vw</option>
						<option value="*" class="case_advanced">*</option>
					</select>
				</unit-input>
			</div>
		`,
		init: (piep_cms, menu_wrapper) => {
			const case_has_aspect_ratio = menu_wrapper._child(".case_has_aspect_ratio");
			const height_input = menu_wrapper._child(`[data-blc_prop="styles.height"]`);
			const ratio_input = menu_wrapper._child(`[data-blc_prop="styles.--aspect_ratio"]`);

			// const heightHasSomeValue = () => {
			// 	return numberFromStr(height_input._get_value());
			// };
			const ratioHasSomeValue = () => {
				return ratio_input._get_value();
			};

			const render = () => {
				const v_node = piep_cms.getVNodeById(piep_cms.focus_node_vid);
				const schema = piep_cms_manager.getVNodeSchema(v_node);

				const can_have_aspect_ratio = !!(schema && schema.can_have_aspect_ratio);

				case_has_aspect_ratio.classList.toggle("hidden", !can_have_aspect_ratio);

				const rhsv = can_have_aspect_ratio ? ratioHasSomeValue() : false;
				piep_cms.side_menu._children(".case_no_aspect_ratio").forEach((e) => {
					e.classList.toggle("inactive", rhsv);
				});
			};

			height_input.addEventListener("change", render);
			height_input.addEventListener("input", render);
			height_input.addEventListener("value_set", render);
			ratio_input.addEventListener("change", render);
			ratio_input.addEventListener("input", render);
			ratio_input.addEventListener("value_set", render);
		},
	});

	piep_cms_manager.registerProp({
		name: "min_max_height",
		type_groups: ["layout"],
		blc_groups: [{ match_tag: piep_cms_manager.match_textables, priority: 5, exclude: true }],
		menu_html: html`
			<div class="glue_children case_no_aspect_ratio">
				<div class="mr2">
					<div class="label">Wysokość min.</div>
					<unit-input data-blc_prop="styles.minHeight">
						<input />
						<select>
							<option value="px">px</option>
							<option value="*" class="case_advanced">*</option>
						</select>
					</unit-input>
				</div>

				<div class="case_advanced">
					<div class="label">Maksymalna max.</div>
					<unit-input data-blc_prop="styles.maxHeight">
						<input />
						<select>
							<option value="px">px</option>
							<option value="*" class="case_advanced">*</option>
						</select>
					</unit-input>
				</div>
			</div>
		`,
	});

	const margin_unit_input = html`
		<input />
		<select>
			<option value="" class="novalue">-</option>
			<option value="px">px</option>
			<option value="%">%</option>
			<option value="var(--default_padding)" class="novalue">Domyślny</option>
			<option value="auto" class="novalue case_advanced">Automatyczny</option>
			<option value="0" class="novalue">Brak</option>
			<option value="*" class="case_advanced">*</option>
		</select>
	`;

	const padding_unit_input = html`
		<input />
		<select>
			<option value="" class="novalue">-</option>
			<option value="px">px</option>
			<option value="%">%</option>
			<option value="var(--default_padding)" class="novalue">Domyślny</option>
			<option value="0" class="novalue">Brak</option>
			<option value="*" class="case_advanced">*</option>
		</select>
	`;

	const border_width_unit_input = html`
		<input />
		<select>
			<option value="" class="novalue">-</option>
			<option value="px">px</option>
			<option value="0" class="novalue">Brak</option>
			<option value="*" class="case_advanced">*</option>
		</select>
	`;

	piep_cms_manager.registerProp({
		name: "margin",
		type_groups: ["layout"],
		blc_groups: layout_blc_groups,
		menu_html: html` <div class="label">
				<div class="layout_info_rect" style="background: var(--margin_control_clr);"></div>
				Margines zewnętrzny
			</div>

			<div class="pretty_radio pretty_blue mb2" data-blc_prop="responsive_settings.bind_margins" style="--columns:3">
				<div class="checkbox_area" data-tooltip="Wszystkie marginesy są tej samej długości">
					<p-checkbox data-value="all"></p-checkbox>
					<img src="/src/img/bind_all_directions.svg" class="bind_directions_icon" />
				</div>
				<div class="checkbox_area" data-tooltip="Marginesy pionowe oraz poziome są tej samej długości">
					<p-checkbox data-value="opposite"></p-checkbox>
					<img src="/src/img/bind_hor_ver.svg" class="bind_directions_icon" />
				</div>
				<div class="checkbox_area" data-tooltip="Każdy margines może mieć inną długość">
					<p-checkbox data-value="none"></p-checkbox>
					<img src="/src/img/bind_none.svg" class="bind_directions_icon" />
				</div>
			</div>

			<div class="combo_directions" data-bind_wrapper="margins">
				<div class="top">
					<unit-input data-blc_prop="styles.marginTop" data-bind_dir="top"> ${margin_unit_input} </unit-input>
					<div class="responsive_info"></div>
				</div>
				<div class="left">
					<unit-input data-blc_prop="styles.marginLeft" data-bind_dir="left"> ${margin_unit_input} </unit-input>
					<div class="responsive_info"></div>
				</div>
				<div class="right">
					<unit-input data-blc_prop="styles.marginRight" data-bind_dir="right"> ${margin_unit_input} </unit-input>
					<div class="responsive_info"></div>
				</div>
				<div class="bottom">
					<unit-input data-blc_prop="styles.marginBottom" data-bind_dir="bottom"> ${margin_unit_input} </unit-input>
					<div class="responsive_info"></div>
				</div>
			</div>`,
	});

	piep_cms_manager.registerProp({
		name: "padding",
		type_groups: ["layout"],
		blc_groups: layout_blc_groups,
		menu_html: html`
			<div class="label">
				<div class="layout_info_rect" style="background: var(--padding_control_clr);"></div>
				Margines wewnętrzny (padding)
			</div>

			<div class="pretty_radio pretty_blue mb2" data-blc_prop="responsive_settings.bind_paddings" style="--columns:3">
				<div class="checkbox_area" data-tooltip="Wszystkie marginesy są tej samej długości">
					<p-checkbox data-value="all"></p-checkbox>
					<img src="/src/img/bind_all_directions.svg" class="bind_directions_icon" />
				</div>
				<div class="checkbox_area" data-tooltip="Marginesy pionowe oraz poziome są tej samej długości">
					<p-checkbox data-value="opposite"></p-checkbox>
					<img src="/src/img/bind_hor_ver.svg" class="bind_directions_icon" />
				</div>
				<div class="checkbox_area" data-tooltip="Każdy margines może mieć inną długość">
					<p-checkbox data-value="none"></p-checkbox>
					<img src="/src/img/bind_none.svg" class="bind_directions_icon" />
				</div>
			</div>

			<div class="combo_directions" data-bind_wrapper="paddings">
				<div class="top">
					<unit-input data-blc_prop="styles.paddingTop" data-bind_dir="top"> ${padding_unit_input} </unit-input>
					<div class="responsive_info"></div>
				</div>
				<div class="left">
					<unit-input data-blc_prop="styles.paddingLeft" data-bind_dir="left"> ${padding_unit_input} </unit-input>
					<div class="responsive_info"></div>
				</div>
				<div class="right">
					<unit-input data-blc_prop="styles.paddingRight" data-bind_dir="right"> ${padding_unit_input} </unit-input>
					<div class="responsive_info"></div>
				</div>
				<div class="bottom">
					<unit-input data-blc_prop="styles.paddingBottom" data-bind_dir="bottom"> ${padding_unit_input} </unit-input>
					<div class="responsive_info"></div>
				</div>
			</div>
		`,
	});

	piep_cms_manager.registerProp({
		name: "border_color",
		type_groups: ["appearance"],
		blc_groups: layout_blc_groups,
		menu_html: html`
			<div class="label">Kolor krawędzi / obramowania</div>

			<div class="pretty_radio pretty_blue mb2" data-blc_prop="responsive_settings.bind_borderColors" style="--columns:3">
				<div class="checkbox_area" data-tooltip="Wszystkie krawędzie są tego samego koloru">
					<p-checkbox data-value="all"></p-checkbox>
					<img src="/src/img/bind_all_directions.svg" class="bind_directions_icon" />
				</div>
				<div class="checkbox_area" data-tooltip="Krawędzie pionowe oraz poziome tego samego koloru">
					<p-checkbox data-value="opposite"></p-checkbox>
					<img src="/src/img/bind_hor_ver.svg" class="bind_directions_icon" />
				</div>
				<div class="checkbox_area" data-tooltip="Każdy krawędź może mieć inny kolor">
					<p-checkbox data-value="none"></p-checkbox>
					<img src="/src/img/bind_none.svg" class="bind_directions_icon" />
				</div>
			</div>

			<div class="combo_directions" data-bind_wrapper="borderColors">
				<div class="top">
					<color-picker class="NOalpha" data-blc_prop="styles.borderTopColor" data-bind_dir="top"></color-picker>
					<div class="responsive_info"></div>
				</div>
				<div class="left">
					<color-picker class="NOalpha" data-blc_prop="styles.borderLeftColor" data-bind_dir="left"></color-picker>
					<div class="responsive_info"></div>
				</div>
				<div class="right">
					<color-picker class="NOalpha" data-blc_prop="styles.borderRightColor" data-bind_dir="right"></color-picker>
					<div class="responsive_info"></div>
				</div>
				<div class="bottom">
					<color-picker class="NOalpha" data-blc_prop="styles.borderBottomColor" data-bind_dir="bottom"></color-picker>
					<div class="responsive_info"></div>
				</div>
			</div>
		`,
	});

	piep_cms_manager.registerProp({
		name: "border_width",
		type_groups: ["appearance", "layout"],
		blc_groups: layout_blc_groups,
		menu_html: html`
			<div class="label">
				<div class="layout_info_rect" style="background: var(--border_control_clr);"></div>
				Grubość krawędzi / obramowania
			</div>

			<div class="pretty_radio pretty_blue mb2" data-blc_prop="responsive_settings.bind_borderWidths" style="--columns:3">
				<div class="checkbox_area" data-tooltip="Wszystkie krawędzie są tej samej długości">
					<p-checkbox data-value="all"></p-checkbox>
					<img src="/src/img/bind_all_directions.svg" class="bind_directions_icon" />
				</div>
				<div class="checkbox_area" data-tooltip="Krawędzie pionowe oraz poziome są tej samej długości">
					<p-checkbox data-value="opposite"></p-checkbox>
					<img src="/src/img/bind_hor_ver.svg" class="bind_directions_icon" />
				</div>
				<div class="checkbox_area" data-tooltip="Każda krawędź może mieć inną długość">
					<p-checkbox data-value="none"></p-checkbox>
					<img src="/src/img/bind_none.svg" class="bind_directions_icon" />
				</div>
			</div>

			<div class="combo_directions" data-bind_wrapper="borderWidths">
				<div class="top">
					<unit-input data-blc_prop="styles.borderTopWidth" data-bind_dir="top"> ${border_width_unit_input} </unit-input>
					<div class="responsive_info"></div>
				</div>
				<div class="left">
					<unit-input data-blc_prop="styles.borderLeftWidth" data-bind_dir="left"> ${border_width_unit_input} </unit-input>
					<div class="responsive_info"></div>
				</div>
				<div class="right">
					<unit-input data-blc_prop="styles.borderRightWidth" data-bind_dir="right"> ${border_width_unit_input} </unit-input>
					<div class="responsive_info"></div>
				</div>
				<div class="bottom">
					<unit-input data-blc_prop="styles.borderBottomWidth" data-bind_dir="bottom"> ${border_width_unit_input} </unit-input>
					<div class="responsive_info"></div>
				</div>
			</div>
		`,
	});
}
