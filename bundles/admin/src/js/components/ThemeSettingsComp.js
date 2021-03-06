/* js[admin] */

/**
 * @typedef {{
 * container_max_width: string
 * default_padding: string
 * colors: ThemeSettings_ColorCompData[]
 * font_sizes: ThemeSettings_FontSizeCompData[]
 * font_family: string
 * }} ThemeSettingsCompData
 *
 * @typedef {{
 * _data: ThemeSettingsCompData
 * _set_data(data?: ThemeSettingsCompData, options?: SetCompDataOptions)
 * _nodes: {
 *  add_color_btn: PiepNode
 *  save_btn: PiepNode
 *  add_font_size_btn: PiepNode
 * }
 * _show(options?: ShowModalParams)
 * } & BaseComp} ThemeSettingsComp
 */

/**
 * @param {ThemeSettingsComp} comp
 * @param {*} parent
 * @param {ThemeSettingsCompData} data
 */
function ThemeSettingsComp(comp, parent, data = undefined) {
	if (data === undefined) {
		data = { colors: [], font_sizes: [], font_family: "", container_max_width: "1300px", default_padding: "10px" };
	}

	comp._show = (options = {}) => {
		setTimeout(() => {
			showModal("ThemeSettings", {
				source: options.source,
			});
		});
	};

	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<button class="btn primary ml1" data-node="{${comp._nodes.save_btn}}">Zapisz <i class="fas fa-save"></i></button>

			<div class="scroll_panel scroll_shadow panel_padding">
				<div class="mtfn">
					<!-- <div class="hover_info">Uwaga - wszystkie zmiany wprowadzane tutaj są globalne!</div> -->

					<div class="label">Maksymalna szerkość kontenera / sekcji (px)</div>
					<div class="glue_children">
						<input class="field" data-bind="{${data.container_max_width}}" />
						<div class="field_desc">px</div>
					</div>

					<div class="label">Domyślny odstęp</div>
					<div class="glue_children">
						<input class="field" data-bind="{${data.default_padding}}" />
						<div class="field_desc">px</div>
					</div>

					<div class="label">Główna czcionka</div>
					<div class="pretty_radio semi_bold" data-bind="{${data.font_family}}" style="max-width: 500px;--columns:3">
						${Object.entries(fonts)
							.map(
								([font_family, data]) =>
									html`<div class="checkbox_area">
										<p-checkbox data-value="${font_family}"></p-checkbox>
										<span>${font_family}</span>
									</div>`
							)
							.join("")}
					</div>

					<div>
						<span class="label medium bold inline"> Paleta kolorów (<span html="{${data.colors.length}}"></span>) </span>
						<button class="btn primary small" data-node="{${comp._nodes.add_color_btn}}">Dodaj kolor <i class="fas fa-plus"></i></button>
					</div>
					<list-comp data-bind="{${data.colors}}" class="wireframe space">
						<theme-settings_color-comp></theme-settings_color-comp>
					</list-comp>

					<div>
						<span class="label medium bold inline"> Lista rozmiarów czcionek (<span html="{${data.font_sizes.length}}"></span>) </span>
						<button class="btn primary small" data-node="{${comp._nodes.add_font_size_btn}}">
							Dodaj rozmiar czcionki <i class="fas fa-plus"></i>
						</button>
					</div>
					<div style="display:flex;justify-content:space-around;max-width: 400px;margin-left: 7px;padding: 5px 0;">
						<i class="fas fa-desktop"></i>
						<i class="fas fa-tablet-alt" style="transform:rotate(90deg) scale(0.9,1)"></i>
						<i class="fas fa-tablet-alt" style="transform:scale(0.9,1)"></i>
						<i class="fas fa-mobile-alt"></i>
					</div>
					<list-comp data-bind="{${data.font_sizes}}" class="wireframe space">
						<theme-settings_font-size-comp></theme-settings_font-size-comp>
					</list-comp>
				</div>
			</div>
		`,
		initialize: () => {
			comp._nodes.add_color_btn.addEventListener("click", () => {
				const data = comp._data;
				const next_id = Math.max(0, ...comp._data.colors.map((c) => numberFromStr(c.name))) + 1;
				const name = `clr_${next_id}`;
				data.colors.push({ value: "", name });
				comp._render();
			});

			comp._nodes.add_font_size_btn.addEventListener("click", () => {
				const data = comp._data;
				const next_id = Math.max(0, ...comp._data.font_sizes.map((c) => numberFromStr(c.name))) + 1;
				const name = `size_${next_id}`;
				data.font_sizes.push({ df_value: "", bg_value: "", md_value: "", sm_value: "", name });
				comp._render();
			});

			comp._nodes.save_btn.addEventListener("click", () => {
				const data = comp._data;
				const save_colors_palette = data.colors.map((c) => ({ name: c.name, value: c.value }));
				const save_font_sizes = data.font_sizes.map((c) => ({
					name: c.name,
					df_value: c.df_value,
					bg_value: c.bg_value,
					md_value: c.md_value,
					sm_value: c.sm_value,
				}));

				showLoader();
				hideModal("ThemeSettings");

				xhr({
					url: STATIC_URLS["ADMIN"] + "/theme/save_settings?no_build",
					params: {
						colors_palette: save_colors_palette,
						font_family: data.font_family,
						font_sizes: save_font_sizes,
						container_max_width: data.container_max_width,
						default_padding: data.default_padding,
					},
					success: (res) => {
						colors_palette = res.colors_palette;
						main_font_family = res.font_family;
						font_sizes = res.font_sizes;
						loadedThemeSettings();
						VERSIONS.global++;
						$("#main_stylesheet").href = `/builds/global.css?v=${VERSIONS.global}x`; // x just in case :*
						$("#main_font").href = fonts[main_font_family].link;

						showNotification("Zapisano zmiany motywu", { type: "success", one_line: true });
						buildResponsiveHeader();
					},
				});
			});
		},
		ready: () => {},
	});
}

/**
 *
 * @param {ThemeSettingsComp} theme_settings_comp
 */
function setThemeSettingsCompData(theme_settings_comp) {
	const data = theme_settings_comp._data;

	data.colors = colors_palette;
	data.font_family = main_font_family;
	data.font_sizes = font_sizes;
	data.container_max_width = container_max_width;
	data.default_padding = default_padding;

	theme_settings_comp._render();
}

function getThemeSettingsModal() {
	const ex = $("#ThemeSettings");
	if (!ex) {
		registerModalContent(html`
			<div id="ThemeSettings" data-expand data-dismissable>
				<div class="modal_body" style="max-width: 1000px;max-height: calc(75% + 100px);">
					<div class="custom_toolbar">
						<span class="title medium">Ustawienia motywu <span class="product_name"></span></span>
						<button class="btn subtle mla" onclick="hideParentModal(this)">Zamknij <i class="fas fa-times"></i></button>
					</div>
					<theme-settings-comp class="flex_stretch"></theme-settings-comp>
				</div>
			</div>
		`);
	}

	/** @type {ThemeSettingsComp} */
	// @ts-ignore
	const theme_settings_comp = $("#ThemeSettings theme-settings-comp");
	if (!ex) {
		ThemeSettingsComp(theme_settings_comp, undefined);
	}

	setThemeSettingsCompData(theme_settings_comp);

	$("#ThemeSettings .custom_toolbar").append(theme_settings_comp._nodes.save_btn);

	return theme_settings_comp;
}
