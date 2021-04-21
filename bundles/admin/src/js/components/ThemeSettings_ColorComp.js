/* js[admin] */

/**
 * @typedef {{
 * } & PaletteColorData} ThemeSettings_ColorCompData
 *
 * @typedef {{
 * _data: ThemeSettings_ColorCompData
 * _set_data(data?: ThemeSettings_ColorCompData, options?: SetCompDataOptions)
 * _nodes: {
 * }
 * _show(options?: ShowModalParams)
 * } & BaseComp} ThemeSettings_ColorComp
 */

/**
 * @param {ThemeSettings_ColorComp} comp
 * @param {*} parent
 * @param {ThemeSettings_ColorCompData} data
 */
function ThemeSettings_ColorComp(comp, parent, data = undefined) {
	if (data === undefined) {
		data = { value: "", name: "" };
	}

	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {},
		});
	};

	createComp(comp, parent, data, {
		template: html` <color-picker data-bind="{${data.value}}" class="inline small"></color-picker>
			<input class="field inline small ml1 trim" style="width: 95px" data-bind="{${data.name}}" data-tooltip="<span class='text_error'>Nie zaleca się zmiany bez wiedzy technicznej</span>"></div>
			<div class="mla">
				<p-batch-trait data-trait="list_controls"></p-batch-trait>
			</div>`,
		initialize: () => {},
		ready: () => {},
	});
}
