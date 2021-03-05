/* js[view] */

function productImagesChange() {
	general_product_images.forEach((img, index) => {
		let weight = -index;
		for (const option_id of selected_option_ids) {
			if (img.option_ids.includes(option_id)) {
				weight += 100;
			}
		}
		img.weight = weight;
	});

	const imgs_copy = cloneObject(general_product_images);
	imgs_copy.sort((a, b) => Math.sign(b.weight - a.weight));
	const slides_html = imgs_copy
		.map(
			(img) => html`<div class="wo997_slide">
				<img data-src="${img.img_url}" data-height="1w" class="product_image wo997_img" />
			</div>`
		)
		.join("");

	/** @type {PiepSliderNode[]} */
	// @ts-ignore
	const sliders = $$(".product_images .wo997_slider");
	sliders.forEach((slider) => {
		slider._slider.slides_wrapper._set_content(slides_html);
		slider._slider.update();
	});
	sliders.forEach((slider) => {
		slider._slider.select_slide(0);
	});

	if (imgs_copy[0]) {
		/** @type {ResponsiveImage} */
		// @ts-ignore
		const sticky_product_img = $(".sticky_product img");
		switchImage(sticky_product_img, imgs_copy[0].img_url, false);
	}

	lazyLoadImages(false);
}

/** @type {PiepNode} */
let product_offer;
/** @type {PiepNode} */
let sticky_product;
/** @type {any} */
let single_product;

domload(() => {
	product_offer = $(".product_offer");
	sticky_product = $(".sticky_product");

	$$(".variants").forEach((variants) => {
		variants.addEventListener("change", () => {
			variantChanged();
		});
	});

	setProductFeaturesFromUrl();

	initBuy();

	// TEMPORARY
	const vdo = $(".vdo");

	vdo.addEventListener("change", () => {
		toggleVariantStyle(vdo);
	});

	vdo._set_value("1");

	/** @type {CartProductComp} */
	// @ts-ignore
	const cart_products_comp = $("cart-products-comp.has_products");
	cartProductsComp(cart_products_comp, undefined, { no_redirect: true, products: [] });

	const loadCart = () => {
		cart_products_comp._data.products = user_cart.products.filter((e) => e.general_product_id === general_product_id);
		cart_products_comp._render();
		expand($(".case_has_products"), cart_products_comp._data.products.length > 0);
	};

	window.addEventListener("user_cart_changed", loadCart);
	loadCart();
});

function initBuy() {
	$$(".qty_controls").forEach((qty_controls) => {
		const val_qty = qty_controls._child(".val_qty");
		const sub_qty = qty_controls._child(".sub_qty");
		const add_qty = qty_controls._child(".add_qty");

		const getMin = () => {
			return 1;
		};

		const getMax = () => {
			return single_product ? Math.min(single_product.stock, 10) : 100;
		};

		val_qty.addEventListener("click", () => {
			// @ts-ignore
			val_qty.select();
		});
		sub_qty.addEventListener("click", () => {
			val_qty._set_value(val_qty._get_value() - 1);
		});
		add_qty.addEventListener("click", () => {
			val_qty._set_value(val_qty._get_value() + 1);
		});

		val_qty.addEventListener("change", () => {
			if (!single_product) {
				return;
			}
			val_qty._set_value(clamp(getMin(), val_qty._get_value(), getMax()), { quiet: true });

			const qty = val_qty._get_value();
			sub_qty.toggleAttribute("disabled", qty === getMin());
			add_qty.toggleAttribute("disabled", qty === getMax());
		});
		val_qty._dispatch_change();
	});

	$(".main_buy_btn").addEventListener("click", () => {
		if (!$(".case_can_buy_product").classList.contains("can_buy")) {
			showNotification(`Wybierz wariant produktu powyżej`, { type: "error", one_line: true });
			return;
		}
		xhr({
			url: "/cart/add-product",
			params: {
				product_id: single_product.product_id,
				qty: $(".main_qty_controls .val_qty")._get_value(),
			},
			success: (res) => {
				user_cart = res.user_cart;
				loadedUserCart();
				window.dispatchEvent(new CustomEvent("user_cart_changed"));
			},
		});
	});
}

/**
 *
 * @param {PiepNode} radio
 */
function toggleVariantStyle(radio) {
	const val = radio._get_value();
	document.body.classList.toggle("price_diff_1", val === "1");
	document.body.classList.toggle("price_diff_2", val === "2");
	document.body.classList.toggle("price_diff_3", val === "3");
	document.body.classList.toggle("price_diff_4", val === "4");
}

window.addEventListener("popstate", () => {
	setProductFeaturesFromUrl();
});

/** @type {number[]} */
let selected_option_ids = [];

function setProductFeaturesFromUrl() {
	const url_params = new URLSearchParams(window.location.search);
	selected_option_ids = def(url_params.get("v"), "")
		.split("-")
		.map((e) => +e);

	/** @type {PiepNode[]} */
	let found_variants = [];
	let missed_option_ids = [];
	selected_option_ids.forEach((option_id) => {
		const option_checkbox = $(`.variants p-checkbox[data-value="${option_id}"]`);
		if (option_checkbox) {
			const variants = option_checkbox._parent(".variants");
			variants._set_value(option_id, { quiet: true });
			found_variants.push(variants);
		} else {
			missed_option_ids.push(option_id);
		}
	});

	selected_option_ids = selected_option_ids.filter((e) => !missed_option_ids.includes(e));

	$$(".variants").forEach((variants) => {
		if (found_variants.includes(variants)) {
			return;
		}
		variants._set_value(false, {
			quiet: true,
		});
	});

	setVariantData();
}

function getProductDataForVariants(feature_option_ids) {
	const matched_products = general_product_products.filter((product) => {
		let exists = true;
		for (const option_id of feature_option_ids) {
			if (!product.variants.includes(option_id)) {
				exists = false;
			}
		}
		return exists;
	});

	let price_min = 10000000;
	let price_max = 0;
	matched_products.forEach((product) => {
		price_min = Math.min(price_min, product.gross_price);
		price_max = Math.max(price_max, product.gross_price);
	});

	return {
		matched_products,
		price_min,
		price_max,
	};
}

function variantChanged() {
	let sv = [];

	$$(".variants").forEach((variants) => {
		const option_id = variants._get_value();
		if (option_id) {
			sv.push(option_id);
		}
	});

	if (!isEquivalent(sv, selected_option_ids)) {
		selected_option_ids = sv;

		let url = "/produkt";
		url += "/" + general_product_id;

		let options_names = [];
		if (selected_option_ids.length > 0) {
			selected_option_ids.forEach((option_id) => {
				let option_name;
				general_product_variants.forEach((variants) => {
					variants.variant_options.forEach((option) => {
						if (option.product_feature_option_id === option_id) {
							option_name = option.name;
						}
					});
				});
				if (option_name) {
					options_names.push(option_name);
				}
			});
		}

		let full_name = general_product_name + " " + options_names.map((e) => " " + e).join("");
		url += "/" + escapeUrl(full_name);

		const url_params = new URLSearchParams();
		if (selected_option_ids.length > 0) {
			url_params.append("v", selected_option_ids.join("-"));
		}

		const url_params_str = url_params.toString();
		if (url_params_str) {
			url += "?" + url_params_str;
		}

		// it does not work lol
		history.pushState(undefined, full_name, url);
		// workaround here
		document.title = full_name;

		setVariantData();
	}
}

function setVariantData() {
	const data = getProductDataForVariants(selected_option_ids);

	let price_min = data.price_min;
	let price_max = data.price_max;

	$$(".variants").forEach((variants) => {
		const selected_option_id = variants._get_value();

		variants._children(".variant_option").forEach((option) => {
			const option_id = +option._child("p-checkbox").dataset.value;

			/** @type {number[]} */
			const assume_other_option_ids = cloneObject(selected_option_ids);

			let option_index = assume_other_option_ids.indexOf(selected_option_id);
			if (option_index !== -1) {
				assume_other_option_ids[option_index] = option_id;
			}

			const other_data = getProductDataForVariants(assume_other_option_ids);
			const inactive = other_data.matched_products.filter((e) => e.stock > 0 && e.active).length === 0;
			option.classList.toggle("inactive", inactive);

			const p_min_d = other_data.price_min - data.price_min;
			const p_max_d = other_data.price_max - data.price_max;

			let price_diff = "";
			if (p_min_d === p_max_d && p_min_d !== 0) {
				price_diff = " " + (p_min_d > 0 ? "+" : "") + p_min_d.toFixed(2) + " zł";
			}

			option.classList.toggle("has_price_diff", !!price_diff);
			const price_diff_node = option._child(".price_diff");
			if (price_diff) {
				// otherwise just fade out nicely
				price_diff_node._set_content(price_diff);
			}
		});
	});

	let selected_product_price = "";
	let selected_product_was_price = "";

	const any_matched = !!price_max;
	single_product = data.matched_products.length === 1 ? data.matched_products[0] : undefined;

	if (any_matched) {
		selected_product_price = price_min.toFixed(2) + "";

		if (price_max !== price_min) {
			selected_product_price += " - " + price_max.toFixed(2);
		}
	}

	if (single_product) {
		if (data.matched_products[0].was_price != data.matched_products[0].price) {
			selected_product_was_price = data.matched_products[0].was_price.toFixed(2);
		}
	}

	if (any_matched) {
		selected_product_price += html`<span style="width:4px" class="price_space"></span> zł`;
	} else {
		selected_product_price = "―";
	}
	if (any_matched && selected_product_was_price) {
		selected_product_was_price += html`<span style="width:4px" class="price_space"></span> zł`;
	}

	$(".selected_product_price")._set_content(selected_product_price);
	$(".selected_product_was_price")._set_content(selected_product_was_price);
	$(".selected_product_qty")._set_content(`${single_product && single_product.active ? single_product.stock + " szt." : "―"}`);

	const can_buy_product = !!(single_product && single_product.stock > 0);
	const case_can_buy_product = $(".case_can_buy_product");
	case_can_buy_product.classList.toggle("can_buy", can_buy_product);

	expand($(".notify_when_product_available"), !!(single_product && single_product.stock <= 0));

	productImagesChange();

	$(".main_qty_controls .val_qty")._set_value();
}

window.addEventListener("main_header_scroll", (ev) => {
	if (window.innerWidth >= 850) {
		return;
	}
	const r = product_offer.getBoundingClientRect();
	const visible = r.top < -50 && r.top + r.height > 200;
	sticky_product.classList.toggle("visible", visible);

	if (visible) {
		// @ts-ignore
		ev.detail.res.other_header_visible = true;
	}
});
