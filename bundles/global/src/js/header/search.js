/* js[global] */

function searchAllProducts() {
	const search = $(".main_search_wrapper input")._get_value().trim();

	if (search.length < 3) {
		topSearchProducts(true);
	} else {
		goToSearchProducts();
	}
}

domload(() => {
	const input = $(".main_search_wrapper input");
	if (!input) {
		return;
	}
	const main_search_wrapper = $(".main_search_wrapper");
	document.addEventListener("mousedown", (ev) => {
		const target = $(ev.target);
		main_search_wrapper.classList.toggle("active", target ? !!target._parent(".main_search_wrapper") : false);
	});
	input.addEventListener("input", () => {
		delay("topSearchProducts", 400);
	});
	main_search_wrapper.addEventListener("mousemove", (ev) => {
		const target = $(ev.target);
		const product_block = target._parent(".main_search_wrapper .product_block", { skip: 0 });
		if (product_block) {
			main_search_wrapper._children(".selected").forEach((e) => {
				e.classList.remove("selected");
			});
			product_block.classList.add("selected");
		}
	});

	input.addEventListener("keydown", (event) => {
		const down = event.key == "ArrowDown";
		const up = event.key == "ArrowUp";

		const selected = main_search_wrapper._child(".selected");
		let select = null;

		if (event.key == "Enter") {
			if (selected) {
				selected.click();
				event.preventDefault();
				return false;
			} else if ($(".main_search_wrapper input")._get_value().trim()) {
				goToSearchProducts();
			} else {
				topSearchProducts(true);
			}
		}

		if (event.key == "Escape") {
			$(".main_search_wrapper input").blur();
			main_search_wrapper.classList.remove("active");
		}

		if (!up && !down) {
			return;
		}

		/* prevent moving cursor sideways on up/down keys */
		event.preventDefault();

		if (selected) {
			if (down) {
				select = selected._next();
			} else if (up) {
				select = selected._prev();
			}
		}

		if (!selected) {
			if (down) {
				if (!select) {
					select = main_search_wrapper._child(".product_block");
				}
			} else if (up) {
				if (!select) {
					select = main_search_wrapper._child(".product_block:last-child");
				}
			}
		}

		main_search_wrapper._children(".selected").forEach((e) => {
			e.classList.remove("selected");
		});

		if (select && !select.classList.contains("no-results")) {
			select.classList.add("selected");
		}
	});

	document.addEventListener("click", (ev) => {
		const target = $(ev.target);
		const product_block = target._parent("header .search_results .product_block", { skip: 0 });
		if (product_block) {
			const a = product_block._child("a");
			if (a) {
				a.click();
			}
		}
	});
});

function getTopSearchUrl() {
	const search_phrase_val = $(".main_search_wrapper input")._get_value().trim();
	return `/produkty?znajdz=${encodeURIComponent(search_phrase_val)}&ile=10`;
}

function topSearchProducts(force) {
	const search_phrase_val = $(".main_search_wrapper input")._get_value().trim();

	const callback = (content) => {
		$(".main_search_wrapper .search_results")._set_content(content);
		$(".main_search_wrapper").classList.toggle("show_results", !!content);
	};

	if (search_phrase_val.length === 0 && !force) {
		return callback("");
	}

	if (search_phrase_val.length < 3) {
		return callback(html`<span class="product_block"> Wpisz mininum 3 znaki ...</span>`);
	}
	search_product_list_xhr = xhr({
		url: "/product/search",
		params: {
			url: getTopSearchUrl(),
		},
		success: (res) => {
			if (res.total_rows === 0) {
				callback(html`<div class="product_block no-results"><i class="fas fa-ban" style="margin:0 5px"></i> Brak wyników</div>`);
			} else {
				callback(res.html);
				lazyLoadImages({ duration: 0 });
			}
		},
	});
}

function goToSearchProducts() {
	window.location.href = getTopSearchUrl();
}
