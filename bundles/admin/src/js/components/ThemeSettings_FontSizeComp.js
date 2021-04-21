/* js[admin] */

/**
 * @typedef {{
 * } & FontSizeData} ThemeSettings_FontSizeCompData
 *
 * @typedef {{
 * _data: ThemeSettings_FontSizeCompData
 * _set_data(data?: ThemeSettings_FontSizeCompData, options?: SetCompDataOptions)
 * _nodes: {
 * }
 * _show(options?: ShowModalParams)
 * } & BaseComp} ThemeSettings_FontSizeComp
 */

/**
 * @param {ThemeSettings_FontSizeComp} comp
 * @param {*} parent
 * @param {ThemeSettings_FontSizeCompData} data
 */
function ThemeSettings_FontSizeComp(comp, parent, data = undefined) {
	if (data === undefined) {
		data = { desktop_value: "", tablet_value: "", mobile_value: "", name: "" };
	}

	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {},
		});
	};

	createComp(comp, parent, data, {
		template: html` 
        	<input class="field inline small trim" style="width: 95px" data-bind="{${data.desktop_value}}">
            <input class="field inline small ml1 trim" style="width: 95px" data-bind="{${data.tablet_value}}">
            <input class="field inline small ml1 trim" style="width: 95px" data-bind="{${data.mobile_value}}">
			<input class="field inline small ml1 trim" style="width: 95px" data-bind="{${data.name}}" data-tooltip="<span class='font_error'>Nie zaleca się zmiany bez wiedzy technicznej</span>"></div>
			<div class="mla">
				<p-batch-trait data-trait="list_controls"></p-batch-trait>
			</div>`,
		initialize: () => {},
		ready: () => {},
	});
}
