/* js[piep_cms_dependencies] */
{
	const text_priority = 15;

	/** @type {EditBlcGroup[]} */
	const text_groups = [
		{ match_tag: piep_cms_manager.match_text_containers, priority: text_priority },
		{ match_tag: piep_cms_manager.match_textables, priority: text_priority },
	];

	/** @type {EditBlcGroup[]} */
	const text_tag_groups = [
		{ match_tag: piep_cms_manager.match_tag_text_containers, priority: text_priority },
		{ match_tag: piep_cms_manager.match_textables, priority: text_priority },
	];

	const irrelevant_text_priority = 5;

	/** @type {EditBlcGroup[]} */
	const irrelevant_text_groups = [
		{ match_tag: piep_cms_manager.match_text_containers, priority: irrelevant_text_priority },
		{ match_tag: piep_cms_manager.match_textables, priority: irrelevant_text_priority },
	];

	/**
	 *
	 * @param {PiepNode} font_size_wrapper
	 */
	const updateFontSizeWrapper = (font_size_wrapper) => {
		const middle_input = font_size_wrapper._child("input.hidden");

		const radio_group = font_size_wrapper._child(".radio_group");
		let font_size_options_html = html`
			<div class="checkbox_area empty">
				<p-checkbox data-value=""></p-checkbox>
				<span>-</span>
			</div>
		`;

		font_sizes.forEach((font_size) => {
			font_size_options_html += html`
				<div class="checkbox_area">
					<p-checkbox data-value="var(--${font_size.name})"></p-checkbox>
					<div style="font-size:var(--${font_size.name});line-height: 1;">A</div>
				</div>
			`;
		});

		radio_group._set_content(font_size_options_html);

		registerForms();

		const unit_input = font_size_wrapper._child("unit-input");

		if (!middle_input.classList.contains("wrrgstrd")) {
			middle_input.classList.add("wrrgstrd");

			// TODO: remove?
			let middle_input_setting_val_user = false;
			middle_input.addEventListener("value_set", () => {
				if (middle_input_setting_val_user) {
					return;
				}

				/** @type {string} */
				const get_value = middle_input._get_value();
				const on_the_list = !!font_sizes.find((f) => `var(--${f.name})` === get_value);

				unit_input._set_value(on_the_list ? "" : get_value, { quiet: true });

				radio_group._set_value(on_the_list ? get_value : "", { quiet: true });
			});

			const change = () => {
				middle_input_setting_val_user = true;
				middle_input._set_value(unit_input._get_value());
				middle_input_setting_val_user = false;
			};
			unit_input.addEventListener("change", change);

			radio_group.addEventListener("change", () => {
				middle_input._set_value(radio_group._get_value());
			});
		}
	};

	/**
	 *
	 * @param {PiepCMS} piep_cms
	 * @param {PiepNode} font_size_dropdown
	 */
	const updateFontSizeDropdown = (piep_cms, font_size_dropdown) => {
		const options_wrapper = font_size_dropdown._child(".options_wrapper");

		let font_size_options_html = options_wrapper._child(`[data-value=""]`).outerHTML;

		font_sizes.forEach((font_size) => {
			font_size_options_html += html`
				<p-option data-value="var(--${font_size.name})">
					<div style="font-size:var(--${font_size.name});">A</div>
				</p-option>
			`;
		});

		font_size_options_html += html`<p-option data-tooltip="Inny rozmiar" class="different_size" data-match=".*">
				<div class="input_icon">|</div>
			</p-option>
			<p-option class="edit_theme_btn" data-tooltip="Zarządzaj listą rozmiarów"> <i class="fas fa-cog"></i> </p-option>`;

		options_wrapper._set_content(font_size_options_html);

		registerForms();

		const different_size = options_wrapper._child(".different_size");
		different_size.addEventListener("click", () => {
			piep_cms.filter_blc_menu._set_value("appearance");
			const value_input = piep_cms.side_menu._child(".prop_font_size unit-input input");
			value_input.click();
			value_input.focus();
			piep_cms.setContentActive(false);
		});
	};

	piep_cms_manager.registerProp({
		name: "text_tag",
		type_groups: ["appearance"],
		blc_groups: text_tag_groups,
		menu_html: html`
			<div class="label">Typ tekstu</div>
			<div class="pretty_radio global_root box_align_left" data-blc_prop="tag" class="--columns:1">
				<div class="checkbox_area">
					<p-checkbox data-value="h1"></p-checkbox>
					<div style="font-size:var(--size_h1);line-height: 1.2;">Nagłówek H1</div>
				</div>
				<div class="checkbox_area">
					<p-checkbox data-value="h2"></p-checkbox>
					<div style="font-size:var(--size_h2);line-height: 1.2;">Nagłówek H2</div>
				</div>
				<div class="checkbox_area">
					<p-checkbox data-value="h3"></p-checkbox>
					<div style="font-size:var(--size_h3);line-height: 1.2;">Nagłówek H3</div>
				</div>
				<div class="checkbox_area">
					<p-checkbox data-value="p"></p-checkbox>
					<div style="font-size:1em;line-height: 1.2;">Paragraf</div>
				</div>
			</div>
		`,
	});

	piep_cms_manager.registerProp({
		name: "font_size",
		type_groups: ["appearance"],
		//blc_groups: text_groups,
		menu_html: html`
			<div class="label">Rozmiar czcionki</div>
			<input class="field hidden" data-blc_prop="styles.fontSize" />

			<div class="label ">
				<span class="case_palette">Z listy</span>
				<span class="edit_theme_btn normal link">Zarządzaj</span>
			</div>
			<div class="pretty_radio global_root" style="--columns:6"></div>

			<div class="label normal">Inny</div>
			<unit-input>
				<input />
				<select>
					<option value="px">px</option>
					<option value="em">em</option>
					<option value="rem">rem</option>
					<option value="*" class="case_advanced">*</option>
				</select>
			</unit-input>
		`,
		init: (piep_cms, menu_wrapper) => {
			const themeSettingsChanged = () => {
				registerForms();
				updateFontSizeWrapper(menu_wrapper);
			};
			window.addEventListener("theme_settings_changed", themeSettingsChanged);
			themeSettingsChanged();
		},
	});

	piep_cms_manager.registerProp({
		name: "font_weight",
		type_groups: ["appearance"],
		//blc_groups: text_groups,
		menu_html: html`
			<div class="label">Grubość czcionki</div>
			<div class="pretty_radio" data-blc_prop="styles.fontWeight" style="--columns:4">
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

	piep_cms_manager.registerProp({
		name: "text_align",
		type_groups: ["appearance"],
		//blc_groups: text_groups,
		menu_html: html`
			<div class="label">Wyrównanie tekstu</div>
			<div class="pretty_radio" data-blc_prop="styles.textAlign" style="--columns:5">
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

	piep_cms_manager.registerProp({
		name: "font_style",
		type_groups: ["appearance"],
		//blc_groups: text_groups,
		menu_html: html`
			<div class="label">Kursywa (pochylenie czcionki)</div>
			<div class="pretty_radio" data-blc_prop="styles.fontStyle" style="--columns:5">
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

	piep_cms_manager.registerProp({
		name: "text_decoration",
		type_groups: ["appearance"],
		//blc_groups: text_groups,
		menu_html: html`
			<div class="label">Zdobienie czcionki</div>
			<div class="pretty_radio" data-blc_prop="styles.textDecoration" style="--columns:5">
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

	piep_cms_manager.registerFloatingProp({
		name: "text_tag",
		blc_groups: text_tag_groups,
		menu_html: html`
			<p-dropdown class="field small inline pretty_blue center grid align_left" data-blc_prop="tag" data-tooltip="Typ tekstu">
				<p-option data-value="h1" style="font-size:var(--size_h1);">
					<label class="semi_bold">H1</label>
					Nagłówek H1
				</p-option>
				<p-option data-value="h2" style="font-size:var(--size_h2);">
					<label class="semi_bold">H2</label>
					Nagłówek H2
				</p-option>
				<p-option data-value="h3" style="font-size:var(--size_h3);">
					<label class="semi_bold">H3</label>
					Nagłówek H3
				</p-option>
				<p-option data-value="p">
					<label><i class="fas fa-paragraph"></i></label>
					Paragraf
				</p-option>
			</p-dropdown>
		`,
	});

	piep_cms_manager.registerFloatingProp({
		name: "font_size",
		blc_groups: text_groups,
		menu_html: html`
			<p-dropdown
				class="field small inline pretty_blue center static_label grid"
				data-blc_prop="styles.fontSize"
				data-tooltip="Rozmiar czcionki"
			>
				<p-option data-value="">
					<span class="semi_bold"> A<span style="font-size:0.7em">A</span> </span>
				</p-option>
			</p-dropdown>
		`,
		init: (piep_cms, menu_wrapper) => {
			const themeSettingsChanged = () => {
				registerForms();
				updateFontSizeDropdown(piep_cms, menu_wrapper);
			};
			window.addEventListener("theme_settings_changed", themeSettingsChanged);
			themeSettingsChanged();
		},
	});

	piep_cms_manager.registerFloatingProp({
		name: "font_weight",
		blc_groups: text_groups,
		menu_html: html`
			<p-dropdown
				class="field small inline pretty_blue center grid align_left"
				data-blc_prop="styles.fontWeight"
				data-tooltip="Grubość czcionki"
			>
				<p-option data-value=""><span class="bold">B</span></p-option>
				<p-option data-value="var(--normal)"><label>B</label> Chuda </p-option>
				<p-option data-value="var(--semi_bold)" class="semi_bold"><label class="semi_bold">B</label> Średnia </p-option>
				<p-option data-value="var(--bold)" class="bold"> <label class="bold">B</label> Gruba </p-option>
			</p-dropdown>
		`,
	});

	piep_cms_manager.registerFloatingProp({
		name: "text_align",
		blc_groups: text_groups,
		menu_html: html`
			<p-dropdown class="field small inline pretty_blue center grid" data-blc_prop="styles.textAlign" data-tooltip="Wyrównanie tekstu">
				<p-option data-value=""> <i class="fas fa-align-left"></i> </p-option>
				<p-option data-value="left"> <i class="fas fa-align-left"></i> </p-option>
				<p-option data-value="center"> <i class="fas fa-align-center"></i> </p-option>
				<p-option data-value="right"> <i class="fas fa-align-right"></i> </p-option>
				<p-option data-value="justify"> <i class="fas fa-align-justify"></i> </p-option>
			</p-dropdown>
		`,
	});

	piep_cms_manager.registerFloatingProp({
		name: "remove_format_btn",
		blc_groups: irrelevant_text_groups,
		menu_html: html`
			<button class="btn transparent small remove_format_btn" data-tooltip="Usuń formatowanie">
				<i class="fas fa-remove-format"></i>
			</button>
		`,
		init: (piep_cms) => {
			piep_cms.container.addEventListener("click", (ev) => {
				const target = $(ev.target);
				if (target._parent(".remove_format_btn") && piep_cms.text_selection) {
					const vids = piep_cms.getAllTextSelectionVids();
					vids.forEach((vid) => {
						const v_node = piep_cms.getVNodeById(vid);
						v_node.styles = {};
						v_node.attrs = {};
						v_node.settings = {};
					});

					piep_cms.update({ all: true });
					piep_cms.pushHistory(`remove_format_${vids.join("_")}`);
				}
			});
		},
	});

	piep_cms_manager.registerFloatingProp({
		name: "insert_inline_btn",
		blc_groups: [{ match_tag: piep_cms_manager.match_textables, priority: irrelevant_text_priority }],
		menu_html: html`
			<p-dropdown class="field small inline pretty_blue center grid" data-tooltip="Wstaw ikonkę, zdjęcie itd.">
				<p-option data-value="" class="hidden"> <i class="fas fa-plus"></i> </p-option>
			</p-dropdown>
		`,
		init: (piep_cms, menu_wrapper) => {
			let insert_blcs = "";
			piep_cms_manager.blcs_schema
				.filter((s) => s.inline)
				.sort((a, b) => Math.sign(b.priority - a.priority))
				.forEach((schema) => {
					insert_blcs += html`<p-option data-value="${schema.id}" data-tooltip="${schema.label}" style="font-size: 1.4em;">
						${schema.icon}
					</p-option>`;
				});

			registerForms();
			const dropdown = menu_wrapper._child(`p-dropdown`);
			dropdown._child(`.options_wrapper`).insertAdjacentHTML("beforeend", insert_blcs);

			dropdown.addEventListener("change", () => {
				const blc_schema_id = dropdown._get_value();
				dropdown._set_value("", { quiet: true });

				const blc_schema = piep_cms_manager.blcs_schema.find((b) => b.id === blc_schema_id);

				const focus_vid = piep_cms.text_selection.focus_vid;
				const focus_offset = piep_cms.text_selection.focus_offset;

				const v_node_data = piep_cms.getVNodeDataById(focus_vid);
				const v_node = v_node_data.v_node;

				if (focus_offset > 0 && focus_offset < v_node.text.length) {
					/** @type {vDomNode} */
					const insert_v_node = cloneObject(v_node);
					insert_v_node.id = piep_cms.getNewBlcId();
					insert_v_node.text = v_node.text.substring(focus_offset);
					v_node.text = v_node.text.substring(0, focus_offset);
					v_node_data.v_nodes.splice(v_node_data.index + 1, 0, insert_v_node);
				}

				piep_cms.collapseTextSelection();

				/** @type {vDomNode} */
				const insert_v_node = cloneObject(blc_schema.v_node);
				let index = v_node_data.index;
				if (focus_offset === v_node.text.length) {
					index++;
				}
				v_node_data.v_nodes.splice(index, 0, insert_v_node);
				piep_cms.setNewIdsOnVNode(insert_v_node);
				piep_cms.update({ all: true });

				piep_cms.displayTextSelection();
			});
		},
	});
}

{
	[
		{ tag: "h1", label: "Nagłówek", icon: html`<span class="bold">H1</span>` },
		{ tag: "h2", label: "Nagłówek", icon: html`<span class="bold">H2</span>` },
		{ tag: "h3", label: "Nagłówek", icon: html`<span class="bold">H3</span>` },
		{ tag: "p", label: "Paragraf", icon: html`<i class="fas fa-paragraph"></i>` },
	].forEach((data) => {
		piep_cms_manager.registerBlcSchema({
			id: data.tag,
			icon: data.icon,
			label: data.label,
			group: "text",
			priority: 100,
			v_node: {
				tag: data.tag,
				id: -1,
				styles: {},
				classes: [],
				attrs: {},
				children: [
					{
						id: -1,
						tag: "span",
						text: data.label,
						attrs: {},
						classes: [],
						styles: {},
					},
				],
			},
		});
	});
}
