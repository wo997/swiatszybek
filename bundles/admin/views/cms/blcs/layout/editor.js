/* js[piep_cms_dependencies] */
{
	piep_cms_manager.registerProp({
		name: "width",
		blc_groups: [
			{ match_tag: piep_cms_manager.match_media_tags, priority: 10 },
			{ match_tag: /.*/, priority: 0 },
		],
		type_groups: ["layout"],
		menu_html: html`
			<div class="label">Szerokość</div>
			<input class="field" data-blc_prop="styles.width" />

			<div class="glue_children">
				<div class="mr2 case_advanced">
					<div class="label normal">Minimalna</div>
					<input class="field" data-blc_prop="styles.minWidth" />
				</div>

				<div>
					<div class="label normal">Maksymalna</div>
					<input class="field" data-blc_prop="styles.maxWidth" />
				</div>
			</div>
		`,
	});

	piep_cms_manager.registerProp({
		name: "height",
		type_groups: ["layout"],
		//blc_groups: [{ match_tag: /.*/, priority: layout_priority }],
		menu_html: html`
			<div class="label">Wysokość</div>
			<input class="field" data-blc_prop="styles.height" />

			<div class="glue_children">
				<div class="mr2">
					<div class="label normal">Minimalna</div>
					<input class="field" data-blc_prop="styles.minHeight" />
				</div>

				<div class="case_advanced">
					<div class="label normal">Maksymalna</div>
					<input class="field" data-blc_prop="styles.maxHeight" />
				</div>
			</div>
		`,
	});

	piep_cms_manager.registerProp({
		name: "margin",
		type_groups: ["layout"],
		//blc_groups: [{ match_tag: /.*/, priority: layout_priority }],
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
					<input class="field" data-blc_prop="styles.marginLeft" placeholder="Lewy" data-bind_dir="left" />
				</div>
				<div class="ml2 mr2">
					<input class="field mb4" data-blc_prop="styles.marginTop" placeholder="Górny" data-bind_dir="top" />

					<input class="field" data-blc_prop="styles.marginBottom" placeholder="Dolny" data-bind_dir="bottom" />
				</div>
				<div>
					<input class="field" data-blc_prop="styles.marginRight" placeholder="Prawy" data-bind_dir="right" />
				</div>
			</div>`,
	});

	piep_cms_manager.registerProp({
		name: "padding",
		type_groups: ["layout"],
		//blc_groups: [{ match_tag: /.*/, priority: layout_priority }],
		menu_html: html`
			<div class="label">
				<div class="layout_info_rect" style="background: var(--padding_control_clr);"></div>
				Margines wewnętrzny (padding)
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
					<input class="field" data-blc_prop="styles.paddingLeft" placeholder="Lewy" data-bind_dir="left" />
				</div>
				<div class="ml2 mr2">
					<input class="field mb4" data-blc_prop="styles.paddingTop" placeholder="Górny" data-bind_dir="top" />

					<input class="field" data-blc_prop="styles.paddingBottom" placeholder="Dolny" data-bind_dir="bottom" />
				</div>
				<div>
					<input class="field" data-blc_prop="styles.paddingRight" placeholder="Prawy" data-bind_dir="right" />
				</div>
			</div>
		`,
	});

	piep_cms_manager.registerProp({
		name: "border",
		type_groups: ["layout", "appearance"],
		//blc_groups: [{ match_tag: /.*/, priority: layout_priority }],
		menu_html: html`
			<div class="label">
				<div class="layout_info_rect" style="background: var(--border_control_clr);"></div>
				Krawędź / Obramowanie
			</div>

			<div class="label normal">Grubość</div>
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
					<input class="field" data-blc_prop="styles.borderLeftWidth" placeholder="Lewy" data-bind_dir="left" />
				</div>
				<div class="ml2 mr2">
					<input class="field mb4" data-blc_prop="styles.borderTopWidth" placeholder="Górny" data-bind_dir="top" />

					<input class="field" data-blc_prop="styles.borderBottomWidth" placeholder="Dolny" data-bind_dir="bottom" />
				</div>
				<div>
					<input class="field" data-blc_prop="styles.borderRightWidth" placeholder="Prawy" data-bind_dir="right" />
				</div>
			</div>

			<div class="label normal">Kolor</div>
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
}
