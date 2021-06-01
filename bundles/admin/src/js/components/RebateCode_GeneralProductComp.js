/* js[admin] */

/**
 * @typedef {{
 * general_product_id: number
 * qty: number
 * }} RebateCode_GeneralProductCompData
 *
 * @typedef {{
 * _data: RebateCode_GeneralProductCompData
 * _set_data(data?: RebateCode_GeneralProductCompData, options?: SetCompDataOptions)
 * _nodes: {
 * product_name: PiepNode
 * }
 * _show(options?: ShowModalParams)
 * } & BaseComp} RebateCode_GeneralProductComp
 */

/**
 * @param {RebateCode_GeneralProductComp} comp
 * @param {*} parent
 * @param {RebateCode_GeneralProductCompData} data
 */
function RebateCode_GeneralProductComp(comp, parent, data = undefined) {
	if (data === undefined) {
		data = { general_product_id: -1, qty: 0 };
	}

	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {
				const general_product = general_products.find((g) => g.general_product_id === data.general_product_id);
				comp._nodes.product_name._set_content(general_product ? general_product.name : "");
			},
		});
	};

	createComp(comp, parent, data, {
		template: html` <span data-node="{${comp._nodes.product_name}}"></span>
			<input class="field inline small mla" data-bind="{${data.qty}}" />
			<div class="ml2">
				<p-batch-trait data-trait="list_controls"></p-batch-trait>
			</div>`,
		initialize: () => {},
		ready: () => {},
	});
}
