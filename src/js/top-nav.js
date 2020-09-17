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

  document.addEventListener("scroll", () => {
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    var movingDown = scrollTop >= nonull(window.scrollTop, 0);

    //var offset = movingDown ? 50 : 250;

    //top_nav.classList.toggle("collapsed", scrollTop > offset);
    top_nav.classList.toggle("collapsed", movingDown && scrollTop > 100);

    window.scrollTop = scrollTop;
  });

  headerResizeCallback();
});

window.addEventListener("resize", headerResizeCallback);

function headerResizeCallback() {
  var header = $("header");
  if (!header) {
    return;
  }
  header.style.marginBottom =
    $(".navigation").getBoundingClientRect().height +
    $(".header-top").getBoundingClientRect().height +
    "px";
}

window.addEventListener("DOMContentLoaded", () => {
  if (window.innerWidth > 800) {
    return;
  }

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

  $("#mainMenu .scroll-panel").appendChild($(".navigation"));

  $("header .basket-wrapper").insertAdjacentHTML(
    "beforeend",
    `
      <button class='btn transparent' onclick='showModal("mainMenu", {source:this})'>
        <i class="fas fa-bars"></i>
      </button>
    `
  );

  $$("header .case-desktop").forEach((e) => {
    e.remove();
  });

  $(".main-search-wrapper").remove();
});

// perform search

window.addEventListener("DOMContentLoaded", () => {
  var input = $(".main-search-wrapper input");
  if (!input) {
    return;
  }
  input.addEventListener("input", () => {
    delay("topSearch", 400);
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
      pageNumber: currPage,
    },
    success: (res) => {
      if (!res.content) {
        res.content = `<div class='result' style='pointer-events:none'><i class="fas fa-ban"></i> Brak wyników</div>`;
      }
      callback(res.content);
    },
  });
}
