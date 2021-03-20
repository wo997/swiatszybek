/* js[view] */

/** @type {PiepNode} */
let buy_products_wrapper;
/** @type {PiepNode} */
let rebate_codes_list;
/** @type {ParcelLock} */
let choose_parcel_locker = undefined;

/**
 * @typedef {{
 *	name: string,
 *	country: string,
 *	post_code: string,
 *	city: string,
 *	street: string,
 *	building_number: string,
 *	flat_number: string,
 * }} ParcelLock
 */

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
	const case_in_person = buy_now_form._child(".case_in_person");
	const case_form_filled = buy_now_form._child(".case_form_filled");
	const courier_address_different_input = buy_now_form._child(".courier_address_different");
	const case_courier_address_different = buy_now_form._child(".case_courier_address_different");
	const confirm_order_btn = buy_now_form._child(".confirm_order");
	const pick_inpost_parcel_locker_btn = buy_now_form._child(".pick_inpost_parcel_locker_btn");
	const accept_regulations_check = buy_now_form._child(".accept_regulations");

	if (IS_LOGGED) {
		// done in the view
		// expand(case_choosen_account, true);
		// expand(choosen_account, false);
	} else {
		buy_without_registration.addEventListener("click", () => {
			expand(case_choosen_account, true, { full_height_all_time: true });
			const rect = buy_without_registration.getBoundingClientRect();
			const diff = rect.top + rect.height - header_height;
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
		expand(case_in_person, delivery === "in_person");
		expand(case_form_filled, true, { full_height_all_time: true });

		const rect = delivery_input.getBoundingClientRect();
		const diff = rect.top + rect.height - header_height;
		if (diff > 0) {
			smoothScroll(diff);
		}
	});

	courier_address_different_input.addEventListener("change", () => {
		const courier_address_different = courier_address_different_input._get_value();
		expand(case_courier_address_different, !!courier_address_different);
	});

	confirm_order_btn.addEventListener("click", () => {
		let valid = true;

		if (!main_address._validate()) {
			valid = false;
		}

		const data = { main_address: main_address._data, delivery: delivery_input._get_value() };
		if (data.delivery === "courier") {
			if (!courier_address._validate()) {
				valid = false;
			}
			data.courier_address = courier_address._data;
		}
		if (data.delivery === "parcel_locker") {
			if (!choose_parcel_locker) {
				if (valid) {
					showNotification(`Wybierz paczkomat`, { type: "error", one_line: true });
					scrollIntoView(pick_inpost_parcel_locker_btn);
				}
				valid = false;
			}
			data.parcel_locker = choose_parcel_locker;
		}

		if (!accept_regulations_check._get_value()) {
			if (valid) {
				showNotification(`Musisz zaakceptować regulamin`, { type: "error", one_line: true });
				scrollIntoView(accept_regulations_check);
			}
			valid = false;
		}

		if (!valid) {
			return;
		}

		xhr({
			url: "/shop_order/confirm",
			params: {
				shop_order: data,
			},
			success: (res) => {
				// will be redirected
			},
		});
	});

	if (pick_inpost_parcel_locker_btn) {
		pick_inpost_parcel_locker_btn.addEventListener("click", () => {
			showInpostParcelLockerPickerModal(pick_inpost_parcel_locker_btn);
		});
	}
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

		if (user_cart.products.length <= 0) {
			showModal("emptyCart");
		}

		rebate_codes_list._set_content(rebate_codes_info);
	};

	window.addEventListener("user_cart_changed", loadCart);
	loadCart();

	initEmptyCartModal();
}

function initEmptyCartModal() {
	registerModalContent(
		html`
			<div id="emptyCart">
				<div class="modal_body" style="width:450px;text-align: center;">
					<h3 class="modal_header">Koszyk jest pusty</h3>
					<div class="panel_padding">
						<div class="semi-bold" style="padding:30px 0">Mamy nadzieję, że to nie koniec naszej przygody 😉</div>
						<a class="btn primary space_top fill" href="/"><i class="fas fa-chevron-left"></i> Wróć do zakupów</a>
					</div>
				</div>
			</div>
		`
	);
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

	window.addEventListener("modal_show", (event) => {
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

			if (confirm(`Czy aby na pewno chcesz usunąć kod rabatowy ${rebate_code}?`)) {
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
	buy_products_wrapper.style.setProperty("--margin_top", `${margin_top}px`);
}

// @ts-ignore
window.easyPackAsyncInit = () => {
	// @ts-ignore
	easyPack.init({
		defaultLocale: "pl",
	});
	// @ts-ignore
	const map = easyPack.mapWidget("easypack-map", (point) => {
		hideModal("InpostParcelLockerPicker");

		const address_details = point.address_details;

		choose_parcel_locker = {
			name: point.name,
			country: "Polska",
			post_code: address_details.post_code,
			city: address_details.city,
			street: address_details.street,
			building_number: address_details.building_number,
			flat_number: address_details.flat_number,
		};

		const buy_now_form = $(".buy_now_form");
		const choosen_parcel_locker = buy_now_form._child(".choosen_parcel_locker");
		choosen_parcel_locker._set_content(html`
			<div class="label">${choose_parcel_locker.name}</div>
			<p>${choose_parcel_locker.street} ${choose_parcel_locker.building_number}, ${choose_parcel_locker.city}</p>
		`);

		const pick_inpost_parcel_locker_btn = buy_now_form._child(".pick_inpost_parcel_locker_btn");
		pick_inpost_parcel_locker_btn._set_content(html`Wybierz inny <i class="fas fa-map-marker-alt"></i>`);
		pick_inpost_parcel_locker_btn.classList.remove("primary");
		pick_inpost_parcel_locker_btn.classList.add("subtle", "space_top");
	});
};

/**
 *
 * @param {PiepNode} src
 */
function showInpostParcelLockerPickerModal(src) {
	showModal("InpostParcelLockerPicker", { source: src });
	const viewport = $(".easypack-widget .scroll-box .viewport");
	if (viewport) {
		viewport.classList.add("scroll_panel");
	}
}
