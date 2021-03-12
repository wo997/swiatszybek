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
/** @type {PaginationComp} */
let product_list_pagination_comp;
/** @type {XMLHttpRequest} */
let search_product_list_xhr;

/** @type {PiepNode} */
let search_products_price_min;
/** @type {PiepNode} */
let search_products_price_max;

const search_products_input_delay = 400;

let current_url = window.location.pathname + def(window.location.search, "");
domload(() => {
	products_all = $(".products_all");
	product_list = $(".product_list");
	results_info_count = $(".results_info .products_total_rows");
	sticky_results_info = $(".results_info");
	products_category_name = $(".category_name");

	initPrices();
	initRangeFilters();
	initPagination();
	initProductFeatures();
	initProductCategories();
	openCurrentMenu();
	setCategoryFeaturesFromUrl();
	setRangesFromUrl();

	if (product_list._is_empty()) {
		displayNoProducts();
	}

	product_list_ready = true;

	document.addEventListener("click", (ev) => {
		const target = $(ev.target);
		const clean_filters_btn = target._parent(".clean_filters_btn", { skip: 0 });
		if (clean_filters_btn) {
			$$(".searching_wrapper .option_checkbox").forEach((option_checkbox) => {
				option_checkbox._set_value(0, { quiet: true });
			});
			mainSearchProducts();
		}
	});
});

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

function setRangesFromUrl() {
	const url_params = new URLSearchParams(window.location.search);

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
		a.insertAdjacentHTML("beforeend", `<button class="expand_btn btn transparent"><i class="fas fa-chevron-right"></button>`);
		ul.classList.add("expand_y", "hidden", "animate_hidden");
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
}

function initPagination() {
	// @ts-ignore
	product_list_pagination_comp = $(`pagination-comp.product_list_pagination`);
	paginationComp(product_list_pagination_comp, undefined);
	product_list_pagination_comp._data = {
		row_count: 2,
		total_rows: +results_info_count.innerText,
		page_id: 0,
		row_count_options: [2, 5, 25, 100],
	};
	product_list_pagination_comp._render();

	product_list_pagination_comp.addEventListener("change", () => {
		delay("mainSearchProducts");
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

function openCurrentMenu() {
	const current = $(`.product_categories li[data-category_id="${product_category_id}"]`);
	if (current) {
		let open_cat = current;
		while (true) {
			open_cat._child("a").classList.add("current");
			const expand_btn = open_cat._child(".expand_btn");
			if (expand_btn) {
				expand_btn.click();
			}
			open_cat = open_cat._parent("li");
			if (!open_cat) {
				break;
			}
		}
	}
}
window.addEventListener("popstate", () => {
	setCategoryFeaturesFromUrl();
});

function setCategoryFeaturesFromUrl() {
	const url_params = new URLSearchParams(window.location.search);

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
		const option_checkbox = $(`.product_features .option_checkbox[data-option_id="${option_id}"]`);
		matched_boxes.push(option_checkbox);
		option_checkbox._set_value(1);

		let option_row = option_checkbox;
		while (true) {
			option_row = option_row._parent(".option_row");
			if (!option_row) {
				return;
			}
			const parent_box = option_row._direct_child(".checkbox_area")._child(".option_checkbox");
			parent_box._set_value(1);
			matched_boxes.push(parent_box);
		}
	});
	$$(`.product_features .option_checkbox`).forEach((option_checkbox) => {
		if (!matched_boxes.includes(option_checkbox)) {
			option_checkbox._set_value(0);
		}
	});

	// paginatiobn
	product_list_pagination_comp._data.page_id = +def(url_params.get("str"), "1") - 1;
	product_list_pagination_comp._data.row_count = +def(url_params.get("ile"), "25");

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
			option_ids.push(+option_checkbox.dataset.option_id);
		});
		if (option_ids.length > 0) {
			data.push({ option_ids, all_names });
		}
	});
	return data;
}

function mainSearchProducts() {
	if (search_product_list_xhr) {
		search_product_list_xhr.abort();
	}

	let url = "/produkty";
	url += "/" + product_category_id;

	const options_data = getSelectedOptionsData();
	pp_selected_option_groups = options_data.map((e) => e.option_ids);

	const category_path_names = product_category_path.map((e) => e.name);
	let full_name = category_path_names.join(" | ");
	if (options_data.length > 0) {
		full_name += options_data
			.map((e) => e.all_names.join(" "))
			.flat(1)
			.map((e) => " | " + e)
			.join("");
	}

	url += "/" + escapeUrl(category_path_names.join(" "));

	const url_params = new URLSearchParams();
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

	const url_params_str = url_params.toString();
	if (url_params_str) {
		url += "?" + url_params_str;
	}

	if (current_url === url) {
		return;
	}

	current_url = url;

	// it does not work lol
	history.pushState(undefined, full_name, url);
	// workaround here
	document.title = full_name;

	search_product_list_xhr = xhr({
		url: "/product/search",
		params: {
			url,
		},
		success: productsFetched,
	});
}

function displayNoProducts() {
	product_list._set_content(html`<div class="no_results">
		<span>Nie znaleźliśmy żadnego produktu</span>
		<br />
		<button class="btn primary clean_filters_btn">Wyczyść filtry <i class="fas fa-eraser"></i></button>
	</div>`);
}

function productsFetched(res = {}) {
	search_product_list_xhr = undefined;

	products_all.style.height = products_all.offsetHeight + "px";
	if (res.html !== undefined) {
		if (res.html === "") {
			displayNoProducts();
		} else {
			product_list._set_content(res.html);
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
