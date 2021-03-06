/* js[global] */

/**
 * @typedef {{
 * product_id: number
 * name: string
 * qty: number
 * img_url: string
 * __current_gross_price: number
 * net_price: number
 * url: string
 * no_redirect?: boolean
 * sell_by: string
 * base_unit: string
 * qty_step: number
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
function CartProducts_ProductComp(comp, parent, data = undefined) {
	if (data === undefined) {
		data = {
			product_id: -1,
			img_url: "",
			name: "",
			qty: 0,
			__current_gross_price: 0,
			net_price: 0,
			url: "",
			sell_by: "qty",
			qty_step: 1,
			base_unit: "",
		};
	}

	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {},
		});
	};

	let template = html` <div class="square_img_wrapper"><img data-src="{${data.img_url}}" class="wo997_img product_img" /></div> `;

	if (data.no_redirect) {
		template += html`<span html="{${data.name}}" class="product_name"></span>`;
	} else {
		template += html`<a html="{${data.name}}" class="product_name" href="${data.url}"></a>`;
	}

	template += html`<button class="btn transparent product_remove small" data-node="{${comp._nodes.remove_btn}}">
			<i class="fas fa-times"></i>
		</button>

		<div class="bottom_row">
			<span
				class="product_price pln"
				html="{${data.__current_gross_price +
				" zł / " +
				(data.sell_by === "qty" ? "szt." : physical_measure_unit_map[data.base_unit].name)}}"
			></span>
			<div class="glue_children qty_controls" data-product="user_cart ${data.product_id}">
				<button class="btn subtle sub_qty">
					<i class="fas fa-minus"></i>
				</button>
				<div class="spinner_wrapper inline">
					<input type="text" class="field inline val_qty number" data-bind="{${data.qty}}" inputmode="numeric" data-input_delay="3000" />
					<div class="spinner overlay"></div>
				</div>
				<button class="btn subtle add_qty small">
					<i class="fas fa-plus"></i>
				</button>
			</div>
			<span class="product_total_price pln" html="{${(data.__current_gross_price * data.qty).toFixed(2) + " zł"}}"></span>
		</div>`;

	createComp(comp, parent, data, {
		template,
		initialize: () => {
			comp._nodes.remove_btn.addEventListener("click", () => {
				comp.style.opacity = "0.6";
				xhr({
					url: "/cart/remove-product",
					params: {
						product_id: data.product_id,
					},
					success: (res) => {
						user_cart = res.user_cart;
						loadedUserCart();
					},
				});
			});
		},
	});
}
