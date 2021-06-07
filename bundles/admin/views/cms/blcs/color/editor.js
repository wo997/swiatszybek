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

				const sp = color_wrapper._child(".selected_palette");
				if (sp) {
					sp.classList.toggle("hidden", !radio_value);
				}
				const sc = color_wrapper._child(".selected_color");
				if (sc) {
					sc.classList.toggle("hidden", !picker_value);
				}
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
	 * @param {PiepCMS} piep_cms
	 * @param {PiepNode} color_wrapper
	 */
	const updateColorDropdown = (piep_cms, color_wrapper) => {
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
			piep_cms.filter_blc_menu._set_value("appearance");
			let match = color_wrapper.classList.contains("prop_background_color") ? ".prop_background_color" : ".prop_color";
			match += " color-picker";
			const color_picker = piep_cms.side_menu._child(match);
			color_picker.click();
			color_picker.focus();
			scrollIntoView(color_picker, { duration: 0, offset: piep_cms.blc_menu_scroll_panel.offsetHeight * 0.5 });
		});
	};

	piep_cms_manager.registerProp({
		name: "color",
		type_groups: ["appearance"],
		blc_groups: text_groups,
		menu_html: html`
			<div class="label">Kolor czcionki</div>

			<input class="field hidden" data-blc_prop="styles.color" />

			<div class="label">
				<span class="case_palette"> <i class="fas fa-check selected_palette"></i> Z palety</span>
				<span class="edit_theme_btn link">Zarządzaj</span>
			</div>
			<div class="pretty_radio global_root" style="--columns:6"></div>

			<div class="label"><i class="fas fa-check selected_color"></i> Inny</div>
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
		menu_html: html`
			<div class="label">Kolor tła</div>
			<input class="field hidden" data-blc_prop="styles.backgroundColor" />

			<div class="label">
				<span class="case_palette"> <i class="fas fa-check selected_palette"></i> Z palety </span>
				<span class="edit_theme_btn link">Zarządzaj</span>
			</div>
			<div class="pretty_radio global_root" style="--columns:6"></div>

			<div class="label"><i class="fas fa-check selected_color"></i> Inny</div>
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
		name: "background_img",
		type_groups: ["appearance"],
		menu_html: html`
			<div class="label">Zdjęcie tła</div>
			<image-picker style="width:120px;height:120px" data-blc_prop="attrs.data-bckg_src"></image-picker>
		`,
		init: (piep_cms, menu_wrapper) => {
			// const middle_input = menu_wrapper._child("input");
			// const image_picker = menu_wrapper._child("image-picker");
			// image_picker.addEventListener("change", () => {
			// 	middle_input._set_value(`url(${image_picker._get_value()})`);
			// });
		},
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
				updateColorDropdown(piep_cms, menu_wrapper);
			};
			window.addEventListener("theme_settings_changed", themeSettingsChanged);
			themeSettingsChanged();
		},
	});

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
				updateColorDropdown(piep_cms, menu_wrapper);
			};
			window.addEventListener("theme_settings_changed", themeSettingsChanged);
			themeSettingsChanged();
		},
	});
}
