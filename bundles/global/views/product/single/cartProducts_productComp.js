/* js[view] */

/**
 * @typedef {{
 * product_id: number
 * name: string
 * qty: number
 * img_url: string
 * gross_price: number
 * net_price: number
 * }} CartProducts_ProductCompData
 *
 * @typedef {{
 * _data: CartProducts_ProductCompData
 * _set_data(data?: CartProducts_ProductCompData, options?: SetCompDataOptions)
 * _nodes: {
 *  remove_btn: PiepNode
 * }
 * } & BaseComp} CartProducts_ProductComp
 */

/**
 * @param {CartProducts_ProductComp} comp
 * @param {*} parent
 * @param {CartProducts_ProductCompData} data
 */
function cartProducts_productComp(comp, parent, data = undefined) {
	if (data === undefined) {
		data = { product_id: -1, img_url: "", name: "", qty: 0, gross_price: 0, net_price: 0 };
	}

	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<span html="{${data.name}}" class="product_name"></span>
			<span html="{${data.qty}}" class="product_qty"></span>
			<img data-src="{${data.img_url}}" class="wo997_img product_image" data-height="1w" />
			<span html="{${data.gross_price}}" class="product_price"></span>
			<button class="btn small subtle" data-node="{${comp._nodes.remove_btn}}"><i class="fas fa-times"></i></button>
		`,
		initialize: () => {
			comp._nodes.remove_btn.addEventListener("click", () => {
				xhr({
					url: "/cart/remove-product",
					params: {
						product_id: data.product_id,
					},
					success: (res) => {
						user_cart = res.user_cart;
						loadedUserCart();
						window.dispatchEvent(new CustomEvent("user_cart_changed"));
					},
				});
			});
		},
	});
}
