/* js[view] */

/** @type {PiepNode} */
let buy_products_wrapper;
/** @type {PiepNode} */
let rebate_codes_list;

domload(() => {
	buy_products_wrapper = $(".buy_products_wrapper");
	rebate_codes_list = $(".rebate_codes_list");

	/** @type {CartProductComp} */
	// @ts-ignore
	const cart_products_comp = $("cart-products-comp.buy_products");
	cartProductsComp(cart_products_comp, undefined);

	const loadCart = () => {
		cart_products_comp._data.products = user_cart.products;
		cart_products_comp._render();

		let rebate_codes_info = "";
		if (user_cart.rebate_codes.length > 0) {
			rebate_codes_info = user_cart.rebate_codes
				.map(
					(e) =>
						html`<span class="rebate_code_block">
							<span><span style="font-weight: 400;"> ${e.code}:</span> -${e.value}</span>
							<button class="btn transparent small remove_rebate_code" data-code="${e.code}">
								<i class="fas fa-times"></i>
							</button>
						</span>`
				)
				.join("<br>");
		}

		rebate_codes_list._set_content(rebate_codes_info);
	};

	window.addEventListener("user_cart_changed", loadCart);
	loadCart();

	/** @type {AddressComp} */
	// @ts-ignore
	const address_comp = $("address-comp.main_address");
	addressComp(address_comp, undefined);

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
				<div class="modal_body" style="width:400px;text-align: center;">
					<button class="close_modal_btn"><i class="fas fa-times"></i></button>
					<h3 class="modal_header">Kod rabatowy</h3>

					<div class="panel_padding">
						<div class="label first" data-validate="string">Wpisz swój kod</div>
						<input type="text" class="field rebate_code" />
						<div class="show_errors"></div>
						<button class="btn primary space_top fill activate_btn">Aktywuj</button>
					</div>
				</div>
			</div>
		`
	);

	$("#addRebateCode .activate_btn").addEventListener("click", () => {
		const rebate_code = $("#addRebateCode .rebate_code");
		if (!validateInputs([rebate_code])) {
			return;
		}

		xhr({
			url: "/cart/activate-rebate-code",
			params: { rebate_code: rebate_code._get_value() },
			success: (res) => {
				if (res.errors && res.errors.length > 0) {
					$("#addRebateCode .show_errors")._set_content(res.errors.join("<br>"));
					showInputErrors(rebate_code, res.errors);
				} else {
					showNotification("Kod rabatowy został aktywowany", { one_line: true, type: "success" });
					hideModal("addRebateCode");
				}
				user_cart = res.user_cart;
				loadedUserCart();
			},
		});
	});

	document.addEventListener("click", (ev) => {
		const target = $(ev.target);
		const remove_rebate_code = target._parent(".remove_rebate_code", { skip: 0 });
		if (remove_rebate_code) {
			const rebate_code = remove_rebate_code.dataset.code;

			if (confirm(`Czy aby na pewno chcesz usunąń kod rabatowy ${rebate_code}`)) {
				xhr({
					url: "/cart/deactivate-rebate-code",
					params: { rebate_code },
					success: (res) => {
						user_cart = res.user_cart;
						loadedUserCart();
					},
				});
			}
		}
	});
});

const onBuyNowScroll = () => {
	const scroll_top = document.documentElement.scrollTop;
	const margin_top = window.innerWidth < 1000 ? 0 : clamp(10, 100 - scroll_top, 100);
	buy_products_wrapper.style.marginTop = `${margin_top}px`;
};
