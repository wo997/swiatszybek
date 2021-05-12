/* js[view] */

const default_search_order = "bestsellery";

let currPage = 1;
let rowCount = 24;
/** @type {number[][]} */
let pp_selected_option_groups;
let product_list_ready = false;

/** @type {PiepNode} */
let results_info;
/** @type {PiepNode} */
let results_info_mobile;
/** @type {PiepNode} */
let products_category_name;
/** @type {PiepNode} */
let products_all;
/** @type {PiepNode} */
let product_list;
/** @type {PiepNode} */
let search_phrase;
/** @type {PiepNode} */
let search_order;
/** @type {PiepNode} */
let feature_filter_count;
/** @type {PaginationComp} */
let product_list_pagination_comp;
/** @type {XMLHttpRequest} */
let search_product_list_xhr;

const search_products_input_delay = 400;

/** @type {string} */
let current_url_search;

domload(() => {
	products_all = $(".products_all");
	product_list = $(".product_list");

	results_info = $(".results_info");
	results_info_mobile = $(".results_info_mobile");
	products_category_name = $(".category_name");

	initRangeFilters();
	initProductFeatures();
	initProductCategories();
	initSearchPhrase();
	initSearchOrder();
	initPagination();
	productsPopState();

	if (product_list._is_empty()) {
		displayNoProducts();
	}

	document.addEventListener("click", (ev) => {
		const target = $(ev.target);
		const clear_filters_btn = target._parent(".clear_filters_btn");
		if (clear_filters_btn) {
			$$(".searching_wrapper .option_checkbox, .searching_wrapper .option_range_checkbox").forEach((option_checkbox) => {
				option_checkbox._set_value(0, { quiet: true });
			});

			$$(".searching_wrapper .option_row .expand_y:not(.hidden)").forEach((expand_y) => {
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

function initSearchOrder() {
	search_order = $(".searching_wrapper .search_order");
	search_order.addEventListener("change", () => {
		delay("mainSearchProducts");
	});
}

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
	const search_phrase_val = def(url_params.get("znajdz"));
	search_phrase._set_value(search_phrase_val, { quiet: true });
}

function setSearchOrderFromUrl() {
	const url_params = new URLSearchParams(current_url_search);

	/** @type {string} */
	const search_order_val = def(url_params.get("sortuj"), default_search_order);
	search_order._set_value(search_order_val, { quiet: true });
}

function setRangesFromUrl() {
	const url_params = new URLSearchParams(current_url_search);

	for (const key of url_params.keys()) {
		if (!key.match(/^(r\d*|cena)$/)) {
			continue;
		}

		const product_feature_id = numberFromStr(key);

		let [from, to] = url_params.get(key).split("_do_");
		const range_filter = $(`.range_filter[data-product_feature_id="${product_feature_id}"]`);

		if (!range_filter) {
			return;
		}

		const input_from = range_filter._child("input.from");
		const unit_from = range_filter._child("select.from");
		const input_to = range_filter._child("input.to");
		const unit_to = range_filter._child("select.to");

		/**
		 *
		 * @param {PiepNode} input
		 * @param {*} unit
		 * @param {string} val
		 */
		const setField = (input, unit, val) => {
			if (unit && unit.options) {
				const match_letter = val.match(/[a-zA-Z]/);
				const letter_index = match_letter ? match_letter.index : val.length;
				const number_str = val.substring(0, letter_index);
				const unit_str = val.substring(letter_index);

				input._set_value(val === "" ? "" : number_str, { quiet: true });
				unit._set_value(unit_str, { quiet: true });
			} else {
				input._set_value(val, { quiet: true });
			}
		};

		setField(input_from, unit_from, from);
		setField(input_to, unit_to, to);

		const double_value_quick_list = $(`.double_value_quick_list[data-product_feature_id="${product_feature_id}"]`);

		if (!double_value_quick_list) {
			return;
		}

		/** @type {PiepNode} */
		let min_checkbox;
		/** @type {PiepNode} */
		let max_checkbox;
		double_value_quick_list._direct_children().forEach((li) => {
			const checkbox = li._child(".option_range_checkbox");
			const val_str = checkbox.dataset.value;
			let [chck_from, chck_to] = val_str.split("_do_");
			if (chck_to === undefined) {
				chck_to = chck_from;
			}

			if (chck_from !== undefined && chck_from == from) {
				min_checkbox = checkbox;
			}
			if (chck_to !== undefined && chck_to == to) {
				max_checkbox = checkbox;
			}
		});
		if (min_checkbox && max_checkbox) {
			double_value_quick_list
				._children(".option_range_checkbox")
				.forEach((e) => e._set_value(e === min_checkbox || e === max_checkbox ? 1 : 0, { quiet: true }));
		} else {
			showTab(double_value_quick_list._parent(".tab_menu"), 2);
		}
	}
}

function initProductCategories() {
	$$(".product_categories ul:not(.level_0)").forEach((ul) => {
		const a = ul._prev();
		let classes = "expand_btn btn transparent";
		if (!ul.classList.contains("hidden")) {
			classes += " open";
		}
		a.insertAdjacentHTML("beforeend", html`<button class="${classes}"><i class="fas fa-chevron-right"></button>`);
	});

	$(".product_categories").addEventListener("click", (ev) => {
		const target = $(ev.target);

		const expand_btn = target._parent(".expand_btn");
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
			open_cat = open_cat._parent("li", { skip: 1 });
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
					setTimeout(() => {
						expand_y._children(".option_checkbox.checked").forEach((c) => {
							c._set_value(0, { quiet: true });
						});
						expand_y._children(".expand_y:not(.hidden)").forEach((e) => {
							expand(e, false);
						});
					}, 250);
				}
			}

			mainSearchProducts();
		});
	});

	$$(".product_features .option_range_checkbox").forEach((checkbox) => {
		checkbox.addEventListener("change", () => {
			const ul = checkbox._parent("ul");
			const checked = ul._children(".option_range_checkbox.checked");
			if (checked.length > 2) {
				checked.forEach((chck) => {
					if (chck !== checkbox) {
						chck._set_value(0, { quiet: true });
					}
				});
			}

			mainSearchProducts();
		});
	});
	$$(".product_features .tab_menu").forEach((tab_menu) => {
		tab_menu.addEventListener("change", () => {
			mainSearchProducts();
		});
	});

	feature_filter_count = $(".searching_wrapper .feature_filter_count");
	setProductsFilterCountFromUrl();
}

/**
 *
 * @returns
 */
function updatePrettyCheckboxRanges() {
	const ranges = {};
	$$(".product_features .double_value_quick_list").forEach((ul) => {
		let r_min = undefined;
		let r_max = undefined;
		/** @type {PiepNode} */
		let min_checkbox;
		/** @type {PiepNode} */
		let max_checkbox;

		// first match is highest, the last one is the lowest, ezy ;)
		ul._children(".option_range_checkbox.checked").forEach((chck) => {
			/** @type {*} */
			let [from, to] = chck.dataset.value.split("_do_");
			if (from !== undefined) {
				// last one low so override everything
				r_min = from;
				min_checkbox = chck;

				if (to === undefined) {
					to = from;
				}
				// first one high
				if (r_max === undefined) {
					r_max = to;
					max_checkbox = chck;
				}
			}
		});
		removeClasses(".angle_up", ["angle_up"], ul);
		removeClasses(".angle_down", ["angle_down"], ul);

		if (min_checkbox || max_checkbox) {
			ranges[ul.dataset.product_feature_id] = [r_min, r_max];
		}

		if (max_checkbox && max_checkbox && min_checkbox !== max_checkbox) {
			max_checkbox.classList.add("angle_up");
			min_checkbox.classList.add("angle_down");
		}

		ul._direct_children().forEach((li) => {
			li._child(".option_range_checkbox")._get_value();
		});
	});

	return ranges;
}

function setProductsFilterCountFromUrl() {
	let filter_count = 0;

	const url_params = new URLSearchParams(current_url_search);

	for (const key of url_params.keys()) {
		if (key.match(/^(r\d*|cena)$/)) {
			filter_count++;
		}
	}

	const v = def(url_params.get("v"), "");
	if (v) {
		filter_count += v.split("-").length;
	}

	feature_filter_count._set_content(filter_count ? `(${filter_count})` : "");
	$(".searching_wrapper .clear_filters_btn").classList.toggle("hidden", filter_count === 0);
}

function initPagination() {
	// @ts-ignore
	product_list_pagination_comp = $(`pagination-comp.product_list_pagination`);
	PaginationComp(product_list_pagination_comp, undefined, {
		total_rows: products_total_rows,
		page_id: 0,
		row_count_options: [5, 25, 100],
	});

	product_list_pagination_comp.addEventListener("change", () => {
		mainSearchProducts();
	});
}

window.addEventListener("popstate", () => {
	productsPopState();
});

function productsPopState() {
	current_url_search = def(window.location.search, "");
	if (current_url_search.charAt(0)) {
		current_url_search = current_url_search.substr(1);
	}
	setCategoryFeaturesFromUrl();
	setRangesFromUrl();
	setSearchPhraseFromUrl();
	setSearchOrderFromUrl();
	setProductsFilterCountFromUrl();
	updatePrettyCheckboxRanges();
	mainSearchProducts(true);
}

function setCategoryFeaturesFromUrl() {
	const url_params = new URLSearchParams(current_url_search);

	// features
	/** @type {string} */
	const v = def(url_params.get("v"), "");
	pp_selected_option_groups = v.split("-").map((/** @type {string} */ group) =>
		group
			.split("i")
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
		const expandy_y = option_checkbox._parent()._next();
		if (expandy_y) {
			expand(expandy_y, true);
		}
		let parent_expand_y = def(expandy_y, option_checkbox);
		while (true) {
			parent_expand_y = parent_expand_y._parent(".expand_y", { skip: 1 });
			if (!parent_expand_y) {
				break;
			}
			expand(parent_expand_y, true);
		}

		let option_row = option_checkbox;
		while (true) {
			option_row = option_row._parent(".option_row", { skip: 1 });
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

	// pagination
	product_list_pagination_comp._data.page_id = +def(url_params.get("str"), "1") - 1;
	product_list_pagination_comp._data.row_count = +def(url_params.get("ile"), "25");
	product_list_pagination_comp._render();
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

	/** @type {string} */
	const search_order_val = search_order._get_value();
	if (search_order_val.trim() !== default_search_order) {
		url_params.append("sortuj", search_order_val);
	}

	if (options_data.length > 0) {
		url_params.append("v", options_data.map((e) => e.option_ids.join("i")).join("-"));
	}

	if (product_list_pagination_comp._data.page_id > 0) {
		url_params.append("str", product_list_pagination_comp._data.page_id + 1 + "");
	}
	if (product_list_pagination_comp._data.row_count !== 25) {
		url_params.append("ile", product_list_pagination_comp._data.row_count + "");
	}

	let url_from_ranges = {};
	$$(".product_features .tab_content:not(.hidden) .range_filter").forEach((range_filter) => {
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
				from += unit_from._get_value();
			}
		}

		if (to_selected) {
			to = numberFromStr(to);
			if (unit_to) {
				to += unit_to._get_value();
			}
		}

		if (from_selected || to_selected) {
			const values = (from_selected ? from : "") + "_do_" + (to_selected ? to : "");
			url_from_ranges[product_feature_id] = values;
		}
	});

	const feature_list_ranges = updatePrettyCheckboxRanges();

	Object.entries(feature_list_ranges).forEach(([product_feature_id, minmax]) => {
		if (url_from_ranges[product_feature_id]) {
			return;
		}
		const values = minmax[0] + "_do_" + minmax[1];
		url_from_ranges[product_feature_id] = values;
	});

	if (Object.keys(url_from_ranges).length > 0) {
		Object.entries(url_from_ranges).forEach(([product_feature_id, values]) => {
			const name = product_feature_id === "cena" ? "cena" : `r${product_feature_id}`;
			url_params.append(name, values);
		});
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

	// !!! currently the name is just the one of the category
	// workaround here
	//document.title = full_name;

	const setSpinners = (spinning) => {
		$$(".product_list_wrapper .spinner_wrapper").forEach((w) => {
			w.classList.toggle("spinning", spinning);
		});
	};

	setSpinners(true);
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

			setSpinners(false);
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
				$$(".product_list_wrapper .products_total_rows").forEach((t) => {
					t._set_content(res.total_products);
				});
				product_list_pagination_comp._data.total_rows = res.total_rows;
				product_list_pagination_comp._render();
			}

			product_list._children(".product_img_wrapper").forEach((img_wrapper) => {
				const product_img = img_wrapper._child(".product_img");
				const images = JSON.parse(img_wrapper.dataset.images);

				img_wrapper.dataset.images = JSON.stringify(images);
				if (images[0]) {
					setResponsiveImageUrl(product_img, images[0]);
				}
				if (images[1]) {
					preloadWo997Image(images[1], product_img);
				}
			});

			lazyLoadImages();

			scrollIntoView(products_category_name, {
				direction: "up",
				offset: header_height + 100,
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
	const getmob = () => window.innerWidth < 850;
	const scrclb = () => {
		const mobile = getmob();
		if (mobile) {
			const r = products_category_name.getBoundingClientRect();
			const visible = r.top > window.innerHeight;
			results_info_mobile.classList.toggle("visible", visible);
		}

		$(".searching_wrapper > .scroll_panel").classList.toggle("separate_scroll", !mobile);
	};
	window.addEventListener("scroll", scrclb);
	window.addEventListener("resize", scrclb);
	scrclb();

	const getTop = () => products_category_name.getBoundingClientRect().top - 100;
	const scrttop = () => {
		if (getmob()) {
			smoothScroll(getTop());
		}
	};
	results_info_mobile._child(".btn").addEventListener("click", scrttop);
	if (getmob()) {
		window.scrollBy(0, getTop());
	}

	products_all.classList.add("ready");
});
