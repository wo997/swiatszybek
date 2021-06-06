/* js[piep_cms_dependencies] */
{
	const text_priority = 15;

	/** @type {EditBlcGroup[]} */
	const text_groups = [
		{ match_tag: piep_cms_manager.match_text_containers, priority: text_priority },
		{ match_tag: piep_cms_manager.match_textables, priority: text_priority },
	];

	/**
	 *
	 * @param {PiepNode} color_wrapper
	 */
	const updateColorWrapper = (color_wrapper) => {
		registerForms();

		const middle_input = color_wrapper._child("input");
		const radio_group = color_wrapper._child(".radio_group");
		const color_picker = color_wrapper._child("color-picker");

		let color_options_html = html`
			<div class="checkbox_area empty">
				<p-checkbox data-value=""></p-checkbox>
				<span>-</span>
			</div>
		`;
		colors_palette.forEach((color) => {
			color_options_html += html`
				<div class="checkbox_area">
					<p-checkbox data-value="var(--${color.name})"></p-checkbox>
					<div class="color_circle" style="background:var(--${color.name});"></div>
				</div>
			`;
		});

		radio_group._set_content(color_options_html);

		registerForms();

		if (!middle_input.classList.contains("wrrgstrd")) {
			middle_input.classList.add("wrrgstrd");
			middle_input.addEventListener("value_set", () => {
				/** @type {string} */
				const color = middle_input._get_value();
				let radio_value, picker_value;
				if (color.match(/#\w{3,}/)) {
					radio_value = false;
					picker_value = color;
				} else {
					radio_value = color;
					picker_value = "";
				}
				radio_group._set_value(radio_value, { quiet: true });
				color_picker._set_value(picker_value, { quiet: true });
			});
		}

		radio_group.addEventListener("change", () => {
			middle_input._set_value(radio_group._get_value());
		});
		color_picker.addEventListener("change", () => {
			middle_input._set_value(color_picker._get_value());
		});
	};

	/**
	 *
	 * @param {PiepNode} color_wrapper
	 */
	const updateColorDropdown = (color_wrapper) => {
		const color_dropdown = color_wrapper._child("p-dropdown");

		registerForms(); // let the options_wrapper appear

		const options_wrapper = color_dropdown._child(".options_wrapper");

		let color_options_html = options_wrapper._child(`[data-value=""]`).outerHTML;
		colors_palette.forEach((color) => {
			color_options_html += html`
				<p-option data-value="var(--${color.name})">
					<div class="color_circle" style="background:var(--${color.name});"></div>
				</p-option>
			`;
		});

		color_options_html += html`
			<p-option data-tooltip="Inny kolor" data-match="#\\w{3,}" class="other_color">
				<i class="fas fa-eye-dropper"></i>
			</p-option>
			<p-option class="edit_theme_btn" data-tooltip="Zarządzaj paletą kolorów"> <i class="fas fa-cog"></i> </p-option>
		`;

		options_wrapper._set_content(color_options_html);

		color_dropdown._child(".other_color").addEventListener("click", () => {
			this.filter_blc_menu._set_value("appearance");
			let match = color_wrapper.classList.contains("prop_background_color") ? ".prop_background_color" : ".prop_color";
			match += " color-picker";
			const color_picker = this.side_menu._child(match);
			color_picker.click();
			color_picker.focus();
			scrollIntoView(color_picker, { duration: 0, offset: this.blc_menu_scroll_panel.offsetHeight * 0.5 });
		});
	};

	piep_cms_manager.registerProp({
		name: "text_tag",
		type_groups: ["appearance"],
		blc_groups: text_groups,
		// blc_groups: [
		// 	{
		// 		match_tag: piep_cms_manager.match_basic_text_containers,
		// 		priority: text_priority,
		// 	},
		// ],
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
		blc_groups: text_groups,
		menu_html: html`
			<div class="label">Rozmiar czcionki</div>
			<input class="field hidden" data-blc_prop="styles.fontSize" />

			<div class="label normal">
				<span class="case_palette">Rozmiar z listy</span>
				<span class="edit_theme_btn normal link">Zarządzaj</span>
			</div>
			<div class="pretty_radio global_root" style="--columns:6"></div>

			<div class="label normal">Inny rozmiar</div>
			<unit-input>
				<input />
				<select>
					<option value="px">px</option>
					<option value="em">em</option>
					<option value="rem">rem</option>
					<option value=""></option>
				</select>
			</unit-input>
		`,
	});

	piep_cms_manager.registerProp({
		name: "font_weight",
		type_groups: ["appearance"],
		blc_groups: text_groups,
		menu_html: html`
			<div class="label">Grubość czcionki</div>
			<div class="pretty_radio pretty_blue" data-blc_prop="styles.fontWeight" style="--columns:4">
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
		blc_groups: text_groups,
		// [
		// 	{
		// 		match_tag: piep_cms_manager.match_basic_text_containers,
		// 		priority: text_priority,
		// 	},
		// ],
		menu_html: html`
			<div class="label">Wyrównanie tekstu</div>
			<div class="pretty_radio pretty_blue" data-blc_prop="styles.textAlign" style="--columns:5">
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
		blc_groups: text_groups,
		menu_html: html`
			<div class="label">Kursywa (pochylenie czcionki)</div>
			<div class="pretty_radio pretty_blue" data-blc_prop="styles.fontStyle" style="--columns:5">
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
		blc_groups: text_groups,
		menu_html: html`
			<div class="label">Zdobienie czcionki</div>
			<div class="pretty_radio pretty_blue" data-blc_prop="styles.textDecoration" style="--columns:5">
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

	piep_cms_manager.registerProp({
		name: "color",
		type_groups: ["appearance"],
		blc_groups: text_groups,
		menu_html: html`
			<div class="label">Kolor czcionki</div>

			<input class="field hidden" data-blc_prop="styles.color" />

			<div class="label normal">
				<span class="case_palette">Kolor z palety</span>
				<span class="edit_theme_btn normal link">Zarządzaj</span>
			</div>
			<div class="pretty_radio global_root" style="--columns:6"></div>

			<div class="label normal">Inny kolor</div>
			<color-picker class="inline NOalpha"></color-picker>
		`,
		init: (piep_cms, menu_wrapper) => {
			const themeSettingsChanged = () => {
				updateColorWrapper(menu_wrapper);
			};
			window.addEventListener("theme_settings_changed", themeSettingsChanged);
			themeSettingsChanged();
		},
	});

	piep_cms_manager.registerProp({
		name: "background_color",
		type_groups: ["appearance"],
		//blc_groups: text_groups,
		menu_html: html`
			<div class="label">Kolor tła</div>

			<input class="field hidden" data-blc_prop="styles.backgroundColor" />

			<div class="label normal">
				<span class="case_palette">Kolor z palety</span>
				<span class="edit_theme_btn normal link">Zarządzaj</span>
			</div>
			<div class="pretty_radio global_root" style="--columns:6"></div>

			<div class="label normal">Inny kolor</div>
			<color-picker class="inline NOalpha"></color-picker>
		`,
		init: (piep_cms, menu_wrapper) => {
			const themeSettingsChanged = () => {
				updateColorWrapper(menu_wrapper);
			};
			window.addEventListener("theme_settings_changed", themeSettingsChanged);
			themeSettingsChanged();
		},
	});

	piep_cms_manager.registerFloatingProp({
		name: "text_tag",
		blc_groups: text_groups,
		// blc_groups: [
		// 	{
		// 		match_tag: piep_cms_manager.match_basic_text_containers,
		// 		priority: text_priority,
		// 	},
		// ],
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
		// blc_groups: [
		// 	{
		// 		match_tag: piep_cms_manager.match_basic_text_containers,
		// 		priority: text_priority,
		// 	},
		// ],
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
		name: "color",
		blc_groups: text_groups,
		menu_html: html`
			<p-dropdown
				class="field small inline pretty_blue center static_label grid global_root"
				data-blc_prop="styles.color"
				data-tooltip="Kolor czcionki"
			>
				<p-option data-value=""> <i class="fas fa-paint-brush"></i> </p-option>
			</p-dropdown>
		`,
		init: (piep_cms, menu_wrapper) => {
			const themeSettingsChanged = () => {
				updateColorDropdown(menu_wrapper);
			};
			window.addEventListener("theme_settings_changed", themeSettingsChanged);
			themeSettingsChanged();
		},
	});

	// bloated
	piep_cms_manager.registerFloatingProp({
		name: "background_color",
		blc_groups: [
			{
				match_tag: piep_cms_manager.match_text_containers,
				priority: text_priority,
			},
		],
		menu_html: html`
			<p-dropdown
				class="field small inline pretty_blue center static_label grid global_root"
				data-blc_prop="styles.backgroundColor"
				data-tooltip="Kolor tła"
			>
				<p-option data-value=""> <i class="fas fa-fill"></i> </p-option>
			</p-dropdown>
		`,
		init: (piep_cms, menu_wrapper) => {
			const themeSettingsChanged = () => {
				updateColorDropdown(menu_wrapper);
			};
			window.addEventListener("theme_settings_changed", themeSettingsChanged);
			themeSettingsChanged();
		},
	});

	piep_cms_manager.registerFloatingProp({
		name: "remove_format_btn",
		blc_groups: text_groups,
		menu_html: html`
			<button class="btn transparent small remove_format_btn" data-tooltip="Usuń formatowanie">
				<i class="fas fa-remove-format"></i>
			</button>
		`,
		init: (piep_cms) => {
			piep_cms.container.addEventListener("click", (ev) => {
				const target = $(ev.target);
				if (target._parent(".remove_format_btn") && piep_cms.text_selection) {
					const vids = [...piep_cms.text_selection.middle_vids, piep_cms.text_selection.focus_vid, piep_cms.text_selection.anchor_vid];
					vids.filter(onlyUnique).forEach((vid) => {
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
}

{
	[
		{ tag: "h1", label: "Nagłówek", icon: html`<span class="bold">H1</span>` },
		{ tag: "h2", label: "Nagłówek", icon: html`<span class="bold">H2</span>` },
		{ tag: "h3", label: "Nagłówek", icon: html`<span class="bold">H3</span>` },
		{ tag: "p", label: "Paragraf", icon: html`<i class="fas fa-align-center"></i>` },
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
