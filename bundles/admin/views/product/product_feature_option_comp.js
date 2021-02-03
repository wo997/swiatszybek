/* js[view] */

/**
 * @typedef {{
 * option_id: number
 * name: string
 * sub_options: ProductFeatureOptionCompData[]
 * } & ListCompRowData} ProductFeatureOptionCompData
 *
 * @typedef {{
 * _data: ProductFeatureOptionCompData
 * _set_data(data?: ProductFeatureOptionCompData, options?: SetCompDataOptions)
 * _nodes: {
 * }
 * } & BaseComp} ProductFeatureOptionComp
 */

/**
 * @param {ProductFeatureOptionComp} comp
 * @param {*} parent
 * @param {ProductFeatureOptionCompData} data
 */
function productFeatureOptionComp(comp, parent, data = { option_id: -1, name: "", sub_options: [] }) {
	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {},
		});
	};

	createComp(comp, parent, data, {
		template: /*html*/ `
                <div class="label">Opcja <span html="{${data.row_index + 1}}"></span></div>
                <input type="text" class="field" data-bind="{${data.name}}"/></span>
    
                <div class="label">Opcje</div> 
                <list-comp data-bind="{${data.sub_options}}">
                    <product-feature-option-comp></product-feature-option-comp>
                <list-comp>
    
                <div html="{${JSON.stringify(data)}}"></div>
            `,
		initialize: () => {},
	});
}
