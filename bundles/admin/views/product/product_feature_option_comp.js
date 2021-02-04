/* js[view] */

/**
 * @typedef {{
 * option_id: number
 * name: string
 * options: ProductFeatureOptionCompData[]
 * } & ListCompRowData} ProductFeatureOptionCompData
 *
 * @typedef {{
 * _data: ProductFeatureOptionCompData
 * _set_data(data?: ProductFeatureOptionCompData, options?: SetCompDataOptions)
 * _nodes: {
 *  add_option_btn: PiepNode
 * }
 * } & BaseComp} ProductFeatureOptionComp
 */

/**
 * @param {ProductFeatureOptionComp} comp
 * @param {*} parent
 * @param {ProductFeatureOptionCompData} data
 */
function productFeatureOptionComp(comp, parent, data = { option_id: -1, name: "", options: [] }) {
	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {},
		});
	};

	createComp(comp, parent, data, {
		template: html`
            <input type="text" class="field inline" data-bind="{${data.name}}"/></span>

            <div class="inline">
                <button class="btn primary small" data-node="{${comp._nodes.add_option_btn}}">
                    Dodaj opcję podrzędną <i class="fas fa-plus"></i>
                </button>
                <p-batch-trait data-trait="list_controls"></p-batch-trait>
            </div> 
            <list-comp data-bind="{${data.options}}">
                <product-feature-option-comp></product-feature-option-comp>
            </list-comp>
        `,
		initialize: () => {
			comp._nodes.add_option_btn.addEventListener("click", () => {
				comp._data.options.push({ name: "", option_id: -1, options: [] });
				comp._render();
			});
		},
	});
}
