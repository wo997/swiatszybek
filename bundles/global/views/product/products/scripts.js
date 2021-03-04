/* js[view] */

var currPage = 1;
var rowCount = 24;
var searchParams = {};
var searchingProducts = false;

/** @type {PiepNode} */
let product_list;

let filtersInitialState;
let filtersStateBeforeOpen;

domload(() => {
	$$(".product_features ul ul:not(.level_0)").forEach((ul) => {
		const checkbox_area = ul._prev();
		const checkbox = checkbox_area._child("p-checkbox");
		checkbox.addEventListener("change", () => {
			expand(ul, checkbox_area._get_value());
		});
		ul.classList.add("expand_y", "hidden", "animate_hidden");
	});

	$$(".product_features .option_checkbox").forEach((checkbox) => {
		checkbox.addEventListener("change", () => {
			searchProducts();
		});
	});

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

	product_list = $(".product_list");

	searchProducts();
});

function getSelectedOptionsData() {
	/**
	 * @type {{
	 * options: {
	 *  option_id: number
	 *  name: string
	 * }[]
	 * full_names: string[]
	 * }}
	 */
	let data = { options: [], full_names: [] };
	$$(".product_features .option_checkbox.checked").forEach((e) => {
		const checkbox_area = e._parent(".checkbox_area");
		const expand_y = checkbox_area._next(".expand_y");
		const name = checkbox_area._child(".feature_option_label").innerText;
		data.full_names.push(name);
		if (expand_y && expand_y._children(".option_checkbox.checked").length !== 0) {
			return;
		}
		data.options.push({ option_id: +e.dataset.option_id, name });
	});
	return data;
}

function searchProducts() {
	if (searchingProducts) {
		setTimeout(() => {
			searchingProducts = false;
		}, 300);
		delay("searchProducts", 300);
		return;
	}

	searchingProducts = true;

	const datatable_params = {};
	//datatable_params.order = data.sort.key + " " + data.sort.order.toUpperCase();
	datatable_params.filters = [];
	datatable_params.row_count = 64;
	datatable_params.page_id = 0;
	datatable_params.quick_search = 0;

	const options_data = getSelectedOptionsData();
	const options = options_data.options;

	let url = "/produkty";
	url += "/" + product_category_id;
	url += "/" + escapeUrl(product_category_full_name.replace(/\//g, " "));
	const option_ids = options.map((e) => e.option_id);
	//const options_names = options.map((e) => e.name);
	if (options.length > 0) {
		url += "/" + option_ids.join("~");
		//url += "/" + escapeUrl(options_names.join(" "));
	}

	let full_name = product_category_full_name + " " + options_data.full_names.join(" ");

	// it does not work lol
	history.pushState(undefined, full_name, url);
	// workaround here
	document.title = full_name;

	xhr({
		url: "/product/search",
		params: {
			datatable_params,
			product_category_id,
			option_ids,
		},
		success: (res) => {
			product_list._set_content(res.html);
			lazyLoadImages();
		},
	});
}

// function scrollToTopOfProductList() {
// 	setTimeout(() => {}, 0);
// }

// function beforeSearchProducts() {
// 	var randomize_btn = $(".randomize_btn");
// 	if (randomize_btn) {
// 		randomize_btn.classList.add("randomize");
// 	}

// 	setTimeout(() => {
// 		searchProducts({
// 			force_search: true,
// 		});
// 	}, 500);
// }
