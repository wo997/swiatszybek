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
			<img data-src="{${data.img_url}}" class="wo997_img product_image" data-height="1w" />
			<span html="{${data.name}}" class="product_name"></span>
			<button class="btn transparent product_remove small" data-node="{${comp._nodes.remove_btn}}"><i class="fas fa-times"></i></button>

			<div class="bottom_row">
				<span class="product_price pln" html="{${data.gross_price + " zł / szt."}}"></span>
				<div class="glue_children qty_controls main_qty_controls">
					<button class="btn subtle sub_qty">
						<i class="fas fa-minus"></i>
					</button>
					<input type="text" class="field inline val_qty" data-bind="{${data.qty}}" data-number inputmode="numeric" />
					<button class="btn subtle add_qty small">
						<i class="fas fa-plus"></i>
					</button>
				</div>
				<span class="product_total_price pln" html="{${data.gross_price * data.qty + " zł"}}"></span>
			</div>
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
