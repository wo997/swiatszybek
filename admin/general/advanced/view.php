<?php //route[{ADMIN}zaawansowane]

// TODO: entity definition / props highlighting would be dope
//updateEnt("pies", 1, ["food" => "69"]);
//updateEnt("pies", 1, ["food" => "-5"]); // should give an error

//die;

class Product
{
    public $product_id;
    public $title;

    public function get_product_id()
    {
        return $this->product_id;
    }
    public function set_product_id($product_id)
    {
        $this->product_id = $product_id;
    }
    public function get_link()
    {
        // this should be editable via event listeners maybe? as we make midifications;
        return getProductLink($this->product_id, $this->title);
    }
}

function getEntityActualOne($table_name, $id, $options = [])
{
    $table_name = clean($table_name);
    $id = intval($id);

    $class = ucfirst($table_name);
    $entity = new $class();

    if ($table_name == "product") {
        $table_name = "products";
    }

    $select = nonull($options, "select", "*");

    $data = fetchRow("select $select from $table_name WHERE product_id = $id");

    //var_dump($data);
    //loadEntityFields($entity, $data);

    return $entity;
}

function loadEntityFields($entity, $data)
{
    $class = get_class($entity);
    $vars = array_keys(get_class_vars($class));
    $methods = get_class_methods($class);

    foreach ($data as $field_name => $field_value) {
        $method_name = "set_" . ($field_name);
        if (array_search($method_name, $methods)) {
            $entity->{$method_name}($field_value);
        } else if (array_search($field_name, $vars)) {
            $entity->{$field_name} = $field_value;
        }
    }
}

/**
 * @var {Product}
 */
$product = getEntityActualOne("product", 29, [
    "select" => "product_id, title, cache_sales"
]);

//var_dump($product, $product->get_link());

?>

<?php startSection("head_content"); ?>

<title>Zaawansowane</title>

<?php startSection("header"); ?>

<div class="custom-toolbar">
    <span class="title">Zaawansowane</span>
    <button class="btn primary" onclick="saveZawansowane()">Zapisz <i class="fa fa-save"></i></button>
</div>

<?php startSection("body_content"); ?>

<div id="zaawansowaneForm">
    <span class="field-title">Certyfikat SSL</span>
    <checkbox name="ssl"></checkbox>

    <span class="field-title">Tryb developmentu</span>
    <checkbox name="dev_mode"></checkbox>

    <span class="field-title">Tryb debugowania</span>
    <checkbox name="debug_mode"></checkbox>

    <span class="field-title">Domena witryny</span>
    <input type="text" class="field" name="domain">

</div>

<?php include "admin/page_template.php"; ?>