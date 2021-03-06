/* js[view] */

let currPage = 1;
let rowCount = 24;
/** @type {number[][]} */
let pp_selected_option_groups;
let product_list_ready = false;

/** @type {PiepNode} */
let product_list;
/** @type {PiepNode} */
let results_info_count;
/** @type {PaginationComp} */
let product_list_pagination_comp;
/** @type {XMLHttpRequest} */
let search_product_list_xhr;

domload(() => {
	product_list = $(".product_list");
	results_info_count = $(".results_info .count");

	// @ts-ignore
	product_list_pagination_comp = $(`pagination-comp.product_list_pagination`);
	paginationComp(product_list_pagination_comp, undefined);
	product_list_pagination_comp._data = {
		row_count: 1,
		total_rows: +results_info_count.innerText,
		page_id: 0,
		row_count_options: [1, 5, 25, 100],
	};
	product_list_pagination_comp._render();

	product_list_pagination_comp.addEventListener("change", () => {
		delay("mainSearchProducts");
	});

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

	$$(".product_categories ul:not(.level_0)").forEach((ul) => {
		const a = ul._prev();
		a.insertAdjacentHTML("afterend", `<button class="expand_btn btn transparent"><i class="fas fa-chevron-right"></button>`);
		ul.classList.add("expand_y", "hidden", "animate_hidden");
	});

	$(".product_categories").addEventListener("click", (ev) => {
		const target = $(ev.target);

		const expand_btn = target._parent(".expand_btn", { skip: 0 });
		if (expand_btn) {
			const open = expand_btn.classList.toggle("open");
			expand(expand_btn._next(), open);
			ev.preventDefault();
			return false;
		}
	});

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

	setCategoryFeaturesFromUrl();

	productsFetched();

	product_list_ready = true;
});

window.addEventListener("popstate", () => {
	setCategoryFeaturesFromUrl();
});

function setCategoryFeaturesFromUrl() {
	const url_params = new URLSearchParams(window.location.search);

	/** @type {string} */
	const v = def(url_params.get("v"), "");
	pp_selected_option_groups = v.split("-").map((/** @type {string} */ group) =>
		group
			.split("_")
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

	$$(".product_features > ul > li").forEach((feature) => {
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

let last_search_params;
function mainSearchProducts() {
	if (search_product_list_xhr) {
		search_product_list_xhr.abort();
	}

	const datatable_params = {};
	//datatable_params.order = data.sort.key + " " + data.sort.order.toUpperCase();
	datatable_params.filters = [];
	datatable_params.row_count = product_list_pagination_comp._data.row_count;
	datatable_params.page_id = product_list_pagination_comp._data.page_id;
	//datatable_params.quick_search = "";

	const options_data = getSelectedOptionsData();
	pp_selected_option_groups = options_data.map((e) => e.option_ids);

	const search_params = { datatable_params, product_category_id, option_id_groups: options_data.map((e) => e.option_ids) };

	if (isEquivalent(last_search_params, search_params)) {
		return;
	}

	const category_path_names = product_category_path.map((e) => e.name);
	let full_name = category_path_names.join(" | ");
	if (options_data.length > 0) {
		full_name += options_data
			.map((e) => e.all_names.join(" "))
			.flat(1)
			.map((e) => " | " + e)
			.join("");
	}

	let url = "/produkty";
	url += "/" + product_category_id;
	url += "/" + escapeUrl(category_path_names.join(" "));
	const url_params = new URLSearchParams();
	if (options_data.length > 0) {
		url_params.append("v", options_data.map((e) => e.option_ids.join("_")).join("-"));
	}

	if (datatable_params.page_id > 0) {
		url_params.append("str", datatable_params.page_id + 1 + "");
	}
	if (datatable_params.row_count !== 25) {
		url_params.append("ile", datatable_params.row_count + "");
	}

	const url_params_str = url_params.toString();
	if (url_params_str) {
		url += "?" + url_params_str;
	}

	// it does not work lol
	history.pushState(undefined, full_name, url);
	// workaround here
	document.title = full_name;

	search_product_list_xhr = xhr({
		url: "/product/search",
		params: search_params,
		success: productsFetched,
	});
}

function productsFetched(res = {}) {
	search_product_list_xhr = undefined;

	if (res.html !== undefined) {
		product_list._set_content(res.html);
	}
	if (res.total_rows !== undefined) {
		results_info_count._set_content(res.total_rows);
		product_list_pagination_comp._data.total_rows = res.total_rows;
		product_list_pagination_comp._render();
	}

	product_list._children(".product_img_wrapper").forEach((img_wrapper) => {
		const product_img = img_wrapper._child(".product_img");
		const images = JSON.parse(img_wrapper.dataset.images);
		images.forEach((img, index) => {
			let weight = -index;
			for (const option_id of pp_selected_option_groups.flat(2)) {
				if (img.option_ids.includes(option_id)) {
					weight += 100;
				}
			}
			img.weight = weight;
		});
		images.sort((a, b) => Math.sign(b.weight - a.weight));

		img_wrapper.dataset.images = JSON.stringify(images);
		if (images[0]) {
			setResponsiveImageUrl(product_img, images[0].img_url);
		}
		if (images[1]) {
			preloadWo997Image(images[1].img_url, product_img);
		}
	});

	lazyLoadImages();
}
