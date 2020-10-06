<?php //route[produkty]

$show_category = null;
$category_link = "";

$parts = explode("/", $url);
if (isset($parts[1]) && strlen($parts[1]) > 1) {
  $category_link = trim($parts[1], "/");
  $show_category = fetchRow("SELECT title, category_id, description, content FROM product_categories WHERE link = ?", [$category_link]);
}

if (!$show_category) {
  header("Location: /produkty/wszystkie");
  die;
}

function showCategory($category, $level = 0)
{
  global $category_link;
  $category_id = intval($category["category_id"]);
  $subcategories = fetchArray("SELECT category_id, title, link, (
      SELECT COUNT(1) FROM link_product_category link INNER JOIN products USING(product_id) WHERE link.category_id = pc.category_id AND published
    ) as product_count FROM product_categories pc WHERE parent_id = $category_id AND published ORDER BY kolejnosc");
  $count = count($subcategories);

  //if ($level > 0) {
  $current = $category_link == $category["link"] ? "current" : "";
  $displayCount = isset($category["product_count"]) ? "<span>(" . $category["product_count"] . ")</span>" : "";
  $paddingLeft = $level == 0 ? 0 : 20 * ($level - 1);
  echo "<div data-parent_id='$category_id'><div class='category-picker-row'><a class='category_name $current' style='padding-left:" . ($paddingLeft) . "px' href='/produkty/" . $category["link"] . "'>" . $category["title"] . "&nbsp;$displayCount</a>";
  if ($count && $level > 0) {
    echo "<div class='btn expand_arrow' onclick='expandWithArrow(this.parent().next(),this)'><i class='fas fa-chevron-right'></i></div>";
  }
  $hidden = $level > 0 ? "expand_y hidden animate_hidden" : "";
  $styles = $level == 0 ? "style='padding-left:0'" : "";
  echo "</div><div class='category-picker-column $hidden' $styles>";
  //}

  foreach ($subcategories as $subcategory) {
    showCategory($subcategory, $level + 1);
  }
  //if ($level > 0) {
  echo "</div></div>";
  //}
}

?>
<!DOCTYPE html>
<html lang="pl">

<head>
  <?php include "global/includes.php"; ?>

  <style>
    .category-picker-row>*,
    .category-picker-row>*>* {
      vertical-align: baseline;
    }

    .search-wrapper .categories {
      min-width: 240px;
    }

    .search-wrapper,
    .products {
      padding: 20px;
    }

    .category_name {
      max-width: 200px;
      display: inline-block;
      padding: 2px;
    }

    .search-wrapper {
      width: auto;
      border: 1px solid #eee;
      box-shadow: 0px 3px 10px -3px rgba(0, 0, 0, 0.19);
    }

    .categories>div>.category-picker-row:before {
      display: none;
    }

    .categories>div>.category-picker-row:after {
      display: none;
    }

    .category_name.current {
      color: var(--primary-clr);
      text-decoration: underline;
      font-weight: bold;
    }

    .category-picker-row .expand_arrow {
      color: #999;
      margin-left: 1px;
      box-shadow: none;
      transition: 0.2s all;
    }

    .attribute-label {
      display: block;
      padding: 2px 0;
    }

    @media only screen and (max-width: 799px) {
      .search-wrapper {
        width: 100%;
      }

      .category-picker-row {
        display: flex;
        justify-content: space-between;
        border-bottom: 1px solid #ddd;
        align-items: center;
        padding-left: 12px;
        height: 2.55em;
      }

      .category-picker-row .expand_arrow {
        width: 2.8em;
        height: 100%;
      }

      .category_name {
        padding: 5px;
        flex-grow: 1;
        max-width: unset;
      }

      .category-picker-row:before,
      .category-picker-row:after {
        display: none;
      }

      .category-picker-column {
        padding: 0;
      }

      .search-wrapper,
      .products {
        padding: 10px;
      }

      .attribute-label {
        padding: 4px 0;
      }
    }

    @media only screen and (min-width: 800px) {
      .category_name {
        padding-left: 0 !important;
      }

      .category-picker-row .expand_arrow {
        transform: translateY(1px);
      }


      .category-picker-row .expand_arrow:hover {
        border-radius: 5px;
        background: #dadada;
      }

      .search-wrapper .mobile-search-btn {
        display: none;
      }

      .search-wrapper {
        max-width: 300px;
      }
    }

    .attribute-list .attribute-list {
      margin-left: 25px;

    }

    .category_name:hover {
      text-decoration: underline #000c;
    }

    .product_list-wrapper {
      padding: 2vw;
      overflow: hidden;
    }

    .attribute-header {
      font-weight: 600;
      margin-top: 1em;
      margin-bottom: 0.3em;
    }

    .product_list-animation-wrapper {
      position: relative;
      overflow: hidden;
    }

    .product_list-container-swap,
    .product_list-container-swap-background {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      background: white;
      pointer-events: none;
      z-index: 100;
    }

    .product_list-container-swap-background {
      height: 10000px;
      top: 100%;
    }

    .under-products {
      position: relative;
      box-shadow: 0px 0px 25px 25px rgba(255, 255, 255, 1);
      margin-bottom: 50px;
    }

    .order_by_item {
      display: block;
    }

    .order_by_item input {
      display: none;
    }

    .order_by_item span {
      background: #fafafa;
      padding: 3px 9px;
      display: block;
      margin-bottom: 3px;
      box-shadow: inset 0px 0px 0px 1px rgba(0, 0, 0, 0.16);
      border-radius: 4px;
      transition: 0.1s all;
      cursor: pointer;
      font-weight: 600;
    }

    .order_by_item input:not(:checked)+span:hover {
      filter: brightness(0.95);
    }

    .sorting-wrapper .order_by_item input:checked+span {
      background: var(--primary-clr);
      color: #fffd;
      cursor: default;
    }

    .sorting-wrapper .order_by_item input:checked+span {
      background: var(--primary-clr);
      color: #fffd;
      cursor: default;
    }

    .sorting-wrapper .order_by_item input:checked+span img {
      filter: invert();
    }

    .order_by_item input:not(:checked)+span .fas,
    .order_by_item input:not(:checked)+span svg {
      opacity: 0.8;
    }

    .order_by_item .fas {
      width: 16px;
      text-align: center;
      transform: scale(1.1);
    }

    .search-header {
      margin: 30px 0 10px;
      font-weight: bold;
      font-size: 16px;
    }

    .search-wrapper .mobile-search-btn,
    .mobile-margin-bottom {
      margin-bottom: 10px;
    }

    .sorting-wrapper.horizontal .order_by_item span {
      padding: 6px 10px;
      margin-right: 10px;
    }

    .sorting-wrapper.horizontal .order_by_item:first-child span {
      margin-left: 10px;
    }

    .sorting-wrapper.horizontal .order_by_item:last-child span {
      margin-right: 10px;
    }

    .horizontal-scroll-wrapper {
      display: flex;
      margin: 0 -10px
    }

    .horizontal-scroll-wrapper .order_by_item>span {
      min-width: 38vw !important;
      text-align: center;
      border-radius: 20px;
    }

    @media only screen and (min-width: 500px) {
      .horizontal-scroll-wrapper .order_by_item>span {
        min-width: 21vw !important;
        text-align: center;
      }
    }

    .filters_description {
      text-align: center;
      font-size: 1.2em;
    }
  </style>

  <script>
    var currPage = 1;
    var rowCount = 24;
    var searchParams = {};
    var searchingProducts = false;

    window.addEventListener("DOMContentLoaded", () => {
      var e = $(".category_name.current");
      if (e) {
        expandCategoriesAbove(e);
      }

      window.productListNode = $(".product_list-container");
      window.productListAnimationNode = $(".product_list-animation-wrapper");
      window.productListSwapNode = $(".product_list-container-swap");
      window.productListSwapContentNode = $(".product_list-container-swap-content");
      window.productListSwapBackgroundNode = $(".product_list-container-swap-background");
      window.paginationNode = $(".under-products .pagination");

      $$(".order_by_item input").forEach(e => {
        e.addEventListener("change", () => {
          searchProducts();
        });
      });

      if (!$(".order_by_item input:checked")) {
        $(`.order_by_item input[value="sale"]`).checked = true;
      }

      var products_search = localStorage.getItem("products_search");
      if (products_search) {
        localStorage.removeItem("products_search");
        $(`.relevance_option`).checked = true;
      } else {
        products_search = "";
      }
      $(".products_search").setValue(products_search);

      attributeSelectionChange(null, null);

      searchProducts();

      window.filtersInitialState = getFormData(".filters");

      if (window.innerWidth < 800) {
        $$(".search-wrapper .search-header").forEach(e => {
          e.remove();
        });

        registerModalContent(`
            <div id="searchCategory" data-expand>
                <div class="modal-body">
                    <button class="fas fa-times close-modal-btn"></button>
                    <h3 class="header">Kategorie</h3>
                    <div class="scroll-panel scroll-shadow">

                    </div>
                </div>
            </div>
        `);

        registerModalContent(`
            <div id="searchFilters" data-expand>
                <div class="modal-body">
                    <button class="fas fa-times close-modal-btn" onclick="restoreFilters();afterFiltersHidden();"></button>
                    <h3 class="header">Filtry <span class="filter_count"></span></h3>
                    <div class="scroll-panel scroll-shadow panel-padding">

                    </div>
                    <div class='footer' style='display:flex;padding:5px'>
                      <button class="btn secondary fill" onclick="clearAllFilters()">
                        Wyczyść filtry
                        <i class="fas fa-times"></i>
                      </button>
                      <button class="btn primary fill" style='margin-left:5px' onclick="hideParentModal(this);afterFiltersHidden()">
                        Pokaż wyniki
                        <i class="fas fa-chevron-right"></i>
                      </button>
                    </div>
                </div>
            </div>
        `);

        $(`#searchCategory .modal-body .scroll-panel`).appendChild(
          $('.search-wrapper .categories')
        );

        var filters = $('.search-wrapper .filters');

        if (!filters.find("*")) {
          $(`.search-filters-btn`).style.display = "none";
        } else {
          $(`#searchFilters .modal-body .scroll-panel`).appendChild(
            filters
          );
        }

        // sorting horizontal
        var scroll_wrapper = $('.sorting-wrapper');
        scroll_wrapper.classList.add("scroll-panel");
        scroll_wrapper.classList.add("scroll-shadow");
        scroll_wrapper.classList.add("horizontal");
        scroll_wrapper.classList.add("light");

        scroll_wrapper.insertAdjacentHTML("afterend", "<div class='horizontal-scroll-wrapper'></div>");
        var container = scroll_wrapper.next();
        container.appendChild(scroll_wrapper);

        registerScrollShadows();

        var products_search = $(".products_search");
        products_search.addEventListener("input", () => {
          // give user a hint
          setMobileSearchBtnOpacity($(".products_search"));
        });
      } else {
        $(".products_search").parent().classList.remove("glue-children");
        var products_search = $(".products_search");
        products_search.addEventListener("input", () => {
          // instant change
          products_search.setValue();
        });
      }
    });

    var blockSearch = false;

    function beforeFiltersShown() {
      blockSearch = true;
      window.filtersStateBeforeOpen = getFormData(".filters");
    }

    function restoreFilters() {
      setFormData(window.filtersStateBeforeOpen, ".filters");
    }

    function afterFiltersHidden() {
      blockSearch = false;
      searchProducts();
    }

    function clearAllFilters() {
      setFormData(window.filtersInitialState, ".filters");
      searchingProducts = false;
      searchProducts();
    }

    function clearSearch() {
      $(".products_search").setValue("");
      searchProducts();
    }

    var firstSearch = true;

    function searchProducts(forceSearch = false) {
      if (blockSearch) {
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
      $$(".combo-select-wrapper[data-attribute_id]").forEach(list => {
        var attribute_value_sub_ids = [];
        list.findAll(":checked").forEach(checkbox => {
          var subCheckboxes = checkbox.findParentByClassName("attributes-list-wrapper").find(".attribute-list");
          var anySubChecked = subCheckboxes ? subCheckboxes.find(":checked") : false;
          if (!anySubChecked) {
            attribute_value_sub_ids.push(checkbox.value);
          }
        });
        if (attribute_value_sub_ids.length > 0) {
          attribute_value_ids.push(attribute_value_sub_ids);
        }
      })

      var newSearchParams = {
        attribute_value_ids: attribute_value_ids,
        category_ids: [<?= $show_category["category_id"] ?>],
        search: $(".products_search").getValue(),
        order_by: $(`[name="order_by"]:checked`).getValue(),
        price_min: $(`.price_min_search`).getValue(),
        price_max: $(`.price_max_search`).getValue(),
        layout: "grid",
      };

      if (JSON.stringify(newSearchParams) != JSON.stringify(searchParams)) {
        currPage = 0;
        searchParams = newSearchParams;
      } else if (!forceSearch) {
        return;
      }

      setMobileSearchBtnOpacity($(".products_search"));

      if (window.innerWidth < MOBILE_WIDTH) {
        scrollToTopOfProductList();
      }

      xhr({
        url: "/search_products",
        params: {
          product_filters: JSON.stringify(searchParams),
          rowCount: rowCount,
          pageNumber: currPage
        },
        success: (res) => {
          if (res.totalRows == 0) {
            var caseFilters = searchParams.attribute_value_ids.length > 0 || searchParams.search !== "" ?
              `<button class='btn subtle' onclick="clearSearch();clearAllFilters();"><i class='fas fa-times'></i> Wyczyść filtry</button>` : "Wyszukaj inną kategorię";
            res.content = `
              <div style='font-size:22px;padding: 60px 10px;text-align:center;font-weight:600'>
                <span style='color: var(--error-clr);'><i class="fas fa-exclamation-circle"></i> Brak produktów!</span>
                <div style='font-size:0.8em;margin:0.7em'>${caseFilters}</div>
              </div>
              `;
          } else {
            res.content = `<div style='height:50px'></div>${res.content}<div style='height:50px'></div>`;
          }

          $(".price_range_info").setContent((res.price_info.min && res.price_info.max) ? `(${res.price_info.min} zł - ${res.price_info.max} zł)` : "");

          var duration = firstSearch ? 0 : 300;
          firstSearch = false;
          var was_h = productListAnimationNode.getBoundingClientRect().height;
          productListSwapContentNode.setContent(res.content);
          setProductListGridDimensions(productListSwapContentNode.find(".product_list_module.grid"));
          lazyLoadImages(false);
          setCustomHeights();
          var h = productListSwapContentNode.getBoundingClientRect().height;

          animate(
            productListAnimationNode,
            duration,
            `
              0% {
                height: ${Math.round(was_h)}px;
              }
              100% {
                height: ${Math.round(h)}px;
              }
            `
          );

          productListSwapBackgroundNode.style.visibility = "";
          animate(
            productListSwapNode,
            duration,
            `
              0% {
                opacity: 0;
              }
              100% {
                opacity: 1;
              }
            `,
            () => {
              productListSwapBackgroundNode.style.visibility = "hidden";
              searchingProducts = false;
              productListNode.setContent(productListSwapNode.innerHTML);
              productListSwapContentNode.empty();
              tooltipResizeCallback();
              productListLoaded();
            }
          );

          if ($(".order_by_item input[value='random']:checked")) {
            if (res.totalRows > 0) {
              paginationNode.setContent(`
              <button class='btn primary medium' onclick='beforeSearchProducts()'>Losuj więcej <i class='fas fa-dice-three'></i></button>
            `);
            } else {
              paginationNode.setContent(``);
            }
          } else {
            renderPagination(
              paginationNode,
              currPage,
              res.pageCount,
              (i) => {
                currPage = i;
                scrollToTopOfProductList();
                searchProducts(true);
              }
            );
          }

          $$(".filters_description").forEach(e => {
            animate(e, duration, ANIMATIONS.blink);
            setTimeout(() => {
              var out = [];
              if (searchParams.search) {
                out.push(`Wyszukaj: <span style='font-weight:600'>${searchParams.search}</span>`);
              }
              if (searchParams.price_min && searchParams.price_max) {
                out.push(`Cena: <span class='pln'>${searchParams.price_min} - ${searchParams.price_max} zł</span>`);
              } else if (searchParams.price_min) {
                out.push(`Cena: <span class='pln'>od ${searchParams.price_min} zł</span>`);
              } else if (searchParams.price_max) {
                out.push(`Cena: <span class='pln'>do ${searchParams.price_max} zł</span>`);
              }

              out.push(`Sortuj: <span style='font-weight:600'>${$(`[value="${searchParams.order_by}"]`).next().textContent}</span>`);
              e.innerHTML = out.join(", ");
            }, duration / 2);
          });
        }
      })
    }

    function scrollToTopOfProductList() {
      scrollToElement($(".hook_view"), {
        top: true,
        offset: window.innerWidth < MOBILE_WIDTH ? 200 : 300,
        sag: window.innerWidth < MOBILE_WIDTH ? 0 : 100,
        duration: 30
      });
    }

    function beforeSearchProducts() {
      scrollToTopOfProductList();
      searchProducts(true);
    }

    function attributeSelectionChange(checkbox, hasChildren) {
      if (checkbox && hasChildren) {
        var list = checkbox.parent().next();
        if (!checkbox.checked) {
          list.findAll(":checked").forEach(subCheckbox => {
            subCheckbox.setValue(0);
          });
        }
        expand(list, checkbox.checked);
      }

      filterChange(true);
    }

    function filterChange(instant = false) {
      var filter_count = $$(".filters input[type='checkbox']:checked").length;

      if ($(".price_min_search").getValue()) {
        filter_count++;
      }
      if ($(".price_max_search").getValue()) {
        filter_count++;
      }

      $$(".filter_count").forEach(e => {
        e.innerHTML = filter_count ? `(${filter_count})` : "";
      });

      $$(".case_any_filters").forEach(e => {
        e.style.display = filter_count ? "" : "none";
      });

      anySearchChange(instant);
    }

    function productsSearchChange(input, instant = false) {
      input = $(input);

      var value = input.getValue();
      var filled = value !== "";
      $$(".case_search").forEach(e => {
        e.style.display = filled ? "" : "none";
      });
      $$(".case_no_search").forEach(e => {
        e.style.display = !filled ? "" : "none";
      });

      if (searchParams.search === "" && value !== "") {
        $(`.order_by_item .relevance_option`).checked = true;
      }

      if (!filled && $(".relevance_option:checked")) {
        $(`.sale_option`).checked = true;
      }

      if (filled && $(".random_option:checked")) {
        $(`.sale_option`).checked = true;
      }

      anySearchChange(instant);
    }

    function setMobileSearchBtnOpacity(input) {
      input.parent().find(".search-btn").style.opacity = input.getValue() !== searchParams.search ? 1 : 0;
    }

    function anySearchChange(instant = false) {
      if (instant) {
        searchProducts();
      } else {
        delay("searchProducts", 500);
      }
    }
  </script>
</head>

<body>
  <?php include "global/header.php"; ?>

  <div class="main-container desktopRow">
    <div class="search-wrapper">
      <button class="btn primary medium fill mobile-search-btn" onclick="showModal('searchCategory', {source:this})">
        <i class="fas fa-list"></i> Kategorie
      </button>

      <button class="btn secondary medium fill mobile-search-btn search-filters-btn" onclick="beforeFiltersShown();showModal('searchFilters', {source:this})">
        <i class="fas fa-sliders-h"></i> Filtry <span class="filter_count"></span>
      </button>

      <div class="search-header"><i class="fas fa-list"></i> Kategorie</div>

      <div class="categories">
        <?= showCategory([
          "link" => "wszystkie",
          "category_id" => 0,
          "title" => "Wszystkie produkty",
        ]) ?>
      </div>

      <div class="search-header">
        <i class="fas fa-search"></i>
        Szukaj
        <button class='btn subtle case_search' onclick='clearSearch()' data-tooltip='Wyczyść filtr' data-position='right' style='margin:-10px 0'>
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class='float-icon mobile-margin-bottom any-search-wrapper glue-children'>
        <input type="text" placeholder="Nazwa produktu..." class="field products_search ignore-glue" onchange="productsSearchChange(this)">
        <i class="fas fa-search"></i>
        <button class="btn primary case-mobile search-btn can-disappear">
          <img class="search-icon" src="/src/img/search_icon.svg">
        </button>
      </div>

      <div class="sorting-wrapper">
        <div class="search-header">
          <i class="fas fa-sort-amount-down-alt"></i>
          Sortuj
        </div>
        <label class="order_by_item">
          <input type="radio" name="order_by" value="sale" class="sale_option">
          <span><i class="fas fa-star"></i> Bestsellery</span>
        </label>
        <label class="order_by_item">
          <input type="radio" name="order_by" value="new">
          <span><i class="fas fa-plus-circle"></i> Najnowsze</span>
        </label>
        <label class="order_by_item">
          <input type="radio" name="order_by" value="cheap">
          <span><i class="fas fa-dollar-sign"></i> Najtańsze</span>
        </label>
        <label class="order_by_item case_no_search">
          <input type="radio" name="order_by" value="random" class="random_option">
          <span><i class="fas fa-dice-three"></i> Losowo</span>
        </label>
        <label class="order_by_item case_search">
          <input type="radio" name="order_by" value="relevance" class="relevance_option">
          <span><img src="/src/img/target_icon.svg" style="width: 1em;transform: translateY(2px);"> Trafność</span>
        </label>
      </div>

      <div class="filters" data-form>
        <div class='search-header'>
          <i class='fas fa-sliders-h'></i>
          Filtry
          <span class='filter_count'></span>
          <button class='btn subtle case_any_filters' onclick='clearAllFilters()' data-tooltip='Wyczyść filtry' data-position='right' style='margin:-10px 0'>
            <i class='fas fa-times'></i>
          </button>
        </div>

        <div class='attribute-header'>Cena <span class="price_range_info"></span></div>

        <div class="flex-children-width">
          <div class="flex-column" style="margin-right:15px;">
            Min.
            <div class='float-icon mobile-margin-bottom flex'>
              <input type="number" class="field inline price_min_search" name="price_min_search" style="padding-right: 24px;" oninput="filterChange()" onchange="filterChange(true);">
              <i>zł</i>
            </div>
          </div>
          <div class="flex-column">
            Max.
            <div class='float-icon mobile-margin-bottom flex'>
              <input type="number" class="field inline price_max_search" name="price_max_search" style="padding-right: 24px;" oninput="filterChange()" onchange="filterChange(true);">
              <i>zł</i>
            </div>
          </div>
        </div>


        <?php
        include_once "admin/product/attributes_service.php";

        function printUserSelectValuesOfAttribute($values, $attribute, $value_id = null)
        {
          if (!isset($values[0])) {
            return "";
          }

          $attr = $value_id ? "data-parent_value_id='" . $value_id . "'" : "";
          $attr .= " data-attribute_id='" . $attribute["attribute_id"] . "'";

          $classes = "attribute-list";

          if ($value_id) {
            $classes .= " expand_y hidden animate_hidden";
          }

          $html = "<div class='$classes' $attr>";
          foreach ($values as $value_data) {
            if ($value_data["values"]["value"] === "") {
              continue;
            }
            $html .= "<div class='attributes-list-wrapper'>";
            $html .= "<label class='attribute-label'>";
            $html .= "<input type='checkbox' name='chk_" . $value_data["values"]["value_id"] . "' value='" . $value_data["values"]["value_id"] . "'";
            $html .= " onchange='attributeSelectionChange(this,";
            $html .= nonull($value_data, "children", []) ? "true" : "false";
            $html .= ")'";
            $html .= ">";
            $html .= "<div class='checkbox'></div> ";
            $html .= $value_data["values"]["value"];

            if (isset($value_data["values"]["color"])) {
              $html .= "<div class='color-circle' style='background-color:" . $value_data["values"]["color"] . "'></div>";
            }

            $html .= "</label>";

            $html .= printUserSelectValuesOfAttribute($value_data["children"], $attribute, $value_data["values"]["value_id"]);

            $html .= "</div>";
          }
          $html .= "</div>";

          return $html;
        }

        $attributes = fetchArray("SELECT name, attribute_id, data_type FROM product_attributes
        INNER JOIN link_category_attribute USING (attribute_id) WHERE category_id=" . intval($show_category["category_id"]));

        $output = "";

        foreach ($attributes as $attribute) {

          $any = isset($attribute_data_types[$attribute["data_type"]]["field"]);

          $output .= "<div class='" . ($any ? "any-value-wrapper" : "combo-select-wrapper") . "' data-attribute_id='" . $attribute["attribute_id"] . "'>";
          $output .= "<div class='attribute-header'>" . $attribute["name"] . "</div> ";

          if ($any) {
          } else {
            $values = getAttributeValues($attribute["attribute_id"]);
            $output .= printUserSelectValuesOfAttribute($values, $attribute);
          }

          $output .= "</div>";
        }

        echo $output;

        ?>
      </div>
    </div>
    <div class="product_list-wrapper">
      <div style="margin: 35px 0">
        <h1 class="h1" style="margin: 5px 0"><?= $show_category["title"] ?></h1>
        <p class="filters_description"></p>
      </div>
      <?= $show_category["description"] ?>

      <div class="hook_view"></div>

      <div class="product_list-animation-wrapper">
        <div class="product_list-container">
          <?php
          /*$moduleParams = [];
$module_content = "";
$moduleParams["category_ids"] = [$show_category["category_id"]];
include "modules/product_list/content.php";
echo $module_content;*/
          ?>
        </div>

        <div class="product_list-container-swap">
          <div class="product_list-container-swap-content"></div>
          <div class="product_list-container-swap-background"></div>
        </div>
      </div>

      <div class="under-products">
        <div class="flexbar">
          <div class="pagination"></div>
        </div>

        <?= getCMSPageHTML($show_category["content"]) ?>
      </div>
    </div>
  </div>

  <?php include "global/footer.php"; ?>
</body>

</html>