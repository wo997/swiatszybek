/* js[global] */

if (window.innerWidth >= 1200) {
	domload(() => {
		$$("nav > div").forEach((e) => {
			e.addEventListener("mouseenter", () => {
				var x = e._child(".float-category");
				if (!x || !x.textContent) return;
				var rect = e.getBoundingClientRect();

				if (floatCategoryHovered && floatCategoryHovered != x) {
					hideFloatingCategory();
				}
				dropdownButtonHovered = e;
				floatCategoryHovered = x;

				dropdownButtonHovered.classList.add("hovered");
				floatCategoryHovered.style.display = "block";
				floatCategoryHovered.style.left = rect.left + "px";
				floatCategoryHovered.style.top = rect.top + rect.height - 1 + "px";
				floatCategoryHovered.style.minWidth = rect.width + "px";
				setTimeout(() => {
					if (floatCategoryHovered) {
						floatCategoryHovered.classList.add("visible");
					}
				});
			});
		});
	});

	function hideFloatingCategory() {
		if (!floatCategoryHovered) {
			return;
		}
		floatCategoryHovered.classList.remove("visible");
		dropdownButtonHovered.classList.remove("hovered");

		let zzz = floatCategoryHovered;
		setTimeout(() => {
			zzz.style.display = "";
		}, 150);

		dropdownButtonHovered = null;
		floatCategoryHovered = null;
	}

	var dropdownButtonHovered = null;
	var floatCategoryHovered = null;
	document.addEventListener("mousemove", (event) => {
		if (!dropdownButtonHovered) return;
		if ($(event.target)._parent(dropdownButtonHovered)) return;
		hideFloatingCategory();
	});
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
	main_header_height = $(".header_height");
	main_header_buttons = main_header._child(".header_buttons");
	main_header_nav = main_header._child("nav");
	main_header.classList.toggle("collapsed", main_scroll_top > 100);
	headerResizeCallback();
});

window.addEventListener("load", () => {
	document.addEventListener("scroll", () => {
		const scroll_top = document.documentElement.scrollTop;
		follow_scroll_top = clamp(scroll_top - main_header.offsetHeight, follow_scroll_top, scroll_top);
		main_header.style.transform = `translateY(${follow_scroll_top - scroll_top}px)`;

		main_scroll_top = document.documentElement.scrollTop;
	});

	headerResizeCallback();
});

window.addEventListener("resize", headerResizeCallback);

function headerResizeCallback() {
	main_header.classList.remove("menu_collapsed");
	main_header_nav.classList.remove("bottom");
	main_header_nav.classList.toggle("bottom", main_header.offsetHeight > 100);
	main_header.classList.toggle("menu_collapsed", IS_TOUCH_DEVICE || main_header_nav.offsetWidth > main_header.offsetWidth + 1);
	main_header_height.style.height = main_header.offsetHeight + "px";
}

domload(() => {
	if (window.innerWidth >= MOBILE_WIDTH) {
		var btn = $("header .basket-wrapper .basket-btn");
		if (btn) {
			btn.addEventListener("click", () => {
				$(".gotobuy").click();
			});
		}
		basketReady();
		return;
	}

	//search
	registerModalContent(html`
		<div id="mainSearch" data-expand>
			<div class="modal-body">
				<button class="close-modal-btn"><i class="fas fa-times"></i></button>
				<h3 class="modal-header"><img class="search_icon" src="/src/img/search_icon.svg" /> Wyszukiwarka</h3>
				<div class="scroll-panel scroll-shadow panel-padding">
					<div></div>
				</div>
			</div>
		</div>
	`);

	const sc = $("#mainSearch .scroll-panel > div");
	const sw = $("header .main_search_wrapper");
	if (sc && sw) {
		sc.insertAdjacentHTML("afterbegin", sw.outerHTML);
	}

	//user
	var um = $("header .user-menu");
	if (um) {
		registerModalContent(html`
			<div id="userMenu" data-expand class="userMenu">
				<div class="modal-body">
					<button class="close-modal-btn"><i class="fas fa-times"></i></button>
					<h3 class="modal-header"><img class="user_icon" src="/src/img/user_icon.svg" /> Moje konto</h3>
					<div class="scroll-panel scroll-shadow">
						<div></div>
					</div>
				</div>
			</div>
		`);

		$("#userMenu .scroll-panel > div").appendChild(um);
	}

	//$("#loginForm").setAttribute("data-expand", "");

	var hua = $("header .user-wrapper a");
	if (hua) {
		hua.addEventListener("click", function (event) {
			showModal("userMenu", { source: this });
			event.preventDefault();
			return false;
		});
	}

	//basket
	registerModalContent(html`
		<div id="basketMenu" class="basketMenu" data-expand>
			<div class="modal-body">
				<button class="close-modal-btn"><i class="fas fa-times"></i></button>
				<h3 class="modal-header">
					<div class="basket-icon-wrapper">
						<img class="basket-icon" src="/src/img/basket_icon.svg" />
						<div class="basket_item_count"></div>
					</div>
					Koszyk
				</h3>
				<div class="scroll-panel scroll-shadow panel-padding">
					<div></div>
				</div>
				<div style="display:flex;padding:0 5px 5px" class="basket_menu_mobile_summary footer"></div>
			</div>
		</div>
	`);

	/*var hc = $("header .header_basket_content");
  if (hc) {
    $("#basketMenu .scroll-panel").appendChild(hc);
  }*/

	const su = $("header .nav_basket_summary");
	if (su) {
		$("#basketMenu .basket_menu_mobile_summary").insertAdjacentHTML("afterbegin", su.outerHTML);
	}

	const hc = $("header .header_basket_content_wrapper");
	if (hc) {
		$("#basketMenu .scroll-panel > div").appendChild(hc);
	}

	basketReady();

	const bbtn = $("header .basket-wrapper .basket-btn");
	if (bbtn) {
		bbtn.addEventListener("click", (ev) => {
			showModal("basketMenu", { source: bbtn });
			ev.preventDefault();
			return false;
		});
	}

	//menu
	registerModalContent(html`
		<div id="mainMenu" class="mainMenu" data-expand>
			<div class="modal-body">
				<button class="close-modal-btn"><i class="fas fa-times"></i></button>
				<h3 class="modal-header"><img class="menu_icon" src="/src/img/menu_icon.svg" /> Menu</h3>
				<div class="scroll-panel scroll-shadow">
					<div></div>
				</div>
			</div>
		</div>
	`);

	var mm = $("#mainMenu .scroll-panel > div");
	var nvg = $(".navigation");

	if (mm && nvg) {
		nvg.insertAdjacentHTML(
			"beforeend",
			html`
        <div>
          <a onclick="showModal('lastViewedProducts',{source:this});return false;">
            <img class="product-history-icon" src="/src/img/product_history_icon.svg"> Ostatnio przeglądane produkty
          </a>
        </div>
        <div>
          <a onclick="showModal('wishList',{source:this});return false;">
            <img class="heart_icon" src="/src/img/heart_icon.svg"></img> Schowek
          </a>
        </div>
      `
		);
		mm.appendChild(nvg);
	}

	// last viewed products
	registerModalContent(html`
		<div id="lastViewedProducts" class="lastViewedProducts" data-expand="previous">
			<div class="modal-body">
				<button class="close-modal-btn"><i class="fas fa-times"></i></button>
				<h3 class="modal-header">
					<img class="product-history-icon" src="/src/img/product_history_icon.svg" />
					Ostatnio przeglądane
				</h3>
				<div class="scroll-panel scroll-shadow panel-padding">
					<div></div>
				</div>
				<div style="display:flex;padding:0 5px 5px" class="basket_menu_mobile_summary footer"></div>
			</div>
		</div>
	`);

	var lvps = $("#lastViewedProducts .scroll-panel > div");
	var lvp = $(".last_viewed_products");

	if (lvps && lvp) {
		lvps.appendChild(lvp);
	}

	// wishlist
	registerModalContent(html`
      <div id="wishList" class="wishList" data-expand="previous">
        <div class="modal-body">
            <button class="close-modal-btn"><i class="fas fa-times"></i></button>
            <h3 class="modal-header">
              <img class="heart_icon" src="/src/img/heart_icon.svg"></img>
              Schowek  
            </h3>
            <div class="scroll-panel scroll-shadow panel-padding">
              <div></div>
            </div>
            <div style='display:flex;padding:0 5px 5px' class='basket_menu_mobile_summary footer'></div>
        </div>
    </div>
  `);

	// TODO: do this baby
	/*var wls = $("#wishList .scroll-panel > div");
  var wl = $(".wish_list");

  if (wls && wl) {
    wls.appendChild(wl);
  }*/

	document.body.insertAdjacentHTML("beforeend", `<style>.headerbtn_menu {display:none!important}</style>`);
});

// perform search

function searchAllProducts() {
	var search = $(".main_search_wrapper input").value.trim();

	if (search.length < 3) {
		topSearchProducts(true);
	} else {
		goToSearchProducts();
	}
}

domload(() => {
	var input = $(".main_search_wrapper input");
	if (!input) {
		return;
	}
	var main_search_wrapper = $(".main_search_wrapper");
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
		var down = event.key == "ArrowDown";
		var up = event.key == "ArrowUp";

		var selected = main_search_wrapper._child(".selected");
		var select = null;

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
	var search = $(".main_search_wrapper input").value.trim();

	var callback = (content) => {
		$(".main_search_wrapper .search-results")._set_content(content);
	};

	if (search.length === 0 && !force) {
		return callback("");
	}

	if (search.length < 3) {
		return callback(force ? `<i class='result' style='pointer-events:none'> Wpisz mininum 3 znaki...</i>` : "");
	}

	var searchParams = JSON.stringify({
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
		`header .scroll-panel,
        header .user-menu,
        header .headerbtn_menu`
	).forEach((e) => {
		e.addEventListener("mousewheel", (event) => {
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
	window.location = "/produkty/wszystkie";
}

window.addEventListener("basket-change", (event) => {
	var res = event.detail.res;
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

	var toggle = (node, visible) => {
		var empty = last_viewed_products.length === 0;

		var show = !empty;
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
