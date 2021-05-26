/* js[admin] */

/**
 * @typedef {{
 * unit_id: string
 * unit_name: string
 * active: number
 * }} ProductFeature_UnitCompData
 *
 * @typedef {{
 * _data: ProductFeature_UnitCompData
 * _set_data(data?: ProductFeature_UnitCompData, options?: SetCompDataOptions)
 * _nodes: {
 * }
 * _load_data(id: number)
 * _save()
 * _delete()
 * _select_current_group_id(id: any)
 * } & BaseComp} ProductFeature_UnitComp
 */

/**
 * @param {ProductFeature_UnitComp} comp
 * @param {*} parent
 * @param {ProductFeature_UnitCompData} data
 */
function ProductFeature_UnitComp(comp, parent, data) {
	if (data === undefined) {
		data = {
			unit_id: "",
			unit_name: "",
			active: 0,
		};
	}

	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<p-checkbox class="square inline" data-bind="{${data.active}}"></p-checkbox>
			<span html="{${data.unit_name}}" class="semi_bold ml1"> </span>
		`,
		ready: () => {},
	});
}
