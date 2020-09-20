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
});

window.addEventListener("resize", headerResizeCallback);

function headerResizeCallback() {
  var header = $("header");
  if (!header) {
    return;
  }

  $(".header-height").style.marginBottom =
    $(".header-top").getBoundingClientRect().height +
    (window.innerWidth >= 800
      ? $(".navigation").getBoundingClientRect().height
      : 0) +
    "px";
}

window.addEventListener("DOMContentLoaded", () => {
  if (window.innerWidth >= 800) {
    var btn = $("header .basket-wrapper .basket-btn");
    if (btn) {
      btn.addEventListener("click", () => {
        $(".gotobuy").click();
      });
    }
    return;
  }

  //search
  registerModalContent(`
      <div id="mainSearch" data-expand>
          <div class="modal-body">
              <button class="fas fa-times close-modal-btn"></button>
              <h3 class="header">Wyszukiwarka</h3>
              <div class="scroll-panel scroll-shadow panel-padding">
                
              </div>
          </div>
      </div>
  `);

  var sc = $("#mainSearch .scroll-panel");
  var sw = $("header .main-search-wrapper");
  if (sc && sw) {
    sc.appendChild(sw);
  }

  //user
  var um = $("header .user-menu");
  if (um) {
    registerModalContent(`
      <div id="userMenu" data-expand>
          <div class="modal-body">
              <button class="fas fa-times close-modal-btn"></button>
              <h3 class="header">Moje konto</h3>
              <div class="scroll-panel scroll-shadow panel-padding">
                
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
            <h3 class="header">Koszyk</h3>
            <div class="scroll-panel scroll-shadow panel-padding">
              
            </div>
            <div style='display:flex;padding:5px'>
              <button class="btn primary medium fill gotobuy" onclick="window.location='/zakup';" style="position:relative">
                Przejdź do kasy
                <i class="fa fa-chevron-right"></i>
              </button>
            </div>
        </div>
    </div>
  `);

  var sc = $("header .nav_basket_container .scrollableContent");
  if (sc) {
    $("#basketMenu .scroll-panel").appendChild(sc);
    sc.classList.remove("scrollableContent");
  }

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
              <h3 class="header">Menu</h3>
              <div class="scroll-panel scroll-shadow panel-padding">
                
              </div>
          </div>
      </div>
  `);

  var mm = $("#mainMenu .scroll-panel");
  var nvg = $(".navigation");
  if (mm && nvg) {
    mm.appendChild(nvg);
  }
});

// perform search

window.addEventListener("DOMContentLoaded", () => {
  var input = $(".main-search-wrapper input");
  if (!input) {
    return;
  }
  var main_search_wrapper = $(".main-search-wrapper");
  document.addEventListener("click", (event) => {
    main_search_wrapper.classList.toggle(
      "active",
      $(event.target).findParentByClassName("main-search-wrapper")
    );
  });
  input.addEventListener("input", () => {
    delay("topSearch", 400);
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

    if (event.key == "Enter" && selected) {
      selected.click();
    }

    if (!up && !down) {
      return;
    }

    if (selected) {
      if (down) {
        select = selected.next();
      } else if (up) {
        select = selected.prev();
      }
    }

    if (down) {
      if (!select) {
        select = main_search_wrapper.find(".result");
      }
    } else if (up) {
      if (!select) {
        select = main_search_wrapper.find(".result:last-child");
      }
    }

    main_search_wrapper.findAll(".selected").forEach((e) => {
      e.classList.remove("selected");
    });

    if (select) {
      select.classList.add("selected");
    }
  });
});

function topSearch() {
  var search = $(".main-search-wrapper input").value.trim();

  var callback = (content) => {
    $(".main-search-wrapper .search-results").setContent(content);
  };

  if (search.length === 0) {
    return callback("");
  }

  if (search.length < 3) {
    return callback(
      `<i class='result' style='pointer-events:none'> Wpisz mininum 3 znaki...</i>`
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
        res.content = `<div class='result' style='pointer-events:none'><i class="fas fa-ban"></i> Brak wyników</div>`;
      }
      callback(res.content);
    },
  });
}

window.addEventListener("DOMContentLoaded", () => {
  var ss = $("header .nav_basket_container .scrollableContent");
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
