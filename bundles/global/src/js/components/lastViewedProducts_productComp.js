/* js[global] */

/**
 * @typedef {LastViewedProduct} LastViewedProducts_ProductCompData
 *
 * @typedef {{
 * _data: LastViewedProducts_ProductCompData
 * _set_data(data?: LastViewedProducts_ProductCompData, options?: SetCompDataOptions)
 * _nodes: {
 *  remove_btn: PiepNode
 * }
 * } & BaseComp} LastViewedProducts_ProductComp
 */

/**
 * @param {LastViewedProducts_ProductComp} comp
 * @param {*} parent
 * @param {LastViewedProducts_ProductCompData} data
 */
function LastViewedProducts_ProductComp(comp, parent, data = undefined) {
	if (data === undefined) {
		data = { general_product_id: -1, img_url: "", name: "", url: "" };
	}

	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {},
		});
	};

	createComp(comp, parent, data, {
		template: html` <a href="${data.url}">
			<div class="square_img_wrapper"><img data-src="{${data.img_url}}" class="wo997_img product_img" /></div>
			<span html="{${data.name}}" class="product_name"></span>
		</a>`,
		initialize: () => {},
	});
}
