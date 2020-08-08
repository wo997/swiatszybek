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
      color: #7c1;
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
  </style>

  <script>
    window.addEventListener("DOMContentLoaded", () => {
      var e = $(".category_name.current");
      if (e) {
        expandCategoriesAbove(e);
      }
    });
  </script>
</head>

<body>
  <?php include "global/header.php"; ?>

  <div class="main-container desktopRow">
    <div class="categories-wrapper">
      <h3 style="margin: 40px 0 10px">Kategorie</h3>

      <div class="categories">
        <?= showCategory([
          "link" => "wszystkie",
          "category_id" => 0,
          "title" => "Wszystkie produkty"
        ]) ?>
      </div>
      <br>

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
          $html .= "<label class='attribute-label'>";
          $html .= "<input type='checkbox' value='" . $value_data["values"]["value_id"] . "'";
          if (nonull($value_data, "children", [])) {
            $html .= " onchange='expand(this.parent().next(),this.checked)'";
          }
          $html .= ">";
          $html .= "<div class='checkbox'></div> ";
          $html .= $value_data["values"]["value"];

          $html .= "</label>";

          $html .= printSelectValuesOfAttribute($value_data["children"], $attribute, $value_data["values"]["value_id"]);
        }
        $html .= "</div>";

        return $html;
      }

      $attributes = fetchArray("SELECT name, attribute_id, data_type FROM product_attributes");

      foreach ($attributes as $attribute) {

        $isOptional = isset($attribute_data_types[$attribute["data_type"]]["field"]);

        echo "<div class='" . ($isOptional ? "optional-value-wrapper" : "combo-select-wrapper") . " attribute-row'>" . $attribute["name"] . " ";

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
    <div class="products">
      <h1 class="h1" style="margin: 40px 0"><?= $show_category["title"] ?></h1>
      <?= $show_category["description"] ?>
      <?php
      $moduleParams = [];
      $module_content = "";
      $moduleParams["category_ids"] = [$show_category["category_id"]];
      include "modules/product-list/content.php";
      echo $module_content;
      ?>
      <?= getCMSPageHTML($show_category["content"]) ?>
    </div>
  </div>

  <?php include "global/footer.php"; ?>
</body>

</html>