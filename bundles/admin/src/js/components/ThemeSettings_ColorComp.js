/* js[admin] */

/**
 * @typedef {{
 * color: string
 * }} ThemeSettings_ColorCompData
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
		data = { color: "" };
	}

	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {},
		});
	};

	createComp(comp, parent, data, {
		template: html` <color-picker data-bind="{${data.color}}" class="inline small"></color-picker>
			<div style="flex-grow:1"></div>
			<p-batch-trait data-trait="list_controls"></p-batch-trait>`,
		initialize: () => {},
		ready: () => {},
	});
}
