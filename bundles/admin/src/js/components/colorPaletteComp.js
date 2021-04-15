/* js[admin] */

/**
 * @typedef {{
 * }} ColorPaletteCompData
 *
 * @typedef {{
 * _data: ColorPaletteCompData
 * _set_data(data?: ColorPaletteCompData, options?: SetCompDataOptions)
 * _nodes: {
 * }
 * _show(options?: ShowModalParams)
 * } & BaseComp} ColorPaletteComp
 */

/**
 * @param {ColorPaletteComp} comp
 * @param {*} parent
 * @param {ColorPaletteCompData} data
 */
function ColorPaletteComp(comp, parent, data = undefined) {
	if (data === undefined) {
		data = {};
	}

	comp._show = (options = {}) => {
		setTimeout(() => {
			showModal("colorPalette", {
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
			<div class="custom_toolbar">
				<span class="title medium">Wybierz cechy dla: <span class="product_name"></span></span>
				<button class="btn subtle" onclick="hideParentModal(this)">Zamknij <i class="fas fa-times"></i></button>
			</div>
			<div class="scroll_panel scroll_shadow panel_padding">lista</div>
		`,
		initialize: () => {},
		ready: () => {},
	});
}

function getColorPaletteModal() {
	const ex = $("#colorPalette");
	if (!ex) {
		registerModalContent(html`
			<div id="colorPalette" data-expand data-dismissable>
				<div class="modal_body" style="max-width: 1000px;max-height: calc(75% + 100px);">
					<color-palette-comp></color-palette-comp>
				</div>
			</div>
		`);
	}

	/** @type {ColorPaletteComp} */
	// @ts-ignore
	const color_palette_comp = $("#colorPalette color-palette-comp");
	if (!ex) {
		ColorPaletteComp(color_palette_comp, undefined);
	}

	return color_palette_comp;
}
