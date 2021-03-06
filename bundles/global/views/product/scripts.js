/* js[view] */

function productImagesChange() {
	general_product_imgs.forEach((img, index) => {
		let weight = -index;
		for (const variant_option_id of ps_selected_variant_option_ids) {
			for (const feature_option_id of map_variant_to_feature_options[variant_option_id]) {
				if (img.feature_option_ids.includes(feature_option_id)) {
					weight += 100;
				}
			}
		}
		img.weight = weight;
	});

	const imgs_copy = cloneObject(general_product_imgs);
	imgs_copy.sort((a, b) => Math.sign(b.weight - a.weight));
	const slides_html = imgs_copy
		.map(
			(img) => html`<div class="wo997_slide">
				<div class="square_img_wrapper">
					<img data-src="${img.img_url}" class="product_img wo997_img" />
				</div>
			</div>`
		)
		.join("");

	/** @type {PiepSliderNode[]} */
	// @ts-ignore
	const sliders = $$(".product_imgs .wo997_slider");
	sliders.forEach((slider) => {
		slider.classList.add("freeze");
		slider._slider.slides_wrapper._set_content(slides_html);
		slider._slider.update();
		setTimeout(() => {
			slider.classList.remove("freeze");
		});
	});
	sliders.forEach((slider) => {
		slider._slider.select_slide(0);
	});

	if (imgs_copy[0]) {
		// @ts-ignore
		const sticky_product_img = $(".sticky_product img");
		// @ts-ignore
		setResponsiveImageUrl(sticky_product_img, imgs_copy[0].img_url);
	}

	lazyLoadImages({ duration: 0 });
}

/** @type {PiepNode} */
let product_offer;
/** @type {PiepNode} */
let sticky_product;
/** @type {any} */
let single_product;

let map_variant_to_feature_options;

domload(() => {
	map_variant_to_feature_options = Object.fromEntries(
		general_product_variants
			.map((variant) => variant.options)
			.flat(1)
			.map((option) => [option.product_variant_option_id, JSON.parse(option.__feature_options_json)])
	);

	product_offer = $(".product_offer");
	sticky_product = $(".sticky_product");

	product_offer._children(".variants").forEach((variants) => {
		variants.addEventListener("change", () => {
			variantChanged();
		});
	});

	setTimeout(() => {
		setProductFeaturesFromUrl();
	});

	/** @type {CartProductsComp} */
	// @ts-ignore
	const cart_products_comp = $("cart-products-comp.has_products");
	CartProductsComp(cart_products_comp, undefined, { no_redirect: true, products: [] });

	const loadCart = () => {
		cart_products_comp._data.products = user_cart.products.filter((e) => e.general_product_id === general_product_id);
		cart_products_comp._render();
		expand($(".case_has_products"), cart_products_comp._data.products.length > 0);
	};

	window.addEventListener("user_cart_changed", loadCart);
	loadCart();

	const qty_input = $(".main_qty_controls .val_qty");
	qty_input.addEventListener("change", () => {
		const qty = qty_input._get_value();
		$(".main_qty_controls")
			._next()
			._set_content(single_product && qty !== 1 ? `${prettyPrice(numberFromStr(single_product.__current_gross_price) * qty)} zł` : "");
	});

	if (general_product_data.sell_by !== "qty") {
		$(".main_qty_label")._set_content(
			`${physical_measures[general_product_data.sell_by].description} (${physical_measure_unit_map[general_product_data.base_unit].name})`
		);
	}

	const main_buy_btn = $(".main_buy_btn");
	main_buy_btn.addEventListener("click", () => {
		if (adding_product_from_cart) {
			return;
		}

		if (!$(".case_can_buy_product").classList.contains("can_buy")) {
			showNotification(`Wybierz wariant produktu powyżej`, { type: "error", one_line: true });
			return;
		}
		const more_qty = qty_input._get_value();
		const product_id = single_product.product_id;
		const cart_product = user_cart.products.find((e) => e.product_id === product_id);
		const was_qty = cart_product ? cart_product.qty : 0;
		const request_qty = was_qty + more_qty;

		adding_product_from_cart = true;

		const spinner_wrapper = main_buy_btn._child(".spinner_wrapper");
		spinner_wrapper.classList.add("spinning");

		let offset = 290;

		xhr({
			url: "/cart/add-product",
			params: {
				product_id: product_id,
				qty: request_qty,
			},
			success: (res) => {
				user_cart = res.user_cart;

				loadedUserCart();
				adding_product_from_cart = false;
				spinner_wrapper.classList.remove("spinning");

				const last = cart_products_comp._child(".bind_products > .list_row:last-child");
				if (last) {
					scrollIntoView(last, { offset, direction: "down" });
				}

				const product_in_cart = user_cart.products.find((e) => e.product_id === product_id);
				if (!product_in_cart || product_in_cart.qty !== request_qty) {
					if (product_in_cart && was_qty === product_in_cart.qty) {
						showNotification(
							html`<div class="header">Brak produktu</div>
								${single_product.__name}`,
							{ width: "min(80vw, 300px)" }
						);
					} else {
						let display_add = "";
						if (more_qty !== 1) {
							display_add += more_qty + " × ";
						}
						display_add += single_product.__name;
						showNotification(
							html`<div class="header">Dodano do koszyka</div>
								${display_add}`,
							{ width: "min(80vw, 300px)" }
						);
					}
				} else {
					//showNotification(`Dodano ${single_product.__name} do koszyka`, { one_line: true, type: "success" });
					showNotification(
						html`<div class="header">Dodano do koszyka</div>
							${single_product.__name}`,
						{ width: "min(80vw, 300px)" }
					);
				}
			},
		});
	});
});

window.addEventListener("popstate", () => {
	setProductFeaturesFromUrl();
});

/** @type {number[]} */
let ps_selected_variant_option_ids = [];

function setProductFeaturesFromUrl() {
	const url_params = new URLSearchParams(window.location.search);
	ps_selected_variant_option_ids = def(url_params.get("v"), "")
		.split("-")
		.map((e) => +e);

	/** @type {PiepNode[]} */
	let found_variants = [];
	let missed_option_ids = [];
	ps_selected_variant_option_ids.forEach((option_id) => {
		const option_checkbox = $(`.variants p-checkbox[data-value="${option_id}"]`);
		if (option_checkbox) {
			const variants = option_checkbox._parent(".variants");
			variants._set_value(option_id, { quiet: true });
			found_variants.push(variants);
		} else {
			missed_option_ids.push(option_id);
		}
	});

	ps_selected_variant_option_ids = ps_selected_variant_option_ids.filter((e) => !missed_option_ids.includes(e));

	product_offer._children(".variants").forEach((variants) => {
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
		price_min = Math.min(price_min, product.__current_gross_price);
		price_max = Math.max(price_max, product.__current_gross_price);
	});

	return {
		matched_products,
		price_min,
		price_max,
	};
}

function variantChanged() {
	let sv = [];

	product_offer._children(".variants").forEach((variants) => {
		const option_id = variants._get_value();
		if (option_id) {
			sv.push(option_id);
		}
	});

	if (!isEquivalent(sv, ps_selected_variant_option_ids)) {
		ps_selected_variant_option_ids = sv;

		let url = "/produkt";
		url += "/" + general_product_id;

		let options_names = [];
		if (ps_selected_variant_option_ids.length > 0) {
			ps_selected_variant_option_ids.forEach((option_id) => {
				let option_name;
				general_product_variants.forEach((variants) => {
					variants.options.forEach((option) => {
						if (option.product_variant_option_id === option_id) {
							option_name = option.name;
						}
					});
				});
				if (option_name) {
					options_names.push(option_name);
				}
			});
		}
		let full_name = general_product_name + " " + options_names.map((e) => " | " + e).join("");
		url += "/" + escapeUrl(full_name);

		const url_params = new URLSearchParams();
		if (ps_selected_variant_option_ids.length > 0) {
			url_params.append("v", ps_selected_variant_option_ids.join("-"));
		}

		const url_params_str = url_params.toString();
		if (url_params_str) {
			url += "?" + url_params_str;
		}

		// it does not work lol
		history.replaceState(undefined, full_name, url);
		// workaround here
		document.title = full_name;

		$$(".full_product_name").forEach((e) => e._set_content(full_name));

		setVariantData();
	}
}

function setVariantData() {
	const data = getProductDataForVariants(ps_selected_variant_option_ids);

	let price_min = data.price_min;
	let price_max = data.price_max;

	product_offer._children(".variants").forEach((variants) => {
		const selected_option_id = variants._get_value();

		variants._children(".variant_option").forEach((option) => {
			const option_id = +option._child("p-checkbox").dataset.value;

			/** @type {number[]} */
			const assume_other_option_ids = cloneObject(ps_selected_variant_option_ids);

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
	let selected_product_percent_off = "";

	const any_matched = !!price_max;
	single_product = data.matched_products.length === 1 ? data.matched_products[0] : undefined;

	if (any_matched) {
		selected_product_price = price_min.toFixed(2) + "";

		if (price_max !== price_min) {
			selected_product_price += " - " + price_max.toFixed(2);
		}
	}

	if (single_product) {
		if (single_product.__current_gross_price != single_product.gross_price) {
			selected_product_was_price = `${single_product.gross_price} zł`;
			selected_product_percent_off = `(-${Math.round((1 - single_product.__current_gross_price / single_product.gross_price) * 100)}%)`;
			//.toFixed(2);
		}
	}

	if (any_matched) {
		selected_product_price += html` zł`;
	} else {
		selected_product_price = "―";
	}

	let product_queue_pretty = "";
	const queue_count = single_product ? single_product.__queue_count : undefined;
	if (queue_count !== undefined) {
		product_queue_pretty = queue_count === 0 ? "Nie ma nikogo w kolejce!" : `Ilość osób w kolejce: ${queue_count}`;
	}
	$$(".selected_product_queue_pretty").forEach((e) => e._set_content(product_queue_pretty));

	$(".selected_product_price")._set_content(selected_product_price);
	$(".selected_product_price").classList.toggle("price_off", !!selected_product_was_price);
	$(".selected_product_was_price")._set_content(selected_product_was_price);
	$(".selected_product_percent_off")._set_content(selected_product_percent_off);

	let display_unit = "szt.";
	if (general_product_data.sell_by !== "qty") {
		display_unit = physical_measure_unit_map[general_product_data.base_unit].name;
	}

	$(".selected_product_stock")._set_content(`${single_product && single_product.active ? single_product.stock + " " + display_unit : "―"}`);

	const can_buy_product = !!(single_product && single_product.stock > 0);
	const case_can_buy_product = $(".case_can_buy_product");
	case_can_buy_product.classList.toggle("can_buy", can_buy_product);
	$(".case_cannot_buy_product").classList.toggle("hidden", can_buy_product);

	expand($(".case_notify_available"), !!(single_product && single_product.stock <= 0));

	$(".main_qty_controls .val_qty")._dispatch_change();

	productImagesChange();

	// display on a feature list
	const product_feature_list = $(".product_feature_list");
	if (product_feature_list) {
		removeClasses(".pflo", ["inactive", "active"], product_feature_list);
		general_product_variants.forEach((variant) => {
			variant.options.forEach((option) => {
				try {
					const selected = ps_selected_variant_option_ids.includes(option.product_variant_option_id);

					const fo_ids = JSON.parse(option.__feature_options_json);
					fo_ids.forEach((fo_id) => {
						const pflo = product_feature_list._child(`.pflo[data-option_id="${fo_id}"]`);

						if (selected) {
							pflo.classList.add("active");
							pflo
								._parent(".pflc")
								._children(".pflo")
								.forEach((e) => {
									e.classList.add("inactive");
								});
						}
					});
				} catch (e) {
					console.error(e);
				}
			});
		});
		removeClasses(".active", ["inactive"], product_feature_list);
	}

	const sis = [];
	data.matched_products.forEach((p) => {
		const si = product_shipping_info[p.product_id];
		si.forEach((carrier) => {
			const find_c = sis.find((s) => s.carrier_id === carrier.carrier_id);
			if (find_c) {
				find_c.price_min = Math.min(find_c.price_min, carrier.price);
				find_c.price_max = Math.max(find_c.price_max, carrier.price);
			} else {
				carrier.price_min = carrier.price;
				carrier.price_max = carrier.price;
				sis.push(carrier);
			}
		});
	});

	$(".product_shipping_info")._set_content(
		sis
			.map((si) => {
				let display_price = si.price_min + "";
				if (si.price_min !== si.price_max) {
					display_price += " - " + si.price_max;
				}
				return html`<li>${si.name} - ${display_price} zł</li>`;
			})
			.join("")
	);
}

domload(() => {
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

	window.addEventListener("resize", productImagesChange);
});

// comments
domload(() => {
	window.addEventListener("scroll", initProductCommentsCallback);
	initProductCommentsCallback();
	$(".seo_comments").remove();
});
function initProductCommentsCallback() {
	// search
	/** @type {ListComp} */
	// @ts-ignore
	const comments_list = $("list-comp.comments");
	if (comments_list.getBoundingClientRect().top > window.innerHeight + 200) {
		return;
	}
	comments_list.addEventListener("change", () => {
		if (add_comment_btn_top) {
			add_comment_btn_top.classList.toggle("hidden", comments_list._data.length < 8);
		}
	});
	window.removeEventListener("scroll", initProductCommentsCallback);

	const comments_filters = $(".product_comments .comments_filters");
	const show_filters = $(".product_comments .show_filters");
	const addComment = $("#addComment .modal_body");
	const search_btn = $(".product_comments .search_btn");
	const add_comment_btn_top = $(".add_comment_btn_top");
	//const coms_container = $(".product_comments .coms_container");

	let filters_open = false;

	ListComp(comments_list, undefined, general_product_comments_rows);

	const comment_count = +$(".product_comments .results_info_count").innerText;

	if (comment_count < 10) {
		show_filters.classList.add("hidden");
	}

	/** @type {PaginationComp} */
	// @ts-ignore
	const comments_pagination = $(`pagination-comp.comments`);
	PaginationComp(comments_pagination, undefined, {
		total_rows: comment_count,
		page_id: 0,
		row_count: 10,
		row_count_options: [10, 15, 30],
	});

	comments_pagination.addEventListener("change", () => {
		searchComments();
	});

	const searchComments = (callback = undefined) => {
		const datatable_params = {};
		// just newest on top is ok
		//     datatable_params.order = data.sort.key + " " + data.sort.order.toUpperCase();
		datatable_params.row_count = comments_pagination._data.row_count;
		datatable_params.page_id = comments_pagination._data.page_id;

		const params = {
			general_product_id,
			datatable_params,
		};

		if (filters_open) {
			// filters are active when button is hidden
			const phrase = $(".product_comments .phrase")._get_value();
			datatable_params.quick_search = phrase;

			params.options = $$(".product_comments .variants_container p-checkbox.checked")
				.map((c) => +c.dataset.value)
				.filter((e) => e);
		}

		xhr({
			url: "/comment/search",
			params,
			success: (res) => {
				comments_list._data = res.rows;
				comments_list._render();

				if (callback) {
					callback();
				}
			},
		});
	};

	// filters
	show_filters.addEventListener("click", () => {
		filters_open = true;
		if (expand(comments_filters, true) === undefined) {
			scrollIntoView(comments_filters);
		}
		show_filters.classList.add("hidden");
		searchComments();
	});
	$(".product_comments .comments_filters .hide_btn").addEventListener("click", () => {
		filters_open = false;
		expand(comments_filters, false);
		show_filters.classList.remove("hidden");
		searchComments();
	});

	// it's weird - it says that we want to have the 0 option selected by default, so the user doesn't have to actually think
	$$(".comments_filters .variants_container .radio_group, #addComment .variants_container .radio_group").forEach((e) => {
		e._set_value("0", { quiet: true });
		e.addEventListener("change", () => {
			if (e._get_value() === "") {
				e._set_value("0", { quiet: true });
			}
		});
	});

	search_btn.addEventListener("click", () => {
		const spinner_wrapper = search_btn._child(".spinner_wrapper");
		spinner_wrapper.classList.add("spinning");
		searchComments(() => {
			spinner_wrapper.classList.remove("spinning");
			smoothScroll(search_btn.getBoundingClientRect().top + search_btn.offsetHeight + 5 - header_height);
		});
	});

	// add comment form
	if (addComment) {
		/**
		 *
		 * @param {PiepNode} rating_picker
		 */
		const generateRating = (rating_picker) => {
			let rating_html = "";
			const rating = +def(rating_picker.dataset.hover_rating, def(rating_picker.dataset.rating, ""));
			for (let i = 1; i <= 5; i++) {
				const cls = i <= rating ? "fas fa-star" : "far fa-star";
				rating_html += html`<i class="${cls}" data-rating="${i}"></i>`;
			}
			rating_picker._set_content(rating_html);
		};
		const rating_picker = $(".rating_picker");
		generateRating(rating_picker);

		window.addEventListener("click", (ev) => {
			const target = $(ev.target);
			const rating_picker_star = target._parent(".rating_picker > i");
			if (rating_picker_star) {
				const rating_picker = target._parent(".rating_picker");
				rating_picker.dataset.rating = rating_picker_star.dataset.rating;
				generateRating(rating_picker);
			}
		});

		window.addEventListener("mousemove", (ev) => {
			const target = $(ev.target);
			const rating_picker_star = target._parent(".rating_picker > i");
			const has_focus = $(".rating_picker.has_focus");
			const rating_picker = target._parent(".rating_picker");
			if (has_focus && has_focus !== rating_picker) {
				has_focus.classList.remove("has_focus");
				delete has_focus.dataset.hover_rating;
				generateRating(has_focus);
			}
			if (rating_picker_star) {
				rating_picker.classList.add("has_focus");
				rating_picker.dataset.hover_rating = rating_picker_star.dataset.rating;
				generateRating(rating_picker);
			}
		});

		const first_label = addComment._child(".label");
		if (first_label) {
			first_label.classList.add("first");
		}

		addComment._child("form").addEventListener("submit", (ev) => {
			ev.preventDefault();

			const rating = +def(rating_picker.dataset.rating, "");
			const nickname_input = addComment._child(".nickname");
			const nickname = nickname_input._get_value();
			const comment_input = addComment._child(".comment");
			const comment = comment_input._get_value().trim();

			const options = addComment
				._children(".variants_container p-checkbox.checked")
				.map((c) => +c.dataset.value)
				.filter((e) => e);

			if (!comment) {
				showInputErrors(comment_input, ["Uzupełnij komentarz"]);
				return;
			}

			if (rating || confirm("Czy chcesz dodać komentarz bez oceny?")) {
				showLoader(addComment);

				xhr({
					url: "/comment/add",
					params: {
						nickname,
						comment: { comment, general_product_id, rating, options },
					},
					success: (res) => {
						hideModal("addComment");
						hideLoader(addComment);
						showNotification("Dodano komentarz", { type: "success", one_line: true });
						scrollIntoView($(".comments_label"), {
							callback: () => {
								searchComments();

								// clear after
								comment_input._set_value("");
								rating_picker.dataset.rating = "";
								generateRating(rating_picker);
								addComment._children(".variants_container .radio_group").map((c) => c._set_value(0, { quiet: true }));
							},
						});
					},
				});
			}
		});
	}
}

// notify when product back in stock

domload(() => {
	const notifyProductAvailable = $("#notifyProductAvailable .modal_body");
	const email_input = notifyProductAvailable._child(".field.email");

	notifyProductAvailable._child("form").addEventListener("submit", (ev) => {
		ev.preventDefault();
		const errors = validateInputs([email_input]);
		if (errors.length > 0) {
			return;
		}

		const email = email_input._get_value();
		showLoader(notifyProductAvailable);
		xhr({
			url: "/product_queue/add",
			params: {
				product_queue: { email, product_id: single_product.product_id },
			},
			success: (res) => {
				hideLoader(notifyProductAvailable);
				// gotta be first
				showModal("notifyProductSuccess");
				hideModal("notifyProductAvailable");

				$("#notifyProductSuccess .email")._set_content(email);
			},
		});
	});
});

domload(() => {
	const ask_product_btn = $(".ask_product_btn");
	ask_product_btn.addEventListener("click", () => {
		const product_name = single_product ? single_product.__name : general_product_name;
		AskProduct._child(`[data-name="subject"]`)._set_value(`Zapytanie o produkt`, { quiet: true });
		AskProduct._child(`[data-name="message"]`)._set_value(product_name, { quiet: true });
		showModal(`AskProduct`, { source: ask_product_btn });
	});

	const AskProduct = $("#AskProduct .modal_body");

	AskProduct._child("form").addEventListener("submit", (ev) => {
		ev.preventDefault();
		const errors = validateInputs(AskProduct._children("[data-name]"));
		if (errors.length > 0) {
			return;
		}

		showLoader(AskProduct);
		xhr({
			url: "/send_contact_form_email",
			params: Object.fromEntries(AskProduct._children("[data-name]").map((field) => [field.dataset.name, field._get_value()])),
			success: (res) => {
				hideLoader(AskProduct);
				hideModal("AskProduct");

				showNotification(`<div class="header">Sukces</div>Wysłano wiadomość`);

				AskProduct._children("[data-name]").forEach((input) => {
					input._set_value("", { quiet: true });
				});
				clearInputsErrors(AskProduct._children("[data-name]"));
			},
		});
	});
});

domload(() => {
	const discount_on_products_label = $(".discount_on_products_label");
	if (!discount_on_products_label) {
		return;
	}
	discount_on_products_label.addEventListener("click", () => {
		expand(discount_on_products_label._next(), discount_on_products_label.classList.toggle("expanded"));
	});
});
