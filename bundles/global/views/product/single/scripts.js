/* js[view] */

let user_cart = [];

function addProductToCart(product_id, qty) {
	xhr({
		url: "add_product_to_cart",
		params: {
			product_id,
			qty,
		},
		success: (res) => {
			user_cart = res.cart;
		},
	});
}

function productImagesChange() {
	const first_product_img = $(".product_images .wo997_slide img");
	if (first_product_img) {
		$(".sticky_product img").dataset.src = first_product_img.dataset.src;
		lazyLoadImages(false);
	}
}

domload(() => {
	const vdo = $(".vdo");

	vdo.addEventListener("change", () => {
		toggleVariantStyle(vdo);
	});

	vdo._set_value("1");

	productImagesChange();
});

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

window.addEventListener("popstate", (event) => {
	setVariantsFromUrl();
});

let selected_variants = {};

function setVariantsFromUrl() {
	let sv = {};

	const url_params = new URLSearchParams(window.location.search);
	const url_variants = url_params.get("v");
	if (url_variants) {
		url_variants.split("~").forEach((e) => {
			const [variant_id, option_id] = e.split(".");
			if (variant_id && option_id) {
				sv[variant_id] = { option_id: +option_id };
			}
		});
	}

	$$(".variants").forEach((variants) => {
		const option_data = sv[variants.dataset.product_feature_id];
		const val = option_data ? option_data.option_id : "";
		variants._set_value(val, {
			quiet: true,
		});
	});

	selected_variants = sv;

	setVariantData();
}

function getProductDataForVariants(sv) {
	const matched_products = general_product_products.filter((product) => {
		let exists = true;
		for (const [product_feature_id, option_info] of Object.entries(sv)) {
			if (!product.active || product.stock <= 0) {
				exists = false;
			}
			const feature = product.variants.find((e) => e.product_feature_id === +product_feature_id);
			if (!feature || feature.product_feature_option_id !== option_info.option_id) {
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
	let sv = {};

	$$(".variants").forEach((variants) => {
		const option_id = variants._get_value();
		if (option_id) {
			sv[variants.dataset.product_feature_id] = { option_id };
		}
	});

	if (!isEquivalent(sv, selected_variants)) {
		selected_variants = sv;

		// manage state

		const url_variants = [];
		for (const [variant_id, option_info] of Object.entries(selected_variants)) {
			url_variants.push(variant_id + "." + option_info.option_id);
		}

		const params = new URLSearchParams(window.location.search);
		params.set("v", url_variants.join("~"));

		history.pushState(undefined, "wariant jakiś tutaj will be", "?" + params.toString());

		setVariantData();
	}
}

function setVariantData() {
	const data = getProductDataForVariants(selected_variants);

	let price_min = data.price_min;
	let price_max = data.price_max;

	$$(".variants").forEach((variants) => {
		//const selected_option_id = variants._get_value();

		variants._children(".variant_option").forEach((option) => {
			const option_id = +option._child("p-checkbox").dataset.value;

			const assume_other_selected = cloneObject(selected_variants);

			assume_other_selected[variants.dataset.product_feature_id] = {
				option_id,
			};

			const other_data = getProductDataForVariants(assume_other_selected);
			const inactive = other_data.matched_products.length === 0;
			option.classList.toggle("inactive", inactive);

			const p_min_d = other_data.price_min - data.price_min;
			const p_max_d = other_data.price_max - data.price_max;

			let price_diff = "";
			if (p_min_d === p_max_d && p_min_d !== 0) {
				price_diff = " " + (p_min_d > 0 ? "+" : "") + p_min_d + " zł";
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
	const single_product = data.matched_products.length === 1 ? data.matched_products[0] : undefined;

	if (any_matched) {
		selected_product_price = price_min + "";

		if (price_max !== price_min) {
			selected_product_price += " - " + price_max;
		}
	}

	if (single_product) {
		if (data.matched_products[0].was_price != data.matched_products[0].price) {
			selected_product_was_price = data.matched_products[0].was_price;
		}
	}

	if (any_matched) {
		selected_product_price += `<span style="width:4px" class="price_space"></span>zł`;
	} else {
		selected_product_price = "Brak produktu";
	}
	if (any_matched && selected_product_was_price) {
		selected_product_was_price += `<span style="width:4px" class="price_space"></span>zł`;
	}

	$(".selected_product_price")._set_content(selected_product_price);
	$(".selected_product_was_price")._set_content(selected_product_was_price);

	$(".buy_btn").toggleAttribute("disabled", !single_product);

	expand($(".notify_product_available"), !single_product);
}

/** @type {PiepNode} */
let product_offer;
/** @type {PiepNode} */
let sticky_product;

domload(() => {
	product_offer = $(".product_offer");
	sticky_product = $(".sticky_product");

	$$(".variants").forEach((variants) => {
		variants.addEventListener("change", () => {
			variantChanged();
		});
	});

	setVariantsFromUrl();
});

let res = { can: true };
window.addEventListener("main_header_scroll", (ev) => {
	if (window.innerWidth >= 850) {
		return;
	}
	const r = product_offer.getBoundingClientRect();
	const fac = 0.01;
	const visible = Math.max(0, Math.min(1, (-50 - r.top) * fac, (r.top + r.height) * fac));

	sticky_product.style.transform = `translateY(${Math.round((visible - 1) * 110)}%)`;

	// @ts-ignore
	if (visible > ev.detail.res.other_header_visible) {
		// @ts-ignore
		ev.detail.res.other_header_visible = visible;
	}
});
