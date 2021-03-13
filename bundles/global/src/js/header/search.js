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
	document.addEventListener("mousedown", (event) => {
		const target = $(event.target);
		main_search_wrapper.classList.toggle("active", target ? !!target._parent(".main_search_wrapper") : false);
	});
	input.addEventListener("input", () => {
		delay("topSearchProducts", 400);
	});
	main_search_wrapper.addEventListener("mousemove", (event) => {
		if ($(event.target).classList.contains("result")) {
			main_search_wrapper._children(".selected").forEach((e) => {
				e.classList.remove("selected");
			});
			$(event.target).classList.add("selected");
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
					select = main_search_wrapper._child(".result");
				}
			} else if (up) {
				if (!select) {
					select = main_search_wrapper._child(".result:last-child");
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
		return callback(force ? html`<i class="result" style="pointer-events:none"> Wpisz mininum 3 znaki ...</i>` : "");
	}
	search_product_list_xhr = xhr({
		url: "/product/search",
		params: {
			url: getTopSearchUrl(),
		},
		success: (res) => {
			if (res.total_rows === 0) {
				callback(html`<div class="result no-results" style="pointer-events:none"><i class="fas fa-ban"></i> Brak wyników</div>`);
			} else {
				callback(res.html);
				setCustomHeights();
			}
		},
	});
}

function goToSearchProducts() {
	window.location.href = getTopSearchUrl();
}
