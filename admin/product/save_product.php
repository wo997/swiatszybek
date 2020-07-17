<?php //->[admin/save_product]

if (isset($_POST["remove"])) {
    query("DELETE FROM variant WHERE product_id = ?",[
        $_POST["product_id"]
    ]);
}
else {
  $product_id = isset($_POST["product_id"]) ? $_POST["product_id"] : "-1";
  if ($product_id == "-1") {
      query("INSERT INTO products () VALUES ()");
      $product_id = getLastInsertedId();
  }
  
  query("UPDATE products SET title = ?, link = ?, seo_title = ?, seo_description = ?,
      specyfikacja = ?, specyfikacja_output = ?, description = ?, descriptionShort = ?,
      image = ?, image_desktop = ?, published = ? WHERE product_id = ".intval($product_id),[
      $_POST["title"],$_POST["link"],$_POST["seo_title"],$_POST["seo_description"],
      $_POST["specyfikacja"],$_POST["specyfikacja_output"],$_POST["description"],$_POST["descriptionShort"],
      $_POST["image"],$_POST["image_desktop"],$_POST["published"]
  ]);

  // categories
  query("DELETE FROM link_product_category WHERE product_id = ?",[$product_id]);
  $insert = "";
  foreach (json_decode($_POST["categories"], true) as $category_id) {
    $insert .= "($product_id,".intval($category_id)."),";
  }
  $insert = substr($insert, 0, -1);
  query("INSERT INTO link_product_category (product_id, category_id) VALUES $insert");

  // attribute values
  query("DELETE FROM link_product_attribute_value WHERE product_id = ?",[$product_id]);
  $insert = "";
  foreach (json_decode($_POST["attribute_values"], true) as $value_id) {
    $insert .= "($product_id,".intval($value_id)."),";
  }
  $insert = substr($insert, 0, -1);
  query("INSERT INTO link_product_attribute_value (product_id, value_id) VALUES $insert");

}
include "../sitemap-create.php";
die;

//

//header("Location: ".getProductLink($number,$_POST["title"]));
//die;
