/* js[piep_cms_dependencies] */
{
	const layout_priority = 10;

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

	/**
	 *
	 * @param {vDomNodeData} v_node_data
	 * @returns
	 */
	const columnsContainerMatcher = (v_node_data) => {
		return v_node_data.v_node.classes.includes("columns_container");
	};

	piep_cms_props_handler.registerProp({
		name: "width",
		blc_groups: [
			{ match_tag: this.match_media_tags, priority: layout_priority },
			{ match_tag: /.*/, priority: 0 },
		],
		type_groups: ["layout"],
		menu_html: html`
			<div class="label">Szerokość</div>
			<input class="field" data-blc_prop="style.width" />

			<div class="glue_children">
				<div class="mr2">
					<div class="label normal">Minimalna</div>
					<input class="field" data-blc_prop="style.minWidth" />
				</div>

				<div>
					<div class="label normal">Maksymalna</div>
					<input class="field" data-blc_prop="style.maxWidth" />
				</div>
			</div>
		`,
	});

	piep_cms_props_handler.registerProp({
		name: "height",
		type_groups: ["layout"],
		//blc_groups: [{ match_tag: /.*/, priority: layout_priority }],
		menu_html: html`
			<div class="label">Wysokość</div>
			<input class="field" data-blc_prop="style.height" />

			<div class="glue_children">
				<div class="mr2">
					<div class="label normal">Minimalna</div>
					<input class="field" data-blc_prop="style.minHeight" />
				</div>

				<div>
					<div class="label normal">Maksymalna</div>
					<input class="field" data-blc_prop="style.maxHeight" />
				</div>
			</div>
		`,
	});

	piep_cms_props_handler.registerProp({
		name: "margin",
		type_groups: ["layout"],
		//blc_groups: [{ match_tag: /.*/, priority: layout_priority }],
		menu_html: html` <div class="label">
				<div class="layout_info_rect" style="background: var(--margin_control_clr);"></div>
				Margines zewnętrzny
			</div>

			<div class="pretty_radio pretty_blue flex columns_3 spiky mt2 mb2" data-blc_prop="setting.bind_margins">
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

			<div class="flex align_center text_center text_center_fields" data-bind_wrapper="margins">
				<div>
					<input class="field" data-blc_prop="style.marginLeft" placeholder="Lewy" data-bind_dir="left" />
				</div>
				<div class="ml2 mr2">
					<input class="field mb4" data-blc_prop="style.marginTop" placeholder="Górny" data-bind_dir="top" />

					<input class="field" data-blc_prop="style.marginBottom" placeholder="Dolny" data-bind_dir="bottom" />
				</div>
				<div>
					<input class="field" data-blc_prop="style.marginRight" placeholder="Prawy" data-bind_dir="right" />
				</div>
			</div>`,
	});

	piep_cms_props_handler.registerProp({
		name: "padding",
		type_groups: ["layout"],
		//blc_groups: [{ match_tag: /.*/, priority: layout_priority }],
		menu_html: html`
			<div class="label">
				<div class="layout_info_rect" style="background: var(--padding_control_clr);"></div>
				Margines wewnętrzny (padding)
			</div>

			<div class="pretty_radio pretty_blue flex columns_3 spiky mt2 mb2" data-blc_prop="setting.bind_paddings">
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

			<div class="flex align_center text_center text_center_fields" data-bind_wrapper="paddings">
				<div>
					<input class="field" data-blc_prop="style.paddingLeft" placeholder="Lewy" data-bind_dir="left" />
				</div>
				<div class="ml2 mr2">
					<input class="field mb4" data-blc_prop="style.paddingTop" placeholder="Górny" data-bind_dir="top" />

					<input class="field" data-blc_prop="style.paddingBottom" placeholder="Dolny" data-bind_dir="bottom" />
				</div>
				<div>
					<input class="field" data-blc_prop="style.paddingRight" placeholder="Prawy" data-bind_dir="right" />
				</div>
			</div>
		`,
	});

	piep_cms_props_handler.registerProp({
		name: "border",
		type_groups: ["layout", "appearance"],
		//blc_groups: [{ match_tag: /.*/, priority: layout_priority }],
		menu_html: html`
			<div class="label">
				<div class="layout_info_rect" style="background: var(--border_control_clr);"></div>
				Krawędź / Obramowanie
			</div>

			<div class="label normal">Grubość</div>
			<div class="pretty_radio pretty_blue flex columns_3 spiky mb2" data-blc_prop="setting.bind_borderWidths">
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

			<div class="flex align_center text_center text_center_fields" data-bind_wrapper="borderWidths">
				<div>
					<input class="field" data-blc_prop="style.borderLeftWidth" placeholder="Lewy" data-bind_dir="left" />
				</div>
				<div class="ml2 mr2">
					<input class="field mb4" data-blc_prop="style.borderTopWidth" placeholder="Górny" data-bind_dir="top" />

					<input class="field" data-blc_prop="style.borderBottomWidth" placeholder="Dolny" data-bind_dir="bottom" />
				</div>
				<div>
					<input class="field" data-blc_prop="style.borderRightWidth" placeholder="Prawy" data-bind_dir="right" />
				</div>
			</div>

			<div class="label normal">Kolor</div>
			<div class="pretty_radio pretty_blue flex columns_3 spiky mb2" data-blc_prop="setting.bind_borderColors">
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

			<div class="flex align_center text_center text_center_fields" data-bind_wrapper="borderColors">
				<div>
					<color-picker data-blc_prop="style.borderLeftColor" data-bind_dir="left"></color-picker>
				</div>
				<div class="ml2 mr2">
					<color-picker class="mb4" data-blc_prop="style.borderTopColor" data-bind_dir="top"></color-picker>

					<color-picker data-blc_prop="style.borderBottomColor" data-bind_dir="bottom"></color-picker>
				</div>
				<div>
					<color-picker data-blc_prop="style.borderRightColor" data-bind_dir="right"></color-picker>
				</div>
			</div>
		`,
	});

	piep_cms_props_handler.registerProp({
		name: "align_self_horizontally",
		blc_groups: [
			{
				matcher: inVerticalContainerMatcher,
				priority: layout_priority,
			},
		],
		type_groups: ["layout"],
		menu_html: html`
			<div class="label">Wyrównaj blok poziomo</div>
			<div class="pretty_radio pretty_blue flex columns_5 spiky" data-blc_prop="style.alignSelf">
				<div class="checkbox_area empty">
					<p-checkbox data-value=""></p-checkbox>
					<span>-</span>
				</div>
				<div class="checkbox_area">
					<p-checkbox data-value="flex-start"></p-checkbox>
					<div class="flex_align_self_horizontal_icon" style="align-items:flex-start"></div>
				</div>
				<div class="checkbox_area">
					<p-checkbox data-value="center"></p-checkbox>
					<div class="flex_align_self_horizontal_icon" style="align-items:center"></div>
				</div>
				<div class="checkbox_area">
					<p-checkbox data-value="flex-end"></p-checkbox>
					<div class="flex_align_self_horizontal_icon" style="align-items:flex-end"></div>
				</div>
				<div class="checkbox_area" data-tooltip="Efekt widoczny jeśli nie została określona szerokość">
					<p-checkbox data-value="stretch"></p-checkbox>
					<div class="flex_align_self_horizontal_icon" style="align-items:stretch"></div>
				</div>
			</div>
		`,
	});

	piep_cms_props_handler.registerProp({
		name: "align_self_vertically",
		blc_groups: [
			{
				matcher: verticalContainerMatcher,
				priority: layout_priority,
			},
		],
		type_groups: ["layout"],
		menu_html: html`
			<div class="label">Wyrównaj blok pionowo</div>
			<div class="pretty_radio pretty_blue flex columns_5 spiky" data-blc_prop="style.alignSelf">
				<div class="checkbox_area empty">
					<p-checkbox data-value=""></p-checkbox>
					<span>-</span>
				</div>
				<div class="checkbox_area">
					<p-checkbox data-value="flex-start"></p-checkbox>
					<div class="flex_align_self_vertical_icon" style="align-items:flex-start"></div>
				</div>
				<div class="checkbox_area">
					<p-checkbox data-value="center"></p-checkbox>
					<div class="flex_align_self_vertical_icon" style="align-items:center"></div>
				</div>
				<div class="checkbox_area">
					<p-checkbox data-value="flex-end"></p-checkbox>
					<div class="flex_align_self_vertical_icon" style="align-items:flex-end"></div>
				</div>
				<div class="checkbox_area" data-tooltip="Efekt widoczny jeśli nie została określona wysokość">
					<p-checkbox data-value="stretch"></p-checkbox>
					<div class="flex_align_self_vertical_icon" style="align-items:stretch"></div>
				</div>
			</div>
		`,
	});

	piep_cms_props_handler.registerProp({
		name: "justify_content_horizontally",
		blc_groups: [
			{
				matcher: columnsContainerMatcher,
				priority: layout_priority,
			},
		],
		type_groups: ["layout"],
		menu_html: html`
			<div class="label">Wyrównaj zawartość poziomo</div>
			<div class="pretty_radio pretty_blue flex columns_4 spiky" data-blc_prop="style.justifyContent">
				<div class="checkbox_area empty">
					<p-checkbox data-value=""></p-checkbox>
					<span>-</span>
				</div>
				<div class="checkbox_area">
					<p-checkbox data-value="flex-start"></p-checkbox>
					<div class="flex_justify_content_horizontal_icon" style="justify-content:flex-start">
						<div></div>
						<div></div>
						<div></div>
					</div>
				</div>
				<div class="checkbox_area">
					<p-checkbox data-value="center"></p-checkbox>
					<div class="flex_justify_content_horizontal_icon" style="justify-content:center">
						<div></div>
						<div></div>
						<div></div>
					</div>
				</div>
				<div class="checkbox_area">
					<p-checkbox data-value="flex-end"></p-checkbox>
					<div class="flex_justify_content_horizontal_icon" style="justify-content:flex-end">
						<div></div>
						<div></div>
						<div></div>
					</div>
				</div>
				<div class="checkbox_area">
					<p-checkbox data-value="space-around"></p-checkbox>
					<div class="flex_justify_content_horizontal_icon" style="justify-content:space-around">
						<div></div>
						<div></div>
						<div></div>
					</div>
				</div>
				<div class="checkbox_area">
					<p-checkbox data-value="space-between"></p-checkbox>
					<div class="flex_justify_content_horizontal_icon" style="justify-content:space-between">
						<div></div>
						<div></div>
						<div></div>
					</div>
				</div>
				<div class="checkbox_area">
					<p-checkbox data-value="space-evenly"></p-checkbox>
					<div class="flex_justify_content_horizontal_icon" style="justify-content:space-evenly">
						<div></div>
						<div></div>
						<div></div>
					</div>
				</div>
			</div>
		`,
	});

	piep_cms_props_handler.registerProp({
		name: "align_items_vertically",
		blc_groups: [
			{
				matcher: columnsContainerMatcher,
				priority: layout_priority,
			},
		],
		type_groups: ["layout"],
		menu_html: html`
			<div class="label">Wyrównaj zawartość pionowo</div>
			<div class="pretty_radio pretty_blue flex columns_5 spiky" data-blc_prop="style.alignItems">
				<div class="checkbox_area empty">
					<p-checkbox data-value=""></p-checkbox>
					<span>-</span>
				</div>
				<div class="checkbox_area">
					<p-checkbox data-value="flex-start"></p-checkbox>
					<div class="flex_align_items_vertical_icon" style="align-items:flex-start">
						<div></div>
						<div></div>
						<div></div>
					</div>
				</div>
				<div class="checkbox_area">
					<p-checkbox data-value="center"></p-checkbox>
					<div class="flex_align_items_vertical_icon" style="align-items:center">
						<div></div>
						<div></div>
						<div></div>
					</div>
				</div>
				<div class="checkbox_area">
					<p-checkbox data-value="flex-end"></p-checkbox>
					<div class="flex_align_items_vertical_icon" style="align-items:flex-end">
						<div></div>
						<div></div>
						<div></div>
					</div>
				</div>
				<div class="checkbox_area">
					<p-checkbox data-value="stretch"></p-checkbox>
					<div class="flex_align_items_vertical_icon" style="justify-content:stretch">
						<div></div>
						<div></div>
						<div></div>
					</div>
				</div>
			</div>
		`,
	});

	piep_cms_props_handler.registerProp({
		name: "justify_content_vertically",
		blc_groups: [
			{
				matcher: verticalContainerMatcher,
				priority: layout_priority,
			},
		],
		type_groups: ["layout"],
		menu_html: html`
			<div class="label">Wyrównaj zawartość pionowo</div>
			<div class="pretty_radio pretty_blue flex columns_4 spiky" data-blc_prop="style.justifyContent">
				<div class="checkbox_area empty">
					<p-checkbox data-value=""></p-checkbox>
					<span>-</span>
				</div>
				<div class="checkbox_area">
					<p-checkbox data-value="flex-start"></p-checkbox>
					<div class="flex_justify_content_vertical_icon" style="justify-content:flex-start">
						<div></div>
						<div></div>
						<div></div>
					</div>
				</div>
				<div class="checkbox_area">
					<p-checkbox data-value="center"></p-checkbox>
					<div class="flex_justify_content_vertical_icon" style="justify-content:center">
						<div></div>
						<div></div>
						<div></div>
					</div>
				</div>
				<div class="checkbox_area">
					<p-checkbox data-value="flex-end"></p-checkbox>
					<div class="flex_justify_content_vertical_icon" style="justify-content:flex-end">
						<div></div>
						<div></div>
						<div></div>
					</div>
				</div>
				<div class="checkbox_area">
					<p-checkbox data-value="space-around"></p-checkbox>
					<div class="flex_justify_content_vertical_icon" style="justify-content:space-around">
						<div></div>
						<div></div>
						<div></div>
					</div>
				</div>
				<div class="checkbox_area">
					<p-checkbox data-value="space-between"></p-checkbox>
					<div class="flex_justify_content_vertical_icon" style="justify-content:space-between">
						<div></div>
						<div></div>
						<div></div>
					</div>
				</div>
				<div class="checkbox_area">
					<p-checkbox data-value="space-evenly"></p-checkbox>
					<div class="flex_justify_content_vertical_icon" style="justify-content:space-evenly">
						<div></div>
						<div></div>
						<div></div>
					</div>
				</div>
			</div>
		`,
	});

	piep_cms_props_handler.registerProp({
		name: "align_items_horizontally",
		blc_groups: [
			{
				matcher: verticalContainerMatcher,
				priority: layout_priority,
			},
		],
		type_groups: ["layout"],
		menu_html: html`
			<div class="label">Wyrównaj zawartość poziomo</div>
			<div class="pretty_radio pretty_blue flex columns_5 spiky" data-blc_prop="style.alignItems">
				<div class="checkbox_area empty">
					<p-checkbox data-value=""></p-checkbox>
					<span>-</span>
				</div>
				<div class="checkbox_area">
					<p-checkbox data-value="flex-start"></p-checkbox>
					<div class="flex_align_items_horizontal_icon" style="align-items:flex-start">
						<div></div>
						<div></div>
						<div></div>
					</div>
				</div>
				<div class="checkbox_area">
					<p-checkbox data-value="center"></p-checkbox>
					<div class="flex_align_items_horizontal_icon" style="align-items:center">
						<div></div>
						<div></div>
						<div></div>
					</div>
				</div>
				<div class="checkbox_area">
					<p-checkbox data-value="flex-end"></p-checkbox>
					<div class="flex_align_items_horizontal_icon" style="align-items:flex-end">
						<div></div>
						<div></div>
						<div></div>
					</div>
				</div>
				<div class="checkbox_area">
					<p-checkbox data-value="stretch"></p-checkbox>
					<div class="flex_align_items_horizontal_icon" style="justify-content:stretch">
						<div></div>
						<div></div>
						<div></div>
					</div>
				</div>
			</div>
		`,
	});
}
