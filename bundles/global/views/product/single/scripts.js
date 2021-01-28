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

domload(() => {
	const vdo = $(".vdo");
	vdo._set_value("1");
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
		url_variants.split(".").forEach((e) => {
			const [variant_id, option_id] = e.split("~");
			if (variant_id && option_id) {
				sv[variant_id] = { option_id: +option_id };
			}
		});
	}

	$$(".variant_radio").forEach((variant_radio) => {
		const option_data = sv[variant_radio.dataset.variant_id];
		const val = option_data ? option_data.option_id : "";
		variant_radio._set_value(val, {
			quiet: true,
		});
	});

	selected_variants = sv;

	setVariantData();
}

function getProductDataForVariants(sv) {
	const matched_products = page_products.filter((product) => {
		let exists = true;
		for (const [variant_id, option_info] of Object.entries(sv)) {
			if (!product.published || product.stock <= 0) {
				exists = false;
			}
			if (product.variants[variant_id] !== option_info.option_id) {
				exists = false;
			}
		}
		return exists;
	});

	let price_min = 10000000;
	let price_max = 0;
	matched_products.forEach((product) => {
		price_min = Math.min(price_min, product.price);
		price_max = Math.max(price_max, product.price);
	});

	return {
		matched_products,
		price_min,
		price_max,
	};
}

function variantChanged() {
	let sv = {};

	$$(".variant_radio").forEach((variant_radio) => {
		const option_id = variant_radio._get_value();
		if (option_id) {
			sv[variant_radio.dataset.variant_id] = { option_id };
		}
	});

	if (!isEquivalent(sv, selected_variants)) {
		selected_variants = sv;

		// manage state

		const url_variants = [];
		for (const [variant_id, option_info] of Object.entries(selected_variants)) {
			url_variants.push(variant_id + "~" + option_info.option_id);
		}

		const params = new URLSearchParams(window.location.search);
		params.set("v", url_variants.join("."));

		history.pushState(
			undefined,
			"wariant jakiś tutaj will be",
			"?" + params.toString()
		);

		setVariantData();
	}
}

function setVariantData() {
	const data = getProductDataForVariants(selected_variants);

	let price_min = data.price_min;
	let price_max = data.price_max;

	$$(".variant_radio").forEach((variant_radio) => {
		//const selected_option_id = variant_radio._get_value();

		variant_radio._children("radio-option").forEach((option) => {
			const option_id = +option.getAttribute("value");

			const assume_other_selected = cloneObject(selected_variants);

			assume_other_selected[variant_radio.dataset.variant_id] = {
				option_id,
			};

			const other_data = getProductDataForVariants(assume_other_selected);
			const inactive = other_data.matched_products.length === 0;
			option.classList.toggle("inactive", inactive);

			const p_min_d = other_data.price_min - data.price_min;
			const p_max_d = other_data.price_max - data.price_max;

			let price_diff = "";
			if (p_min_d === p_max_d && p_min_d !== 0) {
				price_diff = " " + (p_min_d > 0 ? "+" : "") + p_min_d + "zł";
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
	const single_product =
		data.matched_products.length === 1 ? data.matched_products[0] : undefined;

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

domload(() => {
	$$(".variant_radio").forEach((variant_radio) => {
		variant_radio.addEventListener("change", () => {
			variantChanged();
		});
	});

	setVariantsFromUrl();
});

// deprecated below

var RATING = 0;

domload(() => {
	// rating
	var r = $$(".my-rating span");
	for (let i = 0; i < r.length; i++) {
		r[i].setAttribute("data-rating", 5 - i);
		r[i].addEventListener("click", function () {
			var rating = this.getAttribute("data-rating");
			RATING = rating;
			$(".my-rating").className = "rating my-rating rating" + rating;
		});
	}
	var variantButtons = $$(".boxy");
	for (var i = 0; i < variants.length; i++) {
		var variant = variants[i];

		var basket_item = basket_data.basket.find((b) => {
			return b.variant_id == variant.variant_id;
		});
		variant.quantity = basket_item ? basket_item.quantity : 0;
		var left = variant.stock - variant.quantity;

		if (left > 0) {
			variantButtons[i].click();
			break;
		}
	}
});

window.addEventListener("basket-change", (event) => {
	var res = event.detail.res;

	showVariantChanges(
		res,
		$(`.product_basket_variants`),
		product_basket_row_template,
		basket_data.basket
	);

	var wtwoimkoszyku = $(".wtwoimkoszyku");
	if (wtwoimkoszyku) {
		wtwoimkoszyku._set_content(
			`<h3 style='padding:25px 0 10px;margin:0'> Twoim koszyku 
          ${basket_data.basket.length > 1 ? "znajdują" : "znajduje"} się
        </h3>`
		);
	}

	//clickVariant(VARIANT_ID);
});

const product_basket_row_template = `
  <div class='expand_y'>
    <div class='product_row'>
      <div class='cl cl1'><span class='variant_name clamp-lines clamp-2' data-tooltip></span></div>
      <div class='cl cl2'>
        <div class='qty-control glue-children'>
          <button class='btn subtle qty-btn remove' onclick='addVariantToBasket(this,-1)'>
            <i class='fas fa-minus'></i>                            
          </button>
          <span class='qty-label'>66</span>
          <button class='btn subtle qty-btn add' onclick='addVariantToBasket(this,1)'>
            <<i class='fas fa-plus'></i>
          </button>
        </div>
      </div>
      <div class='cl cl3'><span class='pln variant_total_price'></span></div>
      <button class='cl cl4 remove-product-btn' onclick='addVariantToBasket(this,-100000);return false;'>
        <i class="fas fa-times"></i>
      </button>
    </div>
  </div>
`;

var variant_to_image = [];

var VARIANT_ID = null;

function clickVariant(variant_id) {
	$("#buyNow").toggleAttribute("disabled", true);

	if (!variant_id) return;

	var variant = variants.find((v) => {
		return v.variant_id == variant_id;
	});
	var basket_item = basket_data.basket.find((b) => {
		return b.variant_id == variant_id;
	});
	variant.quantity = basket_item ? basket_item.quantity : 0;

	VARIANT_ID = variant_id;
	lazyLoadImages();

	var left = variant.stock - variant.quantity;

	var low = left < 5 ? "style='font-weight:bold;color:red'" : "";

	$(
		"#quantity"
	).innerHTML = `Dostępność: <span class="pln" ${low}>${left} szt.</span>`;

	$("#buyNow").toggleAttribute("disabled", left == 0);

	$("#caseLast").style.display =
		left == 0 && variant.stock > 0 ? "block" : "none";
	$("#caseZero").style.display = left == 0 ? "block" : "none";

	$$(".caseZero").forEach((e) => {
		e.style.display = left == 0 ? "block" : "none";
	});
	$$(".caseMore").forEach((e) => {
		e.style.display = left > 0 ? "block" : "none";
	});
}

// komentarze start

domload(() => {
	createDatatable({
		name: "comments",
		lang: {
			subject: "komentarzy",
		},
		url: "/search_comments",
		params: () => {
			return {
				product_id: PRODUCT_ID,
			};
		},
		renderRow: (r) => {
			var canDelete = r.user_id == USER_ID;
			var canAccept = r.accepted == 0;
			if (!IS_ADMIN) canAccept = false;
			if (IS_ADMIN) canDelete = true;

			var buttons = "";
			if (canDelete)
				buttons += `<button class='btn red' style='margin-left:10px' onclick='commentAction(${r.comment_id},-1)'>Usuń</button>`;
			if (canAccept)
				buttons += `<button class='btn primary' style='margin-left:10px' onclick='commentAction(${r.comment_id},1)'>Akceptuj</button>`;

			return `<div class='comment_header'><div class='pseudonim'>${r.pseudonim} ${r.rating} ${buttons}</div><div class='dodano'>${r.dodano}</div></div><div class='text-wrap'>${r.tresc}</div>`;
		},
		controls: ``,
	});
});

function commentAction(i, action) {
	if (action == -1 && !confirm("Czy aby na pewno chcesz usunąć komentarz?"))
		return;
	ajax(
		"/commentAction",
		{
			comment_id: i,
			action: action,
		},
		() => {
			comments.search(() => {
				$("#formComment").style.display = "block";
				$("#commentSent").style.display = "none";
			});
		},
		() => {}
	);
}

function newComment() {
	var form = $("#formComment");
	if (!validateForm(form)) {
		return;
	}

	xhr({
		url: "/addComment",
		params: {
			product_id: PRODUCT_ID,
			pseudonim: form._child(".pseudonim").value,
			tresc: form._child(".tresc").value,
			rating: RATING,
		},
		success: (res) => {
			comments.search(() => {
				$("#formComment").style.display = "none";

				var out = "<h3>Dziękujemy za przekazaną opinię!</h3>";
				try {
					if (res.kod_rabatowy) {
						out += `<div style='font-size: 24px;margin: 10px 0;display:block;'>Twój kod rabatowy: <span style='font-weight: bold;color: #37f;'>${res.kod_rabatowy}</span></div>`;
						out += `<div>Kopię otrzymasz na skrzynkę pocztową</div>`;
					}
				} catch (e) {}

				$("#commentSent").innerHTML = out;
				$("#commentSent").style.display = "block";
			});
		},
	});
}

// komentarze end

function validateEmail(email) {
	var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(String(email).toLowerCase());
}

function sendNotification() {
	var e = $("#notification_email");
	var email = e.value;
	$("#user_email").innerHTML = email;
	if (!validateEmail(email)) {
		e.style.borderColor = "red";
		return;
	}
	ajax(
		"/user_notify_variant",
		{
			variant_id: ids[VARIANT_ID],
			email: email,
		},
		() => {
			$("#whenNotificationAdded").style.display = "block";
			$("#hideWhenNotificationAdded").style.display = "none";
		},
		null
	);
}
