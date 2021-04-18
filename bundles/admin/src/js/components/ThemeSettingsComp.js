/* js[admin] */

/**
 * @typedef {{
 * colors: ThemeSettings_ColorCompData[]
 * }} ThemeSettingsCompData
 *
 * @typedef {{
 * _data: ThemeSettingsCompData
 * _set_data(data?: ThemeSettingsCompData, options?: SetCompDataOptions)
 * _nodes: {
 *  add_color_btn: PiepNode
 *  save_btn: PiepNode
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
		data = { colors: [] };
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
			<button class="btn primary" data-node="{${comp._nodes.save_btn}}">Zapisz <i class="fas fa-save"></i></button>

			<div class="scroll_panel scroll_shadow panel_padding">
				<div>
					<div class="user_info mb3"><i class="fas fa-info-circle"></i> Uwaga - wszystkie zmiany wprowadzanie tutaj są globalne!</div>

					<div class="label first">Główna czcionka</div>
					<div class="pretty_radio semi_bold">
						<div class="checkbox_area">
							<p-checkbox data-value="Open Sans"></p-checkbox>
							<span> Open Sans </span>
						</div>
						<div class="checkbox_area">
							<p-checkbox data-value="Montserrat"></p-checkbox>
							<span> Montserrat </span>
						</div>
						<div class="checkbox_area">
							<p-checkbox data-value="Lato"></p-checkbox>
							<span> Lato </span>
						</div>
					</div>

					<div>
						<span class="label medium bold inline"> Paleta kolorów (<span html="{${data.colors.length}}"></span>) </span>
						<button class="btn primary small" data-node="{${comp._nodes.add_color_btn}}">Dodaj kolor <i class="fas fa-plus"></i></button>
					</div>
					<list-comp data-bind="{${data.colors}}" class="wireframe space">
						<theme-settings_color-comp></theme-settings_color-comp>
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

			comp._nodes.save_btn.addEventListener("click", () => {
				const save_colors_palette = comp._data.colors.map((c) => ({ name: c.name, value: c.value }));

				showLoader();

				// TODO: save, build, and return in one go, cmon!
				xhr({
					url: STATIC_URLS["ADMIN"] + "/theme/save_settings",
					params: {
						colors_palette: save_colors_palette,
					},
					success: (res) => {
						colors_palette = res.colors_palette;
						loadedColorPalette();
						$("#main_stylesheet").href = `/builds/global.css?v=${res.ASSETS_RELEASE}`;
						showNotification("Zapisano zmiany motywu", { type: "success", one_line: true });
						hideLoader();
					},
				});
			});
		},
		ready: () => {},
	});
}

function getThemeSettingsModal() {
	const ex = $("#ThemeSettings");
	if (!ex) {
		registerModalContent(html`
			<div id="ThemeSettings" data-expand data-dismissable>
				<div class="modal_body" style="max-width: 1000px;max-height: calc(75% + 100px);">
					<div class="custom_toolbar">
						<span class="title medium">Ustawienia motywu <span class="product_name"></span></span>
						<button class="btn subtle" onclick="hideParentModal(this)">Zamknij <i class="fas fa-times"></i></button>
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

	$("#ThemeSettings .custom_toolbar").append(theme_settings_comp._nodes.save_btn);

	return theme_settings_comp;
}
