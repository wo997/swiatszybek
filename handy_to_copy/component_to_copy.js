// copy the code below baby :*
/* js[admin] */

/**
 * @typedef {{
 * }} MyCompData
 *
 * @typedef {{
 * _data: MyCompData
 * _set_data(data?: MyCompData, options?: SetCompDataOptions)
 * _nodes: {
 * }
 * } & BaseComp} MyComp
 */

/**
 * @param {MyComp} comp
 * @param {*} parent
 * @param {MyCompData} data
 */
function MyComp(comp, parent, data = undefined) {
	if (data === undefined) {
		data = {};
	}

	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {},
		});
	};

	createComp(comp, parent, data, {
		template: html``,
		initialize: () => {},
	});
}
