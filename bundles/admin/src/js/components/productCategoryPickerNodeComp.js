/* js[admin] */

/**
 * @typedef {{
 * selected: boolean
 * product_category_id: number
 * product_category_name: string
 * categories: ProductCategoryPickerNodeCompData[]
 * }} ProductCategoryPickerNodeCompData
 *
 * @typedef {{
 * _data: ProductCategoryPickerNodeCompData
 * _set_data(data?: ProductCategoryPickerNodeCompData, options?: SetCompDataOptions)
 * _nodes: {
 *  expand_btn: PiepNode
 *  expand: PiepNode
 * }
 * } & BaseComp} ProductCategoryPickerNodeComp
 */

/**
 * @param {ProductCategoryPickerNodeComp} comp
 * @param {*} parent
 * @param {ProductCategoryPickerNodeCompData} data
 */
function productCategoryPickerNodeComp(comp, parent, data = undefined) {
	if (data === undefined) {
		data = {
			product_category_id: -1,
			product_category_name: "",
			selected: false,
			categories: [],
		};
	}

	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {
				expand(comp._nodes.expand, data.selected);
			},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<label>
				<p-checkbox class="square inline" data-bind="{${data.selected}}"></p-checkbox>
				<span class="semi-bold" html="{${data.product_category_name}}"></span>
			</label>
			<div class="expand_y {${data.categories.length === 0}?empty}" data-node="{${comp._nodes.expand}}">
				<list-comp data-bind="{${data.categories}}" class="wireframe">
					<product-category-picker-node-comp></product-category-picker-node-comp>
				</list-comp>
			</div>
		`,
		initialize: () => {},
	});
}
