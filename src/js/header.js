/* js[global] */

if (window.innerWidth >= 1200) {
  window.addEventListener("DOMContentLoaded", () => {
    $$("nav > div").forEach((e) => {
      e.addEventListener("mouseenter", () => {
        var x = e.find(".float-category");
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
    if (isInNode(event.target, dropdownButtonHovered)) return;
    hideFloatingCategory();
  });
}

window.addEventListener("DOMContentLoaded", () => {
  var top_nav = $(".navigation");
  if (!top_nav) {
    return;
  }

  var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  var collapsed = scrollTop > 100;
  top_nav.classList.toggle("collapsed", collapsed);
  setTimeout(() => {
    top_nav.style.transition = "all 0.5s";
  });

  headerResizeCallback();
});

window.addEventListener("load", () => {
  var top_nav = $(".navigation");
  if (!top_nav) {
    return;
  }

  document.addEventListener("scroll", () => {
    if (window.tempScrollTop) {
      return;
    }

    var bottomOfPage =
      window.innerHeight + window.scrollY >= document.body.offsetHeight;

    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var movingDown = scrollTop >= nonull(window.scrollTop, 0);
    var collapsed = (movingDown && scrollTop > 100) || bottomOfPage;
    top_nav.classList.toggle("collapsed", collapsed);

    window.scrollTop = scrollTop;
  });

  headerResizeCallback();
});

window.addEventListener("resize", headerResizeCallback);

function headerResizeCallback() {
  var header_height = $(".header-height");
  if (!header_height) {
    return;
  }

  header_height.style.marginBottom =
    $(".header-top").getBoundingClientRect().height +
    (window.innerWidth >= MOBILE_WIDTH
      ? $(".navigation").getBoundingClientRect().height
      : 0) +
    "px";
}

window.addEventListener("DOMContentLoaded", () => {
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
  registerModalContent(`
      <div id="mainSearch" data-expand>
          <div class="modal-body">
              <button class="fas fa-times close-modal-btn"></button>
              <h3 class="modal-header"><img class="search-icon" src="/src/img/search_icon.svg"> Wyszukiwarka</h3>
              <div class="scroll-panel scroll-shadow panel-padding">
                
              </div>
          </div>
      </div>
  `);

  var sc = $("#mainSearch .scroll-panel");
  var sw = $("header .main-search-wrapper");
  if (sc && sw) {
    sw.classList.remove("case-desktop"); // don't remove it from header.php pls
    sc.appendChild(sw);
  }

  //user
  var um = $("header .user-menu");
  if (um) {
    registerModalContent(`
      <div id="userMenu" data-expand>
          <div class="modal-body">
              <button class="fas fa-times close-modal-btn"></button>
              <h3 class="modal-header"><img class="user-icon" src="/src/img/user_icon.svg"> Moje konto</h3>
              <div class="scroll-panel scroll-shadow">
                
              </div>
          </div>
      </div>
    `);

    $("#userMenu .scroll-panel").appendChild(um);
  }

  $("#loginForm").setAttribute("data-expand", "");

  var hua = $("header .user-wrapper a");
  if (hua) {
    hua.addEventListener("click", function (event) {
      showModal("userMenu", { source: this });
      event.preventDefault();
      return false;
    });
  }

  //basket
  registerModalContent(`
    <div id="basketMenu" data-expand>
        <div class="modal-body">
            <button class="fas fa-times close-modal-btn"></button>
            <h3 class="modal-header">
              <div class="basket-icon-wrapper">
                <img class="basket-icon" src="/src/img/basket_icon.svg">
                <div class="basket_item_count"></div>
              </div>
              Koszyk  
            </h3>
            <div class="scroll-panel scroll-shadow panel-padding">
              
            </div>
            <div style='display:flex;padding:0 5px 5px' class='basket_menu_mobile_summary footer'></div>
        </div>
    </div>
  `);

  /*var hc = $("header .header_basket_content");
  if (hc) {
    $("#basketMenu .scroll-panel").appendChild(hc);
  }*/

  var sc = $("header .nav_basket_summary");
  if (sc) {
    $("#basketMenu .basket_menu_mobile_summary").appendChild(sc);
  }

  var hc = $("header .header_basket_content_wrapper");
  if (hc) {
    $("#basketMenu .scroll-panel").appendChild(hc);
  }

  basketReady();

  var btn = $("header .basket-wrapper .basket-btn");
  if (btn) {
    btn.addEventListener("click", function (event) {
      showModal("basketMenu", { source: this });
      event.preventDefault();
      return false;
    });
  }

  //menu
  registerModalContent(`
      <div id="mainMenu" data-expand>
          <div class="modal-body">
              <button class="fas fa-times close-modal-btn"></button>
              <h3 class="modal-header"><img class="menu-icon" src="/src/img/menu_icon.svg"> Menu</h3>
              <div class="scroll-panel scroll-shadow">
                
              </div>
          </div>
      </div>
  `);

  var mm = $("#mainMenu .scroll-panel");
  var nvg = $(".navigation");

  if (mm && nvg) {
    nvg.insertAdjacentHTML(
      "beforeend",
      `
        <div>
          <a onclick="showModal('lastViewedProducts',{source:this});return false;">
            <img class="product-history-icon" src="/src/img/product_history_icon.svg"> Ostatnio przeglądane produkty
          </a>
        </div>
        <div>
          <a onclick="showModal('wishList',{source:this});return false;">
            <img class="heart-icon" src="/src/img/heart_icon.svg"></img> Schowek
          </a>
        </div>
      `
    );
    mm.appendChild(nvg);
  }

  // last viewed products
  registerModalContent(`
      <div id="lastViewedProducts" data-expand="previous">
        <div class="modal-body">
            <button class="fas fa-times close-modal-btn"></button>
            <h3 class="modal-header">
              <img class="product-history-icon" src="/src/img/product_history_icon.svg">
              Ostatnio przeglądane  
            </h3>
            <div class="scroll-panel scroll-shadow panel-padding">
              
            </div>
            <div style='display:flex;padding:0 5px 5px' class='basket_menu_mobile_summary footer'></div>
        </div>
    </div>
  `);

  var lvps = $("#lastViewedProducts .scroll-panel");
  var lvp = $(".last_viewed_products");

  if (lvps && lvp) {
    lvps.appendChild(lvp);
  }

  // wishlist
  registerModalContent(`
      <div id="wishList" data-expand="previous">
        <div class="modal-body">
            <button class="fas fa-times close-modal-btn"></button>
            <h3 class="modal-header">
              <img class="heart-icon" src="/src/img/heart_icon.svg"></img>
              Schowek  
            </h3>
            <div class="scroll-panel scroll-shadow panel-padding">
              
            </div>
            <div style='display:flex;padding:0 5px 5px' class='basket_menu_mobile_summary footer'></div>
        </div>
    </div>
  `);

  // TODO: do this baby
  /*var wls = $("#wishList .scroll-panel");
  var wl = $(".wish_list");

  if (wls && wl) {
    wls.appendChild(wl);
  }*/

  document.body.insertAdjacentHTML(
    "beforeend",
    `<style>.headerbtn_hover_content {display:none!important}</style>`
  );
});

// perform search

function btnSearchProducts() {
  var search = $(".main-search-wrapper input").value.trim();

  if (search.length < 3) {
    topSearchProducts(true);
  } else {
    goToSearchProducts();
  }
}

window.addEventListener("DOMContentLoaded", () => {
  var input = $(".main-search-wrapper input");
  if (!input) {
    return;
  }
  var main_search_wrapper = $(".main-search-wrapper");
  document.addEventListener("mousedown", (event) => {
    main_search_wrapper.classList.toggle(
      "active",
      $(event.target).findParentByClassName("main-search-wrapper")
    );
  });
  input.addEventListener("input", () => {
    delay("topSearchProducts", 400);
  });
  main_search_wrapper.addEventListener("mousemove", (event) => {
    if (event.target.classList.contains("result")) {
      main_search_wrapper.findAll(".selected").forEach((e) => {
        e.classList.remove("selected");
      });
      event.target.classList.add("selected");
    }
  });

  input.addEventListener("keydown", (event) => {
    var down = event.key == "ArrowDown";
    var up = event.key == "ArrowUp";

    var selected = main_search_wrapper.find(".selected");
    var select = null;

    if (event.key == "Enter") {
      if (selected) {
        selected.click();
        event.preventDefault();
        return false;
      } else if ($(".main-search-wrapper input").value.trim()) {
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
        select = selected.next();
      } else if (up) {
        select = selected.prev();
      }
    }

    if (!selected) {
      if (down) {
        if (!select) {
          select = main_search_wrapper.find(".result");
        }
      } else if (up) {
        if (!select) {
          select = main_search_wrapper.find(".result:last-child");
        }
      }
    }

    main_search_wrapper.findAll(".selected").forEach((e) => {
      e.classList.remove("selected");
    });

    if (select && !select.classList.contains("no-results")) {
      select.classList.add("selected");
    }
  });
});

function topSearchProducts(force) {
  var search = $(".main-search-wrapper input").value.trim();

  var callback = (content) => {
    $(".main-search-wrapper .search-results").setContent(content);
  };

  if (search.length === 0 && !force) {
    return callback("");
  }

  if (search.length < 3) {
    return callback(
      force
        ? `<i class='result' style='pointer-events:none'> Wpisz mininum 3 znaki...</i>`
        : ""
    );
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
        res.content = `<div class='result no-results' style='pointer-events:none'><i class="fas fa-ban"></i> Brak wyników</div>`;
      }
      callback(res.content);
    },
  });
}

window.addEventListener("DOMContentLoaded", () => {
  var ss = $("header .header_basket_content_wrapper");
  if (!ss) {
    return;
  }
  ss.addEventListener("mousewheel", (event) => {
    var h = ss.getBoundingClientRect().height;
    var y = ss.scrollTop;

    if (
      (event.deltaY < 0 && y < 1) ||
      (event.deltaY > 0 && y > ss.scrollHeight - h - 1)
    ) {
      event.preventDefault();
    }
  });

  var uw = $("header .user-wrapper");
  if (!uw) {
    return;
  }
  uw.addEventListener("mousewheel", (event) => {
    event.preventDefault();
  });
});

function goToSearchProducts() {
  localStorage.setItem(
    "products_search",
    $(".main-search-wrapper input").getValue()
  );
  window.location = "/produkty/wszystkie";
}

window.addEventListener("basket-change", (event) => {
  var res = event.detail.res;
  showVariantChanges(
    res,
    $(`.header_basket_content`),
    header_basket_variant_template,
    basket_data.basket
  );
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

const header_basket_variant_template = `
  <div class='expand_y'>
    <div class='product_row product-block'>
      <a class='product_link'>
        <img class='product-image variant_image' data-height='1w' data-type="src">
        <h3 class='product-title'><span class='check-tooltip variant_full_name'></span></h3>
      </a>
      <div style='text-align:center'>
        <div class='qty-control glue-children'>
          <button class='btn subtle qty-btn remove' onclick='addVariantToBasket(this,-1)'>
            <i class='custom-minus'></i>
          </button>
          <span class='qty-label'></span>
          <button class='btn subtle qty-btn add' onclick='addVariantToBasket(this,1)'>
            <i class='custom-plus'></i>
          </button>
        </div>
        <span class='product-price pln variant_total_price'></span>
      </div>
      <button class='cl cl6 fas fa-times remove-product-btn' onclick='addVariantToBasket(this,-100000);return false;'></button>
    </div>
  </div>
`;

const header_basket_product_template = `
  <div class='expand_y'>
    <div class='product_row product-block'>
      <a class='product_link'>
        <img class='product-image product_image' data-height='1w' data-type="src">
        <h3 class='product-title'><span class='check-tooltip product_name'></span></h3>
      </a>
      <div style='text-align:center'>
        <span class='product-price pln product_price'></span>
      </div>
    </div>
  </div>
`;
