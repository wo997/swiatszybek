<?php //route[produkty]

$show_category = null;
$category_link = "";

$parts = explode("/", $url);
if (isset($parts[1]) && strlen($parts[1]) > 1) {
  $category_link = trim($parts[1], "/");
  $show_category = fetchRow("SELECT title, category_id, description, content FROM product_categories WHERE link = ?", [$category_link]);
} else {
  header("Location: /produkty/wszystkie");
  die;
}

function showCategory($category, $level = 0)
{
  global $category_link;
  $category_id = intval($category["category_id"]);
  $subcategories = fetchArray("SELECT category_id, title, link, (
      SELECT COUNT(1) FROM link_product_category link WHERE link.category_id = pc.category_id
    ) as product_count FROM product_categories pc WHERE parent_id = $category_id AND published ORDER BY kolejnosc");
  $count = count($subcategories);

  //if ($level > 0) {
  $current = $category_link == $category["link"] ? "current" : "";
  $displayCount = isset($category["product_count"]) ? "<span>(" . $category["product_count"] . ")</span>" : "";
  $paddingLeft = $level == 0 ? 0 : 20 * ($level - 1);
  echo "<div data-parent_id='$category_id'><div class='category-picker-row'><a class='category_name $current' style='padding-left:" . ($paddingLeft) . "px' href='/produkty/" . $category["link"] . "'>" . $category["title"] . "&nbsp;$displayCount</a>";
  if ($count && $level > 0) {
    echo "<div class='btn expand' onclick='expandWithArrow(this.parent().next(),this)'><i class='fas fa-chevron-right'></i></div>";
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

  <link rel="stylesheet" href="/modules/product_list/main.css?v=<?= RELEASE ?>">

  <style>
    .category-picker-row>*,
    .category-picker-row>*>* {
      vertical-align: baseline;
    }

    .categories-wrapper .categories {
      min-width: 240px;
    }

    .categories-wrapper,
    .products {
      padding: 20px;
    }

    .category_name {
      max-width: 200px;
      display: inline-block;
    }

    .categories-wrapper {
      width: auto;
      border: 1px solid #eee;
      -webkit-box-shadow: 0px 3px 10px -3px rgba(0, 0, 0, 0.19);
      -moz-box-shadow: 0px 3px 10px -3px rgba(0, 0, 0, 0.19);
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

    .category-picker-row .expand {
      color: #999;
      margin-left: 1px;
      -webkit-box-shadow: none;
      -moz-box-shadow: none;
      box-shadow: none;
      transition: 0.2s all;
    }

    .category-picker-row {
      display: flex;
      padding: 2px;
    }

    @media only screen and (max-width: 799px) {
      .categories-wrapper {
        width: 100%;
      }

      .category-picker-row {
        justify-content: space-between;
        border-top: 1px solid #ddd;
        align-items: center;
        padding: 2px;
      }

      .category-picker-row .expand {
        width: 2.8em;
        height: 2.4em;
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

      .categories-wrapper,
      .products {
        padding: 10px;
      }

    }

    @media only screen and (min-width: 800px) {
      .category_name {
        padding-left: 0 !important;
      }

      .category-picker-row .expand {
        transform: translateY(1px);
      }


      .category-picker-row .expand:hover {
        border-radius: 5px;
        background: #dadada;
      }
    }

    .attribute-label {
      display: block;
      padding: 2px 0;
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

    /*.categories-wrapper .fas {
      color: #c22;
    }*/

    .product_list-animation-wrapper {
      transition: height 0.3s;
      position: relative;
      height: 0px;
      overflow: hidden;
    }

    .product_list-container-swap,
    .product_list-container-swap-background {
      position: absolute;
      transition: opacity 0.3s;
      top: 0;
      left: 0;
      width: 100%;
      background: white;
      pointer-events: none;
    }

    .product_list-container-swap-background {
      /*top: 100%;*/
      height: 10000px;
    }

    .product_list-container {}

    .under-products {
      position: relative;
      -webkit-box-shadow: 0px 0px 25px 25px rgba(255, 255, 255, 1);
      -moz-box-shadow: 0px 0px 25px 25px rgba(255, 255, 255, 1);
      box-shadow: 0px 0px 25px 25px rgba(255, 255, 255, 1);
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
      -webkit-box-shadow: inset 0px 0px 0px 1px rgba(0, 0, 0, 0.16);
      -moz-box-shadow: inset 0px 0px 0px 1px rgba(0, 0, 0, 0.16);
      box-shadow: inset 0px 0px 0px 1px rgba(0, 0, 0, 0.16);
      border-radius: 4px;
      transition: 0.1s all;
      cursor: pointer;
      font-weight: 600;
    }

    .order_by_item input:not(:checked)+span:hover {
      filter: brightness(0.95);
    }

    .order_by_item input:checked+span {
      background: var(--primary-clr);
      color: #fffd;
      cursor: default;
    }

    .order_by_item input:not(:checked)+span .fas {
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
  </style>

  <script>
    var currPage = 1;
    var rowCount = 6;
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
      window.productListSwapBackgroundNode = $(".product_list-container-swap-background");

      $$(".order_by_item input").forEach(e => {
        e.addEventListener("change", () => {
          searchProducts();
        });
      });

      if (!$(".order_by_item input:checked")) {
        $(`.order_by_item input[value="sale"]`).checked = true;
      }

      searchProducts();
    });

    function searchProducts(forceSearch = false) {
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

      var newSearchParams = JSON.stringify({
        attribute_value_ids: attribute_value_ids,
        category_ids: [<?= $show_category["category_id"] ?>],
        phrase: "xxx",
        order_by: $(`[name="order_by"]:checked`).getValue()
      });

      if (newSearchParams != searchParams) {
        currPage = 0;
        searchParams = newSearchParams;
      } else if (!forceSearch) {
        return;
      }

      xhr({
        url: "/search_products",
        params: {
          product_filters: searchParams,
          rowCount: rowCount,
          pageNumber: currPage
        },
        success: (res) => {
          if (res.totalRows == 0) {
            res.content = "<div style='font-size:20px;padding: 100px 10px;text-align:center;font-weight:bold'>Brak produktów</div>";
          } else {
            res.content = `<div style='height:50px'></div>${res.content}<div style='height:50px'></div>`;
          }
          productListSwapNode.style.animation = "fadeIn 0.3s";
          productListSwapBackgroundNode.style.animation = "fadeIn 0.3s";
          productListSwapBackgroundNode.style.visibility = "";

          productListSwapNode.setContent(res.content);

          lazyLoadImages(false);

          setCustomHeights();
          //productListNode.style.animation = "fadeOut 0.3s";

          var h = productListSwapNode.getBoundingClientRect().height;

          productListAnimationNode.style.height = h + "px";

          productListSwapBackgroundNode.style.top = h + "px";

          setTimeout(() => {
            productListNode.setContent(productListSwapNode.innerHTML);
            productListSwapNode.empty();

            productListSwapNode.style.animation = "";
            productListSwapBackgroundNode.style.animation = "";
            productListSwapBackgroundNode.style.visibility = "hidden";
            productListNode.style.animation = "";

            searchingProducts = false;
            //productListAnimationNode.style.height = "";
          }, 300);

          renderPagination(
            $(".pagination"),
            currPage,
            res.pageCount,
            (i) => {
              currPage = i;
              scrollToElement($(".hook_view"), {
                top: true,
                offset: 250,
                sag: 100,
                duration: 30
              });
              searchProducts(true);
              //setTimeout(() => {
              //}, 50);
            }
          );
        }
      })
    }

    function attributeSelectionChange(checkbox, hasChildren) {
      if (hasChildren) {
        var list = checkbox.parent().next();
        if (!checkbox.checked) {
          list.findAll(":checked").forEach(subCheckbox => {
            subCheckbox.setValue(0);
          });
        }
        expand(list, checkbox.checked);
      }

      searchProducts();
    }
  </script>
</head>

<body>
  <?php include "global/header.php"; ?>

  <div class="main-container desktopRow">
    <div class="categories-wrapper">
      <div class="search-header"><i class="fas fa-list"></i> Kategorie</div>

      <div class="categories">
        <?= showCategory([
          "link" => "wszystkie",
          "category_id" => 0,
          "title" => "Wszystkie produkty"
        ]) ?>
      </div>

      <div class="search-header"><i class="fas fa-sort-amount-down-alt"></i> Sortuj</div>
      <label class="order_by_item">
        <input type="radio" name="order_by" value="new">
        <span><i class="fas fa-plus-circle"></i> Najnowsze</span>
      </label>
      <label class="order_by_item">
        <input type="radio" name="order_by" value="sale">
        <span><i class="fas fa-star"></i> Bestsellery</span>
      </label>
      <label class="order_by_item">
        <input type="radio" name="order_by" value="cheap">
        <span><i class="fas fa-dollar-sign"></i> Najtańsze</span>
      </label>
      <label class="order_by_item">
        <input type="radio" name="order_by" value="random">
        <span><i class="fas fa-dice-three"></i> Losowo</span>
      </label>

      <?php
      include_once "admin/product/attributes_service.php";

      function printUserSelectValuesOfAttribute($values, $attribute, $value_id = null)
      {
        if (!isset($values[0])) return "";

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
          $html .= "<input type='checkbox' value='" . $value_data["values"]["value_id"] . "'";
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

        /*$any = isset($attribute_data_types[$attribute["data_type"]]["field"]);

        echo "<div class='" . ($any ? "any-value-wrapper" : "combo-select-wrapper") . " attribute-row'>" . $attribute["name"] . " ";

        if ($any) {
          echo '
              <label class="field-title">
                <input type="checkbox">
                <div class="checkbox"></div>
              </label>
            ';
          $attribute_form_name = 'name="attribute_values[' . $attribute["attribute_id"] . ']"';
          if (strpos($attribute["data_type"], "color") !== false) {
            echo '<input type="text" class="jscolor field" style="display: inline-block;width:65px" ' . $attribute_form_name . '>';
          } else if (strpos($attribute["data_type"], "number") !== false) {
            echo '<input type="number" class="field" ' . $attribute_form_name . '>';
          } else {
            echo '<input type="text" class="field" ' . $attribute_form_name . '>';
          }
        } else {
          $values = getAttributeValues($attribute["attribute_id"]);
          echo printUserSelectValuesOfAttribute($values);
        }

        echo "</div>";*/
      }

      if ($output) {
        echo '<div class="search-header"><i class="fas fa-sliders-h"></i> Filtry</div>';
        echo $output;
      }

      ?>
    </div>
    <div class="product_list-wrapper">
      <h1 class="h1" style="margin: 40px 0"><?= $show_category["title"] ?></h1>
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

        <div class="product_list-container-swap-background"></div>
        <div class="product_list-container-swap"></div>
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