/* js[admin] */

/**
 * @typedef {{
 * is_main: boolean
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
function product_imageComp(comp, parent, data = { product_image_id: -1, img_url: "", is_main: false }) {
	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<image-input data-bind="{${data.img_url}}" style="width:100px;height:100px"></image-input>

			<div style="margin-left: 5px" data-tooltip="Domyślne zdjęcie wyświetlane na liście produktów" class="checkbox_area">
				<p-checkbox data-bind="{${data.is_main}}" class="square"></p-checkbox>
				Główne
			</div>

			<div style="margin-left:auto">
				<p-batch-trait data-trait="list_controls"></p-batch-trait>
			</div>
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
