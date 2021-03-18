/* js[view] */

let currPage = 1;
let rowCount = 24;
/** @type {number[][]} */
let pp_selected_option_groups;
let product_list_ready = false;

/** @type {PiepNode} */
let sticky_results_info;
/** @type {PiepNode} */
let products_category_name;
/** @type {PiepNode} */
let products_all;
/** @type {PiepNode} */
let product_list;
/** @type {PiepNode} */
let results_info_count;
/** @type {PiepNode} */
let results_info_count_spinner;
/** @type {PiepNode} */
let search_phrase;
/** @type {PiepNode} */
let feature_filter_count;
/** @type {PaginationComp} */
let product_list_pagination_comp;
/** @type {XMLHttpRequest} */
let search_product_list_xhr;

/** @type {PiepNode} */
let search_products_price_min;
/** @type {PiepNode} */
let search_products_price_max;

const search_products_input_delay = 400;

/** @type {string} */
let current_url_search;

domload(() => {
	products_all = $(".products_all");
	product_list = $(".product_list");
	results_info_count = $(".results_info .products_total_rows");
	results_info_count_spinner = results_info_count._next();
	sticky_results_info = $(".results_info");
	products_category_name = $(".category_name");

	products_all.classList.add("ready");

	initPrices();
	initRangeFilters();
	initProductFeatures();
	initProductCategories();
	initSearchPhrase();
	initPagination();
	productsPopState();

	if (product_list._is_empty()) {
		displayNoProducts();
	}

	document.addEventListener("click", (ev) => {
		const target = $(ev.target);
		const clear_filters_btn = target._parent(".clear_filters_btn", { skip: 0 });
		if (clear_filters_btn) {
			$$(".searching_wrapper .option_checkbox").forEach((option_checkbox) => {
				option_checkbox._set_value(0, { quiet: true });
			});

			$$(".searching_wrapper .expand_y:not(.hidden)").forEach((expand_y) => {
				expand(expand_y, false);
			});

			$$(".searching_wrapper input.field").forEach((input) => {
				input._set_value("", { quiet: true });
			});

			$$(".searching_wrapper select.field").forEach((select) => {
				// @ts-ignore
				select.selectedIndex = 0;
			});

			mainSearchProducts();
		}
	});

	$$("p-checkbox.colorful").forEach((e) => {
		const checkbox_color = e.style.getPropertyValue("--checkbox_color");
		if (checkbox_color) {
			const hex = checkbox_color.replace("#", "");
			const r = parseInt(hex.substr(0, 2), 16);
			const g = parseInt(hex.substr(2, 2), 16);
			const b = parseInt(hex.substr(4, 2), 16);
			e.classList.toggle("bright_color", 0.299 * r + 0.587 * g + 0.114 * b > 255 / 2);
		}
	});

	setTimeout(() => {
		product_list_ready = true;
	});
});

function initSearchPhrase() {
	search_phrase = $(".searching_wrapper .search_phrase");
	search_phrase.addEventListener("input", () => {
		delay("mainSearchProducts", search_products_input_delay);
	});
	search_phrase.addEventListener("change", () => {
		delay("mainSearchProducts");
	});
}

function initRangeFilters() {
	$$(".searching_wrapper .range_filter").forEach((range_filter) => {
		const input_from = range_filter._child("input.from");
		const unit_from = range_filter._child("select.from");
		const input_to = range_filter._child("input.to");
		const unit_to = range_filter._child("select.to");

		input_from.addEventListener("input", () => {
			delay("mainSearchProducts", search_products_input_delay);
		});
		input_from.addEventListener("change", () => {
			delay("mainSearchProducts");
		});
		input_to.addEventListener("input", () => {
			delay("mainSearchProducts", search_products_input_delay);
		});
		input_to.addEventListener("change", () => {
			delay("mainSearchProducts");
		});
		if (unit_from) {
			unit_from.addEventListener("change", () => {
				delay("mainSearchProducts");
			});
		}
		if (unit_to) {
			unit_to.addEventListener("change", () => {
				delay("mainSearchProducts");
			});
		}
	});
}

function setSearchPhraseFromUrl() {
	const url_params = new URLSearchParams(current_url_search);

	/** @type {string} */
	const search_phrase_val = def(url_params.get("znajdz"), "");
	search_phrase._set_value(search_phrase_val, { quiet: true });
}

function setRangesFromUrl() {
	const url_params = new URLSearchParams(current_url_search);

	/** @type {string} */
	const r = def(url_params.get("r"), "");

	r.split("-").forEach((range_data) => {
		let [product_feature_id, from, to] = range_data.split(/[_l]/);
		const range_filter = $(`.range_filter[data-product_feature_id="${product_feature_id}"]`);

		if (!range_filter) {
			return;
		}

		/**
		 *
		 * @param {string} number
		 * @returns
		 */
		const restore_number = (number) => {
			number = (number + "").replace(/^0/, "0.");
			return numberFromStr(number);
		};

		const input_from = range_filter._child("input.from");
		const unit_from = range_filter._child("select.from");
		const input_to = range_filter._child("input.to");
		const unit_to = range_filter._child("select.to");

		const setField = (input, unit, val) => {
			if (unit && unit.options) {
				const value_data = getSafeUnitValue(
					// @ts-ignore
					[...unit.options].map((e) => +e.value),
					restore_number(val)
				);
				input._set_value(val === "" ? "" : value_data.value, { quiet: true });
				unit._set_value(value_data.unit_factor, { quiet: true });
			} else {
				input._set_value(val, { quiet: true });
			}
		};

		setField(input_from, unit_from, from);
		setField(input_to, unit_to, to);
	});
}

function initProductCategories() {
	$$(".product_categories ul:not(.level_0)").forEach((ul) => {
		const a = ul._prev();
		a.insertAdjacentHTML("beforeend", html`<button class="expand_btn btn transparent"><i class="fas fa-chevron-right"></button>`);
		//ul.classList.add("expand_y", "hidden", "animate_hidden");
	});

	$(".product_categories").addEventListener("click", (ev) => {
		const target = $(ev.target);

		const expand_btn = target._parent(".expand_btn", { skip: 0 });
		if (expand_btn) {
			const open = expand_btn.classList.toggle("open");
			expand(expand_btn._parent()._next(), open);
			ev.preventDefault();
			return false;
		}
	});

	const current = $(`.product_categories li[data-category_id="${product_category_id}"]`);
	if (current) {
		let open_cat = current;
		while (true) {
			open_cat._child("a").classList.add("current");
			open_cat = open_cat._parent("li");
			if (!open_cat) {
				break;
			}
		}
	}
}

function initProductFeatures() {
	$$(".product_features .option_row > ul").forEach((ul) => {
		const checkbox_area = ul._prev();
		const checkbox = checkbox_area._child("p-checkbox");
		checkbox.addEventListener("change", () => {
			expand(ul, checkbox._get_value());
		});
		ul.classList.add("expand_y", "hidden", "animate_hidden");
	});

	$$(".product_features .option_checkbox").forEach((checkbox) => {
		checkbox.addEventListener("change", () => {
			if (!checkbox._get_value()) {
				const checkbox_area = checkbox._parent(".checkbox_area");
				const expand_y = checkbox_area._next(".expand_y");
				if (expand_y) {
					expand_y._children(".option_checkbox.checked").forEach((c) => {
						c._set_value(0, { quiet: true });
					});
				}
			}

			if (product_list_ready) {
				mainSearchProducts();
			}
		});
	});

	feature_filter_count = $(".searching_wrapper .feature_filter_count");
	setProductsFilterCountFromUrl();
}

function setProductsFilterCountFromUrl() {
	let filter_count = 0;

	const url_params = new URLSearchParams(current_url_search);

	const v = def(url_params.get("v"), "");
	if (v) {
		filter_count += v.split("-").length;
	}

	const r = def(url_params.get("r"), "");
	if (r) {
		filter_count += r.split("-").length;
	}

	if (url_params.get("cena")) {
		filter_count++;
	}

	feature_filter_count._set_content(filter_count ? `(${filter_count})` : "");
	$(".searching_wrapper .clear_filters_btn").classList.toggle("hidden", filter_count === 0);
}

function initPagination() {
	// @ts-ignore
	product_list_pagination_comp = $(`pagination-comp.product_list_pagination`);
	paginationComp(product_list_pagination_comp, undefined, {
		total_rows: +results_info_count.innerText,
		page_id: 0,
		row_count_options: [5, 25, 100],
	});

	product_list_pagination_comp.addEventListener("change", () => {
		mainSearchProducts();
	});
}

function initPrices() {
	search_products_price_min = $(".searching_wrapper .price_min");
	search_products_price_max = $(".searching_wrapper .price_max");

	search_products_price_min.addEventListener("input", () => {
		delay("mainSearchProducts", search_products_input_delay);
	});
	search_products_price_min.addEventListener("change", () => {
		delay("mainSearchProducts");
	});
	search_products_price_max.addEventListener("input", () => {
		delay("mainSearchProducts", search_products_input_delay);
	});
	search_products_price_max.addEventListener("change", () => {
		delay("mainSearchProducts");
	});
}

window.addEventListener("popstate", () => {
	productsPopState();
});

function productsPopState() {
	current_url_search = def(window.location.search, "");
	setCategoryFeaturesFromUrl();
	setRangesFromUrl();
	setSearchPhraseFromUrl();
	setProductsFilterCountFromUrl();
	mainSearchProducts(true);
}

function setCategoryFeaturesFromUrl() {
	const url_params = new URLSearchParams(current_url_search);

	// features
	/** @type {string} */
	const v = def(url_params.get("v"), "");
	pp_selected_option_groups = v.split("-").map((/** @type {string} */ group) =>
		group
			.split("l")
			.map((e) => +e)
			.filter((e) => e)
	);

	const matched_boxes = [];
	pp_selected_option_groups.flat(1).forEach((option_id) => {
		const option_checkbox = $(`.product_features .option_checkbox[data-value="${option_id}"]`);
		if (!option_checkbox) {
			return;
		}
		matched_boxes.push(option_checkbox);
		option_checkbox._set_value(1, { quiet: true });

		let option_row = option_checkbox;
		while (true) {
			option_row = option_row._parent(".option_row");
			if (!option_row) {
				return;
			}
			const parent_box = option_row._direct_child(".checkbox_area")._child(".option_checkbox");
			parent_box._set_value(1, { quiet: true });
			matched_boxes.push(parent_box);
		}
	});
	$$(`.product_features .option_checkbox`).forEach((option_checkbox) => {
		if (!matched_boxes.includes(option_checkbox)) {
			option_checkbox._set_value(0, { quiet: true });
		}
	});

	// paginatiobn
	product_list_pagination_comp._data.page_id = +def(url_params.get("str"), "1") - 1;
	product_list_pagination_comp._data.row_count = +def(url_params.get("ile"), "25");
	product_list_pagination_comp._render();

	// price
	/** @type {string} */
	const price_str = def(url_params.get("cena"), "");
	const price_parts = price_str.split("l");
	const price_min = def(price_parts[0], "");
	const price_max = def(price_parts[1], "");
	search_products_price_min._set_value(price_min, { quiet: true });
	search_products_price_max._set_value(price_max, { quiet: true });
}

function getSelectedOptionsData() {
	/**
	 * @type {{
	 *  option_ids: number[]
	 *  all_names: string[]
	 * }[]}
	 */
	let data = [];

	$$(".product_features > li").forEach((feature) => {
		const option_ids = [];
		const all_names = [];
		feature._children(".option_checkbox.checked").forEach((option_checkbox) => {
			const checkbox_area = option_checkbox._parent(".checkbox_area");
			const expand_y = checkbox_area._next(".expand_y");
			const name = checkbox_area._child(".feature_option_label").innerText;
			all_names.push(name);
			if (expand_y && expand_y._children(".option_checkbox.checked").length !== 0) {
				return;
			}
			option_ids.push(+option_checkbox.dataset.value);
		});
		if (option_ids.length > 0) {
			data.push({ option_ids, all_names });
		}
	});
	return data;
}

function mainSearchProducts(force = false) {
	if (!product_list_ready) {
		return;
	}

	const options_data = getSelectedOptionsData();
	pp_selected_option_groups = options_data.map((e) => e.option_ids);

	let url = "/produkty";
	let full_name = "";
	if (product_category_id !== -1) {
		url += "/" + product_category_id;

		const category_path_names = product_category_path.map((e) => e.name);
		full_name = category_path_names.join(" | ");
		if (options_data.length > 0) {
			full_name += options_data
				.map((e) => e.all_names.join(" "))
				.flat(1)
				.map((e) => " | " + e)
				.join("");
		}
		url += "/" + escapeUrl(category_path_names.join(" "));
	}

	const url_params = new URLSearchParams();

	/** @type {string} */
	const search_phrase_val = search_phrase._get_value();
	if (search_phrase_val.trim() !== "") {
		url_params.append("znajdz", search_phrase_val);
	}

	if (options_data.length > 0) {
		url_params.append("v", options_data.map((e) => e.option_ids.join("l")).join("-"));
	}

	const price_min = search_products_price_min._get_value();
	const price_max = search_products_price_max._get_value();

	if (price_min.trim() !== "" || price_max.trim() !== "") {
		url_params.append("cena", def(price_min, "") + "l" + def(price_max, ""));
	}

	if (product_list_pagination_comp._data.page_id > 0) {
		url_params.append("str", product_list_pagination_comp._data.page_id + 1 + "");
	}
	if (product_list_pagination_comp._data.row_count !== 25) {
		url_params.append("ile", product_list_pagination_comp._data.row_count + "");
	}

	let url_from_ranges = [];
	$$(".searching_wrapper .range_filter").forEach((range_filter) => {
		const input_from = range_filter._child("input.from");
		const unit_from = range_filter._child("select.from");
		const input_to = range_filter._child("input.to");
		const unit_to = range_filter._child("select.to");
		const product_feature_id = range_filter.dataset.product_feature_id;

		let from = input_from._get_value();
		let to = input_to._get_value();
		const from_selected = from.trim() !== "";
		const to_selected = to.trim() !== "";
		if (from_selected) {
			from = numberFromStr(from);
			if (unit_from) {
				from *= +unit_from._get_value();
			}
		}

		if (to_selected) {
			to = numberFromStr(to);
			if (unit_to) {
				to *= +unit_to._get_value();
			}
		}

		if (from_selected || to_selected) {
			const safe_number = (number) => {
				const accuracy = 100000;

				// 0.09 becomes 009, you can easily tell that the dot comes after first 0
				return (Math.round(accuracy * number) / accuracy + "").replace(/^0./, "0");
			};
			const values = (from_selected ? safe_number(from) : "") + "l" + (to_selected ? safe_number(to) : "");
			url_from_ranges.push(`${product_feature_id}_${values}`);
		}
	});

	if (url_from_ranges.length > 0) {
		url_params.append("r", url_from_ranges.join("-"));
	}

	const url_search = url_params.toString();
	if (url_search) {
		url += "?" + url_search;
	}

	if (!force) {
		if (current_url_search === url_search) {
			return;
		}

		current_url_search = url_search;

		// title does not work lol
		history.replaceState(undefined, full_name, url);
	}

	setProductsFilterCountFromUrl();

	// workaround here
	document.title = full_name;

	results_info_count_spinner.classList.add("visible");
	product_list.style.opacity = "0.7";

	if (search_product_list_xhr) {
		search_product_list_xhr.abort();
	}

	search_product_list_xhr = xhr({
		url: "/product/search",
		params: {
			url,
		},
		success: (res = {}) => {
			search_product_list_xhr = undefined;

			results_info_count_spinner.classList.remove("visible");
			product_list.style.opacity = "1";

			products_all.style.height = products_all.offsetHeight + "px";
			if (res.html !== undefined) {
				if (res.html === "") {
					displayNoProducts();
				} else {
					product_list._set_content(res.html);
					productBlocksLoaded();
				}
			}
			if (res.total_rows !== undefined) {
				results_info_count._set_content(res.total_rows);
				product_list_pagination_comp._data.total_rows = res.total_rows;
				product_list_pagination_comp._render();
			}

			product_list._children(".product_img_wrapper").forEach((img_wrapper) => {
				const product_img = img_wrapper._child(".product_img");
				const images = JSON.parse(img_wrapper.dataset.images);
				// images.forEach((img, index) => {
				// 	let weight = -index;
				// 	for (const option_id of pp_selected_option_groups.flat(2)) {
				// 		if (img.option_ids.includes(option_id)) {
				// 			weight += 100;
				// 		}
				// 	}
				// 	img.weight = weight;
				// });
				// images.sort((a, b) => Math.sign(b.weight - a.weight));

				img_wrapper.dataset.images = JSON.stringify(images);
				if (images[0]) {
					setResponsiveImageUrl(product_img, images[0].img_url);
				}
				if (images[1]) {
					preloadWo997Image(images[1].img_url, product_img);
				}
			});

			lazyLoadImages();

			scrollIntoView(products_category_name, {
				direction: "up",
				//offset: 0,
				callback: () => {
					products_all.style.height = "";
				},
			});
		},
	});
}

function displayNoProducts() {
	const action_html = feature_filter_count._is_empty()
		? html`<div style="margin-top:5px">Przejdź do innej kategorii</div>`
		: html`<button class="btn primary clear_filters_btn">Wyczyść filtry <i class="fas fa-eraser"></i></button>`;

	product_list._set_content(html`<div class="no_results">
		<span>Nie znaleźliśmy żadnego produktu</span>
		<br />
		${action_html}
	</div>`);
}

domload(() => {
	const scrclb = () => {
		const mobile = window.innerWidth < 850;
		if (mobile) {
			const r = products_category_name.getBoundingClientRect();
			const visible = r.top > window.innerHeight;
			sticky_results_info.classList.toggle("visible", visible);
		}

		$(".searching_wrapper > .scroll_panel").classList.toggle("separate_scroll", !mobile);
	};
	window.addEventListener("scroll", scrclb);
	window.addEventListener("resize", scrclb);
	scrclb();

	$(".results_info .btn").addEventListener("click", () => {
		smoothScroll(products_category_name.getBoundingClientRect().top - 100);
	});
});
