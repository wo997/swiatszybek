/* js[piep_cms_dependencies] */
{
	const tag_containing_text_priority = 5;
	const match_tags_containing_text = /^(tt|i|b|big|small|em|strong|dfn|code|samp|kbd|var|cite|abbr|acronym|sub|sup|span|bdo|address|div|a|object|p|h[1-6]|pre|q|ins|del|dt|dd|li|label|option|textarea|fieldset|legend|button|caption|td|th|title|script|style)$/;

	piep_cms_props_handler.registerProp({
		name: "font_size",
		type_groups: ["appearance"],
		blc_groups: [{ match_tag: match_tags_containing_text, priority: tag_containing_text_priority }],
		menu_html: html`
			<div class="label">Rozmiar czcionki</div>
			<input class="field hidden" data-blc_prop="style.fontSize" />

			<div class="label normal">
				<span class="case_palette">Rozmiar z listy</span>
				<span class="edit_theme_btn normal link">Zarządzaj</span>
			</div>
			<div class="pretty_radio flex columns_6 global_root spiky"></div>

			<div class="label normal">Inny rozmiar</div>
			<div class="glue_children">
				<input class="field value_input" />
				<select class="piep_editor_unit_input field inline">
					<option value="px">px</option>
					<option value="em">em</option>
					<option value="rem">rem</option>
					<option value=""></option>
				</select>
			</div>
		`,
	});

	piep_cms_props_handler.registerProp({
		name: "font_weight",
		type_groups: ["appearance"],
		blc_groups: [{ match_tag: match_tags_containing_text, priority: tag_containing_text_priority }],
		menu_html: html`
			<div class="label">Grubość czcionki</div>
			<div class="pretty_radio pretty_blue flex columns_4 spiky" data-blc_prop="style.fontWeight">
				<div class="checkbox_area empty">
					<p-checkbox data-value=""></p-checkbox>
					<span>-</span>
				</div>
				<div class="checkbox_area">
					<p-checkbox data-value="var(--normal)"></p-checkbox>
					<span>B</span>
				</div>
				<div class="checkbox_area">
					<p-checkbox data-value="var(--semi_bold)"></p-checkbox>
					<span class="semi_bold">B</span>
				</div>
				<div class="checkbox_area">
					<p-checkbox data-value="var(--bold)"></p-checkbox>
					<span class="bold">B</span>
				</div>
			</div>
		`,
	});

	piep_cms_props_handler.registerProp({
		name: "text_align",
		type_groups: ["appearance"],
		blc_groups: [{ match_tag: match_tags_containing_text, priority: tag_containing_text_priority }],
		menu_html: html`
			<div class="label">Wyrównanie tekstu</div>
			<div class="pretty_radio pretty_blue flex columns_5 spiky" data-blc_prop="style.textAlign">
				<div class="checkbox_area empty">
					<p-checkbox data-value=""></p-checkbox>
					<span>-</span>
				</div>
				<div class="checkbox_area">
					<p-checkbox data-value="left"></p-checkbox>
					<i class="fas fa-align-left"></i>
				</div>
				<div class="checkbox_area">
					<p-checkbox data-value="center"></p-checkbox>
					<i class="fas fa-align-center"></i>
				</div>
				<div class="checkbox_area">
					<p-checkbox data-value="right"></p-checkbox>
					<i class="fas fa-align-right"></i>
				</div>
				<div class="checkbox_area">
					<p-checkbox data-value="justify"></p-checkbox>
					<i class="fas fa-align-justify"></i>
				</div>
			</div>
		`,
	});

	piep_cms_props_handler.registerProp({
		name: "font_style",
		type_groups: ["appearance"],
		blc_groups: [{ match_tag: match_tags_containing_text, priority: tag_containing_text_priority }],
		menu_html: html`
			<div class="label">Kursywa (pochylenie czcionki)</div>
			<div class="pretty_radio pretty_blue flex columns_5 spiky" data-blc_prop="style.fontStyle">
				<div class="checkbox_area empty">
					<p-checkbox data-value=""></p-checkbox>
					<span>-</span>
				</div>
				<div class="checkbox_area">
					<p-checkbox data-value="normal"></p-checkbox>
					<i class="fas fa-italic" style="transform: skewX(15deg);"></i>
				</div>
				<div class="checkbox_area">
					<p-checkbox data-value="italic"></p-checkbox>
					<i class="fas fa-italic"></i>
				</div>
			</div>
		`,
	});

	piep_cms_props_handler.registerProp({
		name: "text_decoration",
		type_groups: ["appearance"],
		blc_groups: [{ match_tag: match_tags_containing_text, priority: tag_containing_text_priority }],
		menu_html: html`
			<div class="label">Zdobienie czcionki</div>
			<div class="pretty_radio pretty_blue flex columns_5 spiky" data-blc_prop="style.textDecoration">
				<div class="checkbox_area empty">
					<p-checkbox data-value=""></p-checkbox>
					<span>-</span>
				</div>
				<div class="checkbox_area">
					<p-checkbox data-value="underline"></p-checkbox>
					<i class="fas fa-underline"></i>
				</div>
				<div class="checkbox_area">
					<p-checkbox data-value="line-through"></p-checkbox>
					<i class="fas fa-strikethrough"></i>
				</div>
			</div>
		`,
	});

	piep_cms_props_handler.registerProp({
		name: "color",
		type_groups: ["appearance"],
		blc_groups: [{ match_tag: match_tags_containing_text, priority: tag_containing_text_priority }],
		menu_html: html`
			<div class="label">Kolor czcionki</div>

			<input class="field hidden" data-blc_prop="style.color" />

			<div class="label normal">
				<span class="case_palette">Kolor z palety</span>
				<span class="edit_theme_btn normal link">Zarządzaj</span>
			</div>
			<div class="pretty_radio flex columns_6 global_root spiky"></div>

			<div class="label normal">Inny kolor</div>
			<color-picker class="inline"></color-picker>
		`,
	});

	piep_cms_props_handler.registerProp({
		name: "background_color",
		type_groups: ["appearance"],
		blc_groups: [{ match_tag: match_tags_containing_text, priority: tag_containing_text_priority }],
		menu_html: html`
			<div class="label">Kolor tła</div>

			<input class="field hidden" data-blc_prop="style.backgroundColor" />

			<div class="label normal">
				<span class="case_palette">Kolor z palety</span>
				<span class="edit_theme_btn normal link">Zarządzaj</span>
			</div>
			<div class="pretty_radio flex columns_6 global_root spiky"></div>

			<div class="label normal">Inny kolor</div>
			<color-picker class="inline"></color-picker>
		`,
	});

	const floating_tag_containing_text_priority = 5;

	piep_cms_props_handler.registerFloatingProp({
		selector: ".prop_font_size",
		tag_groups: [{ match_tag: this.match_tags_containing_text, priority: floating_tag_containing_text_priority }],
	});
	piep_cms_props_handler.registerFloatingProp({
		selector: ".prop_font_weight",
		tag_groups: [{ match_tag: this.match_tags_containing_text, priority: floating_tag_containing_text_priority }],
	});
	piep_cms_props_handler.registerFloatingProp({
		selector: ".prop_text_align",
		tag_groups: [{ match_tag: this.match_tags_containing_text, priority: floating_tag_containing_text_priority }],
	});
	piep_cms_props_handler.registerFloatingProp({
		selector: ".prop_color",
		tag_groups: [{ match_tag: this.match_tags_containing_text, priority: floating_tag_containing_text_priority }],
	});
	piep_cms_props_handler.registerFloatingProp({
		selector: ".prop_background_color",
		tag_groups: [{ match_tag: this.match_tags_containing_text, priority: floating_tag_containing_text_priority }],
	});
	piep_cms_props_handler.registerFloatingProp({
		selector: ".remove_format_btn",
		tag_groups: [{ match_tag: this.match_tags_containing_text, priority: floating_tag_containing_text_priority }],
	});
}
