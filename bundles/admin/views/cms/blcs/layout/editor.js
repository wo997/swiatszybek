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
			<div class="pretty_radio pretty_blue flex columns_2 spiky" data-blc_prop="responsive_settings.width_type">
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
		init: (piep_cms) => {
			const width_type_wrapper = piep_cms.side_menu._child(".prop_width_type");
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
					<option value=""></option>
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
							<option value=""></option>
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
							<option value=""></option>
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
			<div class="label">Wysokość</div>
			<unit-input data-blc_prop="styles.height">
				<input />
				<select>
					<option value="px">px</option>
					<option value="%">%</option>
					<option value=""></option>
				</select>
			</unit-input>
		`,
	});

	piep_cms_manager.registerProp({
		name: "min_max_height",
		type_groups: ["layout"],
		blc_groups: [{ match_tag: piep_cms_manager.match_textables, priority: 5, exclude: true }],
		menu_html: html`
			<div class="glue_children">
				<div class="mr2">
					<div class="label">Wysokość min.</div>
					<unit-input data-blc_prop="styles.minHeight">
						<input />
						<select>
							<option value="px">px</option>
							<option value=""></option>
						</select>
					</unit-input>
				</div>

				<div class="case_advanced">
					<div class="label">Maksymalna max.</div>
					<unit-input data-blc_prop="styles.maxHeight">
						<input />
						<select>
							<option value="px">px</option>
							<option value=""></option>
						</select>
					</unit-input>
				</div>
			</div>
		`,
	});

	piep_cms_manager.registerProp({
		name: "margin",
		type_groups: ["layout"],
		blc_groups: layout_blc_groups,
		menu_html: html` <div class="label">
				<div class="layout_info_rect" style="background: var(--margin_control_clr);"></div>
				Margines zewnętrzny
			</div>

			<div class="pretty_radio pretty_blue flex columns_3 spiky mt2 mb2" data-blc_prop="settings.bind_margins">
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

			<div class="flex align_center center center_fields" data-bind_wrapper="margins">
				<div>
					<unit-input data-blc_prop="styles.marginLeft" data-bind_dir="left">
						<input />
						<select>
							<option value="px">px</option>
							<option value="%">%</option>
							<option value=""></option>
							<option value="auto">↔</option>
						</select>
					</unit-input>
				</div>
				<div class="ml2 mr2">
					<unit-input class="mb4" data-blc_prop="styles.marginTop" data-bind_dir="top">
						<input />
						<select>
							<option value="px">px</option>
							<option value="%">%</option>
							<option value=""></option>
							<option value="auto">↕</option>
						</select>
					</unit-input>

					<unit-input data-blc_prop="styles.marginBottom" data-bind_dir="bottom">
						<input />
						<select>
							<option value="px">px</option>
							<option value="%">%</option>
							<option value=""></option>
							<option value="auto">↕</option>
						</select>
					</unit-input>
				</div>
				<div>
					<unit-input data-blc_prop="styles.marginRight" data-bind_dir="right">
						<input />
						<select>
							<option value="px">px</option>
							<option value="%">%</option>
							<option value=""></option>
							<option value="auto">↔</option>
						</select>
					</unit-input>
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

			<div class="label">
				Marginesy poziome
				<i class="fas fa-arrows-alt-h"></i>
			</div>
			<div class="pretty_radio pretty_blue flex columns_2 spiky" data-blc_prop="responsive_settings.hor_padding_type">
				<div class="checkbox_area empty">
					<p-checkbox data-value="custom"></p-checkbox>
					-
				</div>
				<div class="checkbox_area">
					<p-checkbox data-value="default"></p-checkbox>
					Domyślne
				</div>
			</div>

			<div class="label">
				Marginesy pionowe
				<i class="fas fa-arrows-alt-v"></i>
			</div>
			<div class="pretty_radio pretty_blue flex columns_2 spiky" data-blc_prop="responsive_settings.ver_padding_type">
				<div class="checkbox_area empty">
					<p-checkbox data-value="custom"></p-checkbox>
					-
				</div>
				<div class="checkbox_area">
					<p-checkbox data-value="default"></p-checkbox>
					Domyślne
				</div>
			</div>

			<div class="pretty_radio pretty_blue flex columns_3 spiky mt2 mb2" data-blc_prop="settings.bind_paddings">
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

			<div class="flex align_center center center_fields" data-bind_wrapper="paddings">
				<div>
					<unit-input data-blc_prop="styles.paddingLeft" data-bind_dir="left">
						<input />
						<select>
							<option value="px">px</option>
							<option value="%">%</option>
							<option value=""></option>
							<option value="auto">↔</option>
						</select>
					</unit-input>
				</div>
				<div class="ml2 mr2">
					<unit-input class="mb4" data-blc_prop="styles.paddingTop" data-bind_dir="top">
						<input />
						<select>
							<option value="px">px</option>
							<option value="%">%</option>
							<option value=""></option>
							<option value="auto">↕</option>
						</select>
					</unit-input>

					<unit-input data-blc_prop="styles.paddingBottom" data-bind_dir="bottom">
						<input />
						<select>
							<option value="px">px</option>
							<option value="%">%</option>
							<option value=""></option>
							<option value="auto">↕</option>
						</select>
					</unit-input>
				</div>
				<div>
					<unit-input data-blc_prop="styles.paddingRight" data-bind_dir="right">
						<input />
						<select>
							<option value="px">px</option>
							<option value="%">%</option>
							<option value=""></option>
							<option value="auto">↔</option>
						</select>
					</unit-input>
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

			<div class="pretty_radio pretty_blue flex columns_3 spiky mb2" data-blc_prop="settings.bind_borderColors">
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

			<div class="flex align_center center center_fields" data-bind_wrapper="borderColors">
				<div>
					<color-picker class="NOalpha" data-blc_prop="styles.borderLeftColor" data-bind_dir="left"></color-picker>
				</div>
				<div class="ml2 mr2">
					<color-picker class="NOalpha mb4" data-blc_prop="styles.borderTopColor" data-bind_dir="top"></color-picker>

					<color-picker class="NOalpha" data-blc_prop="styles.borderBottomColor" data-bind_dir="bottom"></color-picker>
				</div>
				<div>
					<color-picker class="NOalpha" data-blc_prop="styles.borderRightColor" data-bind_dir="right"></color-picker>
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

			<div class="pretty_radio pretty_blue flex columns_3 spiky mb2" data-blc_prop="settings.bind_borderWidths">
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

			<div class="flex align_center center center_fields" data-bind_wrapper="borderWidths">
				<div>
					<unit-input data-blc_prop="styles.borderLeftWidth" data-bind_dir="left">
						<input />
						<select>
							<option value="px">px</option>
							<option value=""></option>
						</select>
					</unit-input>
				</div>
				<div class="ml2 mr2">
					<unit-input class="mb4" data-blc_prop="styles.borderTopWidth" data-bind_dir="top">
						<input />
						<select>
							<option value="px">px</option>
							<option value=""></option>
						</select>
					</unit-input>

					<unit-input data-blc_prop="styles.borderBottomWidth" data-bind_dir="bottom">
						<input />
						<select>
							<option value="px">px</option>
							<option value=""></option>
						</select>
					</unit-input>
				</div>
				<div>
					<unit-input data-blc_prop="styles.borderRightWidth" data-bind_dir="right">
						<input />
						<select>
							<option value="px">px</option>
							<option value=""></option>
						</select>
					</unit-input>
				</div>
			</div>
		`,
	});
}
