<?php //route[produkty]

$show_category = null;

$category_link = urlParam(1);
if ($category_link) {
  $show_category = fetchRow("SELECT title, category_id, description, content FROM product_categories WHERE link = ?", [$category_link]);
}

if (!$show_category) {
  redirect("/produkty/wszystkie");
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
    echo "<div class='btn expand_arrow' onclick='expandMenu($(this).parent().next(),$(this).parent())'><i class='fas fa-chevron-right'></i></div>";
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

  <script src="/builds/user_produkty_page.js?v=<?= JS_RELEASE ?>"></script>
  <link href="/builds/user_produkty_page.css?v=<?= CSS_RELEASE ?>" rel="stylesheet">

  <script>
    const CATEGORY_ID = <?= $show_category["category_id"] ?>;
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
          <img class='cross-icon' src='/src/img/cross.svg'>
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
            <img class="cross-icon" src="/src/img/cross.svg">
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
            if ($value_data["value"] === "") {
              continue;
            }
            $html .= "<div class='attributes-list-wrapper'>";
            $html .= "<label class='attribute-label'>";
            $html .= "<input type='checkbox' name='chk_" . $value_data["value_id"] . "' value='" . $value_data["value_id"] . "'";
            $html .= " onchange='attributeSelectionChange(this,";
            $html .= nonull($value_data, "_children", []) ? "true" : "false";
            $html .= ")'";
            $html .= ">";
            $html .= "<div class='checkbox'></div> ";
            $html .= $value_data["value"];

            if (isset($value_dat["color"])) {
              $html .= "<div class='color-circle' style='background-color:" . $value_data["color"] . "'></div>";
            }

            $html .= "</label>";

            $html .= printUserSelectValuesOfAttribute($value_data["_children"], $attribute, $value_data["value_id"]);

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