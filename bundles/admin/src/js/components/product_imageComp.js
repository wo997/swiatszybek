/* js[admin] */

/**
 * @typedef {{
 * product_image_id
 * img_url: string
 * } & ListCompRowData} Product_ImageCompData
 *
 * @typedef {{
 * _data: Product_ImageCompData
 * _set_data(data?: Product_ImageCompData, options?: SetCompDataOptions)
 * _nodes: {
 *  feature_name: PiepNode
 *  edit_Image_btn: PiepNode
 *  add_option_btn: PiepNode
 * } & ListControlTraitNodes
 * } & BaseComp} Product_ImageComp
 */

/**
 * @param {Product_ImageComp} comp
 * @param {*} parent
 * @param {Product_ImageCompData} data
 */
function product_imageComp(comp, parent, data = { product_image_id: -1, img_url: "" }) {
	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<image-input data-bind="{${data.img_url}}" data-options='{"width":"100px","height":"1w"}'></image-input>
			<p-batch-trait data-trait="list_controls"></p-batch-trait>
		`,
		initialize: () => {
			/** @type {ListComp} */
			// @ts-ignore
			const list = comp._parent_comp;

			/** @type {ProductComp} */
			// @ts-ignore
			const product_comp = list._parent_comp;
		},
	});
}
