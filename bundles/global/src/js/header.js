/* js[global] */

// domload(() => {
// 	$$("nav > div").forEach((e) => {
// 		e.addEventListener("mouseenter", () => {
// 			var x = e._child(".float-category");
// 			if (!x || !x.textContent) return;
// 			var rect = e.getBoundingClientRect();

// 			if (floatCategoryHovered && floatCategoryHovered != x) {
// 				hideFloatingCategory();
// 			}
// 			dropdownButtonHovered = e;
// 			floatCategoryHovered = x;

// 			dropdownButtonHovered.classList.add("hovered");
// 			floatCategoryHovered.style.display = "block";
// 			floatCategoryHovered.style.left = rect.left + "px";
// 			floatCategoryHovered.style.top = rect.top + rect.height - 1 + "px";
// 			floatCategoryHovered.style.minWidth = rect.width + "px";
// 			setTimeout(() => {
// 				if (floatCategoryHovered) {
// 					floatCategoryHovered.classList.add("visible");
// 				}
// 			});
// 		});
// 	});
// });

// function hideFloatingCategory() {
// 	if (!floatCategoryHovered) {
// 		return;
// 	}
// 	floatCategoryHovered.classList.remove("visible");
// 	dropdownButtonHovered.classList.remove("hovered");

// 	let zzz = floatCategoryHovered;
// 	setTimeout(() => {
// 		zzz.style.display = "";
// 	}, 150);

// 	dropdownButtonHovered = undefined;
// 	floatCategoryHovered = undefined;
// }

// let dropdownButtonHovered;
// let floatCategoryHovered;
// document.addEventListener("mousemove", (event) => {
// 	if (!dropdownButtonHovered) return;
// 	if ($(event.target)._parent(dropdownButtonHovered)) return;
// 	hideFloatingCategory();
// });

function headerResizeCallback() {
	if (!main_header) {
		return;
	}
	main_header.classList.remove("menu_collapsed");
	main_header_nav.classList.remove("bottom");
	main_header_nav.classList.toggle("bottom", main_header.offsetHeight > 100);
	const menu_collapsed = IS_TOUCH_DEVICE || main_header_nav.offsetWidth > main_header.offsetWidth + 1;
	main_header.classList.toggle("menu_collapsed", menu_collapsed);
	main_header_height.style.height = main_header.offsetHeight + "px";

	if (menu_collapsed) {
		requestHeaderModals();
	}

	requestSearchModal();
}

/** @type {number} */
let main_scroll_top = document.documentElement.scrollTop;
let follow_scroll_top = main_scroll_top;
/** @type {PiepNode} */
let main_header;
/** @type {PiepNode} */
let main_header_buttons;
/** @type {PiepNode} */
let main_header_height;
/** @type {PiepNode} */
let main_header_nav;
domload(() => {
	main_header = $("header.main");
	if (!main_header) {
		return;
	}
	main_header_height = $(".header_height");
	main_header_buttons = main_header._child(".header_buttons");
	main_header_nav = main_header._child("nav");
	main_header.classList.toggle("collapsed", main_scroll_top > 100);
	headerResizeCallback();
	window.addEventListener("resize", headerResizeCallback);
});

windowload(() => {
	if (!main_header) {
		return;
	}
	headerResizeCallback();
	document.addEventListener("scroll", () => {
		const scroll_top = document.documentElement.scrollTop;
		follow_scroll_top = clamp(scroll_top - main_header.offsetHeight, follow_scroll_top, scroll_top);
		main_header.style.transform = `translateY(${follow_scroll_top - scroll_top}px)`;

		main_scroll_top = document.documentElement.scrollTop;
	});
});

let requested_search_modal = false;
function requestSearchModal() {
	const msb = $(".mobile_search_btn");
	if (requested_search_modal || !msb.offsetTop) return;
	requested_search_modal = true;

	msb.addEventListener("click", () => {
		showModal("mainSearch", {
			source: msb,
		});
		$("#mainSearch input").focus();
	});

	registerModalContent(html`
		<div id="mainSearch" data-expand>
			<div class="modal_body" style="max-width: 500px;">
				<button class="close_modal_btn"><i class="fas fa-times"></i></button>
				<h3 class="modal_header"><img class="search_icon" src="/src/img/search_icon.svg" /> Wyszukiwarka</h3>
				<div class="scroll_panel scroll_shadow panel_padding">
					<div></div>
				</div>
			</div>
		</div>
	`);

	const sc = $("#mainSearch .scroll_panel > div");
	const sw = $("header .main_search_wrapper");
	sc.insertAdjacentHTML("afterbegin", sw.outerHTML);
}

let requested_header_modals = false;
function requestHeaderModals() {
	if (requested_header_modals) return;
	requested_header_modals = true;

	//user
	if (IS_LOGGED) {
		registerModalContent(html`
			<div id="userMenu" data-expand>
				<div class="modal_body" style="max-width: 500px;">
					<button class="close_modal_btn"><i class="fas fa-times"></i></button>
					<h3 class="modal_header"><img class="user_icon" src="/src/img/user_icon.svg" /> Moje konto</h3>
					<div class="scroll_panel scroll_shadow">
						<div></div>
					</div>
				</div>
			</div>
		`);
		$("#userMenu .scroll_panel > div").insertAdjacentHTML("afterbegin", $("header .user_menu").outerHTML);

		const hua = $("header .user_btn");
		hua.addEventListener("click", (ev) => {
			showModal("userMenu", { source: hua });
			ev.preventDefault();
			return false;
		});
	}

	//basket
	registerModalContent(html`
		<div id="basketMenu" data-expand>
			<div class="modal_body">
				<button class="close_modal_btn"><i class="fas fa-times"></i></button>
				<h3 class="modal_header" style="max-width: 500px;">
					<div class="basket_icon_wrapper">
						<img class="basket_icon" src="/src/img/basket_icon.svg" />
						<div class="basket_item_count"></div>
					</div>
					Koszyk
				</h3>
				<div class="scroll_panel scroll_shadow panel_padding">
					<div></div>
				</div>
				<div style="display:flex;padding:0 5px 5px" class="basket_menu_mobile_summary footer"></div>
			</div>
		</div>
	`);

	const su = $("header .nav_basket_summary");
	$("#basketMenu .basket_menu_mobile_summary").insertAdjacentHTML("afterbegin", su.outerHTML);

	const hc = $("header .header_basket_content_wrapper");
	$("#basketMenu .scroll_panel > div").appendChild(hc);

	basketReady();

	const bbtn = $("header .basket_wrapper .basket-btn");
	if (bbtn) {
		bbtn.addEventListener("click", (ev) => {
			showModal("basketMenu", { source: bbtn });
			ev.preventDefault();
			return false;
		});
	}

	//menu
	registerModalContent(html`
		<div id="mainMenu" data-expand>
			<div class="modal_body" style="max-width: 500px;">
				<button class="close_modal_btn"><i class="fas fa-times"></i></button>
				<h3 class="modal_header"><img class="menu_icon" src="/src/img/menu_icon.svg" /> Menu</h3>
				<div class="scroll_panel scroll_shadow">
					<div></div>
				</div>
			</div>
		</div>
	`);

	const mm = $("#mainMenu .scroll_panel > div");
	mm.insertAdjacentHTML("afterbegin", main_header_nav.outerHTML);
	mm._child("nav").insertAdjacentHTML(
		"beforeend",
		html`
			<div>
				<a onclick="showModal('lastViewedProducts',{source:this});return false;">
					<img class="product-history-icon" src="/src/img/product_history_icon.svg" /> Ostatnio przeglądane produkty
				</a>
			</div>
			<div>
				<a onclick="showModal('wishList',{source:this});return false;">
					<img class="heart_icon" src="/src/img/heart_icon.svg" /> Schowek
				</a>
			</div>
		`
	);

	// last viewed products
	registerModalContent(html`
		<div id="lastViewedProducts" data-expand="previous">
			<div class="modal_body">
				<button class="close_modal_btn"><i class="fas fa-times"></i></button>
				<h3 class="modal_header">
					<img class="product-history-icon" src="/src/img/product_history_icon.svg" />
					Ostatnio przeglądane
				</h3>
				<div class="scroll_panel scroll_shadow panel_padding">
					<div></div>
				</div>
				<div style="display:flex;padding:0 5px 5px" class="basket_menu_mobile_summary footer"></div>
			</div>
		</div>
	`);

	const lvps = $("#lastViewedProducts .scroll_panel > div");
	lvps.insertAdjacentHTML("beforeend", $(".last_viewed_products").outerHTML);

	// wishlist
	registerModalContent(html`
      <div id="wishList" data-expand="previous">
        <div class="modal_body">
            <button class="close_modal_btn"><i class="fas fa-times"></i></button>
            <h3 class="modal_header">
              <img class="heart_icon" src="/src/img/heart_icon.svg"></img>
              Schowek  
            </h3>
            <div class="scroll_panel scroll_shadow panel_padding">
              <div></div>
            </div>
            <div style='display:flex;padding:0 5px 5px' class='basket_menu_mobile_summary footer'></div>
        </div>
    </div>
  `);
}

// perform search

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
		main_search_wrapper.classList.toggle("active", $(event.target) ? !!$(event.target)._parent(".main_search_wrapper") : false);
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
		const select = null;

		if (event.key == "Enter") {
			if (selected) {
				selected.click();
				event.preventDefault();
				return false;
			} else if ($(".main_search_wrapper input").value.trim()) {
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

function topSearchProducts(force) {
	const search = $(".main_search_wrapper input")._get_value().trim();

	const callback = (content) => {
		$(".main_search_wrapper .search-results")._set_content(content);
	};

	if (search.length === 0 && !force) {
		return callback("");
	}

	if (search.length < 3) {
		return callback(force ? `<i class='result' style='pointer-events:none'> Wpisz mininum 3 znaki...</i>` : "");
	}

	const searchParams = JSON.stringify({
		search: search,
		basic: true,
	});

	xhr({
		url: "/search_products",
		params: {
			product_filters: searchParams,
			rowCount: 10,
			pageNumber: 0,
		},
		success: (res) => {
			if (!res.content) {
				res.content = html`<div class="result no-results" style="pointer-events:none"><i class="fas fa-ban"></i> Brak wyników</div>`;
			}
			callback(res.content);
		},
	});
}

domload(() => {
	$$(
		`header .scroll_panel,
        header .user-menu,
        header .headerbtn_menu`
	).forEach((e) => {
		e.addEventListener("mousewheel", (event) => {
			// @ts-ignore
			if ((event.deltaY < 0 && e.scrollTop < 1) || (event.deltaY > 0 && e.scrollTop > e.scrollHeight - e.offsetHeight - 1)) {
				event.preventDefault();
			} else {
				event.stopPropagation();
			}
		});
	});
});

function goToSearchProducts() {
	localStorage.setItem("products_search", $(".main_search_wrapper input")._get_value());
	window.location.href = "/produkty/wszystkie";
}

window.addEventListener("basket-change", (event) => {
	// @ts-ignore
	const res = event.detail.res;
	showVariantChanges(res, $(`.header_basket_content`), header_basket_variant_template, basket_data.basket);
});

domload(() => {
	showProductChanges(
		{
			changes: {
				added: last_viewed_products_ids,
				removed: [],
			},
			options: { instant: true },
		},
		$(`.last_viewed_products`),
		header_basket_product_template,
		last_viewed_products
	);

	const toggle = (node, visible) => {
		const empty = last_viewed_products.length === 0;

		let show = !empty;
		if (!visible) {
			show = !show;
		}

		if (node.classList.contains("expand_y")) {
			expand(node, show, { duration: 0 });
		} else {
			node.classList.toggle("hidden", !show);
		}
	};

	$$(".case_last_viewed_products_not_empty").forEach((e) => {
		toggle(e, true);
	});
	$$(".case_last_viewed_products_empty").forEach((e) => {
		toggle(e, false);
	});
});

const header_basket_variant_template = html`
	<div class="expand_y">
		<div class="product_row product-block">
			<a class="product_link">
				<img class="product-image variant_image" data-height="1w" />
				<h3 class="product-title"><span class="check-tooltip variant_full_name"></span></h3>
			</a>
			<div style="text-align:center">
				<div class="qty-control glue_children">
					<button class="btn subtle qty-btn remove" onclick="addVariantToBasket(this,-1)">
						<i class="fas fa-minus"></i>
					</button>
					<span class="qty-label"></span>
					<button class="btn subtle qty-btn add" onclick="addVariantToBasket(this,1)">
						<i class="fas fa-plus"></i>
					</button>
				</div>
				<span class="product-price pln variant_total_price"></span>
			</div>
			<button class="cl cl6 fas remove-product-btn" onclick="addVariantToBasket(this,-100000);return false;">
				<i class="fas fa-times"></i>
			</button>
		</div>
	</div>
`;

const header_basket_product_template = html`
	<div class="expand_y">
		<div class="product_row product-block">
			<a class="product_link">
				<img class="product-image product_image" data-height="1w" />
				<h3 class="product-title"><span class="check-tooltip product_name"></span></h3>
			</a>
			<div style="text-align:center">
				<span class="product-price pln product_price"></span>
			</div>
		</div>
	</div>
`;
