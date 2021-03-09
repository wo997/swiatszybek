/* js[view] */

/** @type {PiepNode} */
let buy_products_wrapper;
/** @type {PiepNode} */
let rebate_codes_list;

domload(() => {
	buy_products_wrapper = $(".buy_products_wrapper");
	rebate_codes_list = $(".rebate_codes_list");

	initBuyNowCart();

	/** @type {AddressComp} */
	// @ts-ignore
	const main_address = $("address-comp.main_address");
	addressComp(main_address, undefined);

	/** @type {AddressComp} */
	// @ts-ignore
	const courier_address = $("address-comp.courier_address");
	addressComp(courier_address, undefined);

	document.addEventListener("scroll", onBuyNowScroll);
	window.addEventListener("resize", onBuyNowScroll);
	onBuyNowScroll();

	initRebateCodes();

	const buy_now_form = $(".buy_now_form");
	const choosen_account = buy_now_form._child(".choosen_account");
	const buy_without_registration = buy_now_form._child(".buy_without_registration");
	const case_choosen_account = buy_now_form._child(".case_choosen_account");
	const your_address_label = buy_now_form._child(".your_address_label");
	const delivery_input = buy_now_form._child(".delivery");
	const case_courier = buy_now_form._child(".case_courier");
	const case_parcel_locker = buy_now_form._child(".case_parcel_locker");
	const case_form_filled = buy_now_form._child(".case_form_filled");
	const courier_address_different_input = buy_now_form._child(".courier_address_different");
	const case_courier_address_different = buy_now_form._child(".case_courier_address_different");

	if (IS_LOGGED) {
		expand(case_choosen_account, true);
		expand(choosen_account, false);
	} else {
		buy_without_registration.addEventListener("click", () => {
			expand(case_choosen_account, true, { full_height_all_time: true });
			const rect = buy_without_registration.getBoundingClientRect();
			const diff = rect.top + rect.height - main_header_height.offsetHeight;
			if (diff > 0) {
				smoothScroll(diff);
			}
		});

		if (your_address_label) {
			your_address_label.classList.remove("first");
		}
	}

	delivery_input.addEventListener("change", () => {
		const delivery = delivery_input._get_value();
		expand(case_courier, delivery === "courier");
		expand(case_parcel_locker, delivery === "parcel_locker");
		expand(case_form_filled, true, { full_height_all_time: true });

		const rect = delivery_input.getBoundingClientRect();
		const diff = rect.top + rect.height - main_header_height.offsetHeight;
		if (diff > 0) {
			smoothScroll(diff);
		}
	});

	courier_address_different_input.addEventListener("change", () => {
		const courier_address_different = courier_address_different_input._get_value();
		expand(case_courier_address_different, !!courier_address_different);
	});
});

function initBuyNowCart() {
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
							<span><span style="font-weight: 400;"> ${e.code}:</span> -${e.value + (e.value.includes("%") ? "" : " zł")}</span>
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
}

function initRebateCodes() {
	const add_rebate_code_btn = $(".add_rebate_code_btn");
	add_rebate_code_btn.addEventListener("click", () => {
		showModal("activateRebateCode", { source: add_rebate_code_btn });
	});

	registerModalContent(
		html`
			<div id="activateRebateCode" data-dismissable>
				<div class="modal_body" style="width:400px;text-align: center;">
					<button class="close_modal_btn"><i class="fas fa-times"></i></button>
					<h3 class="modal_header">Kod rabatowy</h3>

					<div class="panel_padding">
						<div class="label first">Wpisz swój kod</div>
						<input type="text" class="field rebate_code" data-validate="string" />
						<div class="show_errors"></div>
						<button class="btn primary space_top fill activate_btn">Aktywuj</button>
					</div>
				</div>
			</div>
		`
	);

	$("#activateRebateCode .activate_btn").addEventListener("click", () => {
		const rebate_code = $("#activateRebateCode .rebate_code");
		const errors = validateInputs([rebate_code]);
		if (errors.length > 0) {
			return;
		}

		xhr({
			url: "/cart/activate-rebate-code",
			params: { rebate_code: rebate_code._get_value() },
			success: (res) => {
				if (res.errors && res.errors.length > 0) {
					$("#activateRebateCode .show_errors")._set_content(res.errors.join("<br>"));
					showInputErrors(rebate_code, res.errors);
				} else {
					showNotification("Kod rabatowy został aktywowany", { one_line: true, type: "success" });
					hideModal("activateRebateCode");
					rebate_code._set_value("");
				}
				user_cart = res.user_cart;
				loadedUserCart();
			},
		});
	});

	window.addEventListener("modal-show", (event) => {
		// @ts-ignore
		if (event.detail.node.id != "activateRebateCode") {
			return;
		}

		$("#activateRebateCode .show_errors")._empty();
		clearInputErrors($("#activateRebateCode .rebate_code"));
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
}

function onBuyNowScroll() {
	const scroll_top = document.documentElement.scrollTop;
	const margin_top = window.innerWidth < 1000 ? 0 : clamp(10, 100 - scroll_top, 100);
	buy_products_wrapper.style.marginTop = `${margin_top}px`;
}
