/* js[view] */

/**
 * @typedef {{
 * feature_id: number
 * name: string
 * options: ProductFeatureOptionCompData[]
 * }} ProductFeatureCompData
 *
 * @typedef {{
 * _data: ProductFeatureCompData
 * _set_data(data?: ProductFeatureCompData, options?: SetCompDataOptions)
 * _nodes: {
 *  add_option_btn: PiepNode
 * }
 * } & BaseComp} ProductFeatureComp
 */

/**
 * @param {ProductFeatureComp} comp
 * @param {*} parent
 * @param {ProductFeatureCompData} data
 */
function productFeatureComp(comp, parent, data = { feature_id: -1, name: "", options: [] }) {
	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {},
		});
	};

	createComp(comp, parent, data, {
		template: /*html*/ `
            <div class="label">Nazwa cechy produktu</div>
            <input type="text" class="field" data-bind="{${data.name}}"/></span>

            <div class="label">
                Opcje
                <button class="btn primary" data-node="{${comp._nodes.add_option_btn}}">
                    Dodaj <i class="fas fa-plus"></i>
                </button>
            </div>
            <list-comp data-bind="{${data.options}}">
                <product-feature-option-comp></product-feature-option-comp>
            </list-comp>

            <div html="{${JSON.stringify(data)}}"></div>
        `,
		initialize: () => {
			comp._nodes.add_option_btn.addEventListener("click", () => {
				comp._data.options.push({ name: "", option_id: -1, sub_options: [] });
				comp._render();
			});
		},
	});
}
