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
  $hidden = $level > 0 ? "expandY hidden" : "";
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
  <?php include "includes.php"; ?>

  <link rel="stylesheet" href="/modules/product-list/main.css">

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
      color: #cc2229;
      text-decoration: underline;
      font-weight: bold;
    }

    .category-picker-row .expand {
      color: #999;
      margin-left: 1px;
    }

    .category-picker-row {
      display: flex;
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
    }

    .attribute-label {
      display: block;
      padding: 2px 0;
    }

    .attribute-list .attribute-list {
      margin-left: 25px;

    }


    .product-list-wrapper {
      padding: 2vw;
    }

    .product-list-container {
      margin: 30px 0;
    }

    .combo-select-wrapper .attribute-header {
      font-weight: 600;
      margin-top: 1em;
      margin-bottom: 0.3em;
    }

    .categories-wrapper .fas {
      color: #c22;
    }
  </style>

  <script>
    var currPage = 1;
    var rowCount = 6;
    var searchParams = {};

    window.addEventListener("DOMContentLoaded", () => {
      var e = $(".category_name.current");
      if (e) {
        expandCategoriesAbove(e);
      }

      searchProducts();
    });

    function searchProducts() {
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
        phrase: "xxx"
      });

      //console.log(newSearchParams);


      if (newSearchParams != searchParams) {
        currPage = 0;
        searchParams = newSearchParams;
      }

      xhr({
        url: "/search_products",
        params: {
          filters: searchParams,
          rowCount: rowCount,
          pageNumber: currPage
        },
        success: (res) => {
          if (res.totalRows == 0) {
            res.content = "<div style='font-size:20px;margin:100px 0;padding: 10px;text-align:center;font-weight:bold'>Brak produktów</div>";
          }

          $(".product-list-container").setContent(res.content);

          renderPagination(
            $(".pagination"),
            currPage,
            res.pageCount,
            (i) => {
              currPage = i;
              searchProducts();
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
            subCheckbox.checked = 0;
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
      <div style="margin: 40px 0 10px;font-weight:bold;font-size:16px"><i class="fas fa-list"></i> Kategorie</div>

      <div class="categories">
        <?= showCategory([
          "link" => "wszystkie",
          "category_id" => 0,
          "title" => "Wszystkie produkty"
        ]) ?>
      </div>

      <div style="margin: 40px 0 10px;font-weight:bold;font-size:16px"><i class="fas fa-sliders-h"></i> Filtry</div>

      <?php
      include_once "admin/product/attributes_service.php";

      function printSelectValuesOfAttribute($values, $attribute, $value_id = null)
      {
        if (!isset($values[0])) return "";

        $attr = $value_id ? "data-parent_value_id='" . $value_id . "'" : "";
        $attr .= " data-attribute_id='" . $attribute["attribute_id"] . "'";

        $classes = "attribute-list";

        if ($value_id) {
          $classes .= " expandY hidden";
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

          $html .= "</label>";

          $html .= printSelectValuesOfAttribute($value_data["children"], $attribute, $value_data["values"]["value_id"]);

          $html .= "</div>";
        }
        $html .= "</div>";

        return $html;
      }

      $attributes = fetchArray("SELECT name, attribute_id, data_type FROM product_attributes");

      foreach ($attributes as $attribute) {

        $isOptional = isset($attribute_data_types[$attribute["data_type"]]["field"]);

        echo "<div class='" . ($isOptional ? "optional-value-wrapper" : "combo-select-wrapper") . "' data-attribute_id='" . $attribute["attribute_id"] . "'><div class='attribute-header'>" . $attribute["name"] . "</div> ";

        if ($isOptional) {
        } else {
          $values = getAttributeValues($attribute["attribute_id"]);
          echo printSelectValuesOfAttribute($values, $attribute);
        }

        echo "</div>";

        /*$isOptional = isset($attribute_data_types[$attribute["data_type"]]["field"]);

        echo "<div class='" . ($isOptional ? "optional-value-wrapper" : "combo-select-wrapper") . " attribute-row'>" . $attribute["name"] . " ";

        if ($isOptional) {
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
          echo printSelectValuesOfAttribute($values);
        }

        echo "</div>";*/
      }


      ?>
    </div>
    <div class="product-list-wrapper">
      <h1 class="h1" style="margin: 40px 0"><?= $show_category["title"] ?></h1>
      <?= $show_category["description"] ?>

      <div class="product-list-container">
        <?php
        /*$moduleParams = [];
        $module_content = "";
        $moduleParams["category_ids"] = [$show_category["category_id"]];
        include "modules/product-list/content.php";
        echo $module_content;*/
        ?>
      </div>

      <div class="flexbar">
        <div class="pagination"></div>
      </div>

      <?= getCMSPageHTML($show_category["content"]) ?>
    </div>
  </div>

  <?php include "global/footer.php"; ?>
</body>

</html>