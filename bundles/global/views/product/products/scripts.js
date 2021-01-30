/* js[view] */

var currPage = 1;
var rowCount = 24;
var searchParams = {};
var searchingProducts = false;

/** @var {PiepNode} */
let productListNode;
/** @var {PiepNode} */
let productListAnimationNode;
/** @var {PiepNode} */
let productListSwapNode;
/** @var {PiepNode} */
let productListSwapContentNode;
/** @var {PiepNode} */
let productListSwapBackgroundNode;
/** @var {PiepNode} */
let paginationNode;

let filtersInitialState;
let filtersStateBeforeOpen;

domload(() => {
	var e = $(".category_name.current");
	if (e) {
		expandCategoriesAbove(e);
	}

	productListNode = $(".product_list-container");
	productListAnimationNode = $(".product_list-animation-wrapper");
	productListSwapNode = $(".product_list-container-swap");
	productListSwapContentNode = $(".product_list-container-swap-content");
	productListSwapBackgroundNode = $(".product_list-container-swap-background");
	paginationNode = $(".under-products .pagination");

	$$(".order_by_item input").forEach((e) => {
		e.addEventListener("change", () => {
			searchProducts();
		});
	});

	if (!$(".order_by_item input:checked")) {
		$(`.order_by_item input[value="sale"]`).checked = true;
	}

	filtersInitialState = getFormData(".filters");

	if (window.innerWidth < 800) {
		goMobile();
	} else {
		goDesktop();
	}

	let products_search = localStorage.getItem("products_search");
	if (products_search) {
		localStorage.removeItem("products_search");
		$(`.relevance_option`)._set_value(1, { quiet: true });
		$(".products_search")._set_value(products_search);
	} else {
		searchProducts({
			scroll: false,
		});
	}

	attributeSelectionChange(null, null);
});

var blockProductsSearch = false;

function goDesktop() {
	$(".products_search")._parent().classList.remove("glue-children");
	var products_search = $(".products_search");
	products_search.addEventListener("input", () => {
		// instant change
		products_search._set_value();
	});
}

function goMobile() {
	$$(".search-wrapper .search-header").forEach((e) => {
		e.remove();
	});

	registerModalContent(`
          <div id="searchCategory" data-expand>
              <div class="modal-body">
                  <button class="close-modal-btn"><img src="/src/img/cross.svg"></button>
                  <h3 class="modal-header">Kategorie</h3>
                  <div class="scroll-panel scroll-shadow">
                    <div></div>
                  </div>
              </div>
          </div>
      `);

	registerModalContent(`
          <div id="searchFilters" data-expand>
              <div class="modal-body">
                  <button class="close-modal-btn" onclick="restoreFilters();"><img src="/src/img/cross.svg"></button>
                  <h3 class="modal-header"><div>Filtry <span class="filter_count"></span></div></h3>
                  <div class="scroll-panel scroll-shadow panel-padding">
                    <div></div>
                  </div>
                  <div class='footer' style='display:flex;padding:5px'>
                    <button class="btn secondary fill" onclick="clearAllFilters()">
                      Wyczyść filtry
                      <i class="fas fa-times"></i>
                    </button>
                    <button class="btn primary fill" style='margin-left:5px' onclick="hideParentModal(this);afterFiltersSelected()">
                      Pokaż wyniki
                    <i class="fas fa-chevron-right"></i>
                    </button>
                  </div>
              </div>
          </div>
      `);

	$(`#searchCategory .modal-body .scroll-panel > div`).appendChild(
		$(".search-wrapper .categories")
	);

	var filters = $(".search-wrapper .filters");

	if (!filters._child("*")) {
		$(`.search-filters-btn`).style.display = "none";
	} else {
		$(`#searchFilters .modal-body .scroll-panel > div`).appendChild(filters);
	}

	// sorting horizontal
	var scroll_wrapper = $(".sorting-wrapper");
	scroll_wrapper.classList.add("scroll-panel");
	scroll_wrapper.classList.add("scroll-shadow");
	scroll_wrapper.classList.add("horizontal");
	scroll_wrapper.classList.add("light");

	scroll_wrapper.insertAdjacentHTML(
		"afterend",
		"<div class='horizontal-scroll-wrapper'></div>"
	);
	var container = scroll_wrapper._next();
	container.appendChild(scroll_wrapper);

	registerScrollShadows();

	var products_search = $(".products_search");
	products_search.addEventListener("input", () => {
		// give user a hint
		setMobileSearchBtnOpacity($(".products_search"));
	});
}

function beforeFiltersShown() {
	blockProductsSearch = true;
	filtersStateBeforeOpen = getFormData(".filters");
}

function restoreFilters() {
	setFormData(filtersStateBeforeOpen, ".filters");
}

function afterFiltersSelected() {
	blockProductsSearch = false;
	searchProducts();
	// just in case filters are the same
	scrollToTopOfProductList();
}

function clearAllFilters() {
	setFormData(filtersInitialState, ".filters");
	searchingProducts = false;
	searchProducts();
}

function clearSearch() {
	$(".products_search")._set_value("");
	searchProducts();
}

var firstSearch = true;

function searchProducts(options = {}) {
	if (blockProductsSearch) {
		return;
	}

	if (searchingProducts) {
		setTimeout(() => {
			searchingProducts = false;
		}, 300);
		delay("searchProducts", 300);
		return;
	}

	searchingProducts = true;
	var attribute_value_ids = [];
	$$(".combo-select-wrapper[data-attribute_id]").forEach((list) => {
		var attribute_value_sub_ids = [];
		list._children(":checked").forEach((checkbox) => {
			var subCheckboxes = checkbox
				._parent(".attributes-list-wrapper")
				._child(".attribute-list");
			var anySubChecked = subCheckboxes
				? subCheckboxes._child(":checked")
				: false;
			if (!anySubChecked) {
				attribute_value_sub_ids.push(checkbox._get_value());
			}
		});
		if (attribute_value_sub_ids.length > 0) {
			attribute_value_ids.push(attribute_value_sub_ids);
		}
	});

	var newSearchParams = {
		attribute_value_ids: attribute_value_ids,
		category_ids: [CATEGORY_ID],
		search: $(".products_search")._get_value(),
		order_by: $(`[name="order_by"]:checked`)._get_value(),
		price_min: $(`.price_min_search`)._get_value(),
		price_max: $(`.price_max_search`)._get_value(),
		layout: "grid",
	};

	setMobileSearchBtnOpacity($(".products_search"));

	if (JSON.stringify(newSearchParams) != JSON.stringify(searchParams)) {
		currPage = 0;
		searchParams = newSearchParams;
	} else if (!options.force_search) {
		return;
	}

	if (window.innerWidth < MOBILE_WIDTH && def(options.scroll, true)) {
		scrollToTopOfProductList();
	}

	xhr({
		url: "/search_products",
		params: {
			product_filters: JSON.stringify(searchParams),
			rowCount: rowCount,
			pageNumber: currPage,
		},
		success: (res) => {
			if (res.totalRows == 0) {
				var caseFilters =
					searchParams.attribute_value_ids.length > 0 ||
					searchParams.search !== ""
						? `<button class='btn subtle' onclick="clearSearch();clearAllFilters();"><i class="fas fa-times"></i> Wyczyść filtry</button>`
						: "Wyszukaj inną kategorię";
				res.content = `
              <div style='font-size:22px;padding: 60px 10px;text-align:center;font-weight:600'>
                <span style='color: var(--error-clr);'><i class="fas fa-exclamation-circle"></i> Brak produktów!</span>
                <div style='font-size:0.8em;margin:0.7em'>${caseFilters}</div>
              </div>
              `;
			} else {
				res.content = `<div style='height:50px'></div>${res.content}<div style='height:50px'></div>`;
			}

			$(".price_range_info")._set_content(
				res.price_info.min && res.price_info.max
					? `(${res.price_info.min} zł - ${res.price_info.max} zł)`
					: ""
			);

			var duration = firstSearch ? 0 : 300;
			firstSearch = false;
			var was_h = productListAnimationNode.getBoundingClientRect().height;
			productListSwapContentNode._set_content(res.content);
			setProductListGridDimensions(
				productListSwapContentNode._child(".product_list_module.grid")
			);

			lazyLoadImages(false);

			var h = productListSwapContentNode.getBoundingClientRect().height;

			productListAnimationNode._animate(
				`
                    0% {
                        height: ${Math.round(was_h)}px;
                    }
                    100% {
                        height: ${Math.round(h)}px;
                    }
                `,
				duration
			);

			productListSwapBackgroundNode.style.visibility = "";
			productListSwapNode._animate(
				`
                    0% {
                        opacity: 0;
                    }
                    100% {
                        opacity: 1;
                    }
                `,
				duration,
				{
					callback: () => {
						productListSwapBackgroundNode.style.visibility = "hidden";
						searchingProducts = false;
						productListNode._set_content(productListSwapNode.innerHTML);
						productListSwapContentNode._empty();
						tooltip.resizeCallback();
						productListLoaded();

						lazyLoadImages(false);
					},
				}
			);

			if ($(".order_by_item input[value='random']:checked")) {
				if (res.totalRows > 0) {
					paginationNode._set_content(`
              <button class='btn primary medium randomize_btn' onclick='beforeSearchProducts()'><span class='randomize_text'>Losuj więcej</span> <span class='randomize_loader_wrapper'><i class='randomize_loader fas fa-dice-three'></i></span></button>
            `);
				} else {
					paginationNode._empty();
				}
			} else {
				renderPagination(paginationNode, currPage, res.pageCount, (i) => {
					currPage = i;
					scrollToTopOfProductList();
					searchProducts({
						force_search: true,
					});
				});
			}

			$$(".filters_description").forEach((e) => {
				e._animate(ANIMATIONS.blink, duration);
				setTimeout(() => {
					var out = [];
					if (searchParams.search) {
						out.push(
							`Wyszukaj: <span style='font-weight:600'>${searchParams.search}</span>`
						);
					}
					if (searchParams.price_min && searchParams.price_max) {
						out.push(
							`Cena: <span class='pln'>${searchParams.price_min} - ${searchParams.price_max} zł</span>`
						);
					} else if (searchParams.price_min) {
						out.push(
							`Cena: <span class='pln'>od ${searchParams.price_min} zł</span>`
						);
					} else if (searchParams.price_max) {
						out.push(
							`Cena: <span class='pln'>do ${searchParams.price_max} zł</span>`
						);
					}

					out.push(
						`Sortuj: <span style='font-weight:600'>${
							$(`[value="${searchParams.order_by}"]`)._next().textContent
						}</span>`
					);
					e.innerHTML = out.join(", ");
				}, duration / 2);
			});
		},
	});
}

function scrollToTopOfProductList() {
	setTimeout(() => {
		// scrollIntoView(elem)
		// depcrecated!
		// scrollToElement($(".hook_view"), {
		// 	top: true,
		// 	offset: window.innerWidth < MOBILE_WIDTH ? 200 : 300,
		// 	sag: window.innerWidth < MOBILE_WIDTH ? 0 : 100,
		// 	duration: 30,
		// });
	}, 0);
}

function beforeSearchProducts() {
	var randomize_btn = $(".randomize_btn");
	if (randomize_btn) {
		randomize_btn.classList.add("randomize");
	}

	setTimeout(() => {
		searchProducts({
			force_search: true,
		});
	}, 500);
}

function attributeSelectionChange(checkbox, hasChildren) {
	if (checkbox && hasChildren) {
		var list = checkbox._parent()._next();
		if (!checkbox.checked) {
			list._children(":checked").forEach((subCheckbox) => {
				subCheckbox._set_value(0);
			});
		}
		expand(list, checkbox.checked);
	}

	filterChange(true);
}

function filterChange(instant = false) {
	var filter_count = $$(".filters input[type='checkbox']:checked").length;

	if ($(".price_min_search")._get_value()) {
		filter_count++;
	}
	if ($(".price_max_search")._get_value()) {
		filter_count++;
	}

	$$(".filter_count").forEach((e) => {
		e.innerHTML = filter_count ? `(${filter_count})` : "";
	});

	$$(".case_any_filters").forEach((e) => {
		e.style.display = filter_count ? "" : "none";
	});

	anySearchChange(instant);
}

function productsSearchChange(input, instant = false) {
	input = $(input);

	var value = input._get_value();
	var filled = value !== "";
	$$(".case_search").forEach((e) => {
		e.style.display = filled ? "" : "none";
	});
	$$(".case_no_search").forEach((e) => {
		e.style.display = !filled ? "" : "none";
	});

	if (searchParams.search === "" && value !== "") {
		$(`.order_by_item .relevance_option`)._set_value(1, { quiet: true });
	}

	if (!filled && $(".relevance_option:checked")) {
		$(`.sale_option`)._set_value(1, { quiet: true });
	}

	if (filled && $(".random_option:checked")) {
		$(`.sale_option`)._set_value(1, { quiet: true });
	}

	anySearchChange(instant);
}

function setMobileSearchBtnOpacity(input) {
	input._parent()._child(".search-btn").style.opacity =
		input._get_value() !== searchParams.search ? 1 : 0;
}

function anySearchChange(instant = false) {
	if (instant) {
		searchProducts();
	} else {
		delay("searchProducts", 500);
	}
}