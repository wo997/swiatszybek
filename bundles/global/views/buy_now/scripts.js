/* js[view] */

/** @type {PiepNode} */
let buy_products_wrapper;

domload(() => {
	/** @type {CartProductComp} */
	// @ts-ignore
	const cart_products_comp = $("cart-products-comp.buy_products");
	if (!cart_products_comp) {
		return;
	}
	cartProductsComp(cart_products_comp, undefined);

	const loadCart = () => {
		cart_products_comp._data.products = user_cart.products;
		cart_products_comp._render();
		const empty = cart_products_comp._data.products.length === 0;
		expand($(".case_cart_not_empty"), !empty);
		expand($(".case_cart_empty"), empty);

		$$(".cart_product_count").forEach((e) => {
			e._set_content(cart_products_comp._data.products.length);
		});
	};

	window.addEventListener("user_cart_changed", loadCart);
	loadCart();

	/** @type {AddressComp} */
	// @ts-ignore
	const address_comp = $("address-comp.main_address");
	addressComp(address_comp, undefined);

	buy_products_wrapper = $(".buy_products_wrapper");
	document.addEventListener("scroll", onBuyNowScroll);
	window.addEventListener("resize", onBuyNowScroll);
	onBuyNowScroll();

	const add_rebate_code_btn = $(".add_rebate_code_btn");
	add_rebate_code_btn.addEventListener("click", () => {
		showModal("addRebateCode", { source: add_rebate_code_btn });
	});

	registerModalContent(
		html`
			<div id="addRebateCode" data-dismissable>
				<div class="modal_body">
					<button class="close_modal_btn"><i class="fas fa-times"></i></button>
					<h3 class="modal_header">Kod rabatowy</h3>

					<div class="panel_padding">
						<div class="label first">Wpisz kod</div>
						<input type="text" class="field" />
						<button class="btn primary space_top fill">Aktywuj</button>
					</div>
				</div>
			</div>
		`
	);
});

const onBuyNowScroll = () => {
	const scroll_top = document.documentElement.scrollTop;
	const margin_top = window.innerWidth < 1000 ? 0 : clamp(10, 100 - scroll_top, 100);
	buy_products_wrapper.style.marginTop = `${margin_top}px`;
};
