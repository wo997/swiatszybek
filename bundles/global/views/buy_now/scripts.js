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
	let ready = false;
	buy_products_wrapper = $(".buy_products_wrapper");
	rebate_codes_list = $(".rebate_codes_list");

	initBuyNowCart();

	/** @type {AddressComp} */
	// @ts-ignore
	const main_address = $("address-comp.main_address");
	AddressComp(main_address, undefined);

	/** @type {AddressComp} */
	// @ts-ignore
	const courier_address = $("address-comp.courier_address");
	AddressComp(courier_address, undefined);

	const buy_now_container = $(".buy_now_container");
	const onBuyNowScroll = () => {
		const scroll_top = document.documentElement.scrollTop;
		let margin_top = 0;
		if (window.innerWidth >= 1000) {
			margin_top = clamp(10, 100 - scroll_top, 100);
			const bottom = buy_now_container.getBoundingClientRect().bottom - window.innerHeight;
			if (bottom < 0) {
				margin_top = bottom;
			}
			//margin_top += header_height;
			buy_products_wrapper.style.setProperty("--top", `${margin_top}px`);
		}
	};

	document.addEventListener("scroll", onBuyNowScroll, { passive: true });
	window.addEventListener("resize", onBuyNowScroll, { passive: true });
	setTimeout(onBuyNowScroll);

	initRebateCodes();

	const buy_now_form = $(".buy_now_form");
	//const choosen_account = buy_now_form._child(".choosen_account");
	const buy_without_registration = buy_now_form._child(".buy_without_registration");
	const case_choosen_account = buy_now_form._child(".case_choosen_account");
	const your_address_label = buy_now_form._child(".your_address_label");
	const delivery_input = buy_now_form._child(".delivery");
	const case_courier = buy_now_form._child(".case_courier");
	const case_courier_above = buy_now_form._child(".case_courier_above");
	const case_parcel_locker = buy_now_form._child(".case_parcel_locker");
	const case_in_person = buy_now_form._child(".case_in_person");
	const case_form_filled = buy_now_form._child(".case_form_filled");
	const courier_address_different_input = buy_now_form._child(".courier_address_different");
	const case_courier_address_different = buy_now_form._child(".case_courier_address_different");
	const confirm_order_btn = buy_now_form._child(".confirm_order");
	const pick_inpost_parcel_locker_btn = buy_now_form._child(".pick_inpost_parcel_locker_btn");
	const accept_regulations_check = buy_now_form._child(".accept_regulations");
	const carrier_input = buy_now_form._child(".carrier");
	const payment_time_input = buy_now_form._child(".payment_time");
	const cart_delivery_price_wrapper = $(".cart_delivery_price_wrapper");
	const in_person_map_wrapper = buy_now_form._child(".in_person_map_wrapper");
	const client_notes_input = buy_now_form._child(".client_notes");

	const renderCarriers = () => {
		const delivery_type_id = delivery_input._get_value();

		const now_carriers = user_cart.available_carriers.filter(
			(available_carrier) => available_carrier.delivery_type_id === delivery_type_id
		);
		const carrier_html = now_carriers
			.map(
				(available_carrier) =>
					html`<div class="checkbox_area carrier_${available_carrier.api_key}">
						<p-checkbox data-value="${available_carrier.carrier_id}"></p-checkbox>
						<span class="semi_bold name">${available_carrier.name}</span>
						<img src="${available_carrier.img_url}" class="carrier_img" />
						<span class="duration">${available_carrier.delivery_time_days} dni</span>
						<span class="pln">${available_carrier.fit_dimensions.price} zł</span>
					</div>`
			)
			.join("");

		const was_h = carrier_input.scrollHeight;
		carrier_input._set_content(carrier_html);
		carrier_input.dataset.value = ""; // just do it to avoid issues ;)
		const now_h = carrier_input.scrollHeight;
		if (Math.abs(was_h - now_h) > 10) {
			animate(carrier_input, `0%{height:${was_h}px;overflow:hidden} 100%{height:${now_h}px;overflow:hidden}`, 250);
		}

		expand(case_courier_above, delivery_type_id === 1 && user_cart.allow_cod);

		registerForms();

		carrier_input._set_value(user_cart.carrier_id, { quiet: true });

		if (now_carriers.length === 1) {
			const single_carrier_id = now_carriers[0].carrier_id;
			if (carrier_input._get_value() !== single_carrier_id) {
				carrier_input._set_value(single_carrier_id);
			}
		}
	};

	const loadCart = () => {
		/**
		 *
		 * @param {number} delivery_type_id
		 * @param {PiepNode} target
		 */
		const setPrettyPrices = (delivery_type_id, target) => {
			const prices = user_cart.available_carriers.filter((c) => c.delivery_type_id === delivery_type_id).map((c) => c.fit_dimensions.price);
			let display_prices = "Niedostępny";
			if (prices.length) {
				const price_min = Math.min(...prices);
				const price_max = Math.max(...prices);
				display_prices = price_min + "";
				if (price_min !== price_max) {
					display_prices += " - " + price_max;
				}
				display_prices += " zł";
			}
			target._parent(".checkbox_area").classList.toggle("disabled", prices.length === 0);
			target._set_content(display_prices);
		};
		setPrettyPrices(1, buy_now_form._child(".courier_prices"));
		setPrettyPrices(2, buy_now_form._child(".parcel_prices"));
		//setPrettyPrices(3, buy_now_form._child(".in_person_prices"));

		renderCarriers();
	};

	window.addEventListener("user_cart_changed", loadCart);
	loadCart();

	if (IS_LOGGED) {
		// done in the view
		// expand(case_choosen_account, true);
		// expand(choosen_account, false);
	} else {
		buy_without_registration.addEventListener("click", () => {
			expand(case_choosen_account, true, { full_height_all_time: true });
			const rect = buy_without_registration.getBoundingClientRect();
			const diff = rect.top + rect.height + 10 - header_height;
			if (diff > 50) {
				smoothScroll(diff);
			}
		});

		if (your_address_label) {
			your_address_label.classList.remove("first");
		}
	}

	delivery_input.addEventListener("change", () => {
		const delivery_type_id = delivery_input._get_value();
		expand(case_courier, delivery_type_id === 1);

		expand(case_parcel_locker, delivery_type_id === 2);

		expand(case_in_person, delivery_type_id === 3);

		expand(case_form_filled, true, { full_height_all_time: true });

		carrier_input.dataset.delivery_type_id = delivery_type_id;

		if (ready) {
			const rect = delivery_input.getBoundingClientRect();
			const diff = rect.top - 60 - header_height;
			if (diff > 50) {
				smoothScroll(diff);
			}

			cart_delivery_price_wrapper.classList.add("spinning");
			xhr({
				url: "/cart/set_delivery_type",
				params: {
					delivery_type_id,
				},
				success: (res) => {
					user_cart = res.user_cart;
					loadedUserCart();
					adding_product_from_cart = false;

					removeClasses(".spinning", ["spinning"]);
				},
			});
		}

		renderCarriers();
	});
	delivery_input._set_value(user_cart.delivery_type_id);

	payment_time_input.addEventListener("change", () => {
		if (ready) {
			const rect = payment_time_input.getBoundingClientRect();
			const diff = rect.top - 60 - header_height;
			if (diff > 50) {
				smoothScroll(diff);
			}

			cart_delivery_price_wrapper.classList.add("spinning");

			const payment_time = payment_time_input._get_value();
			xhr({
				url: "/cart/set_payment_time",
				params: {
					payment_time,
				},
				success: (res) => {
					user_cart = res.user_cart;
					loadedUserCart();
					adding_product_from_cart = false;

					removeClasses(".spinning", ["spinning"]);
				},
			});
		}
	});
	payment_time_input._set_value(user_cart.payment_time);

	carrier_input.addEventListener("change", () => {
		const carrier_id = carrier_input._get_value();

		if (ready) {
			const rect = carrier_input.getBoundingClientRect();
			const diff = rect.top - 60 - header_height;
			if (diff > 50) {
				smoothScroll(diff);
			}

			cart_delivery_price_wrapper.classList.add("spinning");
			xhr({
				url: "/cart/set_carrier",
				params: {
					carrier_id,
				},
				success: (res) => {
					user_cart = res.user_cart;
					loadedUserCart();
					adding_product_from_cart = false;

					removeClasses(".spinning", ["spinning"]);
				},
			});
		}

		const carrier = user_cart.available_carriers.find((c) => c.carrier_id === carrier_id);

		if (carrier && carrier.google_maps_embed_code) {
			in_person_map_wrapper._set_content(carrier.google_maps_embed_code);
		}
		// const map_iframe = in_person_map_wrapper._child("iframe");
		// if (map_iframe) {
		// 	map_iframe.removeAttribute("loading");
		// }
	});
	carrier_input._set_value(user_cart.carrier_id);

	courier_address_different_input.addEventListener("change", () => {
		const courier_address_different = courier_address_different_input._get_value();
		expand(case_courier_address_different, !!courier_address_different);
	});
	courier_address_different_input._set_value(0);

	$(".empty_cart_btn").addEventListener("click", () => {
		if (confirm("Czy aby na pewno chcesz usunąć wszystkie produkty z koszyka?")) {
			xhr({
				url: "/cart/empty",
				success: (res) => {
					user_cart = res.user_cart;
					loadedUserCart();
				},
			});
		}
	});

	confirm_order_btn.addEventListener("click", () => {
		let valid = true;

		if (!main_address._validate()) {
			valid = false;
		}

		const data = { main_address: main_address._data, client_notes: client_notes_input._get_value() };

		const delivery_type = delivery_input._get_value();
		if (delivery_type <= 0) {
			showNotification(`Wybierz formę dostawy`, { type: "error", one_line: true });
		}
		data.delivery_type = delivery_type.delivery_type_id;

		const errors = validateInputs([delivery_input, carrier_input]);
		if (errors.length > 0) {
			valid = false;
		}

		if (delivery_type === 1) {
			const courier_address_different = courier_address_different_input._get_value();
			if (courier_address_different) {
				if (!courier_address._validate()) {
					valid = false;
				}
				data.courier_address = courier_address._data;
			} else {
				data.courier_address = main_address._data;
			}
		}
		if (delivery_type === 2) {
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

		showLoader();

		xhr({
			url: "/shop_order/confirm",
			params: {
				shop_order: data,
			},
			success: (res) => {
				hideLoader();
				// will be redirected to order page and then straight to payment

				if (res && res.success === false) {
					window.location.reload();
				}
			},
		});
	});

	if (pick_inpost_parcel_locker_btn) {
		pick_inpost_parcel_locker_btn.addEventListener("click", () => {
			showInpostParcelLockerPickerModal(pick_inpost_parcel_locker_btn);
		});
	}

	ready = true;
});

function initBuyNowCart() {
	/** @type {CartProductsComp} */
	// @ts-ignore
	const cart_products_comp = $("cart-products-comp.buy_products");
	CartProductsComp(cart_products_comp, undefined);

	const loadCart = () => {
		cart_products_comp._data.products = user_cart.products;
		cart_products_comp._render();

		let rebate_codes_info = "";
		if (user_cart.rebate_codes.length > 0) {
			rebate_codes_info = user_cart.rebate_codes
				.map(
					(e) =>
						html`<span class="rebate_code_block">
							<span><span class="normal"> ${e.code}:</span> -${e.value + (e.value.includes("%") ? "" : " zł")}</span>
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
						<div class="semi_bold" style="padding:30px 0">Mamy nadzieję, że to nie koniec naszej przygody 😉</div>
						<a class="btn primary mtf fill" href="/"><i class="fas fa-chevron-left"></i> Wróć do zakupów</a>
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
						<form>
							<hr />
							<div class="label">Wpisz swój kod</div>
							<input type="text" class="field rebate_code" data-validate="" />
							<div class="show_errors"></div>
							<button class="btn primary mtf fill" type="submit">Aktywuj</button>
						</form>
					</div>
				</div>
			</div>
		`
	);

	$("#activateRebateCode form").addEventListener("submit", (ev) => {
		ev.preventDefault();

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
		const remove_rebate_code = target._parent(".remove_rebate_code");
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

// @ts-ignore
window.easyPackAsyncInit = () => {
	// @ts-ignore
	easyPack.init({
		defaultLocale: "pl",
	});
	// @ts-ignore
	easyPack.mapWidget("easypack-map", (point) => {
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
		pick_inpost_parcel_locker_btn.classList.add("subtle");
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
